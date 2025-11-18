# JWT Authentication Fix - Hướng dẫn kiểm tra

## ✅ ĐÃ SỬA 2 VẤN ĐỀ CHÍNH

### 1. Configuration Key Mismatch ✓
**Trước đây:**
- Generate token dùng: `Jwt:Issuer` và `Jwt:Audience`
- Validate token dùng: `Authentication:Jwt:Issuer` và `Authentication:Jwt:Audience`
- ➡️ Token luôn bị reject!

**Đã sửa:** Cả hai đều dùng `Jwt:Issuer` và `Jwt:Audience`

---

### 2. Middleware Order ✓
**Trước đây:**
```
UseCors → MapHub → UseAuthentication → UseAuthorization
```

**Đã sửa:**
```
UseHttpsRedirection → UseCors → UseAuthentication → UseAuthorization → MapHub → MapControllers
```

---

## 📋 CHECKLIST KIỂM TRA

### Bước 1: Kiểm tra appsettings.json
Đảm bảo file `appsettings.json` hoặc `appsettings.Development.json` có cấu hình:

```json
{
  "Jwt": {
    "Key": "minimum-32-characters-secret-key-here-change-this",
    "Issuer": "MarketAnalysisBackend",
    "Audience": "MarketAnalysisClient",
    "ExpireMinutes": 60
  }
}
```

**Lưu ý:**
- `Key` phải ít nhất 32 ký tự
- `Issuer` và `Audience` phải khớp với client

---

### Bước 2: Test Login API

#### 2.1. Register User
```bash
POST http://localhost:5071/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "username": "testuser",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2.2. Login
```bash
POST http://localhost:5071/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "test@example.com",
  "password": "Test@123456"
}
```

**Copy token từ response!**

---

### Bước 3: Test Protected Endpoint

#### 3.1. Test với token
```bash
GET http://localhost:5071/api/user/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Kết quả mong đợi:**
- ✅ Status: 200 OK (nếu là Admin)
- ✅ Status: 403 Forbidden (nếu không phải Admin - đúng behavior)

#### 3.2. Test không có token
```bash
GET http://localhost:5071/api/user/users
```

**Kết quả mong đợi:**
- ✅ Status: 401 Unauthorized

---

### Bước 4: Kiểm tra JWT Token

#### Decode token tại: https://jwt.io/

**Token hợp lệ phải có:**
```json
{
  "sub": "1",
  "email": "test@example.com",
  "username": "testuser",
  "displayName": "testuser",
  "authProvider": "Local",
  "exp": 1234567890,
  "iss": "MarketAnalysisBackend",      ← Phải khớp với appsettings
  "aud": "MarketAnalysisClient"         ← Phải khớp với appsettings
}
```

---

## 🔍 DEBUG COMMON ERRORS

### Lỗi 1: "401 Unauthorized" khi call API với token
**Nguyên nhân:**
- Token không được gửi đúng format
- Header phải là: `Authorization: Bearer {token}`
- Lưu ý có khoảng trắng giữa "Bearer" và token

**Kiểm tra:**
```bash
# SAI
Authorization: eyJhbGci...

# ĐÚNG
Authorization: Bearer eyJhbGci...
```

---

### Lỗi 2: "IDX10214: Audience validation failed"
**Nguyên nhân:** Audience trong token khác với cấu hình

**Sửa:** Đảm bảo `Jwt:Audience` trong appsettings.json khớp với client

---

### Lỗi 3: "IDX10205: Issuer validation failed"
**Nguyên nhân:** Issuer trong token khác với cấu hình

**Sửa:** Đảm bảo `Jwt:Issuer` trong appsettings.json đúng

---

### Lỗi 4: "IDX10503: Signature validation failed"
**Nguyên nhân:**
- `Jwt:Key` khác nhau giữa lúc generate và validate
- Token bị modify
- Key quá ngắn (<32 characters)

**Sửa:**
- Đảm bảo `Jwt:Key` giống nhau
- Restart application sau khi thay đổi config
- Dùng key mạnh: `openssl rand -base64 32`

---

### Lỗi 5: "IDX10223: Lifetime validation failed"
**Nguyên nhân:** Token hết hạn

**Kiểm tra:**
- Decode token tại jwt.io
- Xem trường `exp` (expiration timestamp)
- So sánh với thời gian hiện tại

**Sửa:** Login lại để lấy token mới

---

## 🧪 TEST CASE MẪU (Postman/Insomnia)

### Collection: Market Analysis Auth Test

#### 1. Register
```
POST {{baseUrl}}/api/auth/register
```
Body:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test@123456"
}
```

**Test Script:**
```javascript
pm.test("Register successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.token).to.be.a('string');
    pm.environment.set("jwt_token", jsonData.token);
});
```

---

#### 2. Login
```
POST {{baseUrl}}/api/auth/login
```
Body:
```json
{
  "usernameOrEmail": "test@example.com",
  "password": "Test@123456"
}
```

**Test Script:**
```javascript
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.token).to.be.a('string');
    pm.environment.set("jwt_token", jsonData.token);
});
```

---

#### 3. Get User Info (Protected)
```
GET {{baseUrl}}/api/user/userInfo/{{jwt_token}}
Authorization: Bearer {{jwt_token}}
```

**Test Script:**
```javascript
pm.test("Get user info successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.user.email).to.eql("test@example.com");
});
```

---

#### 4. Test Without Token (Should Fail)
```
GET {{baseUrl}}/api/user/users
```
(No Authorization header)

**Test Script:**
```javascript
pm.test("Should be unauthorized without token", function () {
    pm.response.to.have.status(401);
});
```

---

## 🚀 CHẠY APPLICATION

### 1. Build project
```bash
cd MarketAnalysisBackend
dotnet restore
dotnet build
```

### 2. Chạy migrations (nếu cần)
```bash
dotnet ef database update
```

### 3. Chạy app
```bash
dotnet run
```

### 4. Test endpoint health
```bash
curl http://localhost:5071/api/asset
```

---

## 📝 LƯU Ý BẢO MẬT

### Sau khi fix, cần làm thêm:

1. **Environment Variables** (Production)
```bash
export JWT_KEY="your-production-secret-key-min-64-chars"
export JWT_ISSUER="https://api.yourdomain.com"
export JWT_AUDIENCE="https://yourdomain.com"
```

2. **appsettings.Production.json**
```json
{
  "Jwt": {
    "Key": "${JWT_KEY}",
    "Issuer": "${JWT_ISSUER}",
    "Audience": "${JWT_AUDIENCE}",
    "ExpireMinutes": 15
  }
}
```

3. **KHÔNG commit** appsettings.json vào git!
```bash
echo "appsettings.*.json" >> .gitignore
echo "!appsettings.Development.json.example" >> .gitignore
```

---

## ❓ NẾU VẪN KHÔNG HOẠT ĐỘNG

### Enable Logging để debug

**appsettings.Development.json:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore.Authentication": "Debug",
      "Microsoft.AspNetCore.Authorization": "Debug"
    }
  }
}
```

**Xem logs khi call API:**
```bash
dotnet run --verbosity detailed
```

Logs sẽ hiển thị chi tiết lỗi JWT validation!

---

## 📞 SUPPORT

Nếu vẫn gặp lỗi, cung cấp:
1. HTTP status code (401, 403, 500?)
2. Response body
3. Request headers (Authorization header)
4. Server logs (nếu có)
5. Decoded JWT token (từ jwt.io)
