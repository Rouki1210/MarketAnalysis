# Hướng dẫn sử dụng chức năng đăng nhập/đăng ký

## Tổng quan
Hệ thống xác thực (authentication) đã được tích hợp vào ứng dụng với modal đăng nhập/đăng ký hiện đại.

## Các file đã tạo

### 1. Auth Modal Component
- **File**: `src/app/features/auth/auth-modal.component.ts`
- **Template**: `src/app/features/auth/auth-modal.component.html`
- **Styles**: `src/app/features/auth/auth-modal.component.css`

Component modal với 2 tab:
- **Log In**: Đăng nhập với email/password
- **Sign Up**: Đăng ký tài khoản mới

### 2. Auth Service
- **File**: `src/app/core/services/auth.service.ts`
- Quản lý trạng thái modal (mở/đóng)
- Cung cấp các phương thức xác thực (sẽ triển khai sau)

### 3. Header Component (đã cập nhật)
- Thêm nút "Log In"
- Tích hợp auth modal
- Hiển thị modal khi click vào nút

## Tính năng

### 1. Đăng nhập (Log In Tab)
- ✅ Input email với border màu xanh
- ✅ Input password với nút hiển thị/ẩn mật khẩu
- ✅ Link "Forgot password?"
- ✅ Nút "Log In" chính
- ✅ 4 phương thức đăng nhập xã hội:
  - Google (với logo Google đầy đủ màu sắc)
  - Apple (với logo Apple)
  - Binance (với logo Binance màu vàng)
  - Wallet (với icon ví)

### 2. Đăng ký (Sign Up Tab)
- ✅ Input email
- ✅ Input password với nút hiển thị/ẩn
- ✅ Input confirm password
- ✅ Nút "Sign Up" chính
- ✅ 4 phương thức đăng ký xã hội (giống phần đăng nhập)

### 3. UI/UX
- ✅ Modal overlay tối (backdrop)
- ✅ Nút đóng (X) ở góc phải
- ✅ Chuyển đổi tab mượt mà
- ✅ Border xanh cho tab đang active
- ✅ Animation fade-in khi mở modal
- ✅ Click outside để đóng modal
- ✅ Responsive design
- ✅ Theme tối giống ảnh mẫu

## Cách sử dụng

### Mở modal đăng nhập
```typescript
// Trong bất kỳ component nào
constructor(private authService: AuthService) {}

openLogin() {
  this.authService.openAuthModal();
}
```

### Đóng modal
```typescript
closeLogin() {
  this.authService.closeAuthModal();
}
```

## Các bước tiếp theo cần triển khai

### 1. Backend API Integration
Cập nhật `auth.service.ts`:
```typescript
async login(email: string, password: string) {
  // Gọi API đăng nhập
  const response = await this.http.post('/api/auth/login', { email, password });
  // Lưu token
  localStorage.setItem('token', response.token);
  return response;
}

async signup(email: string, password: string) {
  // Gọi API đăng ký
  const response = await this.http.post('/api/auth/signup', { email, password });
  return response;
}
```

### 2. Social Authentication
Tích hợp OAuth2 cho:
- Google Sign-In
- Apple Sign-In
- Binance OAuth
- Web3 Wallet Connection

### 3. Form Validation
Thêm validation cho:
- Email format
- Password strength
- Password matching (confirm password)
- Error messages

### 4. State Management
- Lưu trạng thái đăng nhập
- Hiển thị thông tin user sau khi đăng nhập
- Thay nút "Log In" thành avatar/menu user

### 5. Security
- Implement JWT tokens
- Refresh token mechanism
- Secure password hashing
- CSRF protection

## Testing

1. Chạy ứng dụng:
```bash
npm start
```

2. Mở trình duyệt tại `http://localhost:4200`

3. Click vào nút "Log In" ở header

4. Modal sẽ hiển thị với:
   - Tab "Log In" active mặc định
   - Các input fields
   - Các nút social login

5. Test chuyển tab giữa "Log In" và "Sign Up"

6. Test đóng modal bằng:
   - Nút X
   - Click outside modal

## Customization

### Thay đổi màu sắc
Sửa file `auth-modal.component.html`:
```html
<!-- Background modal -->
class="bg-[#1a1d2e]"  <!-- Đổi màu nền -->

<!-- Border active tab -->
class="border-blue-500"  <!-- Đổi màu border -->

<!-- Button primary -->
class="bg-blue-600 hover:bg-blue-700"  <!-- Đổi màu nút -->
```

### Thay đổi kích thước modal
```html
class="max-w-md"  <!-- Đổi thành max-w-lg, max-w-xl, etc. -->
```

## Lưu ý
- Component sử dụng Angular Signals để quản lý state
- Modal được hiển thị với position: fixed, z-index: 50
- Tất cả icons được tích hợp inline SVG để tránh phụ thuộc icon library
- Form chưa có validation - cần thêm trước khi production
