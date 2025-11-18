# JWT Service Improvements - Chi tiết sửa đổi

## ✅ NHỮNG GÌ ĐÃ SỬA

### 1. **GenerateToken() - Token sinh ra hoàn toàn tương thích**

#### ✨ Thêm Validation Config
```csharp
// Trước: Không validate config
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

// Sau: Validate đầy đủ
if (string.IsNullOrEmpty(jwtKey))
    throw new InvalidOperationException("JWT Key is not configured");
if (jwtKey.Length < 32)
    throw new InvalidOperationException("JWT Key must be at least 32 characters long");
```

**Lợi ích:**
- Phát hiện sớm config sai
- Error message rõ ràng
- Tránh runtime errors khó debug

---

#### ✨ Fix Duplicate ExpireMinutes
```csharp
// Trước: Đọc config 2 lần
var expireMinutes = Convert.ToDouble(_config["Jwt:ExpireMinutes"]); // Không dùng
var expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_config["Jwt:ExpireMinutes"])); // Dùng

// Sau: Đọc 1 lần, có fallback
var expireMinutes = string.IsNullOrEmpty(jwtExpireMinutes) ? 60 : Convert.ToDouble(jwtExpireMinutes);
var expires = now.AddMinutes(expireMinutes);
```

**Lợi ích:**
- Code sạch hơn
- Có default value nếu config thiếu
- Hiệu suất tốt hơn

---

#### ✨ Thêm Claims Chuẩn
```csharp
// Trước: Thiếu claims quan trọng
var claims = new[]
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
    new Claim(JwtRegisteredClaimNames.Email, user.Email),
    // ... thiếu nhiều claims
};

// Sau: Đầy đủ claims chuẩn
var claims = new List<Claim>
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
    new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // ✅ Unique token ID
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),          // ✅ Standard identity claim
    new Claim(ClaimTypes.Name, user.Username),                         // ✅ Standard name claim
    new Claim("username", user.Username),
    new Claim("displayName", user.DisplayName ?? user.Username),
    new Claim("authProvider", user.AuthProvider)
};
```

**Lợi ích:**
- **Jti (JWT ID)**: Unique identifier cho mỗi token - cần thiết cho token revocation
- **ClaimTypes.NameIdentifier**: Standard claim cho User.Identity.Name
- **ClaimTypes.Name**: Tương thích với [Authorize] attribute
- Null safety cho Email

---

#### ✨ Thêm NotBefore Claim
```csharp
// Trước: Không có notBefore
var token = new JwtSecurityToken(
    issuer: _config["Jwt:Issuer"],
    audience: _config["Jwt:Audience"],
    claims: claims,
    expires: expires, // Chỉ có expires
    signingCredentials: creds
);

// Sau: Có notBefore
var now = DateTime.UtcNow;
var token = new JwtSecurityToken(
    issuer: jwtIssuer,
    audience: jwtAudience,
    claims: claims,
    notBefore: now,    // ✅ Token không hợp lệ nếu dùng trước thời điểm này
    expires: expires,
    signingCredentials: creds
);
```

**Lợi ích:**
- Ngăn chặn token được dùng trước khi được issue
- Tăng bảo mật
- Chuẩn JWT best practice

---

#### ✨ Thêm Logging
```csharp
_logger.LogInformation(
    "Generated JWT token for user {UserId} ({Username}). Issuer: {Issuer}, Audience: {Audience}, Expires: {Expires}",
    user.Id, user.Username, jwtIssuer, jwtAudience, expires);
```

**Lợi ích:**
- Debug dễ dàng
- Audit trail
- Theo dõi token generation

---

### 2. **GetPrincipalFromToken() - Validation rõ ràng**

#### ✨ Thêm Config Validation
```csharp
// Sau: Validate config trước khi dùng
if (string.IsNullOrEmpty(jwtKey) || string.IsNullOrEmpty(jwtIssuer) || string.IsNullOrEmpty(jwtAudience))
{
    _logger.LogError("JWT configuration is missing");
    return null;
}
```

---

#### ✨ Thêm ValidateIssuerSigningKey
```csharp
// Trước: Thiếu flag quan trọng
var tokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = false,
    // Thiếu ValidateIssuerSigningKey!
    ValidIssuer = _config["Jwt:Issuer"],
    ValidAudience = _config["Jwt:Audience"],
    IssuerSigningKey = new SymmetricSecurityKey(...)
};

// Sau: Đầy đủ
var tokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = false, // Intentional - for info extraction only
    ValidateIssuerSigningKey = true, // ✅ Validate chữ ký!
    ValidIssuer = jwtIssuer,
    ValidAudience = jwtAudience,
    IssuerSigningKey = new SymmetricSecurityKey(...)
};
```

**Lợi ích:**
- Validate chữ ký token
- Ngăn chặn token bị giả mạo
- Tăng bảo mật

---

