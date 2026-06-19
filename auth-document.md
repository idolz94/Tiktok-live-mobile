# Lumi Authentication Contract for React Native

## Scope

Tài liệu này mô tả contract giữa client React Native và Lumi backend cho các luồng xác thực, bao gồm login, register, refresh token và các request cần xác thực. Trọng tâm của tài liệu là các endpoint, params, headers, response và các lưu ý tích hợp từ phía client.

## Client → Backend Principles

Khi tích hợp từ phía React Native, cần tuân thủ các nguyên tắc sau:

- Gọi đúng endpoint và đúng method theo contract backend.
- Chỉ gửi những params/headers mà backend yêu cầu.
- Lưu và gửi lại `accessToken` theo cơ chế thống nhất của app.
- Xử lý refresh token khi nhận `401`.
- Không giả định backend tự động hiểu các field ngoài contract.
- Không đưa secret nội bộ vào client nếu request không thật sự cần.

---

## 1) Authentication Model

Cơ chế xác thực hiện tại bao gồm:

- `accessToken` dạng JWT
- `refreshToken` dạng JWT
- cookie `httpOnly` do backend thiết lập
- header `Authorization: Bearer <token>` cho các request API

Backend chấp nhận token từ các nguồn sau:

- header `Authorization`
- cookie `lumi_access_token`

---

## 2) Login

### Endpoint

`POST /api/auth/login`

### Request

#### Headers

- `Content-Type: application/json`

#### Body

Payload đăng nhập theo contract backend hiện tại. Client phải gửi đúng các field mà backend yêu cầu; không thêm field không nằm trong contract.

### Response

Backend sẽ:

- trả về `accessToken`
- set cookie:
  - `lumi_access_token`
  - `lumi_refresh_token`

### Client behavior

Sau khi login thành công, app nên:

1. lưu `accessToken`
2. gắn token vào các request sau đó
3. lưu state đăng nhập của user

### Lưu ý

- Không phụ thuộc riêng vào cookie trên mobile; hãy lưu và gửi `accessToken` qua request wrapper của app.
- Nếu request sau login bị `401`, phải đi qua refresh token trước khi yêu cầu user đăng nhập lại.
- Không giả định backend trả thêm field ngoài các field đã được contract công bố.

---

## 3) Register

### Endpoint

`POST /api/auth/register`

### Request

#### Headers

- `Content-Type: application/json`

#### Body

Payload đăng ký theo contract backend hiện tại. Client phải gửi đúng các field mà backend yêu cầu; không thêm field không nằm trong contract.

### Response

Backend xử lý tương tự login:

- trả về `accessToken`
- set cookie `httpOnly`:
  - `lumi_access_token`
  - `lumi_refresh_token`

### Client behavior

Sau khi register thành công, app nên:

1. lưu `accessToken`
2. coi user là đã đăng nhập
3. chuyển sang luồng onboarding / home theo product flow

### Lưu ý

- Nếu backend yêu cầu xác minh thêm trong tương lai, client cần tách riêng luồng đăng ký và luồng xác nhận.
- Không tái sử dụng payload đăng nhập cho register nếu backend quy định field khác nhau.

---

## 4) Gửi request có auth

Với các API cần đăng nhập, app nên gửi:

```http
Authorization: Bearer <accessToken>
```

Nếu môi trường hỗ trợ cookie, nên giữ `credentials` để backend nhận cookie session.

### Khuyến nghị cho React Native

- dùng một request wrapper duy nhất
- mọi API có auth đều đi qua wrapper này
- không gắn token rải rác trong từng screen/component

### Lưu ý

- Request wrapper phải ưu tiên token hiện hành của app.
- Khi token được refresh, toàn bộ request tiếp theo phải dùng token mới.
- Không hardcode base URL hoặc secret nội bộ trong component UI.

---

## 5) Refresh token

### Endpoint

`POST /api/auth/refresh`

### Backend nhận refresh token từ

- cookie `lumi_refresh_token`
- hoặc body `refreshToken`

### Request

#### Headers

- `Content-Type: application/json`

#### Body

Có thể gửi rỗng nếu refresh token đã có trong cookie, hoặc gửi:

```json
{
  "refreshToken": "<refreshToken>"
}
```

### Response

Nếu refresh thành công, backend trả về `accessToken` mới.

### Luồng refresh chuẩn

Khi request trả về `401`:

1. gọi `/api/auth/refresh`
2. nếu refresh thành công:
   - nhận `accessToken` mới
   - cập nhật token local
   - retry request ban đầu
3. nếu refresh fail:
   - logout user
   - clear toàn bộ auth state
   - điều hướng về màn login

### Lưu ý

- Chỉ refresh một lần cho nhiều request cùng lúc đang bị `401`.
- Không tạo nhiều refresh request song song.
- Nếu refresh token đã hết hạn, không retry vô hạn.

---

## 6) Logout

Hiện tại phía app nên xử lý logout theo các bước:

1. clear `accessToken`
2. clear user state
3. clear mọi cache liên quan auth
4. điều hướng về màn login

