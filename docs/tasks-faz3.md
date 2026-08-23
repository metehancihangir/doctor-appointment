# ✅ Faz 3 — Görev Listesi: Doktor Listeleme & Arama Ekranı

> 📖 **Kaynak:** [phases.md — FAZ 3](phases.md#faz-3--doktor-listeleme--arama-ekranı)
> Bu liste, `phases.md` dosyasındaki Faz 3 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[x]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 0 / 3 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 0 / 2 |
| ⚛️ Bileşenler & UI (Frontend) | 0 / 5 |
| 🧪 Testler | 0 / 7 |
| **Toplam** | **0 / 17** |

---

## 🗄️ BÖLÜM A — Veri Yapısı & Mimari (Backend)

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari — Yeni Tablolar & DTO'lar*

- [x] **1.** `Models/DoctorProfile.cs` entity sınıfını oluştur:
  - `Id` (int, PK), `UserId` (int, FK → Users, unique), `Specialty` (string, max 100), `Bio` (string/text, nullable), `YearsOfExperience` (int)
- [x] **2.** `Models/DoctorAvailability.cs` entity sınıfını oluştur:
  - `Id` (int, PK), `DoctorId` (int, FK → DoctorProfiles), `DayOfWeek` (int: 0=Pazar ... 6=Cumartesi), `StartTime` (time/TimeSpan), `EndTime` (time/TimeSpan)
- [x] **3.** `AppDbContext`'e `DbSet<DoctorProfile>` ve `DbSet<DoctorAvailability>` ekle. İlişkileri (FK) ve indexleri tanımla, ardından migration (`Add-Migration AddDoctorTables`) oluştur ve uygula. (Opsiyonel: Seed data ile 1 Admin, 1 Doktor ve ilgili DoctorAvailability verisini ekle).

---

## ⚙️ BÖLÜM B — Endpoint'ler & İş Mantığı (Backend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **4.** Doktor listeleme için gerekli DTO'ları oluştur (`DTOs/Doctor/` klasöründe):
  - `DoctorListItemDto` { DoctorId, FullName, Specialty, YearsOfExperience, UserId }
  - `DoctorListResponseDto` { Doctors: List<DoctorListItemDto>, TotalCount, Page, PageSize }
- [x] **5.** **GET /api/v1/doctors** endpoint'ini (veya Service katmanını) oluştur:
  - Query parametrelerini al: `search` (opsiyonel), `specialty` (opsiyonel), `page` (default: 1), `pageSize` (default: 10)
  - `Users` ve `DoctorProfiles` tablolarını JOIN'le.
  - Sadece aktif (`IsActive = true`) ve rolü `Doctor` olan kullanıcıları getir.
  - `search` parametresi varsa isim/soyisim'de `LIKE` araması yap.
  - `specialty` parametresi varsa birebir eşleştir.
  - Pagination (`Skip((page-1)*pageSize).Take(pageSize)`) ve `TotalCount` hesaplaması yaparak dönüştür.

---

## ⚛️ BÖLÜM C — Bileşenler & UI (Frontend)

> 📌 Kaynak: `phases.md` → *UI/UX Tasarımı & Frontend Adım 1-4*

- [x] **6.** `src/pages/Patient/DoctorsPage.jsx` sayfa bileşenini oluştur ve React Router'da (`App.jsx`) yapılandır (Mevcut `PatientLayout` içine veya route'a).
- [x] **7.** `src/components/SearchFilter.jsx` (Arama ve Filtreleme) bileşenini oluştur:
  - Arama (isim/soyisim) input'u
  - Uzmanlık alanı seçimi (Dropdown/Select)
  - Temizle butonu
- [x] **8.** `src/hooks/useDoctors.js` custom hook'unu oluştur:
  - State: `doctors`, `totalCount`, `page`, `isLoading`, `error`
  - Arama kelimesi (search) değiştiğinde `300ms` debounce ile istek atsın.
- [x] **9.** `src/components/DoctorCard.jsx` (Doktor Kartı) bileşenini oluştur:
  - Avatar, İsim, Uzmanlık (Badge) ve Deneyim yılı bilgilerini göster.
  - Mobil uyumlu Grid layout sınıfı (`doctors-grid`) kullan (tek sütun -> tablet 2 sütun -> masaüstü 3 sütun).
  - Kart üzerinde "Randevu Al" butonunu (veya karta tıklandığında `/patient/appointment/doctorId` yönlendirmesini) ekle (İşlevi Faz 4'te bağlanacak).
- [x] **10.** `src/components/Pagination.jsx` bileşenini oluştur:
  - Sayfa başı 10 kayıt (`pageSize = 10`).
  - Önceki/Sonraki ve aktif sayfa numarası özelliklerini içersin.
  - Eğer hiç kayıt yoksa "Sonuç bulunamadı" (Empty state) mesajını/görselini göster.

---

## 🧪 BÖLÜM D — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T3.1 – T3.7*

- [x] **11.** **[T3.1]** Backend'e `GET /api/v1/doctors` isteği atarak tüm aktif doktorların sayfalama ile geldiğini (Integration) doğrula.
- [x] **12.** **[T3.2]** Uzmanlığa göre sorgu (Örn. `?specialty=Pediatri`) atıldığında sadece o uzmanlıktaki doktorların geldiğini (Integration) doğrula.
- [x] **13.** **[T3.3]** İsme göre arama (Örn. `?search=Ahmet`) yapıldığında kısmi eşleşmenin çalıştığını (Integration) doğrula.
- [x] **14.** **[T3.4]** Pasif duruma getirilmiş (`IsActive=false`) doktorun listeye gelmediğini (Integration) doğrula.
- [x] **15.** **[T3.5]** Filtre sonucu boş döndüğünde arayüzde (UI) "Sonuç bulunamadı" mesajının gösterildiğini doğrula.
- [x] **16.** **[T3.6]** Sistemde 11'den fazla doktor varken `page=2` isteğinde sonraki sayfaya geçildiğini (Integration) doğrula.
- [x] **17.** **[T3.7]** `DoctorsPage` sayfasına yetkisiz (çıkış yapmış) şekilde girildiğinde UI üzerinden `/login` sayfasına yönlendirildiğini (Korumalı Route kontrolü) doğrula.

---

## ✅ Faz 3 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 3 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 3 tamamdır ve Faz 4'e geçilebilir:

- [x] Doktor kartları grid layout'ta listeleniyor
- [x] İsim ve uzmanlık filtresi çalışıyor
- [x] Debounce ile gereksiz API çağrısı önleniyor
- [x] Pagination 10'ar öğeyle çalışıyor
- [x] Seed data ile en az 3-5 doktor görüntülenebiliyor
