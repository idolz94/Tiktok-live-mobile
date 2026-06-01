declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /** TikTok SSE API endpoint */
      EXPO_PUBLIC_TIKTOK_SSE_API?: string;
      /** TikTok username to connect to */
      EXPO_PUBLIC_TIKTOK_USERNAME?: string;
    }
  }
}

export {};