Nếu backend có endpoint logout riêng, app có thể gọi trước khi clear local state.

### Lưu ý

- Logout phải xóa toàn bộ dữ liệu phiên hiện tại trên client.
- Không giữ lại token sau khi user đã chủ động đăng xuất.

---

## 7) Protected routes

Các route chính cần auth gồm:

- `/api/me`
- `/api/orders`
- `/api/customers`
- `/api/customers/:customerId/addresses`
- `/api/live-comments`
- `/api/live-sessions`
- `/api/live-stream`
- `/api/licenses`
- `/api/payments`
- `/api/me/shop-settings`
- `/api/me/product-presets`
- `/api/admin`

### Lưu ý

- Các route trên có thể yêu cầu thêm quyền hoặc internal key tùy từng nhóm chức năng.
- Client chỉ gọi những route đã được backend xác nhận trong contract.

---

## 8) Internal API key

Một số route internal/admin cần thêm header:

```http
x-internal-api-key: <NODE_INTERNAL_API_KEY>
```

Hoặc query:

```http
?internalApiKey=<key>
```

### Lưu ý

- key này là secret nội bộ
- không đưa vào client public nếu không thật sự cần
- nếu request từ app không cần route internal thì không dùng key này

---

## 9) Error handling

### 401

Ý nghĩa:

- chưa đăng nhập
- access token sai
- access token hết hạn
- refresh token hết hạn / không hợp lệ

### 403

Ý nghĩa:

- không đủ quyền
- client không được phép gọi API

### Shape lỗi phổ biến

```json
{
  "ok": false,
  "message": "..."
}
```

Một số response còn có thêm:

- `code`
- `details`

### Quy tắc xử lý phía app

- `401` => thử refresh token
- refresh fail => logout
- `403` => show lỗi không có quyền hoặc chặn thao tác

### Lưu ý

- UI không nên dựa vào message text để phân nhánh logic chính.
- Nên dựa vào HTTP status và `code` nếu backend có trả.

---

## 10) Kết nối realtime / SSE

Với các kết nối realtime cần auth, app nên gửi:

```http
Authorization: Bearer <accessToken>
```

Nếu server trả `401` hoặc `403`, app nên coi kết nối là hết phiên và ngắt stream.

### Lưu ý

- SSE/realtime phải tái sử dụng cùng một cơ chế token với API thường.
- Khi refresh token xong, cần reconnect stream với token mới nếu cần.

---

## 11) Suggested RN implementation flow

### App start

1. đọc token đã lưu
2. nếu có token, set vào request wrapper
3. gọi API bootstrap / me
4. nếu `401`, refresh token
5. nếu refresh fail, đưa user về login

### Login/Register

1. gọi API auth tương ứng
2. nhận `accessToken`
3. lưu token
4. fetch profile/bootstrap
5. điều hướng vào app

### API request lifecycle

1. request bình thường với `Authorization`
2. nếu `401`, gọi refresh
3. nếu refresh thành công, retry
4. nếu refresh thất bại, logout

### Lưu ý

- Flow này nên được encapsulate trong một service hoặc request layer dùng chung.
- Không implement riêng lẻ theo từng màn hình.

---

## 12) Important notes

- Backend hiện tại đang chạy theo flow `JWT + cookie nội bộ`.
- Token verification hiện là theo JWT backend, không nên giả định Clerk SDK trực tiếp trong client contract.
- Team React Native nên bám theo flow trong tài liệu này để tránh lệch implementation.

### Lưu ý

- Nếu backend thay đổi contract, tài liệu này phải được cập nhật trước khi RN implement tiếp.
- Mọi field mới từ backend cần được ghi rõ input/output và ví dụ payload.

---

## 13) Recommended API wrapper behavior

Nên có một layer request dùng chung với các khả năng:

- gắn `Authorization` tự động
- retry một lần sau refresh
- queue các request đang chờ refresh
- clear session khi refresh fail

### Lưu ý

- Wrapper phải là điểm duy nhất xử lý auth headers và refresh flow.
- Không xử lý refresh token trực tiếp trong từng component.

---

## 14) Minimal contract summary

### Login
- `POST /api/auth/login`
- trả `accessToken`
- set cookies auth

### Register
- `POST /api/auth/register`
- trả `accessToken`
- set cookies auth

### Refresh
- `POST /api/auth/refresh`
- nhận refresh token từ cookie hoặc body
- trả `accessToken` mới

### Protected request
- gửi `Authorization: Bearer <accessToken>`
- kèm cookie nếu môi trường hỗ trợ

### Failure handling
- `401` => refresh
- refresh fail => logout
- `403` => block action / show permission error

### Lưu ý

- Đây là summary cho implementation; chi tiết contract vẫn phải tuân theo các mục phía trên.
- Không coi summary là nguồn duy nhất khi code.

---

## 3) Register

### Endpoint

`POST /api/auth/register`

### Output

Backend xử lý tương tự login:

