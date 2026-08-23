# ✅ Faz 1 — Görev Listesi: Proje Kurulumu & Altyapı

> 📖 **Kaynak:** [phases.md — FAZ 1](phases.md#faz-1--proje-kurulumu--altyap%C4%B1)
> Bu liste, `phases.md` dosyasındaki Faz 1 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[ ]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🏗️ Backend Kurulum | 12 / 12 |
| ⚛️ Frontend Kurulum | 11 / 11 |
| 🎨 CSS & Tasarım Sistemi | 8 / 8 |
| 🧪 Testler | 5 / 5 |
| **Toplam** | **36 / 36** |

---

## 🏗️ BÖLÜM A — Backend Kurulum

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend, Adım 1-5*

### A1. Proje Oluşturma ve Paket Kurulumu

- [x] **1.** `dotnet new webapi -n MediBook.API` komutu ile ASP.NET Core Web API projesi oluştur
  - `--no-https` eklemek gerekebilir; önce help ile seçenekleri kontrol et
- [x] **2.** `Microsoft.EntityFrameworkCore` NuGet paketini ekle
  ```bash
  dotnet add package Microsoft.EntityFrameworkCore
  ```
- [x] **3.** `Pomelo.EntityFrameworkCore.MySql` NuGet paketini ekle
  ```bash
  dotnet add package Pomelo.EntityFrameworkCore.MySql
  ```
- [x] **4.** `Microsoft.AspNetCore.Authentication.JwtBearer` NuGet paketini ekle
  ```bash
  dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
  ```
- [x] **5.** `BCrypt.Net-Next` NuGet paketini ekle
  ```bash
  dotnet add package BCrypt.Net-Next
  ```
- [x] **6.** `dotnet ef` CLI aracını yükle (migration için gerekli)
  ```bash
  dotnet tool install --global dotnet-ef
  dotnet add package Microsoft.EntityFrameworkCore.Design
  ```

### A2. Klasör Yapısını Oluştur

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari — Backend Proje Yapısı*

- [x] **7.** Proje içinde şu klasörleri oluştur:
  - `Controllers/`
  - `Services/`
  - `Repositories/`
  - `Models/`
  - `DTOs/`
  - `Data/`
  - `Middleware/`

### A3. AppDbContext ve Veritabanı Bağlantısı

> 📌 Kaynak: `phases.md` → *Backend Adım 2 — AppDbContext Kurulumu*

- [x] **8.** `Data/AppDbContext.cs` dosyasını oluştur, `DbContext`'ten türet
- [x] **9.** `Models/User.cs` entity sınıfını oluştur (`phases.md`'deki Users tablosu şemasına göre):
  - `Id`, `FirstName`, `LastName`, `Email`, `PasswordHash`, `Role`, `PhoneNumber`, `CreatedAt`, `IsActive`
  - `Role` için `enum` (Patient, Doctor, Admin) tanımla
- [x] **10.** `AppDbContext`'e `DbSet<User>` ekle, `OnModelCreating`'de unique email kısıtı tanımla
- [x] **11.** `appsettings.json`'a MySQL connection string ekle:
  ```json
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=medibook_db;User=root;Password=YOUR_PASSWORD;"
  }
  ```
- [x] **12.** `Program.cs`'e MySQL bağlantısını kaydet:
  ```csharp
  builder.Services.AddDbContext<AppDbContext>(options =>
      options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));
  ```

### A4. İlk Migration

> 📌 Kaynak: `phases.md` → *Backend Adım 3 — İlk Migration*

- [x] **13.** Migration oluştur:
  ```bash
  dotnet ef migrations add InitialCreate
  ```
- [x] **14.** Migration'ı veritabanına uygula:
  ```bash
  dotnet ef database update
  ```
- [x] **15.** MySQL'de `medibook_db` veritabanının ve `Users` tablosunun oluşturulduğunu doğrula

### A5. CORS Konfigürasyonu

> 📌 Kaynak: `phases.md` → *Backend Adım 4 — CORS Konfigürasyonu*

- [x] **16.** `Program.cs`'e CORS policy ekle:
  - Origin: `http://localhost:5173`
  - `AllowAnyHeader()`, `AllowAnyMethod()`, `AllowCredentials()`
- [x] **17.** `app.UseCors("FrontendPolicy")` middleware'ini pipeline'a ekle (doğru sırada: `UseRouting`'den sonra)

### A6. Global Hata Middleware'i

> 📌 Kaynak: `phases.md` → *Backend Adım 5 — Global Hata Middleware*

- [x] **18.** `Middleware/ExceptionMiddleware.cs` dosyasını oluştur
- [x] **19.** Middleware'de tüm exception'ları `try/catch` ile yakala, standart JSON formatında yanıt döndür:
  ```json
  { "success": false, "message": "...", "errors": [] }
  ```
- [x] **20.** Middleware'i `Program.cs`'e kaydet: `app.UseMiddleware<ExceptionMiddleware>()`
- [x] **21.** Swagger'ın Development ortamında aktif olduğunu doğrula (`app.UseSwagger()`, `app.UseSwaggerUI()`)

---

## ⚛️ BÖLÜM B — Frontend Kurulum

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend, Adım 1-3*

### B1. Vite + React Projesi Kurulumu

- [x] **22.** Vite ile React projesi oluştur:
  ```bash
  npm create vite@latest medibook-client -- --template react
  ```
- [x] **23.** Proje klasörüne gir ve bağımlılıkları yükle:
  ```bash
  cd medibook-client
  npm install
  ```
- [x] **24.** Gerekli kütüphaneleri ekle:
  ```bash
  npm install axios react-router-dom
  ```
- [x] **25.** `npm run dev` ile geliştirme sunucusunu başlat, `http://localhost:5173`'ün açıldığını doğrula

### B2. Klasör Yapısını Oluştur

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari — Frontend Proje Yapısı*

- [x] **26.** `src/` içinde şu klasörleri oluştur:
  - `api/`
  - `components/`
  - `pages/`
  - `context/`
  - `hooks/`
  - `utils/`
  - `styles/`

### B3. Axios Instance

> 📌 Kaynak: `phases.md` → *Frontend Adım 2 — Axios Instance*

- [x] **27.** `src/api/axiosInstance.js` dosyasını oluştur:
  ```javascript
  import axios from 'axios';
  const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });
  export default api;
  ```
- [x] **28.** Request interceptor ekle: her isteğe `Authorization: Bearer <token>` header'ı eklenecek (token Faz 2'de gelecek, şimdilik yorum satırı bırak)
- [x] **29.** Response interceptor için iskelet bırak: 401 → refresh token akışı (Faz 2'de doldurulacak)

### B4. React Router Kurulumu

> 📌 Kaynak: `phases.md` → *Frontend Adım 3 — React Router Kurulumu*

- [x] **30.** `src/App.jsx`'i `BrowserRouter` ile sar
- [x] **31.** Temel route yapısını kur (placeholder sayfa bileşenleriyle):
  - `/` → Login'e yönlendir
  - `/login` → `LoginPage` (boş bileşen)
  - `/register` → `RegisterPage` (boş bileşen)
  - `/patient/*` → `PatientLayout` (korumalı, Faz 2'de aktif olacak)
  - `/doctor/*` → `DoctorLayout` (korumalı)
  - `/admin/*` → `AdminLayout` (korumalı)
- [x] **32.** `src/pages/` altında placeholder sayfa dosyalarını oluştur: `LoginPage.jsx`, `RegisterPage.jsx`

---

## 🎨 BÖLÜM C — CSS & Tasarım Sistemi

> 📌 Kaynak: `phases.md` → *Frontend Adım 4-5 — CSS Temel Sistemi & Mobile-First Responsive Sistem*

### C1. CSS Token Sistemi

- [x] **33.** `src/styles/index.css` dosyasını oluştur, CSS reset ekle (margin/padding sıfırlama, `box-sizing: border-box`)
- [x] **34.** `:root` içine renk token'larını tanımla:
  ```css
  --primary: #1E5CA8;
  --primary-dark: #0F4C81;
  --text-dark: #0F2A44;
  --text-muted: #5F6B7A;
  --bg: #F5F7FA;
  --white: #FFFFFF;
  --success: #2ECC71;
  --warning: #F39C12;
  --danger: #E74C3C;
  --radius: 8px;
  --shadow: 0 2px 12px rgba(0,0,0,0.08);
  ```
- [x] **35.** `index.html`'e Google Fonts'tan `Inter` fontunu ekle:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  ```
- [x] **36.** `body`'ye `font-family: 'Inter', sans-serif` ve `background-color: var(--bg)` uygula

### C2. Mobile-First Breakpoint Sistemi

> 📌 Kaynak: `phases.md` → *Frontend Adım 5 — Mobile-First Responsive Sistem*
> ⚠️ **Kural:** Tüm CSS önce mobil (0px) için yazılır, sonra `min-width` ile büyütülür.

- [x] **37.** `src/styles/breakpoints.css` dosyasını oluştur, breakpoint'leri yorum olarak tanımla:
  - Mobil: 0-479px (varsayılan, media query yok)
  - Tablet: `@media (min-width: 480px)`
  - Küçük masaüstü: `@media (min-width: 768px)`
  - Büyük masaüstü: `@media (min-width: 1024px)`
  - Geniş ekran: `@media (min-width: 1280px)`
- [x] **38.** `src/styles/index.css`'e `@import './breakpoints.css'` ekle
- [x] **39.** Global `.container` sınıfını mobile-first olarak tanımla:
  ```css
  .container {
    width: 100%;
    padding: 0 1rem;       /* Mobil: iki yandan padding */
  }
  @media (min-width: 768px) {
    .container { padding: 0 2rem; }
  }
  @media (min-width: 1280px) {
    .container { max-width: 1200px; margin: 0 auto; }
  }
  ```
- [x] **40.** Temel Navbar iskeletini (`src/components/Navbar.jsx`) oluştur — mobilde hamburger menü yapısı (Faz 2'de doldurulacak)

---

## 🧪 BÖLÜM D — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T1.1 – T1.5*

- [x] **41.** **[T1.1]** Backend'i çalıştır (`dotnet run`), Swagger UI'ın `http://localhost:5000/swagger`'da açıldığını doğrula
- [x] **42.** **[T1.2]** MySQL'e bağlan, `medibook_db` içinde `Users` tablosunun ve tüm sütunların doğru oluşturulduğunu doğrula
- [x] **43.** **[T1.3]** Frontend'i çalıştır (`npm run dev`), `http://localhost:5173`'ün hatasız açıldığını doğrula
- [x] **44.** **[T1.4]** Frontend'den Axios ile backend'e basit bir test isteği gönder, CORS hatası almadan yanıt geldiğini doğrula
- [x] **45.** **[T1.5]** Tanımsız bir endpoint'e istek at (örn. `/api/v1/test`), global middleware'in `{ success: false, message: "Not Found" }` formatında yanıt döndürdüğünü doğrula

---

## ✅ Faz 1 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 1 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 1 tamamdır ve Faz 2'ye geçilebilir:

- [x] Backend Swagger üzerinden erişilebilir durumda (`http://localhost:5000/swagger`)
- [x] MySQL veritabanına bağlantı başarılı (`medibook_db` oluşturuldu)
- [x] `Users` tablosu tüm sütunlarıyla migration ile oluşturuldu
- [x] Frontend `localhost:5173`'te hatasız çalışıyor
- [x] Axios instance yapılandırıldı (`src/api/axiosInstance.js`)
- [x] Global CSS token'ları ve breakpoint sistemi tanımlandı
- [x] CORS — Frontend'den backend'e istek başarıyla gidiyor
- [x] Global hata middleware standart JSON formatında yanıt dönüyor

---

## 📝 Notlar & Dikkat Edilecekler

| # | Not |
|---|---|
| 1 | MySQL'in yerel makinede kurulu ve çalışır durumda olduğundan emin ol |
| 2 | `appsettings.json`'daki şifreyi `.gitignore` ile git'e yükleme! `appsettings.Development.json` kullan |
| 3 | `dotnet ef` CLI aracı zaten yüklüyse tekrar yükleme adımını atla |
| 4 | Frontend ve backend **aynı anda** çalışmalı — iki ayrı terminal penceresi aç |
| 5 | Breakpoint sistemini Faz 2'den itibaren her bileşende uygula |

---

*Tüm görevler tamamlandıktan sonra → **[Faz 2 Görev Listesi](tasks-faz2.md)** ile devam et.*
