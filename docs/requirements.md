# MediBook - Doctor Appointment System
### Requirements Document

## 1. Proje Özeti

Doktor Randevu Sistemi, hastaların sağlık hizmeti sağlayıcılarıyla dijital ortamda buluşmasını sağlayan, telefon araması ve uzun bekleme sürelerini ortadan kaldıran web tabanlı bir platformdur. Hastalar, doktorlar ve sistem yöneticileri için ayrı ayrı tasarlanmış arayüzler üzerinden 7/24 erişilebilir bir randevu yönetim deneyimi sunar.

---

## 2. Teknoloji Yığını (Tech Stack)

| Katman | Teknoloji | Notlar |
|---|---|---|
| Backend | ASP.NET Core Web API (.NET 8) | RESTful API mimarisi |
| Frontend | React (Vite ile) | Fonksiyonel bileşenler, Hooks |
| Veritabanı | MySQL | İlişkisel veri modeli |
| ORM | Entity Framework Core | Code-First yaklaşımı, Migrations |
| Kimlik Doğrulama | JWT (JSON Web Token) | Stateless, Access + Refresh Token yapısı |
| State Management (Frontend) | React Context API veya Redux Toolkit | Proje büyüklüğüne göre karar verilecek |
| HTTP İstemcisi | Axios | Interceptor ile token yönetimi |
| Şifreleme | BCrypt | Parola hashleme |
| Stil | CSS Modules / Tailwind CSS | Kurumsal tema için tutarlı tasarım sistemi |

---

## 3. Mimari Genel Bakış

```
[React SPA] <--REST/JSON--> [ASP.NET Core Web API] <--EF Core--> [MySQL]
```

- **Katmanlı Mimari (Backend):** Controller → Service → Repository → DbContext
- **API Versiyonlama:** `/api/v1/...` şeklinde ileride sürüm desteği için hazır
- **CORS:** Sadece frontend origin'ine izin verilecek şekilde yapılandırılacak
- **Ortam Ayrımı:** Development / Staging / Production için ayrı `appsettings.json`

---

## 4. Kimlik Doğrulama ve Yetkilendirme