- trả về `accessToken`
- set cookie `httpOnly`
  - `lumi_access_token`
  - `lumi_refresh_token`

### Hành vi phía app

Sau khi register thành công, app nên:

1. lưu `accessToken`
2. coi user là đã đăng nhập
3. chuyển sang luồng onboarding / home theo product flow

---

## 4) Gửi request có auth

Với các API cần đăng nhập, app nên gửi:

```http
Authorization: Bearer <accessToken>
```

Nếu môi trường hỗ trợ cookie, nên giữ `credentials` để backend nhận cookie session.

### Khuyến nghị cho React Native

- dùng một request wrapper duy nhất
- mọi API có auth đều đi qua wrapper này
- không gắn token rải rác trong từng screen/component

---

## 5) Refresh token

### Endpoint

`POST /api/auth/refresh`

### Backend nhận refresh token từ

- cookie `lumi_refresh_token`
- hoặc body `refreshToken`

### Luồng refresh chuẩn

Khi request trả về `401`:

1. gọi `/api/auth/refresh`
2. nếu refresh thành công:
   - nhận `accessToken` mới
   - cập nhật token local
   - retry request ban đầu
3. nếu refresh fail:
   - logout user
   - clear toàn bộ auth state
   - điều hướng về màn login

### Gợi ý triển khai phía RN

Nên có cơ chế:

- chặn nhiều request refresh song song
- chỉ refresh 1 lần cho nhiều request cùng lúc
- retry request sau khi có token mới

---

## 6) Logout

Hiện tại phía app nên xử lý logout theo các bước:

1. clear `accessToken`
2. clear user state
3. clear mọi cache liên quan auth
4. điều hướng về màn login

Nếu backend có endpoint logout riêng, app có thể gọi trước khi clear local state.

---

## 7) Protected routes

Các route chính cần auth gồm:

- `/api/me`
- `/api/orders`
- `/api/customers`
- `/api/customers/:customerId/addresses`
- `/api/live-comments`
- `/api/live-sessions`
- `/api/live-stream`
- `/api/licenses`
- `/api/payments`
- `/api/me/shop-settings`
- `/api/me/product-presets`
- `/api/admin`

---

## 8) Internal API key

Một số route internal/admin cần thêm header:

```http
x-internal-api-key: <NODE_INTERNAL_API_KEY>
```

Hoặc query:

```http
?internalApiKey=<key>
```

### Lưu ý

- key này là secret nội bộ
- không đưa vào client public nếu không thật sự cần
- nếu request từ app không cần route internal thì không dùng key này

---

## 9) Error handling

### 401

Ý nghĩa:

- chưa đăng nhập
- access token sai
- access token hết hạn
- refresh token hết hạn / không hợp lệ

### 403

Ý nghĩa:

- không đủ quyền
- client không được phép gọi API

### Shape lỗi phổ biến

```json
{
  "ok": false,
  "message": "..."
}
```

Một số response còn có thêm:

- `code`
- `details`

### Quy tắc xử lý phía app

- `401` => thử refresh token
- refresh fail => logout
- `403` => show lỗi không có quyền hoặc chặn thao tác

---

## 10) Kết nối realtime / SSE

Với các kết nối realtime cần auth, app nên gửi:

```http
Authorization: Bearer <accessToken>
```

Nếu server trả `401` hoặc `403`, app nên coi kết nối là hết phiên và ngắt stream.

---

## 11) Suggested RN implementation flow

### App start

1. đọc token đã lưu
2. nếu có token, set vào request wrapper
3. gọi API bootstrap / me
4. nếu `401`, refresh token
5. nếu refresh fail, đưa user về login

### Login/Register

1. gọi API auth tương ứng
2. nhận `accessToken`
3. lưu token
4. fetch profile/bootstrap
5. điều hướng vào app

### API request lifecycle

1. request bình thường với `Authorization`
2. nếu `401`, gọi refresh
3. nếu refresh thành công, retry
4. nếu refresh thất bại, logout

---

## 12) Important notes

- Backend hiện tại đang chạy theo flow `JWT + cookie nội bộ`.
- Token verification hiện là theo JWT backend, không nên giả định Clerk SDK trực tiếp trong client contract.
- Team React Native nên bám theo flow trong tài liệu này để tránh lệch implementation.

---

## 13) Recommended API wrapper behavior

Nên có một layer request dùng chung với các khả năng:

- gắn `Authorization` tự động
- retry một lần sau refresh
- queue các request đang chờ refresh
- clear session khi refresh fail

---

## 14) Minimal contract summary

### Login
- `POST /api/auth/login`
- trả `accessToken`
- set cookies auth

### Register
- `POST /api/auth/register`
- trả `accessToken`
- set cookies auth

### Refresh
- `POST /api/auth/refresh`
- nhận refresh token từ cookie hoặc body
- trả `accessToken` mới

### Protected request
- gửi `Authorization: Bearer <accessToken>`
- kèm cookie nếu môi trường hỗ trợ

### Failure handling
- `401` => refresh
- refresh fail => logout
- `403` => block action / show permission error
