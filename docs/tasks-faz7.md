# Faz 7: Admin Panel — Detaylı Görev Listesi

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 1 / 1 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 7 / 7 |
| ⚛️ Bileşenler & UI (Frontend) | 7 / 7 |
| 🧪 Testler | 7 / 7 |
| **Toplam** | **22 / 22** |

---

## 🗄️ Veri Yapısı & Mimari (Backend)
> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari* (Yeni migration gerekmiyor)

- [x] **1.** İlgili DTO sınıflarını oluştur:
  - `AdminStatsDto`: `TotalPatients`, `TotalDoctors`, `TotalAppointments`, `TodayAppointments`
  - `DailyAppointmentStatDto`: `Date`, `Total`, `Completed`, `Cancelled`
  - `CreateDoctorRequestDto`: `FirstName`, `LastName`, `Email`, `Phone`, `Password`, `Specialty`, `YearsOfExperience`, `Bio`, `Availability` (List<AvailabilityDto>)
  - `AvailabilityDto`: `DayOfWeek`, `StartTime`, `EndTime`

---

## ⚙️ Endpoint'ler & İş Mantığı (Backend)
> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **2.** **GET /api/v1/admin/stats** endpoint'ini oluştur:
  - Toplam hasta, doktor, randevu sayılarını ve bugünkü randevu sayısını `AdminStatsDto` olarak dön.
- [x] **3.** **GET /api/v1/admin/stats/daily?days=7** endpoint'ini oluştur:
  - İstenen gün sayısı kadar (varsayılan 7) geriye dönük her bir gün için randevu sayılarını (Total, Completed, Cancelled) `DailyAppointmentStatDto` listesi olarak dön.
- [x] **4.** **GET /api/v1/admin/users?role=&page=** ve **PUT /api/v1/admin/users/{id}/status** endpoint'lerini oluştur:
  - Rol (Patient/Doctor) bazlı kullanıcıları sayfalayarak getir.
  - İlgili kullanıcının IsActive durumunu true/false (Aktif/Pasif) yapabilen endpoint.
- [x] **5.** **POST /api/v1/admin/doctors** endpoint'ini (Transaction yapısıyla) oluştur:
  - Email benzersizliği kontrolü.
  - `Users` tablosuna `Role=Doctor` kaydı ve şifre hash'leme.
  - `DoctorProfiles` kaydı oluşturma.
  - `DoctorAvailability` kayıtlarını `AvailabilityDto` üzerinden ekleme.
  - Hata anında transaction rollback.
- [x] **6.** **PUT /api/v1/admin/doctors/{id}** endpoint'ini oluştur:
  - Var olan doktor profil (uzmanlık, deneyim, bio) bilgilerini güncelleyen yapı.
- [x] **7.** **PUT /api/v1/admin/doctors/{id}/availability** endpoint'ini oluştur:
  - Doktorun mevcut mesai saatlerini güncelleyen (sil/yaz veya güncelle) yapı.
- [x] **8.** **GET /api/v1/admin/appointments** (Filtreli) ve **PUT /api/v1/admin/appointments/{id}/status** endpoint'ini oluştur:
  - Tüm randevuları `doctor`, `patient`, `status`, `page` (ve `tarih` gereksinimi için startDate/endDate) parametreleri ile getir.
  - Admin yetkisiyle istenen randevu durumunu güncelle.

---

## ⚛️ Bileşenler & UI (Frontend)
> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend*

- [x] **9.** `src/layouts/AdminLayout.jsx` oluştur:
  - Sadece Admin yetkisine açık (ProtectedRoute) sidebar/navbar yapısı.
  - Linkler: Dashboard | Kullanıcılar | Doktorlar | Randevular (Aktif route vurgulama ile).
- [x] **10.** `src/pages/Admin/AdminDashboard.jsx` oluştur:
  - 4 adet Sistem İstatistik Kartı ve Son 7 Günlük Randevu Tablosu/Grafiği içermeli.
  - Hızlı erişim link/butonları.
- [x] **11.** `src/pages/Admin/UserManagement.jsx` oluştur:
  - Hasta / Doktor sekmeleri ayrımı.
  - Her satırda: Ad Soyad | Email | Rol | Durum (Aktif/Pasif toggle özelliği) kolonlarını içeren tablo.
- [x] **12.** `src/pages/Admin/DoctorManagement.jsx` oluştur:
  - Kayıtlı doktorların detaylı listesi ve profil düzenleme butonları.
  - Yeni doktor ekleme butonu modal'ı tetiklemeli.
- [x] **13.** `src/components/AvailabilityEditor.jsx` bileşenini oluştur:
  - Haftanın her günü için Aktif/Pasif toggle'ı.
  - Aktif ise Başlangıç-Bitiş zaman (time picker) seçimi.
- [x] **14.** `src/components/CreateDoctorModal.jsx` (Çok Adımlı) bileşenini oluştur:
  - Adım 1: Kişisel Bilgiler (Ad, Email, Şifre vb.).
  - Adım 2: Mesleki Bilgiler (Uzmanlık vb.).
  - Adım 3: `AvailabilityEditor` ile mesai saatleri.
  - API çağrısı yaparak doktoru kaydetme.
- [x] **15.** `src/pages/Admin/AppointmentManagement.jsx` oluştur:
  - Sistemdeki tüm randevuları sayfalama ve Doktor | Hasta | Durum | Tarih filtreleriyle listeleme.
  - Tıklanan randevunun detayını görüntüleme ve durumunu güncelleme modal'ı.

---

## 🧪 Test Senaryoları & Doğrulama
> 📌 Kaynak: `phases.md` → *Test Senaryoları T7.1 – T7.7*

- [x] **16.** **[T7.1]** İstatistik kartlarındaki verilerin veritabanı kayıtlarıyla (Total, Today vs.) eşleştiğini doğrula.
- [x] **17.** **[T7.2]** Yeni doktor oluşturma formunun (User + Profile + Availability) veritabanına sorunsuz eklendiğini doğrula (Transaction testi).
- [x] **18.** **[T7.3]** Var olan bir email adresiyle doktor eklendiğinde `400 Bad Request` alındığını doğrula.
- [x] **19.** **[T7.4]** Kullanıcının statüsünün Aktif <-> Pasif olarak (IsActive toggle) güncellenebildiğini doğrula.
- [x] **20.** **[T7.5]** Pasif hale getirilen bir doktorun, hastalar tarafındaki "Doktor Seçimi" (Aktif Doktorlar) endpoint'inde listelenmediğini doğrula.
- [x] **21.** **[T7.6]** Günlük istatistik endpoint'inin (7 günlük) tarihleri ve toplamları doğru hesapladığını doğrula.
- [x] **22.** **[T7.7]** Hasta veya Doktor rolüne sahip bir kullanıcının `/admin/*` route'larına girmesinin engellenip `/login` veya 403 sayfasına yönlendirildiğini doğrula.

---

## ✅ Tamamlanma Kriterleri Kontrolü (Son Kontrol)
> 📌 Kaynak: `phases.md` → *Faz 7 Tamamlanma Kriterleri*

- [x] Admin dashboard istatistik ve 7 günlük tablo çalışıyor
- [x] Kullanıcı listesi sekme bazlı, aktif/pasif toggle çalışıyor
- [x] Yeni doktor oluşturma (müsaitlik dahil) transaction ile çalışıyor
- [x] Tüm randevular filtrelenebiliyor ve durum güncellenebiliyor
- [x] Admin route'larına rol kontrolü uygulanmış
