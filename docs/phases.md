# MediBook — Geliştirme Yol Haritası (Phases)

> **Amaç:** Bu belge, MediBook projesini ekran bazlı modüllere bölerek adım adım ilerleyebileceğin öğretici bir geliştirme planı sunar.
> Her faz bağımsız olarak tamamlanabilir ve bir sonraki fazın temelini oluşturur.

---

## 📌 Karar Verilen Teknik Parametreler

| Konu | Karar |
|---|---|
| Randevu slot süresi | 30 dakika (sabit) |
| Reschedule (yeniden planlama) | Yok — iptal + yeni randevu akışı yeterli |
| Background Job (SMS hatırlatma) | .NET `IHostedService` (BackgroundService) |
| Access Token süresi | 15 dakika |
| Refresh Token süresi | 7 gün (HttpOnly cookie) |
| Çoklu cihaz oturumu | Desteklenmiyor (tek aktif oturum) |
| Geçmiş tarihe randevu | Backend'de yasak (validation) |
| En erken randevu rezervasyonu | Randevudan en az 2 saat öncesi |
| Admin seed şifresi | `Admin123!` |
| Doctor seed şifresi | `password123` |
| Dashboard istatistik gösterimi | Sayı kartları + son 7 günlük randevu tablosu |
| Rate limiting (login) | 5 başarısız deneme → 15 dakika bekleme |
| Pagination | 10 öğe/sayfa |

---

## 🗺️ Genel Faz Haritası

```
Faz 1 → Proje Kurulumu & Altyapı
Faz 2 → Kimlik Doğrulama (Auth) Modülü
Faz 3 → Doktor Listeleme & Arama Ekranı
Faz 4 → Randevu Alma Ekranı
Faz 5 → Hasta Dashboard (Randevularım)
Faz 6 → Doktor Dashboard
Faz 7 → Admin Panel
Faz 8 → SMS Bildirim Entegrasyonu
Faz 9 → Güvenlik, Hata Yönetimi & Polishing
```

---

---

# FAZ 1 — Proje Kurulumu & Altyapı

> **Hedef:** Backend ve frontend iskeletini kurmak, veritabanı bağlantısını sağlamak, temel proje yapısını oluşturmak.
> Bu faz kod yazmadan önce sağlam bir zemin hazırlar.

---

## 🖥️ UI/UX Tasarımı

Bu fazda görsel ekran yoktur. Ancak aşağıdaki kararlar verilmelidir:

- **Renk sistemi** CSS değişkenleri (`--primary`, `--secondary`, `--danger` vb.) ile tanımlanır
- **Font:** `Inter` (Google Fonts üzerinden)
- **Global layout:** Üst navigasyon çubuğu (Navbar) + ana içerik alanı
- `index.css` içinde reset, tipografi ve renk token'ları tanımlanır

---

## 🗄️ Veri Yapısı & Mimari

### Backend Proje Yapısı
```
MediBook.API/
├── Controllers/
├── Services/          ← İş mantığı
├── Repositories/      ← Veri erişimi
├── Models/            ← Entity sınıfları
├── DTOs/              ← İstek/yanıt nesneleri
├── Data/
│   └── AppDbContext.cs
├── Middleware/        ← Hata yönetimi, loglama
└── appsettings.json
```

### Frontend Proje Yapısı
```
medibook-client/
├── src/
│   ├── api/           ← Axios instance + endpoint fonksiyonları
│   ├── components/    ← Paylaşılan UI bileşenleri
│   ├── pages/         ← Sayfa bileşenleri
│   ├── context/       ← AuthContext
│   ├── hooks/         ← Custom hook'lar
│   ├── utils/         ← Yardımcı fonksiyonlar
│   └── styles/        ← Global CSS
└── index.html
```

### Veritabanı İlk Migration
```
Users tablosu:
- Id (int, PK, auto-increment)
- FirstName (varchar 100)
- LastName (varchar 100)
- Email (varchar 255, unique)
- PasswordHash (varchar 255)
- Role (enum: Patient | Doctor | Admin)
- PhoneNumber (varchar 20)
- CreatedAt (datetime)
- IsActive (bool, default: true)
```

---

## ⚙️ Kodlama Süreci — Backend

### Adım 1: Proje Oluşturma
```bash
dotnet new webapi -n MediBook.API
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Pomelo.EntityFrameworkCore.MySql
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package BCrypt.Net-Next
```

### Adım 2: AppDbContext Kurulumu
- `AppDbContext.cs` oluştur
- `Program.cs`'e MySQL bağlantısı ekle
- `appsettings.json`'a connection string yaz

### Adım 3: İlk Migration
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Adım 4: CORS Konfigürasyonu
```csharp
// Program.cs
builder.Services.AddCors(options => {
    options.AddPolicy("FrontendPolicy", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Refresh token cookie için
    });
});
```

### Adım 5: Global Hata Middleware'i
- `ExceptionMiddleware.cs` → try/catch ile tüm exception'ları yakala
- Standart hata yanıt formatı: `{ success, message, errors? }`

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: Vite + React Kurulumu
```bash
npm create vite@latest medibook-client -- --template react
cd medibook-client
npm install axios react-router-dom
```

### Adım 2: Axios Instance
```javascript
// src/api/axiosInstance.js
const api = axios.create({ baseURL: 'http://localhost:5000/api/v1' });
// Request interceptor: Authorization header
// Response interceptor: 401 → refresh token → retry
```

### Adım 3: React Router Kurulumu
```javascript
// Temel route yapısı
/               → Landing / Login redirect
/login          → Login sayfası
/register       → Kayıt sayfası
/patient/*      → Hasta sayfaları (korumalı)
/doctor/*       → Doktor sayfaları (korumalı)
/admin/*        → Admin sayfaları (korumalı)
```

### Adım 4: CSS Temel Sistemi
```css
/* src/styles/index.css */
:root {
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
}
```

### Adım 5: Mobile-First Responsive Sistem