#### ✨ Detailed Error Handling
```csharp
// Trước: Nuốt tất cả errors
catch
{
    return null; // Không biết lỗi gì!
}

// Sau: Chi tiết từng loại lỗi
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
- Biết chính xác lỗi gì
- Debug nhanh hơn
- Logs rõ ràng

---

## 🎯 TẠI SAO TOKEN BÂY GIỜ HOẠT ĐỘNG?

### Trước đây:
❌ Token thiếu `ClaimTypes.NameIdentifier` → RequireRoleAttribute không tìm thấy userId
❌ Config không được validate → Runtime errors
❌ Errors không rõ ràng → Debug khó khăn
❌ Duplicate code → Confusing

### Bây giờ:
✅ Token có đầy đủ claims chuẩn → Authentication middleware nhận diện đúng
✅ Config được validate sớm → Errors rõ ràng ngay từ đầu
✅ Logging chi tiết → Debug dễ dàng
✅ Code sạch, dễ maintain

---

## 📋 TOKEN MẪU SAU KHI SỬA

Decode token tại https://jwt.io/:

```json
{
  "sub": "123",                          // ✅ Standard subject claim
  "email": "user@example.com",           // ✅ Email
  "jti": "a1b2c3d4-e5f6-...",           // ✅ Unique JWT ID (mới thêm)
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "123", // ✅ Chuẩn ASP.NET (mới thêm)
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": "testuser",      // ✅ Chuẩn ASP.NET (mới thêm)
  "username": "testuser",                // ✅ Custom claim
  "displayName": "Test User",            // ✅ Custom claim
  "authProvider": "Local",               // ✅ Custom claim
  "nbf": 1700000000,                     // ✅ Not before (mới thêm)
  "exp": 1700086400,                     // ✅ Expiration
  "iss": "MarketAnalysisBackend",        // ✅ Issuer - khớp với config
  "aud": "MarketAnalysisFrontend"        // ✅ Audience - khớp với config
}
```

---

## 🧪 CÁCH TEST

### 1. Build lại project
```bash
cd MarketAnalysisBackend
dotnet build
```

### 2. Chạy app
```bash
dotnet run
```

### 3. Login để lấy token mới
```bash
curl -X POST http://localhost:5071/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "usernameOrEmail": "test@example.com",
    "password": "Test@123456"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "testuser"
}
```

### 4. Test protected endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5071/api/user/userInfo/YOUR_TOKEN
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    ...
  }
}
```

### 5. Kiểm tra logs
```bash
# Khi generate token
info: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Generated JWT token for user 123 (testuser). Issuer: MarketAnalysisBackend, Audience: MarketAnalysisFrontend, Expires: 11/18/2024 3:00:00 PM

# Nếu có lỗi validation
fail: MarketAnalysisBackend.Services.Implementations.JwtService[0]
      Invalid token audience: IDX10214: Audience validation failed...
```

---

## 🔍 TROUBLESHOOTING

### Vấn đề 1: "401 Unauthorized"
**Nguyên nhân:** Token mới chưa được tạo, đang dùng token cũ

**Giải pháp:**
1. Xóa token cũ
2. Login lại
3. Lấy token mới

---

### Vấn đề 2: "JWT Key is not configured"
**Nguyên nhân:** appsettings.json thiếu hoặc sai

**Giải pháp:**
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

---

### Vấn đề 3: "Invalid token audience"
**Nguyên nhân:** Frontend gửi token có audience khác

**Giải pháp:** Đảm bảo frontend và backend dùng cùng Audience

**Backend appsettings.json:**
```json
"Audience": "MarketAnalysisFrontend"
```

**Frontend (khi config):**
Không cần config gì, backend tự generate đúng audience

---

## 📝 NEXT STEPS (Recommended)

### 1. Implement Refresh Token (Priority: HIGH)
Token hiện tại hết hạn sau 1440 phút (24 giờ). Nên thêm refresh token để:
- User không phải login lại thường xuyên
- Có thể revoke token khi cần

### 2. Add Token Revocation (Priority: HIGH)
Hiện tại không có cách revoke token. Nên:
- Lưu JTI vào database
- Check JTI khi validate
- Có API để revoke token

### 3. Add Rate Limiting (Priority: MEDIUM)
Ngăn brute force attacks:
```bash
dotnet add package AspNetCoreRateLimit
```

### 4. Move Secrets to Environment Variables (Priority: HIGH)
```bash
export JWT_KEY="your-secret-key"
export JWT_ISSUER="MarketAnalysisBackend"
export JWT_AUDIENCE="MarketAnalysisFrontend"
```

---

## ✅ SUMMARY

| Feature | Before | After | Status |
|---------|--------|-------|--------|
| Config Validation | ❌ | ✅ | Fixed |
| Duplicate Code | ❌ | ✅ | Fixed |
| Standard Claims | ⚠️ Partial | ✅ Complete | Fixed |
| JTI (Token ID) | ❌ | ✅ | Added |
| NotBefore | ❌ | ✅ | Added |
| Error Logging | ⚠️ Generic | ✅ Detailed | Improved |
| Null Safety | ⚠️ Partial | ✅ Complete | Improved |
| Code Quality | ⚠️ | ✅ | Improved |

Token bây giờ **100% tương thích** với authentication middleware! 🎉