- **Yöntem:** JWT Token tabanlı, stateless authentication
- **Access Token:** Kısa ömürlü (örn. 15-30 dk)
- **Refresh Token:** Uzun ömürlü, HttpOnly cookie içinde saklanacak (XSS koruması için)
- **Roller:** `Patient`, `Doctor`, `Admin`
- **Yetkilendirme:** `[Authorize(Roles = "...")]` attribute'ları ile endpoint bazlı erişim kontrolü
- **Parola Güvenliği:** BCrypt ile hashleme, minimum parola politikası (uzunluk, karmaşıklık)
- **Email Kullanılabilirlik Kontrolü:** Kayıt sırasında asenkron email doğrulama (var olan email'lerle çakışmayı önlemek için)

---

## 5. Kullanıcı Rolleri ve Fonksiyonel Gereksinimler

### 5.1 Hasta (Patient)

- Kayıt formu ile hesap oluşturma (ad, soyad, email, parola, doğum tarihi, telefon vb.)
- Giriş yaparak hasta paneline erişim
- Doktorları listeleme ve **uzmanlık alanına göre filtreleme/arama**
- Doktor profilini görüntüleme (uzmanlık, deneyim, müsaitlik takvimi)
- Uygun tarih/saat seçerek randevu oluşturma
- Randevu sırasında **semptom ve ek not** girme
- Kişisel panelde tüm randevularını görüntüleme (durum bazlı: Planlandı, Onaylandı, Tamamlandı, İptal Edildi)
- Randevu iptal etme
- Doğum tarihinden otomatik yaş hesaplama (profilde gösterim için)

### 5.2 Doktor (Doctor)

- Hesaplar admin tarafından oluşturulur (self-registration yok)
- Giriş yaparak doktor paneline erişim
- Günlük/haftalık randevu istatistiklerini ve programını görüntüleme
- Kendisine ait tüm randevuları tek ekrandan yönetme
- Randevu durumunu güncelleme (Onaylandı → Tamamlandı vb.)
- Hasta detaylarını ve (varsa) geçmiş randevu/medikal notlarını görüntüleme
- **Klinik not ve tanı** ekleme
- Randevuları durum ve tarihe göre filtreleme
- Hasta iletişim bilgilerini görüntüleme

### 5.3 Yönetici (Admin)

- Admin panelinde sistem geneli istatistikleri görüntüleme (toplam hasta, doktor, randevu sayıları vb.)
- Tüm kullanıcı hesaplarını (hasta + doktor) yönetme
- Yeni doktor ekleme (uzmanlık alanı, müsaitlik bilgisi ile birlikte)
- Doktor profillerini güncelleme
- Sistem genelindeki tüm randevuları görüntüleme ve gerektiğinde durumunu değiştirme
- Kullanıcı hesaplarını aktif/pasif yapabilme
- Doktorların müsaitlik takvimini (haftalık çalışma saatleri) oluşturma ve güncelleme
- Sistem kullanım ve randevu trendlerini (yoğun günler/saatler, doktor bazlı randevu hacmi vb.) izleme

---

## 6. Randevu Durum Akışı (Appointment Status Flow)

```
Scheduled → Confirmed → Completed
     ↓
  Cancelled  (herhangi bir aşamada, iptal koşullarına bağlı)
```

- Durum geçişleri backend tarafında validasyona tabi olacak (örn. "Completed" durumundan "Scheduled"a dönüş engellenecek)

---

## 7. Veritabanı Şeması (Taslak)

**Users** (ortak alanlar - TPH veya ayrı tablo yaklaşımı değerlendirilecek)
- Id, FirstName, LastName, Email, PasswordHash, Role, PhoneNumber, CreatedAt, IsActive

**PatientProfiles**
- Id, UserId (FK), DateOfBirth, Gender, Address

**DoctorProfiles**
- Id, UserId (FK), Specialty, Bio, YearsOfExperience

**DoctorAvailability**
- Id, DoctorId (FK), DayOfWeek, StartTime, EndTime

**Appointments**
- Id, PatientId (FK), DoctorId (FK), AppointmentDate, AppointmentTime, Status, Symptoms, PatientNotes, DoctorNotes, Diagnosis, CreatedAt, UpdatedAt

> Not: Şema, geliştirme sürecinde EF Core migration'ları ile detaylandırılacaktır.

---

## 8. API Endpoint Taslağı (Örnek)

| Method | Endpoint | Rol | Açıklama |
|---|---|---|---|
| POST | /api/v1/auth/register | Public | Hasta kaydı |
| POST | /api/v1/auth/login | Public | Giriş, JWT üretimi |
| POST | /api/v1/auth/refresh | Public | Token yenileme |
| GET | /api/v1/auth/check-email | Public | Email kullanılabilirlik kontrolü |
| GET | /api/v1/doctors | Public/Patient | Doktor listesi + filtreleme |
| GET | /api/v1/doctors/{id} | Public/Patient | Doktor detayı |
| POST | /api/v1/appointments | Patient | Randevu oluşturma |
| GET | /api/v1/appointments/my | Patient | Kendi randevuları |
| PUT | /api/v1/appointments/{id}/cancel | Patient | Randevu iptali |
| GET | /api/v1/doctor/appointments | Doctor | Doktora ait randevular |
| PUT | /api/v1/doctor/appointments/{id}/status | Doctor | Durum güncelleme |
| PUT | /api/v1/doctor/appointments/{id}/notes | Doctor | Klinik not ekleme |
| GET | /api/v1/admin/stats | Admin | Sistem istatistikleri ve randevu trendleri |
| POST | /api/v1/admin/doctors | Admin | Yeni doktor ekleme |
| PUT | /api/v1/admin/doctors/{id}/availability | Admin | Doktor müsaitlik takvimini güncelleme |
| GET | /api/v1/admin/appointments | Admin | Tüm randevular |
| PUT | /api/v1/admin/appointments/{id}/status | Admin | Randevu durumunu güncelleme |
| PUT | /api/v1/admin/users/{id}/status | Admin | Kullanıcı hesabını aktif/pasif yapma |

---

## 9. Arayüz (UI/UX) Gereksinimleri

- **Tasarım Dili:** Sade & Kurumsal — güven veren, klasik hastane/klinik hissi
- **Renk Paleti:**
  - Ana renk: Mavi tonları (örn. `#1E5CA8`, `#0F4C81`) — güven ve profesyonellik
  - Nötr: Beyaz / açık gri arka planlar (`#FFFFFF`, `#F5F7FA`)
  - Vurgu: Randevu durumları için semantik renkler (yeşil = onaylı/tamamlandı, sarı = beklemede, kırmızı = iptal)
- **Tipografi:** Okunabilir, sade bir sans-serif font (örn. Inter, Roboto)
- **Responsive Tasarım:** Mobil, tablet ve masaüstü için tam uyumluluk (mobile-first yaklaşım önerilir)
- **Bileşenler:**
  - Sabit üst navigasyon çubuğu (rol bazlı menü öğeleri)
  - Kart tabanlı doktor listeleme
  - Takvim/zaman dilimi seçici (randevu alma ekranında)
  - Dashboard'larda özet istatistik kartları (grafik/sayaç görünümü)
  - Durum etiketleri (badge) ile görsel geri bildirim
- **Erişilebilirlik:** Temel WCAG uyumluluğu (kontrast oranları, form label'ları, klavye navigasyonu)

---

## 10. Güvenlik Gereksinimleri

- Tüm API iletişimi HTTPS üzerinden
- Parolalar BCrypt ile hashlenerek saklanacak
- JWT token'lar güvenli şekilde saklanacak (Access token memory/localStorage tartışmalı — HttpOnly cookie önerilir)
- Rol bazlı yetkilendirme her endpoint'te zorunlu
- SQL Injection koruması (EF Core parametrik sorgular sayesinde doğal olarak sağlanır)
- Input validasyonu hem frontend hem backend tarafında (FluentValidation önerilir)
- Rate limiting (özellikle login endpoint'i için brute-force koruması)

---

## 11. Kapsam Dışı / İleride Eklenebilecekler (Future Scope)

- Email/SMS bildirim sistemi (randevu onayı, hatırlatma) — **şu an kapsam dışı, isteğe bağlı ileride eklenebilir**
- Online ödeme entegrasyonu
- Video görüşme (tele-tıp) desteği
- Doktor değerlendirme/yorum sistemi
- Çoklu dil desteği (i18n)
- Takvim uygulamalarıyla entegrasyon (Google Calendar vb.)

---

## 12. Açık Sorular / Netleştirilmesi Gerekenler

- [ ] Doktorların müsaitlik saatleri sabit haftalık şablon mu olacak, yoksa doktor bazlı özel takvim mi?
- [ ] Randevu süresi sabit mi (örn. 30 dk) yoksa doktor/uzmanlık bazlı değişken mi?
- [ ] Aynı anda birden fazla hastanın aynı slotu seçmesi durumunda (race condition) nasıl bir kilitleme/kontrol mekanizması olacak?
- [ ] Hasta, randevusunu iptal etmenin yanında **yeniden planlayabilecek (reschedule)** mi?
- [ ] Deployment ortamı ne olacak (Azure, AWS, kendi sunucunuz vb.)?

---

## 13. Marka Kimliği (Branding)

Proje adı, `project03.md` içindeki admin hesabı örneğinden (`admin@medibook.com`) yola çıkılarak **"MediBook"** olarak belirlenmiştir.

### 13.1 Logo

Aşağıdaki logo, "Seçenek A — sağlık artısı rozeti" konseptinin son halidir. Hem tam versiyon (wordmark) hem de ikon-only (favicon/app icon) versiyonu indirilebilir SVG ve PNG formatında hazırlanmıştır.

![MediBook Logo](assets/medibook-logo.png)

**Dosyalar:**
- `assets/medibook-logo.svg` / `.png` — tam logo (ikon + yazı)
- `assets/medibook-icon.svg` / `.png` — sadece ikon (favicon, app icon, sosyal medya profili için)

**Renk kodları:** Ana mavi `#1E5CA8`, koyu lacivert metin `#0F2A44`, gri alt metin `#5F6B7A`

### 13.2 Seçilen Arayüz Tasarımı — Seçenek A

Responsive uyum açısından daha kolay ölçeklendiği için **Seçenek A** (üst navigasyon çubuğu + hero alan + kart tabanlı doktor listeleme) seçilmiştir. Bu düzen, sidebar gerektiren panellere göre mobilde tek sütuna daha doğal indirgenir.

![MediBook Anasayfa Mockup](assets/medibook-design-mockup-a.png)

**Dosya:** `assets/medibook-design-mockup-a.svg` / `.png`

> Not: Hasta/doktor paneli (dashboard) gibi iç sayfalarda, bu üst navigasyon iskeletinin *içinde*, önceki mesajda gösterilen "Seçenek B" tarzı özet istatistik kartı + randevu listesi düzeni kullanılacaktır (sidebar yerine üstte sekmeler ile).

---

## 14. Demo / Seed Veri Hesapları

`project03.md` kaynağında belirtilen örnek hesaplar, geliştirme ve test ortamı için seed data olarak kullanılacaktır:

| Rol | Email | Not |
|---|---|---|
| Admin | admin@medibook.com | Tam sistem erişimi (kullanıcı, doktor, randevu yönetimi) |
| Doctor | (seed ile oluşturulacak) | Uzmanlık: Pediatri — doktor panelini test etmek için |
| Patient | (seed ile oluşturulacak) | Randevu alma/görüntüleme akışını test etmek için |

> Bu hesaplar yalnızca Development ortamında EF Core seed data ile oluşturulacak; Production ortamında yer almayacaktır.

---

*Bu doküman, projenin ilerleyen aşamalarında güncellenecek canlı bir belgedir.*
