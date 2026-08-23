# ✅ Faz 6 — Görev Listesi: Doktor Dashboard

> 📖 **Kaynak:** [phases.md — FAZ 6](phases.md#faz-6--doktor-dashboard)
> Bu liste, `phases.md` dosyasındaki Faz 6 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[ ]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 1 / 1 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 5 / 5 |
| ⚛️ Bileşenler & UI (Frontend) | 5 / 5 |
| 🧪 Testler | 7 / 7 |
| **Toplam** | **18 / 18** |

---

## 🗄️ BÖLÜM A — Veri Yapısı & Mimari (Backend)

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari* (Yeni migration gerekmiyor)

- [x] **1.** İlgili DTO sınıflarını oluştur (`DTOs/Appointment/` veya `DTOs/Doctor/` altında):
  - `DoctorAppointmentDto`: `Id`, `PatientFullName`, `PatientPhone`, `PatientAge`, `AppointmentDate`, `AppointmentTime`, `Status`, `Symptoms`, `PatientNotes`, `DoctorNotes`, `Diagnosis`
  - `UpdateAppointmentStatusDto`: `Status`
  - `UpdateDoctorNotesDto`: `DoctorNotes`, `Diagnosis`
  - `DoctorStatsDto`: `TodayCount`, `PendingCount`, `CompletedCount`, `TotalCount`

---

## ⚙️ BÖLÜM B — Endpoint'ler & İş Mantığı (Backend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **2.** **GET /api/v1/doctor/stats** endpoint'ini `DoctorDashboardController` veya `AppointmentsController` içine ekle:
  - İlgili doktora ait randevu verilerini okuyarak `DoctorStatsDto` döndür.
- [x] **3.** **GET /api/v1/doctor/appointments** endpoint'ini oluştur:
  - Query Parametreleri: `status` (isteğe bağlı), `startDate` (isteğe bağlı), `endDate` (isteğe bağlı), `page` (varsayılan: 1), `pageSize` (varsayılan: 10).
  - İstek yapan doktorun ID'sini JWT'den alıp sadece o doktora ait randevuları döndür. Yaş hesabı yap (`PatientProfiles.DateOfBirth` → `DateTime.Now`).
- [x] **4.** Durum Geçiş (Status Transition) Validasyonlarını hazırla:
  - `Scheduled` → `Confirmed` veya `Cancelled`
  - `Confirmed` → `Completed` veya `Cancelled`
  - `Completed` veya `Cancelled` durumundaki kayıtlar **değiştirilemez**.
- [x] **5.** **PUT /api/v1/doctor/appointments/{id}/status** endpoint'ini oluştur:
  - İlgili validasyonlardan (adım 4) geçiyorsa statüyü güncelle. 
- [x] **6.** **PUT /api/v1/doctor/appointments/{id}/notes** endpoint'ini oluştur:
  - `DoctorNotes` ve `Diagnosis` alanlarını güncelle (sadece o doktorun hastasıysa yetki ver).

---

## ⚛️ BÖLÜM C — Bileşenler & UI (Frontend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend*

- [x] **7.** `src/hooks/useDoctorAppointments.js` custom hook'unu oluştur:
  - State: `status`, `startDate`, `endDate`, `page`. API'den `appointments` listesi ve istatistikleri çekecek yapı.
- [x] **8.** `src/components/StatusDropdown.jsx` bileşenini oluştur:
  - Mevcut randevu durumunu prop alıp sadece geçerli geçiş seçeneklerini listelesin (Örn: `Scheduled` ise `Completed` seçeneğini gizlesin).
- [x] **9.** `src/components/AppointmentDetailModal.jsx` bileşenini oluştur:
  - Props: `appointment`, `onClose`, `onUpdate`.
  - Hasta bilgileri (ad, telefon, hesaplanmış yaş), semptomlar ve hasta notları read-only (okunabilir).
  - Durum güncelleme dropdown'u barındırsın (`StatusDropdown` kullanarak).
  - Klinik not ve tanı için textarea'lar barındırsın. "Kaydet" butonu ile API çağrılarını yapsın.
- [x] **10.** `src/pages/Doctor/DoctorDashboard.jsx` sayfasını oluştur (`/doctor/dashboard` rotası):
  - Üstte "İstatistik Kartları" paneli (Bugünkü, Bekleyen, Tamamlanan, Toplam).
  - "Bugünkü Program" isimli ayrı bir panel (Saate göre sıralı mini liste).
- [x] **11.** Dashboard içerisinde "Tüm Randevular Tablosu" yapısını kur:
  - Filtre çubuğu (Durum + Tarih aralığı).
  - Tablo sütunları: Hasta | Tarih/Saat | Yaş | Semptomlar | Durum | İşlem.
  - Satıra veya işlem butonuna tıklandığında `AppointmentDetailModal`'ı aç.

---

## 🧪 BÖLÜM D — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T6.1 – T6.7*

- [x] **12.** **[T6.1]** Doktorun sadece kendi randevularını görebildiğini (Integration Test / API Çağrısı) doğrula.
- [x] **13.** **[T6.2]** Başka bir doktora ait randevu detayına erişimin `403 Forbidden` veya `404 Not Found` döndürdüğünü doğrula.
- [x] **14.** **[T6.3]** `Scheduled` olan randevunun durumunun `Confirmed` yapılabildiğini doğrula.
- [x] **15.** **[T6.4]** `Completed` durumuna geçmiş bir randevunun `Scheduled` durumuna geri alınmasının (yasak) `400 Bad Request` döndürdüğünü doğrula.
- [x] **16.** **[T6.5]** Klinik notların (DoctorNotes, Diagnosis) başarıyla kaydedilip okunabildiğini doğrula.
- [x] **17.** **[T6.6]** İstatistik kartlarındaki "Bugünkü randevu sayısı" bilgisinin backend'den doğru hesaplanıp döndüğünü doğrula (Unit Test / Manuel).
- [x] **18.** **[T6.7]** `DateOfBirth` (Doğum Tarihi) kullanılarak hastanın yaşının doğru hesaplandığını (Unit Test / Manuel) doğrula.

---

## ✅ Faz 6 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 6 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 6 tamamdır ve Faz 7'ye geçilebilir:

- [x] Dashboard istatistik kartları doğru veri gösteriyor
- [x] Tüm randevular filtre ile listelenebiliyor
- [x] Durum güncelleme geçiş kurallarına uygun çalışıyor
- [x] Klinik not ekleme/güncelleme çalışıyor
- [x] Hasta detay modal'ı yaş hesaplamalı bilgiler gösteriyor
