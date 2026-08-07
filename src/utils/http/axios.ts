import {
  API_URL_ENDPOINT,
  MOBILE_APP_KEY,
  MOBILE_APP_SECRET,
  WEB_URL_ORIGIN,
  WEB_URL_REFERER,
} from "@constants/config";
import { useAuthStore } from "@features/auth/stores";
import { refreshAccessToken } from "./auth-session";
import { secureStorage } from "@utils/storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { licenseExpiredEmitter, sessionExpiredEmitter } from "./session-event";
import { ApiError } from "./api-error";

// ponytail: match by message, not code — backend reuses generic "FORBIDDEN" code for every 403
const LICENSE_EXPIRED_MESSAGE = "Shop đã hết hạn dùng thử hoặc chưa có license.";

// ponytail: pure-JS HMAC-SHA256, needed because Hermes lacks crypto.subtle
function sha256Bytes(data: number[]): number[] {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ];
  const bytes = [...data];
  const len = bytes.length;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  const bits = len * 8;
  bytes.push(0,0,0,0,(bits>>>24)&0xff,(bits>>>16)&0xff,(bits>>>8)&0xff,bits&0xff);
  let h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  for (let i = 0; i < bytes.length; i += 64) {
    const w: number[] = [];
    for (let j = 0; j < 16; j++) w.push((bytes[i+j*4]<<24)|(bytes[i+j*4+1]<<16)|(bytes[i+j*4+2]<<8)|bytes[i+j*4+3]);
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j-15]>>>7)|(w[j-15]<<25))^((w[j-15]>>>18)|(w[j-15]<<14))^(w[j-15]>>>3);
      const s1 = ((w[j-2]>>>17)|(w[j-2]<<15))^((w[j-2]>>>19)|(w[j-2]<<13))^(w[j-2]>>>10);
      w.push((w[j-16]+s0+w[j-7]+s1)>>>0);
    }
    let [a,b,c,d,e,f,g,hh] = h;
    for (let j = 0; j < 64; j++) {
      const S1 = ((e>>>6)|(e<<26))^((e>>>11)|(e<<21))^((e>>>25)|(e<<7));
      const ch = (e&f)^(~e&g);
      const t1 = (hh+S1+ch+K[j]+w[j])>>>0;
      const S0 = ((a>>>2)|(a<<30))^((a>>>13)|(a<<19))^((a>>>22)|(a<<10));
      const maj = (a&b)^(a&c)^(b&c);
      const t2 = (S0+maj)>>>0;
      hh=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    h = [(h[0]+a)>>>0,(h[1]+b)>>>0,(h[2]+c)>>>0,(h[3]+d)>>>0,(h[4]+e)>>>0,(h[5]+f)>>>0,(h[6]+g)>>>0,(h[7]+hh)>>>0];
  }
  const out: number[] = [];
  h.forEach(v => { out.push((v>>>24)&0xff,(v>>>16)&0xff,(v>>>8)&0xff,v&0xff); });
  return out;
}

function strToBytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) { out.push(c); }
    else if (c < 0x800) { out.push(0xc0|(c>>6), 0x80|(c&0x3f)); }
    else { out.push(0xe0|(c>>12), 0x80|((c>>6)&0x3f), 0x80|(c&0x3f)); }
  }
  return out;
}

function hmacSha256Hex(key: string, message: string): string {
  const BLOCK = 64;
  let keyBytes = strToBytes(key);
  if (keyBytes.length > BLOCK) keyBytes = sha256Bytes(keyBytes);
  while (keyBytes.length < BLOCK) keyBytes.push(0);
  const ipad = keyBytes.map(b => b ^ 0x36);
  const opad = keyBytes.map(b => b ^ 0x5c);
  const inner = sha256Bytes([...ipad, ...strToBytes(message)]);
  const result = sha256Bytes([...opad, ...inner]);
  return result.map(b => b.toString(16).padStart(2,'0')).join('');
}

function shouldSkipRefresh(url?: string) {
  return Boolean(url?.includes("/auth/login") || url?.includes("/auth/refresh"));
}

async function clearSessionAndNotify() {
  await useAuthStore.getState().logout();
  sessionExpiredEmitter.emit();
}

async function clearLicenseAndNotify() {
  await useAuthStore.getState().logout();
  licenseExpiredEmitter.emit();
}

// START 401 retry interceptor
// Khi gặp 401, thử refresh token một lần; nếu refresh thành công thì retry request gốc.
// Chỉ khi refresh token cũng thất bại mới gọi clearSessionAndNotify() để logout user.
function attach401RetryInterceptor(client: ReturnType<typeof axios.create>) {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const url = error.config?.url || "";
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;

      if (
        status === 401 &&
        originalRequest &&
        !shouldSkipRefresh(url) &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return client(originalRequest);
          }
        } catch {
          void clearSessionAndNotify();
          return Promise.reject(error);
        }

        void clearSessionAndNotify();
      }

      return Promise.reject(error);
    },
  );
}
// END 401 retry interceptor

// ────────────────────────────────────────────────
// Axios instance for API
// ────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_URL_ENDPOINT,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-app-key": MOBILE_APP_KEY,
    Origin: WEB_URL_ORIGIN,
    Referer: WEB_URL_REFERER,
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

attach401RetryInterceptor(apiClient);

apiClient.interceptors.request.use(
  (config) => {
    if (!config.url?.includes("/spx")) return config;
    const timestamp = Math.floor(Date.now() / 1000);
    const randomNum = Math.floor(Math.random() * 1_000_000);
    const body = config.data ?? {};
    const raw = `${MOBILE_APP_KEY}_${timestamp}_${randomNum}_${JSON.stringify(body)}`;
    const checkSign = hmacSha256Hex(MOBILE_APP_SECRET, raw);
    config.headers["app-id"] = MOBILE_APP_KEY;
    config.headers["check-sign"] = checkSign;
    config.headers["timestamp"] = String(timestamp);
    config.headers["random-num"] = String(randomNum);
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log("===== API ERROR =====");
      console.log("URL:", error.config?.url);
      console.log("STATUS:", error.response?.status);
      console.log("RESPONSE:", JSON.stringify(error.response?.data, null, 2));
      console.log("=====================");
    }

    if (
      error.response?.status === 403 &&
      error.response?.data?.message === LICENSE_EXPIRED_MESSAGE
    ) {
      void clearLicenseAndNotify();
    }

    if (error.response) {
      throw new ApiError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data,
      );
    }

    throw error;
  },
);

export default apiClient;
