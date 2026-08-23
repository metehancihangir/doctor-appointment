# Faz 9: Güvenlik, Hata Yönetimi & Polishing — Detaylı Görev Listesi

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari | 1 / 1 |
| ⚙️ İş Mantığı (Backend) | 4 / 4 |
| ⚛️ Bileşenler & UI (Frontend) | 6 / 6 |
| 🧪 Testler | 8 / 8 |
| **Toplam** | **19 / 19** |

---

## 🗄️ Veri Yapısı & Mimari
> 📌 Kaynak: `phases.md` → *Faz 9 - Veri Yapısı & Mimari*

- [x] **1.** Bu fazda veritabanı veya mimari düzeyde tablo değişikliği yapılmayacaktır. Mevcut veritabanı yapısı olduğu gibi korunur. (IsReminderSent vs. önceki fazlarda eklendiği için)

---

## ⚙️ İş Mantığı (Backend)
> 📌 Kaynak: `phases.md` → *Faz 9 - Kodlama Süreci — Backend*

- [x] **2.** **FluentValidation Entegrasyonu:**
  - `dotnet add package FluentValidation.AspNetCore` paketi kur.
  - Her DTO için Validator sınıfı yaz:
    - *Email:* geçerli format (`EmailAddress`)
    - *Şifre:* min 6 karakter (`MinimumLength`)
    - *Telefon:* rakam, 10-11 karakter arası
    - *AppointmentDate:* >= DateTime.Now (Geçmişe randevu alınamaz)
- [x] **3.** **Standart Hata Yanıt Formatı:**
  - API endpoint'leri hata fırlattığında veya validasyon hatası olduğunda standart JSON formatında (`success: false`, `message`, `errors[]`) dönüş yapılmasını sağla.
- [x] **4.** **Serilog ile Yapısal Loglama:**
  - `dotnet add package Serilog.AspNetCore` ve `Serilog.Sinks.File` paketlerini kur.
  - Logların `logs/medibook-{Date}.log` formatında dosyaya yazılmasını yapılandır.
  - Sadece *Warning* ve üzeri hata seviyelerini dosyaya yazdıracak şekilde sınırlandır.
- [x] **5.** **Güvenlik Politikaları (HTTPS + HSTS):**
  - Backend `Program.cs` içine `app.UseHttpsRedirection()` ekle.
  - Production ortamı düşünülerek `app.UseHsts()` ayarını aktif et.

---

## ⚛️ Bileşenler & UI (Frontend)
> 📌 Kaynak: `phases.md` → *Faz 9 - UI/UX Tasarımı & Kodlama Süreci — Frontend*

- [x] **6.** **Global Error Boundary (Hata Sınırı):**
  - Beklenmedik JavaScript hatalarını yakalamak için `src/components/ErrorBoundary.jsx` bileşenini geliştir.
  - Hata anında uygulamanın çökmesini önleyerek ekrana özel bir "Bir şeyler yanlış gitti" sayfası yansıt.
- [x] **7.** **Toast Context ve Bildirimleri:**
  - Başarı (Yeşil), Hata (Kırmızı), Uyarı (Sarı) için genel bir ToastContext (`src/context/ToastContext.jsx`) yapısı kur.
  - Bildirimlerin 3 saniye sonra otomatik kapanmasını (slide-in / fade-out animasyonlarıyla) sağla.
- [x] **8.** **Loading Skeleton (Yükleme Durumları):**
  - API'den veri beklenirken ekranda titreşen gri bloklar (shimmer effect) oluşturacak `src/components/SkeletonCard.jsx` geliştir.
  - Doktor ve Randevu kartları (DoctorCard, AppointmentCard vb.) için ayrı varyantlar ekle.
- [x] **9.** **Form Hata Mesajları ve Geri Bildirimler:**
  - Input alanlarının altında kırmızı, uyarı ikonlu hata açıklamalarının standart şekilde gösterilmesini sağla.
- [x] **10.** **404 Sayfası:**
  - Geçersiz URL girişleri için özel tasarımlı "Sayfa Bulunamadı" ekranı oluştur ve "Ana Sayfaya Dön" butonu ekle.
- [x] **11.** **Responsive (Mobil Uyumluluk) Düzenlemeleri:**
  - CSS üzerinden breakpoint kontrollerini sağla (Mobil 375px, Tablet 768px, Masaüstü 1280px).
  - Özel olarak doktor grid yapısını dar ekranlarda (`max-width: 768px` -> 2 sütun, `max-width: 480px` -> 1 sütun) esneyecek şekilde ayarla.
  - Liste ekranlarında, veri olmadığında çıkacak "Boş State" mesajlarını + aksiyon butonlarını (Yeni randevu al vb.) tasarla.

---

## 🧪 Test Senaryoları & Doğrulama
> 📌 Kaynak: `phases.md` → *Faz 9 - Test Senaryoları T9.1 – T9.8*

- [x] **12.** **[T9.1]** FluentValidation ile geçersiz email girildiğinde standart hata mesajının döndüğünü doğrula (Unit test).
- [x] **13.** **[T9.2]** SQL injection denemesi yapıldığında, EF Core parametrik sorgusunun bunu güvenli şekilde engellediğini doğrula (Integration).
- [x] **14.** **[T9.3]** Token olmadan korumalı API'lere erişilmeye çalışıldığında `401 Unauthorized` döndüğünü doğrula (Integration).
- [x] **15.** **[T9.4]** Rate limit aşımı durumunda (ileride eklenirse) `429 Too Many Requests` döndüğünü kontrol et. (Eğer Rate Limiting entegrasyonu yoksa bunu basic seviyede ya kontrol et ya da atla).
- [x] **16.** **[T9.5]** Backend tarafında oluşan uyarı ve hataların `logs/` klasöründe `.log` uzantılı dosyalara başarılı şekilde yazıldığını doğrula (Manuel).
- [x] **17.** **[T9.6]** Mobil görünüm testinde (375px viewport) ekranların tek sütuna inip hizalamalarının bozulmadığını kontrol et (Manuel).
- [x] **18.** **[T9.7]** Yanlış bir URL girildiğinde (örneğin `/bilinmeyen-sayfa`) özel 404 ekranının geldiğini doğrula (UI).
- [x] **19.** **[T9.8]** Frontend Toast bildirimlerinin ekrana gelip 3 saniye sonra kaybolduğunu doğrula (UI).

---

## ✅ Tamamlanma Kriterleri Kontrolü (Son Kontrol)
> 📌 Kaynak: `phases.md` → *Faz 9 - Tamamlanma Kriterleri*

- [x] FluentValidation tüm DTO'larda aktif.
- [x] Standart hata yanıt formatı tüm endpoint'lerde tutarlı.
- [x] Serilog ile loglama çalışıyor.
- [x] Toast bildirimleri tüm kullanıcı aksiyonlarında gösteriliyor.
- [x] Loading skeleton veri yüklenirken görünüyor.
- [x] Tüm ekranlar mobil ve tablette düzgün görünüyor.
