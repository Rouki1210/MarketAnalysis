# MarketAnalysis

**MarketAnalysis** is a full-stack web application built with **Angular 18** (frontend) and **ASP.NET Core 8** (backend).  
It provides a secure and scalable system for user authentication using both **email/password** and **Google OAuth2**,  
and will later support advanced market data analysis features.

---

## 🚀 Overview

- **Frontend**: Angular 18 with Google Identity Services for OAuth 2.0 login  
- **Backend**: ASP.NET Core 8 API handling authentication, user management, and JWT token generation  
- **Database**: PostgreSQL (configured via `appsettings.json`)  
- **Authentication methods**:
  - Standard email/password signup & login
  - Google OAuth 2.0 login (auto-registers new users)
- **JWT-based authentication** for secure API access

---

## 📁 Project Structure

```
MarketAnalysis/
├── MarketAnalysisFrontend/     # Angular 18 Frontend
│   ├── src/
│   └── ...
│
├── MarketAnalysisBackend/      # ASP.NET Core Backend
│   ├── Controllers/
│   ├── Models/
│   ├── Services/
│   ├── Repositories/
│   └── appsettings.json (ignored)
│
├── .gitignore
└── README.md
```

---

## 🧠 Features

✅ Google OAuth2 login (using authorization code flow)  
✅ Secure JWT generation & token validation  
✅ User registration and login with email/password  
✅ Role-based structure for future admin/user separation  
✅ PostgreSQL integration  
✅ Modular, scalable architecture for analytics and APIs  

---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup (ASP.NET Core 8)

1. Navigate to backend folder:
   ```bash
   cd MarketAnalysisBackend
   ```

2. Create your configuration file:
   ```bash
   cp appsettings.example.json appsettings.json
   ```

3. Edit `appsettings.json` and fill in your credentials:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=MarketAnalysis;Username=postgres;Password=yourpassword"
     },
     "Google": {
       "ClientId": "YOUR_GOOGLE_CLIENT_ID",
       "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET",
       "RedirectUri": "http://localhost:4200"
     },
     "Jwt": {
       "Key": "your-secret-jwt-key",
       "Issuer": "MarketAnalysis",
       "Audience": "MarketAnalysisUsers"
     }
   }
   ```

4. Run database migrations (if using EF Core):
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

5. Run the backend:
   ```bash
   dotnet run
   ```

---

### 2️⃣ Frontend Setup (Angular 18)

1. Navigate to the frontend directory:
   ```bash
   cd MarketAnalysisFrontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment file:
   ```typescript
   // src/environments/environment.ts
   export const environment = {
     production: false,
     apiBaseUrl: 'https://localhost:7175',
     googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
     googleRedirectUri: 'http://localhost:4200'
   };
   ```

4. Start the development server:
   ```bash
   ng serve --port 4200
   ```

---

## 🔐 Google OAuth2 Login Flow

1. Frontend requests a Google authorization code using  
   `google.accounts.oauth2.initCodeClient`
2. The authorization code is sent to backend endpoint `/api/Auth/google`
3. Backend exchanges the code for Google tokens (`id_token`, `access_token`)
4. The `id_token` is verified and decoded to extract user info (email, name)
5. If the user doesn’t exist, backend auto-creates a new user record
6. A **JWT token** is generated and returned to the frontend
7. Frontend stores JWT in local storage and marks user as logged in

---

## 🧩 API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| `POST` | `/api/Auth/register` | Register a new user with email & password |
| `POST` | `/api/Auth/login` | Login using email & password |
| `POST` | `/api/Auth/google` | Login or sign up using Google OAuth |
| `GET`  | `/api/User/me` | Get the current logged-in user info (JWT required) |

---

## ⚠️ Important Notes

- Never push your real `appsettings.json` to GitHub.  
  It should be **listed in `.gitignore`** (already included).
- Use an `appsettings.example.json` for sharing sample configs.
- Update your **Google Cloud OAuth Consent Screen** to "External"  
  if you want users outside your organization to log in.
- Always use HTTPS and correct redirect URIs in production.

---

## 🧪 Development Tips

- If you get `redirect_uri_mismatch`, ensure your redirect URI  
  matches exactly in both Google Cloud Console and your environment file.
- If you get `403: org_internal`, switch OAuth consent type to **External**.
- Use browser console + backend logs for tracing OAuth code flow.

---

## 👥 Contribution Guidelines

1. Fork this repository  
2. Create a new branch: `git checkout -b feature/YourFeature`  
3. Commit your changes: `git commit -m "Add your feature"`  
4. Push to your branch: `git push origin feature/YourFeature`  
5. Open a Pull Request 🎉

---

## 📜 License

This project is open-source under the **MIT License**.  
Feel free to use, modify, and distribute it with proper attribution.

```
MIT © 2025 Vinh Nguyen (Rouki1210)
```

---

## 📧 Contact

**Main Developer:** Vinh Nguyen && Pham Huu Anh Vu
**GitHub:** [Rouki1210](https://github.com/Rouki1210) && [25thnovvv](https://github.com/25thnovvv)
**Email:** vinh12102004@gmail.com  

---

## 👥 Contributors

| Avatar | Name | Role | GitHub |
|--------|------|------|---------|
| <img src="https://github.com/Rouki1210.png" width="50" height="50" style="border-radius:50%;"> | **Vinh Nguyen (Rouki1210)** | Full-Stack Developer / Project Owner | [Rouki1210](https://github.com/Rouki1210) |
| <img src="https://github.com/25thnovvv.png" width="50" height="50" style="border-radius:50%;"> | **Pham Huu Anh Vu (25thnovvv)** | Frontend Developer | [25thnovvv](https://github.com/25thnovvv) |
| <img src="https://github.com/Kim2k4.png" width="50" height="50" style="border-radius:50%;"> | **Kim2k4** | Frontend Developer | [Kim2k4](https://github.com/Kim2k4) |

---

## 🌟 Future Plans

- Market data analytics dashboard  
- Real-time crypto & gold price tracking  
- Historical data visualization  
- User portfolio management  

---

Made with ❤️ by **Vinh Nguyen**
