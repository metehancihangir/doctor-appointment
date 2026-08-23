# ✅ Faz 4 — Görev Listesi: Randevu Alma Ekranı

> 📖 **Kaynak:** [phases.md — FAZ 4](phases.md#faz-4--randevu-alma-ekranı)
> Bu liste, `phases.md` dosyasındaki Faz 4 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[ ]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 3 / 3 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 3 / 3 |
| ⚛️ Bileşenler & UI (Frontend) | 6 / 6 |
| 🧪 Testler | 7 / 7 |
| **Toplam** | **19 / 19** |

---

## 🗄️ BÖLÜM A — Veri Yapısı & Mimari (Backend)

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari — Yeni Tablo*

- [x] **1.** `Models/Appointment.cs` entity sınıfını ve `Models/AppointmentStatus.cs` (enum) oluştur:
  - `Id` (int, PK), `PatientId` (int, FK → Users), `DoctorId` (int, FK → DoctorProfiles)
  - `AppointmentDate` (DateOnly veya DateTime), `AppointmentTime` (TimeOnly veya TimeSpan)
  - `Status` (enum: Scheduled, Confirmed, Completed, Cancelled)
  - `Symptoms` (string, nullable), `PatientNotes` (string, nullable), `DoctorNotes` (string, nullable), `Diagnosis` (string, nullable)
  - `IsReminderSent` (bool, default: false), `CreatedAt`, `UpdatedAt`
- [x] **2.** `AppDbContext`'e `DbSet<Appointment>` ekle, ilişkileri (Patient ve Doctor foreign key'leri) yapılandır ve `Add-Migration AddAppointmentsTable` komutu ile migration oluşturup uygula.
- [x] **3.** İlgili DTO'ları `DTOs/Appointment/` ve `DTOs/Doctor/` altında oluştur:
  - `DoctorDetailDto` (DoctorId, FullName, Specialty, YearsOfExperience, Bio, AvailableDays[])
  - `AvailableSlotsRequestDto` (DoctorId, Date)
  - `TimeSlotDto` (Time, IsAvailable)
  - `CreateAppointmentDto` (DoctorId, AppointmentDate, AppointmentTime, Symptoms, PatientNotes)
  - `AppointmentResponseDto` (Id, DoctorName, Date, Time, Status)

---

## ⚙️ BÖLÜM B — Endpoint'ler & İş Mantığı (Backend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **4.** **GET /api/v1/doctors/{id}** endpoint'ini oluştur:
  - Belirtilen doktorun profil detaylarını ve çalıştığı günleri (`AvailableDays`) `DoctorDetailDto` olarak döndür.
- [x] **5.** **GET /api/v1/doctors/{id}/slots?date=YYYY-MM-DD** endpoint'ini oluştur:
  - Doktorun `DoctorAvailability` tablosundan o gün (DayOfWeek) için mesai saatlerini al.
  - Başlangıç ve bitiş aralığını 30 dakikalık slotlara böl.
  - Seçilen tarihte status'ü `Cancelled` olmayan mevcut randevuları DB'den çek ve bu saatlere denk gelen slotları `IsAvailable = false` yap. `List<TimeSlotDto>` dön.
- [x] **6.** **POST /api/v1/appointments** endpoint'ini oluştur (Randevu Oluşturma):
  - Validasyonlar: DoctorId geçerli mi? Tarih bugün veya ilerisi mi? (Geçmişe randevu alınamaz). Seçilen zaman en az 2 saat sonrası mı? Doktor o gün o saatte çalışıyor mu? Slot daha önceden alınmış mı (Dolu mu)? Hasta aynı slota başka randevu almış mı?
  - Başarılı ise randevuyu `Scheduled` statüsünde DB'ye kaydet.

---

## ⚛️ BÖLÜM C — Bileşenler & UI (Frontend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend*

- [x] **7.** `src/pages/Patient/AppointmentBookingPage.jsx` sayfasını oluştur ve `App.jsx` te `/patient/appointment/:doctorId` rotasına bağla.
  - İçerisinde Çok Adımlı Form State'ini (`step: 1|2|3`, `selectedDate`, `selectedSlot`, `symptoms`, `notes`) yönet.
- [x] **8.** `src/hooks/useAvailableSlots.js` custom hook'unu oluştur:
  - Parametre olarak `doctorId` ve `date` alsın. Tarih değiştiğinde backend'e gidip güncel slot durumlarını çeksin.
- [x] **9.** `src/components/DoctorProfileCard.jsx` bileşenini oluştur (Sayfa üstünde doktor bilgisini göstermek için).
- [x] **10.** **Adım 1: Tarih Seçimi** arayüzünü kodla:
  - Mini takvim veya tarih seçici (Datepicker). Sadece **bu hafta ve sonraki 4 haftalık** (1 aylık) periyot gösterilmeli. Geçmiş günler ve doktorun çalışmadığı günler tıklanamaz (disabled) olsun.
- [x] **11.** **Adım 2: Saat Seçimi** (`SlotGrid.jsx`) arayüzünü kodla:
  - 30 dakikalık zaman dilimlerini (10:00, 10:30 vb.) grid olarak bas.
  - Dolu slotlar gri/disabled (cursor: not-allowed) olsun. Boş slotlara tıklanabilsin.
- [x] **12.** **Adım 3: Randevu Formu ve Onay** arayüzünü kodla:
  - Semptomlar ve Notlar için textarea girişleri ekle.
  - Randevu onayla butonuna "Loading" state ekle, işlem bitince **başarı animasyonu** göster ve ardından dashboard sayfasına yönlendir.

---

## 🧪 BÖLÜM D — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T4.1 – T4.7*

- [x] **13.** **[T4.1]** Geçerli slota randevu alma isteğinin `201 Created` döndüğünü doğrula.
- [x] **14.** **[T4.2]** Geçmiş bir tarihe (dün) randevu alma isteğinin `400 Bad Request` döndüğünü doğrula.
- [x] **15.** **[T4.3]** Şu andan itibaren 2 saatten daha kısa bir süreye randevu alma isteğinin `400 Bad Request` döndüğünü doğrula.
- [x] **16.** **[T4.4]** Zaten dolu olan bir slota (başka hasta tarafından alınmış) randevu isteğinin `409 Conflict` (veya Bad Request) döndüğünü doğrula.
- [x] **17.** **[T4.5]** Doktorun çalışma planında (Availability) olmayan bir güne randevu isteğinin `400 Bad Request` döndüğünü doğrula.
- [x] **18.** **[T4.6]** Slot hesaplama algoritmasının (Unit test - Backend) 09:00-17:00 aralığı için tam 16 adet 30 dk'lık slot ürettiğini doğrula.
- [x] **19.** **[T4.7]** Randevu durumu `Cancelled` yapıldığında, o saatin tekrar `IsAvailable = true` olarak slot listesine geldiğini doğrula.

---

## ✅ Faz 4 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 4 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 4 tamamdır ve Faz 5'e geçilebilir:

- [x] Doktor profil detay sayfası görüntüleniyor
- [x] Müsait günler takvimde disabled/enabled doğru gösteriliyor
- [x] Seçilen güne göre slotlar dinamik yükleniyor
- [x] Randevu oluşturma tüm validasyonlarla çalışıyor
- [x] Başarı sonrası dashboard'a yönlendirme yapılıyor
