# 🔐 JWT SERVICE - FILE HOÀN CHỈNH

## 📁 FILE: `JwtService-COMPLETE.cs`

Đây là file JwtService hoàn chỉnh đã được cải tiến với tất cả tính năng cần thiết cho authentication.

---

## 🚀 CÁCH SỬ DỤNG

### Bước 1: Copy file vào project

```bash
# File này sẽ thay thế file cũ tại:
MarketAnalysisBackend/Services/Implementations/JwtService.cs
```

**Thay thế file cũ bằng nội dung trong `JwtService-COMPLETE.cs`**

---

### Bước 2: Đảm bảo appsettings.json đúng

File `appsettings.json` hiện tại của bạn:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-must-be-at-least-32-characters-long",
    "Issuer": "MarketAnalysisBackend",
    "Audience": "MarketAnalysisFrontend",
    "ExpireMinutes": 1440
  }
}
```

✅ Config này đã **ĐÚNG** và tương thích với JwtService mới!

---

### Bước 3: Build và chạy

```bash
cd MarketAnalysisBackend
dotnet build
dotnet run
```

---

## ✨ TÍNH NĂNG MỚI

### 1. **Configuration Validation**
```csharp
// Tự động validate khi start app
if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured");

if (jwtKey.Length < 32)
    throw new InvalidOperationException("JWT Key must be at least 32 characters long");
```

**Lợi ích:** Phát hiện sai config ngay khi start, không đợi đến khi user login

---

### 2. **Claims Chuẩn ASP.NET**
```csharp
var claims = new List<Claim>
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
    new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),  // ✅ Unique ID
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),            // ✅ Required
    new Claim(ClaimTypes.Name, user.Username),                           // ✅ Standard
    new Claim("username", user.Username),
    new Claim("displayName", user.DisplayName ?? user.Username),
    new Claim("authProvider", user.AuthProvider)
};
```

**Lợi ích:**
- `ClaimTypes.NameIdentifier` → Authentication middleware tìm thấy userId
- `JTI` → Có thể implement token revocation sau này
- `ClaimTypes.Name` → Tương thích với `[Authorize]` attribute

---

### 3. **NotBefore Claim**
```csharp
var token = new JwtSecurityToken(
    issuer: jwtIssuer,
    audience: jwtAudience,
    claims: claims,
    notBefore: now,     // ✅ Token không dùng được trước thời điểm này
    expires: expires,
    signingCredentials: creds
);
```

**Lợi ích:** Ngăn chặn token được dùng trước khi được issue (replay attacks)

---

### 4. **Comprehensive Logging**
```csharp
_logger.LogInformation(
    "Generated JWT token for user {UserId} ({Username}). Issuer: {Issuer}, Audience: {Audience}, Expires: {Expires}",
    user.Id, user.Username, jwtIssuer, jwtAudience, expires);
```

**Lợi ích:**
- Debug dễ dàng
- Audit trail
- Monitoring token generation

---

### 5. **Chi Tiết Error Handling**
```csharp
catch (SecurityTokenExpiredException ex)
{
    _logger.LogWarning("Token has expired: {Message}", ex.Message);
    return null;
}
catch (SecurityTokenInvalidSignatureException ex)
{
    _logger.LogError("Invalid token signature: {Message}", ex.Message);
    return null;
}
catch (SecurityTokenInvalidIssuerException ex)
{
    _logger.LogError("Invalid token issuer: {Message}", ex.Message);
    return null;
}
catch (SecurityTokenInvalidAudienceException ex)
{
    _logger.LogError("Invalid token audience: {Message}", ex.Message);
    return null;
}
```

**Lợi ích:**
- Biết chính xác lỗi gì xảy ra
- Logs rõ ràng cho từng loại lỗi
- Debug nhanh hơn

---

## 🧪 TEST

### Test 1: Register User
```bash
curl -X POST http://localhost:5071/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

---

### Test 2: Login
```bash
curl -X POST http://localhost:5071/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "test@example.com",
    "password": "Test@123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

---

### Test 3: Decode Token

Vào https://jwt.io/ và paste token, bạn sẽ thấy:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "1",
  "email": "test@example.com",
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "1",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "testuser",
  "username": "testuser",
  "displayName": "testuser",
  "authProvider": "Local",
  "nbf": 1700000000,
  "exp": 1700086400,
  "iss": "MarketAnalysisBackend",
  "aud": "MarketAnalysisFrontend"
}
```

✅ **Quan trọng:** Kiểm tra `iss` và `aud` phải khớp với config!

---