> ⚠️ **Temel Prensip:** Tüm bileşenler **önce mobil için** yazılır, ardından büyük ekranlara doğru genişletilir (`min-width` media query'leri kullanılır).

**Breakpoint Tanımları:**
```css
/* src/styles/breakpoints.css */

/* Mobil: 0 - 479px → varsayılan (media query yok) */
/* Tablet: 480px ve üzeri */
@media (min-width: 480px) { }

/* Küçük masaüstü: 768px ve üzeri */
@media (min-width: 768px) { }

/* Büyük masaüstü: 1024px ve üzeri */
@media (min-width: 1024px) { }

/* Geniş ekran: 1280px ve üzeri */
@media (min-width: 1280px) { }
```

**Grid Sistemi (Mobile-First):**
```css
/* Doktor kartları — önce tek sütun (mobil), sonra genişle */
.doctors-grid {
  display: grid;
  grid-template-columns: 1fr;              /* Mobil: tek sütun */
  gap: 1rem;
}

@media (min-width: 480px) {
  .doctors-grid { grid-template-columns: repeat(2, 1fr); } /* Tablet */
}

@media (min-width: 1024px) {
  .doctors-grid { grid-template-columns: repeat(3, 1fr); } /* Masaüstü */
}
```

**Geliştirme Kuralları (tüm fazlar için geçerli):**
- Tüm layout'lar **tek sütundan** başlar
- Genişlik için `px` yerine `%`, `rem`, `clamp()` kullan
- Touch hedefleri minimum `44x44px` olmalı (butonlar, linkler)
- Navbar mobilde hamburger menüye dönüşür (Faz 2'den itibaren)

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T1.1 | Backend başlatıldığında DB bağlantısı | Manuel | Swagger UI açılır, DB bağlantısı başarılı |
| T1.2 | Migration uygulandı mı | Manuel | `Users` tablosu MySQL'de mevcut |
| T1.3 | Frontend başlatıldığında ana sayfa yüklenir | Manuel | `http://localhost:5173` hatasız açılır |
| T1.4 | CORS — Frontend'den API çağrısı | Manuel | 403 olmadan yanıt gelir |
| T1.5 | Global hata middleware | Unit Test | Tanımsız endpoint'e istek → `{ success: false, message: "Not Found" }` |

---

## ✅ Faz 1 Tamamlanma Kriterleri

- [ ] Backend Swagger üzerinden erişilebilir durumda
- [ ] MySQL veritabanına bağlantı başarılı
- [ ] `Users` tablosu migration ile oluşturuldu
- [ ] Frontend `localhost:5173`'te hatasız çalışıyor
- [ ] Axios instance yapılandırıldı
- [ ] Global CSS token'ları tanımlandı

---
---

# FAZ 2 — Kimlik Doğrulama (Auth) Modülü

> **Hedef:** Kayıt, giriş ve oturum yönetimi ekranlarını oluşturmak. JWT Access + Refresh Token akışını kurmak.

---

## 🖥️ UI/UX Tasarımı

### Kayıt Ekranı (`/register`)
**Bileşenler:**
- Merkezi kart layout (beyaz kart, gölge, `--radius`)
- Logo / başlık
- Form alanları: Ad, Soyad, Email, Telefon, Doğum Tarihi, Şifre, Şifre Tekrar
- Email kullanılabilirlik göstergesi (yeşil ✓ / kırmızı ✗, async kontrol)
- Gönder butonu (loading spinner ile)
- "Zaten hesabın var mı? Giriş yap" linki

### Giriş Ekranı (`/login`)
**Bileşenler:**
- Merkezi kart layout
- Email + Şifre alanları
- Hata mesajı alanı (kırmızı alert kutusu)
- Giriş butonu
- "Hesap oluştur" linki

### Rol Yönlendirme Mantığı
```
Giriş başarılı →
  Role === "Patient"  → /patient/dashboard
  Role === "Doctor"   → /doctor/dashboard
  Role === "Admin"    → /admin/dashboard
```

---

## 🗄️ Veri Yapısı & Mimari

### Yeni Tablolar (Migration)
```
PatientProfiles:
- Id (int, PK)
- UserId (int, FK → Users.Id, unique)
- DateOfBirth (date)
- Gender (varchar 10)
- Address (varchar 500, nullable)

RefreshTokens:
- Id (int, PK)
- UserId (int, FK → Users.Id)
- Token (varchar 500, unique)
- ExpiresAt (datetime)
- CreatedAt (datetime)
- IsRevoked (bool, default: false)
```

### DTO'lar
```csharp
RegisterRequestDto   { FirstName, LastName, Email, Phone, DateOfBirth, Password, ConfirmPassword }
LoginRequestDto      { Email, Password }
AuthResponseDto      { AccessToken, Role, FullName, UserId }
// Refresh Token → HttpOnly Cookie olarak set edilir (DTO içinde değil)
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint'ler
```
POST /api/v1/auth/register   → Hasta kaydı
POST /api/v1/auth/login      → Giriş + JWT üretimi
POST /api/v1/auth/refresh    → Access token yenileme
POST /api/v1/auth/logout     → Refresh token iptali
GET  /api/v1/auth/check-email?email= → Email kullanılabilirlik
```

### Adım 1: JWT Token Üretimi
```csharp
// Claim'ler: UserId, Email, Role, FullName
// Access Token: 15 dakika ömürlü
// Refresh Token: random GUID → DB'ye kaydet → HttpOnly cookie
```

### Adım 2: Şifre Hashleme
```csharp
// Kayıt: BCrypt.HashPassword(dto.Password)
// Doğrulama: BCrypt.Verify(dto.Password, user.PasswordHash)
```

### Adım 3: Refresh Token Akışı
```
1. /auth/refresh çağrıldığında cookie'den token oku
2. DB'de geçerli ve revoked olmayan token'ı bul
3. Eski token'ı revoke et
4. Yeni access + refresh token üret
5. Yeni refresh token'ı cookie'ye yaz
```

### Adım 4: Rate Limiting (Login)
```csharp
// Program.cs → builder.Services.AddRateLimiter()
// Login endpoint: 5 istek / 15 dakika / IP bazlı
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: AuthContext
```javascript
// src/context/AuthContext.jsx
// State: { user, accessToken, isAuthenticated, isLoading }
// Actions: login(), logout(), refreshToken()
// Token → memory'de tut (localStorage değil, XSS güvenliği için)
```

### Adım 2: Axios Interceptor — Token Yenileme
```javascript
// Response interceptor:
// 401 alınırsa → /auth/refresh çağır (cookie otomatik gider)
// Yeni access token alınırsa → başarısız isteği tekrar dene
// Refresh da 401 dönerse → logout() çağır
```

### Adım 3: ProtectedRoute Bileşeni
```javascript
// <ProtectedRoute role="Patient"> → sadece Patient rolü erişebilir
// Yetkisiz erişimde /login'e yönlendir
```

### Adım 4: Form Validasyonu (Frontend)
```javascript
// Email: regex ile format kontrolü
// Şifre: min 6 karakter
// Şifre Tekrar: eşleşme kontrolü
// Telefon: sadece rakam, 10-11 karakter
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T2.1 | Geçerli bilgilerle kayıt | Integration | 201 Created, DB'de yeni kullanıcı |
| T2.2 | Var olan email ile kayıt | Integration | 400 Bad Request, hata mesajı |
| T2.3 | Geçerli giriş (Patient) | Integration | 200 OK, access token + cookie |
| T2.4 | Yanlış şifre ile giriş | Integration | 401 Unauthorized |
| T2.5 | Süresi dolmuş access token → refresh | Integration | Yeni access token alınır |
| T2.6 | Logout sonrası refresh | Integration | 401 (token revoked) |
| T2.7 | Login rate limit aşımı | Integration | 429 Too Many Requests |
| T2.8 | Email check — mevcut email | Unit | `{ available: false }` |
| T2.9 | Email check — yeni email | Unit | `{ available: true }` |
| T2.10 | Eksik alanlarla kayıt formu | UI | Hata mesajları gösterilir, form gönderilmez |

---

## ✅ Faz 2 Tamamlanma Kriterleri

- [ ] Hasta kayıt formu çalışıyor (validasyon + async email kontrolü)
- [ ] Giriş ekranı çalışıyor, rol bazlı yönlendirme yapıyor
- [ ] JWT access token memory'de, refresh token HttpOnly cookie'de
- [ ] Token yenileme interceptor'ı çalışıyor
- [ ] ProtectedRoute bileşeni yetkisiz erişimi engelliyor
- [ ] Rate limiting login endpoint'inde aktif

---
---

# FAZ 3 — Doktor Listeleme & Arama Ekranı

> **Hedef:** Hastaların doktorları listeleyebileceği, uzmanlık alanına göre filtreleyip arayabileceği ekranı oluşturmak.

---

## 🖥️ UI/UX Tasarımı

### Doktorlar Sayfası (`/patient/doctors`)
**Bileşenler:**
- **Arama & Filtre Çubuğu:**
  - Metin arama input'u (doktor adı)
  - Uzmanlık dropdown filtresi (Kardiyoloji, Pediatri, Ortopedi vb.)
  - "Temizle" butonu
- **Doktor Kartları Grid (2-3 sütun):**
  - Avatar (baş harfler — CSS ile renkli daire)
  - Ad Soyad
  - Uzmanlık alanı badge'i (mavi)
  - Deneyim yılı
  - "Randevu Al" butonu → Faz 4'e yönlendirir
- **Pagination:** Sayfa başı 10 kart, önceki/sonraki butonlar
- **Boş durum:** "Sonuç bulunamadı" görseli ve mesajı

---

## 🗄️ Veri Yapısı & Mimari

### Yeni Tablolar (Migration)
```
DoctorProfiles:
- Id (int, PK)
- UserId (int, FK → Users.Id, unique)
- Specialty (varchar 100)
- Bio (text, nullable)
- YearsOfExperience (int)

DoctorAvailability:
- Id (int, PK)
- DoctorId (int, FK → DoctorProfiles.Id)
- DayOfWeek (int: 0=Pazar ... 6=Cumartesi)
- StartTime (time)
- EndTime (time)
-- Örnek: Salı 09:00-17:00 → Her 30 dk'da bir slot üretilir
```

### Seed Data (Faz 3)
```csharp
// 1 Admin: admin@medibook.com / Admin123!
// 1 Doctor: Pediatri, 5 yıl deneyim / password123
// DoctorAvailability: Hafta içi 09:00-17:00
```

### DTO'lar
```csharp
DoctorListItemDto     { DoctorId, FullName, Specialty, YearsOfExperience, UserId }
DoctorListResponseDto { Doctors: List<DoctorListItemDto>, TotalCount, Page, PageSize }
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint
```
GET /api/v1/doctors?search=&specialty=&page=1&pageSize=10
```

### Mantıksal Akış
```
1. Query string parametrelerini al
2. Users JOIN DoctorProfiles sorgusu kur
3. IsActive = true filtresi uygula
4. search parametresi varsa → FirstName + LastName LIKE '%search%'
5. specialty varsa → Specialty = specialty
6. Skip((page-1)*pageSize).Take(pageSize) ile paginate et
7. TotalCount ile birlikte DTO'ya dönüştür ve döndür
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: useDoctors Custom Hook
```javascript
// src/hooks/useDoctors.js
// State: { doctors, totalCount, page, isLoading, error }
// Arama ve filtre değiştiğinde 300ms debounce ile API çağrısı
```

### Adım 2: DoctorCard Bileşeni
```javascript
// src/components/DoctorCard.jsx
// Avatar: isim baş harfleri (CSS ile renkli daire)
// "Randevu Al" → navigate('/patient/appointment/doctorId')
```

### Adım 3: SearchFilter Bileşeni
```javascript
// src/components/SearchFilter.jsx
// Props: { onSearch, onSpecialtyChange }
// Specialty listesi: sabit array
```

### Adım 4: Pagination Bileşeni
```javascript
// src/components/Pagination.jsx
// Props: { currentPage, totalPages, onPageChange }
// Aktif sayfa vurgulama
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T3.1 | Tüm aktif doktorlar listelenir | Integration | Sayfalı liste, toplam sayı doğru |
| T3.2 | Uzmanlığa göre filtreleme | Integration | Sadece ilgili uzmanlık doktorları |
| T3.3 | İsme göre arama | Integration | Kısmi eşleşme çalışıyor |
| T3.4 | Pasif doktor listelenmez | Integration | isActive=false doktor görünmez |
| T3.5 | Boş sonuç durumu | UI | "Sonuç bulunamadı" mesajı görünür |
| T3.6 | Sayfalama — 11+ doktor | Integration | Sayfa 2'de devam eder |
| T3.7 | Yetkisiz erişim (çıkış yapılmış) | UI | /login'e yönlendirir |

---

## ✅ Faz 3 Tamamlanma Kriterleri

- [ ] Doktor kartları grid layout'ta listeleniyor
- [ ] İsim ve uzmanlık filtresi çalışıyor
- [ ] Debounce ile gereksiz API çağrısı önleniyor
- [ ] Pagination 10'ar öğeyle çalışıyor
- [ ] Seed data ile en az 3-5 doktor görüntülenebiliyor

---
---

# FAZ 4 — Randevu Alma Ekranı

> **Hedef:** Hastanın doktor profilini görüntüleyip, müsait tarih/saat seçerek randevu oluşturmasını sağlamak.

---

## 🖥️ UI/UX Tasarımı

### Doktor Profil & Randevu Ekranı (`/patient/appointment/:doctorId`)
**Bileşenler:**
- **Doktor Profil Kartı (üst):** Avatar, Ad Soyad, Uzmanlık, Deneyim, Bio
- **Adım 1 — Tarih Seçimi:**
  - Mini takvim (bu hafta + sonraki 4 hafta)
  - Sadece doktorun çalışma günleri seçilebilir (diğerleri disabled)
  - Geçmiş tarihler disabled
- **Adım 2 — Saat Seçimi (tarih seçilince açılır):**
  - 30 dakikalık slotlar grid olarak (09:00, 09:30, 10:00...)
  - Dolu slotlar gri/disabled
  - Boş slotlar mavi, hover efekti
- **Adım 3 — Notlar Formu:**
  - Semptomlar textarea
  - Ek notlar textarea (opsiyonel)
- **Randevu Onayla Butonu:** Loading state → başarı animasyonu → dashboard'a yönlendirme

---

## 🗄️ Veri Yapısı & Mimari

### Yeni Tablo (Migration)
```
Appointments:
- Id (int, PK)
- PatientId (int, FK → Users.Id)
- DoctorId (int, FK → DoctorProfiles.Id)
- AppointmentDate (date)
- AppointmentTime (time)
- Status (enum: Scheduled | Confirmed | Completed | Cancelled)
- Symptoms (text, nullable)
- PatientNotes (text, nullable)
- DoctorNotes (text, nullable)
- Diagnosis (text, nullable)
- IsReminderSent (bool, default: false)
- CreatedAt (datetime)
- UpdatedAt (datetime)
```

### DTO'lar
```csharp
DoctorDetailDto           { DoctorId, FullName, Specialty, YearsOfExperience, Bio, AvailableDays: int[] }
AvailableSlotsRequestDto  { DoctorId, Date }
TimeSlotDto               { Time, IsAvailable }
CreateAppointmentDto      { DoctorId, AppointmentDate, AppointmentTime, Symptoms, PatientNotes }
AppointmentResponseDto    { Id, DoctorName, Date, Time, Status }
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint'ler
```
GET  /api/v1/doctors/{id}                   → Doktor profil detayı
GET  /api/v1/doctors/{id}/slots?date=       → Müsait slotlar
POST /api/v1/appointments                   → Randevu oluşturma
```

### Slot Hesaplama Mantığı
```
1. DoctorAvailability'den seçilen güne (DayOfWeek) ait çalışma saatlerini al
2. StartTime-EndTime aralığını 30 dakikalık dilimlere böl
3. Bu tarihe ait mevcut randevuları DB'den çek (Status != Cancelled)
4. Dolu slotları IsAvailable=false olarak işaretle
5. Liste döndür
```

### Randevu Oluşturma Validasyonları
```
1. DoctorId geçerli mi?
2. AppointmentDate bugün veya sonrası mı?
3. Seçilen DateTime en az 2 saat sonrası mı?
4. Seçilen tarihte doktor çalışıyor mu? (DoctorAvailability kontrolü)
5. Slot dolu mu? (DoctorId + Date + Time benzersiz mi?)
6. Aynı hasta aynı slota başka randevu almış mı?
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: Çok Adımlı Form State
```javascript
// State: { step: 1|2|3, selectedDate, selectedSlot, symptoms, notes }
// step 1 → tarih seç → step 2 açılır
// step 2 → saat seç → step 3 açılır
// step 3 → form doldur → onayla
```

### Adım 2: useAvailableSlots Hook
```javascript
// selectedDate değiştiğinde GET /doctors/{id}/slots?date= çağır
// Çalışmayan gün seçilirse → "Doktor bu gün çalışmıyor" mesajı
```

### Adım 3: SlotGrid Bileşeni
```javascript
// src/components/SlotGrid.jsx
// Disabled slot: gri, cursor: not-allowed
// Seçili slot: koyu mavi, ring efekti
// Hover: açık mavi arka plan
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T4.1 | Geçerli slota randevu alma | Integration | 201 Created |
| T4.2 | Geçmiş tarihe randevu | Integration | 400 Bad Request |
| T4.3 | 2 saatten yakın tarihe randevu | Integration | 400 Bad Request |
| T4.4 | Dolu slota randevu | Integration | 409 Conflict |
| T4.5 | Doktorun çalışmadığı güne randevu | Integration | 400 Bad Request |
| T4.6 | Slot listesi doğru hesaplanıyor | Unit | 09:00-17:00 → 16 slot |
| T4.7 | İptal edilen randevunun slotu tekrar müsait | Integration | IsAvailable = true |

---

## ✅ Faz 4 Tamamlanma Kriterleri

- [ ] Doktor profil detay sayfası görüntüleniyor
- [ ] Müsait günler takvimde disabled/enabled doğru gösteriliyor
- [ ] Seçilen güne göre slotlar dinamik yükleniyor
- [ ] Randevu oluşturma tüm validasyonlarla çalışıyor
- [ ] Başarı sonrası dashboard'a yönlendirme yapılıyor

---
---

# FAZ 5 — Hasta Dashboard (Randevularım)

> **Hedef:** Hastanın tüm randevularını görebileceği, iptal edebileceği kişisel dashboard ekranını oluşturmak.

---

## 🖥️ UI/UX Tasarımı

### Hasta Dashboard (`/patient/dashboard`)
**Bileşenler:**
- **Özet Kartlar (üst satır):**
  - Toplam Randevu | Bekleyen (Scheduled+Confirmed) | Tamamlanan
- **Filtre Çubuğu:**
  - Durum dropdown: Tümü | Planlandı | Onaylandı | Tamamlandı | İptal Edildi
  - Tarih aralığı filtresi
- **Randevu Listesi:**
  - Doktor adı, uzmanlık | Tarih/Saat | Durum badge'i (renk kodlu)
  - "İptal Et" butonu (sadece Scheduled/Confirmed için, modalda onay)
- **Boş durum:** "Henüz randevunuz yok" + "Randevu Al" butonu

---

## 🗄️ Veri Yapısı & Mimari

Mevcut `Appointments` tablosu kullanılır. Yeni migration gerekmez.

### DTO'lar
```csharp
PatientAppointmentDto {
  Id, DoctorFullName, DoctorSpecialty,
  AppointmentDate, AppointmentTime,
  Status, Symptoms, CreatedAt
}
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint'ler
```
GET /api/v1/appointments/my?status=&startDate=&endDate=&page=1
PUT /api/v1/appointments/{id}/cancel
```

### İptal Mantığı
```
1. Randevu mevcut mu ve bu hastaya ait mi? (404 / 403)
2. Status == Scheduled veya Confirmed mi? (değilse 400)
3. Status → Cancelled, UpdatedAt → DateTime.Now
4. SMS bildirimi tetikle (Faz 8'de aktif olacak, şimdilik placeholder)
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: usePatientAppointments Hook
```javascript
// State: { appointments, totalCount, page, statusFilter, dateFilter, isLoading }
// Filtre değiştiğinde API'yi tekrar çağır
```

### Adım 2: AppointmentCard Bileşeni
```javascript
// StatusBadge renk kodları:
// Scheduled → sarı | Confirmed → mavi | Completed → yeşil | Cancelled → kırmızı
// "İptal Et" → CancelModal aç
```

### Adım 3: CancelModal
```javascript
// "Bu randevuyu iptal etmek istediğinize emin misiniz?"
// Onayla → API çağır → listeyi güncelle
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T5.1 | Hasta kendi randevularını görür | Integration | Sadece kendi randevuları listelenir |
| T5.2 | Başkasının randevusuna erişim | Integration | 403 Forbidden |
| T5.3 | Scheduled randevuyu iptal | Integration | Status → Cancelled |
| T5.4 | Completed randevuyu iptal etmeye çalışmak | Integration | 400 Bad Request |
| T5.5 | Durum bazlı filtreleme | Integration | Sadece seçilen durumdakiler gelir |
| T5.6 | Randevusuz hasta dashboard'u | UI | Boş durum ekranı gösterilir |

---

## ✅ Faz 5 Tamamlanma Kriterleri

- [ ] Hasta dashboard'u kişisel randevuları doğru gösteriyor
- [ ] Durum badge'leri renk kodlu
- [ ] Filtre (durum + tarih) çalışıyor
- [ ] İptal işlemi modal onayı ile yapılıyor
- [ ] Özet kartlar doğru hesaplanıyor

---
---

# FAZ 6 — Doktor Dashboard

> **Hedef:** Doktorun tüm randevularını yönetebileceği, durum güncelleyebileceği ve klinik not ekleyebileceği dashboard ekranını oluşturmak.

---

## 🖥️ UI/UX Tasarımı

### Doktor Dashboard (`/doctor/dashboard`)
**Bileşenler:**
- **Üst İstatistik Kartları:** Bugünkü | Bekleyen | Tamamlanan | Toplam
- **Bugünkü Program (ayrı panel):**
  - Saate göre sıralı: Saat | Hasta adı | Durum | İşlemler
- **Tüm Randevular Tablosu:**
  - Filtre: Durum + Tarih aralığı
  - Sütunlar: Hasta | Tarih/Saat | Yaş | Semptomlar | Durum | İşlem
  - Satıra tıklanınca Randevu Detay Modal açılır
- **Randevu Detay Modal:**
  - Hasta bilgileri (ad, telefon, hesaplanmış yaş)
  - Semptomlar ve hasta notları (read-only)
  - Durum güncelleme dropdown
  - Klinik not + Tanı textarea
  - Kaydet butonu

---

## 🗄️ Veri Yapısı & Mimari

Mevcut tablolar kullanılır. Yeni migration gerekmez.

### DTO'lar
```csharp
DoctorAppointmentDto {
  Id, PatientFullName, PatientPhone, PatientAge,
  AppointmentDate, AppointmentTime,
  Status, Symptoms, PatientNotes, DoctorNotes, Diagnosis
}
UpdateAppointmentStatusDto { Status }
UpdateDoctorNotesDto       { DoctorNotes, Diagnosis }
DoctorStatsDto             { TodayCount, PendingCount, CompletedCount, TotalCount }
```

### Yaş Hesaplama
```csharp
// PatientProfiles.DateOfBirth → DateTime.Now ile fark → yıl bazlı yaş
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint'ler
```
GET /api/v1/doctor/stats
GET /api/v1/doctor/appointments?status=&startDate=&endDate=&page=1
PUT /api/v1/doctor/appointments/{id}/status
PUT /api/v1/doctor/appointments/{id}/notes
```

### Durum Geçiş Validasyonu
```
Scheduled  → Confirmed | Cancelled   ✓
Confirmed  → Completed | Cancelled   ✓
Completed  → (değiştirilemez)        ✗
Cancelled  → (değiştirilemez)        ✗
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: useDoctorAppointments Hook
```javascript
// Filtre state'i: { status, startDate, endDate, page }
```

### Adım 2: AppointmentDetailModal Bileşeni
```javascript
// Props: { appointment, onClose, onUpdate }
// Hasta bilgileri (read-only) + durum dropdown + not alanları
```

### Adım 3: StatusDropdown Bileşeni
```javascript
// Mevcut duruma göre geçerli seçenekleri filtrele
// Scheduled → [Confirmed, Cancelled] | Confirmed → [Completed, Cancelled]
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T6.1 | Doktor kendi randevularını görür | Integration | Sadece bu doktora ait |
| T6.2 | Başka doktorun randevusuna erişim | Integration | 403 Forbidden |
| T6.3 | Scheduled → Confirmed geçişi | Integration | Status güncellendi |
| T6.4 | Completed → Scheduled geçişi (yasak) | Integration | 400 Bad Request |
| T6.5 | Klinik not ekleme | Integration | DoctorNotes kaydedildi |
| T6.6 | İstatistik kartları doğru | Unit | Bugünkü randevu sayısı doğru |
| T6.7 | Yaş hesaplama | Unit | DateOfBirth → doğru yaş |

---

## ✅ Faz 6 Tamamlanma Kriterleri

- [ ] Dashboard istatistik kartları doğru veri gösteriyor
- [ ] Tüm randevular filtre ile listelenebiliyor
- [ ] Durum güncelleme geçiş kurallarına uygun çalışıyor
- [ ] Klinik not ekleme/güncelleme çalışıyor
- [ ] Hasta detay modal'ı yaş hesaplamalı bilgiler gösteriyor

---
---

# FAZ 7 — Admin Panel

> **Hedef:** Sistem yöneticisinin kullanıcıları yönetebileceği, doktor ekleyebileceği, tüm randevuları görebileceği ve sistem istatistiklerini izleyebileceği admin panelini oluşturmak.

---

## 🖥️ UI/UX Tasarımı

### Admin Dashboard (`/admin/dashboard`)
**Bileşenler:**
- **Sistem İstatistik Kartları:** Toplam Hasta | Toplam Doktor | Toplam Randevu | Bugünkü Randevu
- **Son 7 Günlük Randevu Tablosu:** Tarih | Toplam | Tamamlanan | İptal
- **Hızlı Erişim Butonları:** Yeni Doktor Ekle | Kullanıcıları Yönet | Tüm Randevular

### Admin — Kullanıcı Yönetimi (`/admin/users`)
- Hasta / Doktor sekme ayrımı
- Her satır: Ad Soyad | Email | Rol | Durum | Aktif/Pasif toggle

### Admin — Doktor Yönetimi (`/admin/doctors`)
- Doktor listesi + "Yeni Doktor Ekle" butonu (modal)
- Doktor ekleme: çok adımlı form (kişisel bilgiler → uzmanlık → müsaitlik)

### Admin — Randevu Yönetimi (`/admin/appointments`)
- Tüm randevular, filtre: Doktor | Hasta | Durum | Tarih
- Durum güncelleme yetkisi

---

## 🗄️ Veri Yapısı & Mimari

Mevcut tablolar kullanılır. Yeni migration gerekmez.

### DTO'lar
```csharp
AdminStatsDto           { TotalPatients, TotalDoctors, TotalAppointments, TodayAppointments }
DailyAppointmentStatDto { Date, Total, Completed, Cancelled }
CreateDoctorRequestDto  { FirstName, LastName, Email, Phone, Password, Specialty, YearsOfExperience, Bio, Availability: List<AvailabilityDto> }
AvailabilityDto         { DayOfWeek, StartTime, EndTime }
```

---

## ⚙️ Kodlama Süreci — Backend

### Endpoint'ler
```
GET  /api/v1/admin/stats
GET  /api/v1/admin/stats/daily?days=7
GET  /api/v1/admin/users?role=&page=
PUT  /api/v1/admin/users/{id}/status
POST /api/v1/admin/doctors
PUT  /api/v1/admin/doctors/{id}
PUT  /api/v1/admin/doctors/{id}/availability
GET  /api/v1/admin/appointments?doctor=&patient=&status=&page=
PUT  /api/v1/admin/appointments/{id}/status
```

### Yeni Doktor Oluşturma (Transaction)
```
1. Email benzersiz mi kontrol et
2. Users tablosuna Role=Doctor kaydı oluştur (BCrypt hash)
3. DoctorProfiles tablosuna profil kaydı oluştur
4. DoctorAvailability kayıtlarını ekle
5. Tüm adımlar transaction içinde — hata olursa rollback
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: Admin Sidebar Navigation
```javascript
// Dashboard | Kullanıcılar | Doktorlar | Randevular
// Aktif route vurgulama | Sadece Admin rolü erişebilir
```

### Adım 2: CreateDoctorModal (çok adımlı)
```javascript
// Adım 1: Kişisel bilgiler
// Adım 2: Profesyonel bilgiler (uzmanlık, deneyim, bio)
// Adım 3: Müsaitlik (haftanın her günü toggle + saat aralığı)
```

### Adım 3: AvailabilityEditor Bileşeni
```javascript
// Her gün için toggle (çalışıyor/çalışmıyor)
// Çalışıyorsa: StartTime - EndTime time picker
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T7.1 | İstatistik kartları doğru değer | Integration | DB kayıtlarıyla eşleşiyor |
| T7.2 | Yeni doktor oluşturma (tam form) | Integration | User + DoctorProfile + Availability oluştu |
| T7.3 | Var olan email ile doktor oluşturma | Integration | 400 Bad Request |
| T7.4 | Kullanıcıyı pasif yapma | Integration | IsActive = false |
| T7.5 | Pasif doktor liste endpoint'inde görünmez | Integration | isActive=false filtreleniyor |
| T7.6 | Günlük istatistik hesaplama | Unit | Doğru tarih aralığı ve sayılar |
| T7.7 | Admin olmayan kullanıcı admin route | UI | /login'e yönlendirir |

---

## ✅ Faz 7 Tamamlanma Kriterleri

- [ ] Admin dashboard istatistik ve 7 günlük tablo çalışıyor
- [ ] Kullanıcı listesi sekme bazlı, aktif/pasif toggle çalışıyor
- [ ] Yeni doktor oluşturma (müsaitlik dahil) transaction ile çalışıyor
- [ ] Tüm randevular filtrelenebiliyor ve durum güncellenebiliyor
- [ ] Admin route'larına rol kontrolü uygulanmış

---
---

# FAZ 8 — SMS Bildirim Entegrasyonu

> **Hedef:** Randevu oluşturulduğunda, onaylandığında, iptal edildiğinde ve 24 saat öncesinde hastaya SMS bildirimi gönderilmesini sağlamak.

---

## 🖥️ UI/UX Tasarımı

Bu fazda kullanıcıya görünür ekran değişikliği yoktur.
- Hasta kaydında telefon numarası zorunlu hale gelir (Faz 2'de zaten alınıyor, required validasyon pekiştirilir)
- SMS hatası kullanıcıya yansıtılmaz (silent fail)

---

## 🗄️ Veri Yapısı & Mimari

### Yeni Tablo (Opsiyonel — SMS Log)
```
SmsLogs:
- Id (int, PK)
- UserId (int, FK)
- AppointmentId (int, FK, nullable)
- Message (varchar 500)
- SentAt (datetime)
- IsSuccess (bool)
- ErrorMessage (varchar 500, nullable)
```

### NuGet Paketi
```bash
dotnet add package Twilio
```

### Konfigürasyon
```json
// appsettings.json
"Twilio": {
  "AccountSid": "AC...",
  "AuthToken": "...",
  "FromNumber": "+1..."
}
```

---

## ⚙️ Kodlama Süreci — Backend

### Adım 1: ISmsService Arayüzü
```csharp
public interface ISmsService {
    Task SendAsync(string toNumber, string message);
}
// TwilioSmsService : ISmsService implement eder
// DI container'a kayıt: builder.Services.AddScoped<ISmsService, TwilioSmsService>();
```

### Adım 2: SMS Tetikleyicileri
```
Randevu oluşturuldu →
  "Sayın {Ad}, {Tarih} {Saat} tarihli Dr. {Doktor} randevunuz oluşturulmuştur. - MediBook"

Randevu onaylandı (Confirmed) →
  "Sayın {Ad}, randevunuz Dr. {Doktor} tarafından onaylanmıştır. - MediBook"

Randevu iptal edildi →
  "Sayın {Ad}, {Tarih} {Saat} tarihli randevunuz iptal edilmiştir. - MediBook"
```

### Adım 3: BackgroundService — 24 Saat Hatırlatma
```csharp
// AppointmentReminderService : BackgroundService
// Her gün 08:00'de çalışır (Timer veya Cron ile)
// Şu andan 24-25 saat sonrasındaki Scheduled/Confirmed randevuları sorgula
// IsReminderSent = false olanları filtrele
// Her biri için SMS gönder, ardından IsReminderSent = true yap
// Program.cs → builder.Services.AddHostedService<AppointmentReminderService>();
```

---

## ⚛️ Kodlama Süreci — Frontend

Bu fazda frontend değişikliği yoktur. SMS gönderim hatası kullanıcıya yansıtılmaz.

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T8.1 | Randevu oluşturunca SMS tetiklenir | Unit (Mock) | ISmsService.SendAsync çağrıldı |
| T8.2 | SMS hatası randevuyu etkilemez | Unit | Exception yakalanır, 201 dönülür |
| T8.3 | BackgroundService — doğru randevular seçiliyor | Unit | 24-25 saatlik penceredeki randevular |
| T8.4 | Hatırlatma bir kez gönderilir | Unit | IsReminderSent=true olanlar atlanır |
| T8.5 | Telefonsuz kullanıcıya SMS | Unit | SMS atlanır, hata fırlatılmaz |

---

## ✅ Faz 8 Tamamlanma Kriterleri

- [ ] Twilio entegrasyonu çalışıyor (trial hesap ile test)
- [ ] Randevu oluşturma/onaylama/iptal SMS'leri gönderiliyor
- [ ] BackgroundService her gün 08:00'de 24 saatlik hatırlatma gönderiyor
- [ ] SMS hatası randevu akışını durdurmuyyor (silent fail + log)
- [ ] IsReminderSent ile tekrar gönderim önleniyor

---
---

# FAZ 9 — Güvenlik, Hata Yönetimi & Polishing

> **Hedef:** Uygulamayı production-ready kaliteye taşımak. Güvenliği pekiştirmek, hata mesajlarını standartlaştırmak ve kullanıcı deneyimini iyileştirmek.

---

## 🖥️ UI/UX Tasarımı

### Genel UX İyileştirmeleri
- **Loading Skeleton:** Veri yüklenirken titreşen gri bloklar (shimmer efekti)
- **Toast Bildirimleri:** Başarı (yeşil) / Hata (kırmızı) / Uyarı (sarı) — 3 saniye otomatik kapanır
- **Form Hata Mesajları:** Input altında kırmızı, icon'lu hata açıklamaları
- **404 Sayfası:** Özel tasarımlı "Sayfa Bulunamadı" ekranı + "Ana Sayfaya Dön" butonu
- **Boş State'ler:** Tüm liste ekranlarında özel mesaj + aksiyon butonu
- **Responsive:** Mobil (375px), tablet (768px), masaüstü (1280px) breakpoint kontrolü

---

## 🗄️ Veri Yapısı & Mimari

Bu fazda tablo değişikliği yoktur. (`IsReminderSent` Faz 8'de zaten eklendi)

---

## ⚙️ Kodlama Süreci — Backend

### Adım 1: FluentValidation
```bash
dotnet add package FluentValidation.AspNetCore
```
```csharp
// Her DTO için Validator sınıfı:
// - Email: geçerli format
// - Şifre: min 6 karakter
// - Telefon: rakam, 10-11 karakter
// - AppointmentDate: >= DateTime.Now
```

### Adım 2: Standart Hata Yanıt Formatı
```json
{
  "success": false,
  "message": "Doğrulama hatası",
  "errors": ["Email geçerli değil", "Şifre en az 6 karakter olmalı"]
}
```

### Adım 3: Serilog Loglama
```bash
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.File
```
```csharp
// logs/medibook-{Date}.log dosyasına yaz
// Hata seviyesi: Warning ve üzeri
```

### Adım 4: HTTPS + HSTS
```csharp
app.UseHttpsRedirection();
app.UseHsts(); // production ortamı için
```

---

## ⚛️ Kodlama Süreci — Frontend

### Adım 1: Global Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
// Beklenmedik JS hatalarını yakalar
// "Bir şeyler yanlış gitti" ekranı gösterir
```

### Adım 2: Toast Context
```javascript
// src/context/ToastContext.jsx
// showToast(message, type: 'success'|'error'|'warning')
// Animasyonlu slide-in / fade-out
```

### Adım 3: Loading Skeleton
```javascript
// src/components/SkeletonCard.jsx
// CSS shimmer animasyonu
// DoctorCard ve AppointmentCard için varyantlar
```

### Adım 4: Responsive CSS Düzenlemeleri
```css
@media (max-width: 768px) {
  .doctors-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .doctors-grid { grid-template-columns: 1fr; }
}
```

---

## 🧪 Test Senaryoları

| # | Test | Tür | Beklenen Sonuç |
|---|---|---|---|
| T9.1 | FluentValidation — geçersiz email | Unit | Hata mesajı döner |
| T9.2 | SQL injection denemesi | Integration | EF Core parametrik sorgu, güvenli |
| T9.3 | Token olmadan API erişimi | Integration | 401 Unauthorized |
| T9.4 | Rate limit aşımı | Integration | 429 Too Many Requests |
| T9.5 | Hata logları dosyaya yazılıyor | Manuel | logs/ klasöründe .log dosyası oluştu |
| T9.6 | Mobil görünüm (375px) | Manuel | Tüm ekranlar tek sütuna düzgün iniyor |
| T9.7 | 404 sayfası | UI | Özel 404 ekranı görünüyor |
| T9.8 | Toast bildirimleri | UI | 3 saniye sonra kapanıyor |

---

## ✅ Faz 9 Tamamlanma Kriterleri

- [ ] FluentValidation tüm DTO'larda aktif
- [ ] Standart hata yanıt formatı tüm endpoint'lerde tutarlı
- [ ] Serilog ile loglama çalışıyor
- [ ] Toast bildirimleri tüm kullanıcı aksiyonlarında gösteriliyor
- [ ] Loading skeleton veri yüklenirken görünüyor
- [ ] Tüm ekranlar mobil ve tablette düzgün görünüyor

---

---

## 📊 Özet Tablo

| Faz | Modül | Tahmini Süre | Öncelik |
|---|---|---|---|
| 1 | Proje Kurulumu & Altyapı | 1-2 gün | 🔴 Kritik |
| 2 | Kimlik Doğrulama (Auth) | 2-3 gün | 🔴 Kritik |
| 3 | Doktor Listeleme & Arama | 1-2 gün | 🔴 Kritik |
| 4 | Randevu Alma Ekranı | 2-3 gün | 🔴 Kritik |
| 5 | Hasta Dashboard | 1-2 gün | 🔴 Kritik |
| 6 | Doktor Dashboard | 2-3 gün | 🟠 Yüksek |
| 7 | Admin Panel | 3-4 gün | 🟠 Yüksek |
| 8 | SMS Bildirim Entegrasyonu | 1-2 gün | 🟡 Orta |
| 9 | Güvenlik & Polishing | 2-3 gün | 🟡 Orta |

> **Toplam tahmini süre:** 15-24 gün (tam zamanlı çalışma için)

---

## 🔗 Kullanılan Paketler

| Paket / Araç | Kullanım Alanı |
|---|---|
| `Pomelo.EntityFrameworkCore.MySql` | MySQL ORM |
| `Microsoft.AspNetCore.Authentication.JwtBearer` | JWT kimlik doğrulama |
| `BCrypt.Net-Next` | Şifre hashleme |
| `FluentValidation.AspNetCore` | DTO validasyonu |
| `Serilog.AspNetCore` + `Serilog.Sinks.File` | Yapısal loglama |
| `Twilio` | SMS gönderimi |
| `axios` | HTTP istemcisi (Frontend) |
| `react-router-dom` | Sayfa yönlendirme (Frontend) |

---

*Bu belge MediBook projesinin geliştirme sürecinde referans doküman olarak kullanılacaktır.*
*Her faz tamamlandığında ilgili checkbox'lar işaretlenerek ilerleme takip edilebilir.*
