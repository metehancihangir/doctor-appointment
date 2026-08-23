# ✅ Faz 2 — Görev Listesi: Kimlik Doğrulama (Auth) Modülü

> 📖 **Kaynak:** [phases.md — FAZ 2](phases.md#faz-2--kimlik-doğrulama-auth-modülü)
> Bu liste, `phases.md` dosyasındaki Faz 2 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[ ]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 4 / 4 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 7 / 7 |
| ⚛️ Auth Altyapısı (Frontend) | 3 / 3 |
| 🖥️ UI & Form Validasyonu (Frontend) | 4 / 4 |
| 🧪 Testler | 10 / 10 |
| **Toplam** | **28 / 28** |

---

## 🗄️ BÖLÜM A — Veri Yapısı & Mimari (Backend)

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari — Yeni Tablolar & DTO'lar*

- [x] **1.** `Models/PatientProfile.cs` entity sınıfını oluştur:
  - `Id` (int, PK), `UserId` (int, FK → Users, unique), `DateOfBirth` (date), `Gender` (string), `Address` (string, nullable)
- [x] **2.** `Models/RefreshToken.cs` entity sınıfını oluştur:
  - `Id` (int, PK), `UserId` (int, FK), `Token` (string, unique), `ExpiresAt` (datetime), `CreatedAt` (datetime), `IsRevoked` (bool, default: false)
- [x] **3.** `AppDbContext`'e `DbSet<PatientProfile>` ve `DbSet<RefreshToken>` ekle. İlişkileri (FK) ve indexleri tanımla, ardından migration (`Add-Migration AddAuthTables` / `dotnet ef migrations add AddAuthTables`) oluştur ve uygula.
- [x] **4.** Auth işlemleri için gerekli DTO'ları oluştur (`DTOs/Auth/` klasöründe):
  - `RegisterRequestDto`
  - `LoginRequestDto`
  - `AuthResponseDto`

---

## ⚙️ BÖLÜM B — Endpoint'ler & İş Mantığı (Backend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **5.** `Services/TokenService.cs` oluştur:
  - JwtBearer ile 15 dakikalık Access Token (Claim'ler: UserId, Email, Role, FullName) üreten metodu yaz.
  - Random GUID üreterek 7 günlük Refresh Token üreten metodu yaz.
- [x] **6.** `Controllers/AuthController.cs` oluştur.
- [x] **7.** **POST /api/v1/auth/register** endpoint'ini yaz:
  - `BCrypt.Net-Next` ile şifreyi hashle.
  - `Users` tablosuna ve `PatientProfiles` tablosuna kayıt ekle (Transaction kullanarak).
- [x] **8.** **GET /api/v1/auth/check-email?email=** endpoint'ini yaz (Kullanılabilirlik kontrolü).
- [x] **9.** **POST /api/v1/auth/login** endpoint'ini yaz:
  - Email ve şifre doğrula (`BCrypt.Verify`).
  - Access ve Refresh token üret.
  - Refresh token'ı DB'ye kaydet ve Response'a `HttpOnly` Cookie olarak ekle.
- [x] **10.** **POST /api/v1/auth/refresh** endpoint'ini yaz:
  - Request Cookie'den token'ı oku.
  - DB'den kontrol et (geçerli mi, revoked değil mi?).
  - Eski token'ı revoke et (`IsRevoked = true`), yeni token'ları üret ve Cookie'yi güncelle.
- [x] **11.** **POST /api/v1/auth/logout** endpoint'ini yaz (Refresh token iptali).
- [x] **12.** `Program.cs`'e Rate Limiting ekle (`AddRateLimiter`): Login endpoint'i için IP bazlı (5 istek / 15 dakika) konfigüre et ve middleware'i pipeline'a dahil et.

---

## ⚛️ BÖLÜM C — Auth Altyapısı (Frontend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend Adım 1-3*

- [x] **13.** `src/context/AuthContext.jsx` oluştur:
  - State: `user`, `accessToken`, `isAuthenticated`, `isLoading`
  - Metotlar: `login()`, `logout()`, `refreshToken()`
  - (Token localStorage'da tutulmayacak, XSS'e karşı React memory'de kalacak)
- [x] **14.** `src/api/axiosInstance.js` dosyasını güncelle (Interceptors):
  - Request interceptor: Eğer memory'de access token varsa `Authorization: Bearer <token>` ekle.
  - Response interceptor: `401 Unauthorized` alınırsa `/auth/refresh` çağır, yeni token alınırsa önceki isteği tekrar dene. Refresh başarısız olursa `logout()` çağır.
- [x] **15.** `src/components/ProtectedRoute.jsx` bileşenini oluştur:
  - Yetkisiz (giriş yapmamış) kullanıcıyı `/login`'e yönlendir.
  - Gerekirse rol bazlı yetki kontrolü yap.

---

## 🖥️ BÖLÜM D — UI & Form Validasyonu (Frontend)

> 📌 Kaynak: `phases.md` → *UI/UX Tasarımı & Frontend Adım 4*

- [x] **16.** `src/pages/LoginPage.jsx` sayfasını geliştir:
  - Merkezi kart layout, logo/başlık.
  - Email, Şifre inputları ve hata/alert alanı.
  - Başarılı girişte role göre ilgili dashboard'a yönlendirme.
- [x] **17.** `src/pages/RegisterPage.jsx` sayfasını geliştir:
  - Form alanları: Ad, Soyad, Email, Telefon, Doğum Tarihi, Şifre, Şifre Tekrar.
  - Async email kullanılabilirlik göstergesi (yeşil ✓ / kırmızı ✗).
- [x] **18.** Frontend Form Validasyonlarını uygula:
  - Email formatı (Regex), Şifre min 6 karakter, Şifre tekrar eşleşmesi, Telefon sadece rakam (10-11 karakter).
- [x] **19.** Form gönderim durumları (Loading spinner) ve API hata mesajlarının (Toast veya Alert olarak) gösterimini yap.

---

## 🧪 BÖLÜM E — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T2.1 – T2.10*

- [x] **20.** **[T2.1]** Geçerli bilgilerle kayıt → 201 Created, DB'de yeni kullanıcı oluştuğunu doğrula.
- [x] **21.** **[T2.2]** Var olan email ile kayıt → 400 Bad Request hata mesajı alındığını doğrula.
- [x] **22.** **[T2.3]** Geçerli giriş (Patient) → 200 OK, access token ve HttpOnly cookie geldiğini doğrula.
- [x] **23.** **[T2.4]** Yanlış şifre ile giriş → 401 Unauthorized döndüğünü doğrula.
- [x] **24.** **[T2.5]** Süresi dolmuş access token ile işlem → Refresh mekanizmasının tetiklendiğini ve yeni token alındığını doğrula.
- [x] **25.** **[T2.6]** Logout sonrası refresh yapmaya çalışmak → 401 (token revoked) döndüğünü doğrula.
- [x] **26.** **[T2.7]** Login rate limit aşımı → Üst üste 5 hatalı girişten sonra 429 Too Many Requests döndüğünü doğrula.
- [x] **27.** **[T2.8 & T2.9]** Email check işlemi → Mevcut email için `false`, yeni email için `true` döndüğünü doğrula.
- [x] **28.** **[T2.10]** Eksik alanlarla kayıt formu gönderimi → Frontend UI'da hata mesajlarının çıktığını doğrula.

---

## ✅ Faz 2 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 2 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 2 tamamdır ve Faz 3'e geçilebilir:

- [x] Hasta kayıt formu çalışıyor (validasyon + async email kontrolü)
- [x] Giriş ekranı çalışıyor, rol bazlı yönlendirme yapıyor
- [x] JWT access token memory'de, refresh token HttpOnly cookie'de
- [x] Token yenileme interceptor'ı çalışıyor
- [x] ProtectedRoute bileşeni yetkisiz erişimi engelliyor
- [x] Rate limiting login endpoint'inde aktif