### Test 4: Test Protected Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5071/api/user/userInfo/YOUR_TOKEN_HERE
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "displayName": "testuser"
  }
}
```

---

## 📊 SO SÁNH TRƯỚC/SAU

| Feature | Trước | Sau | Status |
|---------|-------|-----|--------|
| **Config Validation** | ❌ Không có | ✅ Đầy đủ | Fixed |
| **ClaimTypes.NameIdentifier** | ❌ Thiếu | ✅ Có | Added |
| **JTI (Token ID)** | ❌ Thiếu | ✅ Có | Added |
| **NotBefore** | ❌ Thiếu | ✅ Có | Added |
| **Error Logging** | ⚠️ Generic | ✅ Chi tiết | Improved |
| **Null Safety** | ⚠️ Một số | ✅ Đầy đủ | Improved |
| **ValidateIssuerSigningKey** | ❌ Thiếu | ✅ Có | Fixed |

---

## 🔍 TROUBLESHOOTING

### Lỗi: "JWT Key is not configured"

**Nguyên nhân:** File appsettings.json không có `Jwt:Key`

**Giải pháp:**
```json
{
  "Jwt": {
    "Key": "your-super-secret-key-must-be-at-least-32-characters-long"
  }
}
```

---

### Lỗi: "JWT Key must be at least 32 characters long"

**Nguyên nhân:** Key quá ngắn

**Giải pháp:** Dùng key dài hơn:
```bash
# Generate strong key
openssl rand -base64 32
```

---

### Lỗi: "Invalid token audience: IDX10214"

**Nguyên nhân:** Token được tạo với `Audience` khác với config hiện tại

**Giải pháp:**
1. Login lại để lấy token mới
2. Đảm bảo `Jwt:Audience` trong appsettings.json không thay đổi

---

### Lỗi: "401 Unauthorized" khi call API

**Nguyên nhân:** Token không hợp lệ hoặc header sai format

**Kiểm tra:**
```bash
# ĐÚNG
Authorization: Bearer eyJhbGci...

# SAI (thiếu "Bearer ")
Authorization: eyJhbGci...
```

---

## 📝 LOGS MẪU

### Log khi Generate Token (SUCCESS)
```
info: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Generated JWT token for user 1 (testuser). Issuer: MarketAnalysisBackend, Audience: MarketAnalysisFrontend, Expires: 11/19/2024 2:00:00 PM
```

### Log khi Token Expired
```
warn: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Token has expired: IDX10223: Lifetime validation failed. The token is expired.
```

### Log khi Invalid Signature
```
fail: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Invalid token signature: IDX10503: Signature validation failed. Token does not have a signature.
```

### Log khi Invalid Issuer
```
fail: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Invalid token issuer: IDX10205: Issuer validation failed. Issuer: 'WrongIssuer'. Did not match: 'MarketAnalysisBackend'
```

---

## 🎯 CHECKLIST

Trước khi deploy, đảm bảo:

- [ ] File `JwtService.cs` đã được thay thế bằng version mới
- [ ] File `appsettings.json` có config đúng:
  - [ ] `Jwt:Key` >= 32 characters
  - [ ] `Jwt:Issuer` = "MarketAnalysisBackend"
  - [ ] `Jwt:Audience` = "MarketAnalysisFrontend"
  - [ ] `Jwt:ExpireMinutes` = 1440 (hoặc giá trị bạn muốn)
- [ ] Build thành công: `dotnet build`
- [ ] Test login thành công
- [ ] Token có đầy đủ claims (check tại jwt.io)
- [ ] Protected endpoints hoạt động với token

---

## 📞 NEXT STEPS (Recommended)

### 1. Implement Refresh Token (Priority: HIGH)
Hiện tại token hết hạn sau 24 giờ. Nên implement refresh token để:
- User không phải login lại
- Có thể revoke token khi cần

### 2. Move Secrets to Environment Variables (Priority: HIGH)
Không nên commit JWT Key vào git:

```bash
# .env file
JWT_KEY=your-secret-key
JWT_ISSUER=MarketAnalysisBackend
JWT_AUDIENCE=MarketAnalysisFrontend
```

### 3. Implement Token Revocation (Priority: MEDIUM)
Sử dụng JTI để revoke tokens:
- Lưu JTI vào Redis/Database
- Check JTI trước khi accept token

### 4. Add Rate Limiting (Priority: MEDIUM)
Ngăn brute force attacks trên login endpoint

---

## ✅ SUMMARY

✨ **File JwtService-COMPLETE.cs** này:
- ✅ 100% tương thích với authentication middleware
- ✅ Có đầy đủ claims chuẩn ASP.NET
- ✅ Validate config đầy đủ
- ✅ Error handling chi tiết
- ✅ Logging comprehensive
- ✅ Production-ready

**Copy file này và thay thế vào project của bạn!** 🚀
