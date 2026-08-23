# ✅ Faz 5 — Görev Listesi: Hasta Dashboard (Randevularım)

> 📖 **Kaynak:** [phases.md — FAZ 5](phases.md#faz-5--hasta-dashboard-randevularım)
> Bu liste, `phases.md` dosyasındaki Faz 5 planını madde madde uygulanabilir görevlere dönüştürür.
> Her görevi tamamladığında `[ ]` → `[x]` olarak işaretle.

---

## 📊 İlerleme Durumu

| Kategori | Tamamlanan / Toplam |
|---|---|
| 🗄️ Veri Yapısı & Mimari (Backend) | 1 / 1 |
| ⚙️ Endpoint'ler & İş Mantığı (Backend) | 2 / 2 |
| ⚛️ Bileşenler & UI (Frontend) | 5 / 5 |
| 🧪 Testler | 6 / 6 |
| **Toplam** | **14 / 14** |

---

## 🗄️ BÖLÜM A — Veri Yapısı & Mimari (Backend)

> 📌 Kaynak: `phases.md` → *Veri Yapısı & Mimari* (Yeni migration gerekmiyor)

- [x] **1.** İlgili DTO sınıfını oluştur:
  - `DTOs/Appointment/PatientAppointmentDto.cs`: `Id`, `DoctorFullName`, `DoctorSpecialty`, `AppointmentDate`, `AppointmentTime`, `Status`, `Symptoms`, `CreatedAt`

---

## ⚙️ BÖLÜM B — Endpoint'ler & İş Mantığı (Backend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Backend*

- [x] **2.** **GET /api/v1/appointments/my** endpoint'ini `AppointmentsController` içine ekle:
  - Query Parametreleri: `status` (isteğe bağlı), `startDate` (isteğe bağlı), `endDate` (isteğe bağlı), `page` (varsayılan: 1), `pageSize` (varsayılan: 10).
  - Yalnızca istek yapan `PatientId`'ye ait randevuları getir, sayfalama ve filtrelemeyi uygula.
  - Randevuları tarih/saate göre azalan (yeniden eskiye) sırala.
- [x] **3.** **PUT /api/v1/appointments/{id}/cancel** endpoint'ini `AppointmentsController` içine ekle:
  - Randevu var mı ve bu hastaya mı ait kontrol et (yoksa 404/403 döndür).
  - Randevu durumu (`Status`) `Scheduled` veya `Confirmed` mi kontrol et (değilse 400 Bad Request döndür).
  - Durumu `Cancelled` yap ve `UpdatedAt` alanını `DateTime.UtcNow` olarak güncelle.
  - SMS tetikleme yeri için // TODO yorum satırı ekle (Faz 8 için).

---

## ⚛️ BÖLÜM C — Bileşenler & UI (Frontend)

> 📌 Kaynak: `phases.md` → *Kodlama Süreci — Frontend*

- [x] **4.** `src/hooks/usePatientAppointments.js` custom hook'unu oluştur:
  - State: `appointments`, `totalCount`, `page`, `statusFilter`, `dateFilter`, `isLoading`.
  - Filtreler değiştiğinde API'yi tekrar çağıracak mantığı yaz.
- [x] **5.** `src/components/AppointmentCard.jsx` bileşenini oluştur:
  - Doktor adı, uzmanlık, tarih/saat gösterimi.
  - Durum (StatusBadge) renk kodları: Scheduled → sarı, Confirmed → mavi, Completed → yeşil, Cancelled → kırmızı.
  - Durum iptal edilebilir seviyedeyse (Scheduled/Confirmed) "İptal Et" butonu göster (Tıklanınca modal açılacak).
- [x] **6.** `src/components/CancelModal.jsx` (veya `AppointmentCancelModal.jsx`) bileşenini oluştur:
  - "Bu randevuyu iptal etmek istediğinize emin misiniz?" sorusu, Onayla/İptal butonları.
  - Onaylanınca iptal API'sini çağır ve listeyi güncellemesi için callback tetikle.
- [x] **7.** `src/pages/Patient/PatientDashboard.jsx` sayfasını oluştur ve layout/router'a bağla (`/patient/dashboard`):
  - Üst satıra **Özet Kartları** ekle: Toplam Randevu, Bekleyen (Scheduled+Confirmed), Tamamlanan (Completed).
  - Filtre çubuğunu ekle: Durum dropdown'u (**Tümü | Planlandı | Onaylandı | Tamamlandı | İptal Edildi**) ve tarih aralığı Datepicker'ları.
- [x] **8.** Dashboard sayfasında `Randevu Listesi` ve `Boş Durum` ekranını yönet:
  - `usePatientAppointments` hook'undan gelen listeyi mapleyip `AppointmentCard`ları bas.
  - Eğer liste boşsa "Henüz randevunuz yok" mesajı ve "Randevu Al" (doktorlara yönlendiren) butonu göster.

---

## 🧪 BÖLÜM D — Testler

> 📌 Kaynak: `phases.md` → *Test Senaryoları T5.1 – T5.6*

- [x] **9.** **[T5.1]** Hastanın `/appointments/my` isteğinde sadece kendi randevularının listelendiğini doğrula.
- [x] **10.** **[T5.2]** Başka bir hastanın ID'sine ait randevuyu iptal etmeye çalışmanın `403 Forbidden` veya `404 Not Found` döndürdüğünü doğrula.
- [x] **11.** **[T5.3]** `Scheduled` durumundaki bir randevuya iptal isteği atıldığında statüsünün `Cancelled` olduğunu doğrula.
- [x] **12.** **[T5.4]** `Completed` durumundaki (zaten bitmiş) bir randevuyu iptal etmeye çalışmanın `400 Bad Request` döndürdüğünü doğrula.
- [x] **13.** **[T5.5]** Durum bazlı filtreleme API'sine (örn: `?status=Completed`) sadece seçilen duruma ait verilerin döndüğünü doğrula.
- [x] **14.** **[T5.6]** Hiç randevusu olmayan bir hastanın dashboard'a girdiğinde `Boş Durum (Empty State)` ekranını gördüğünü UI üzerinden doğrula.

---

## ✅ Faz 5 Tamamlanma Kriterleri

> 📌 Kaynak: `phases.md` → *Faz 5 Tamamlanma Kriterleri*

Tüm aşağıdaki maddeler ✅ olduğunda Faz 5 tamamdır ve Faz 6'ya geçilebilir:

- [x] Hasta dashboard'u kişisel randevuları doğru gösteriyor
- [x] Durum badge'leri renk kodlu
- [x] Filtre (durum + tarih) çalışıyor
- [x] İptal işlemi modal onayı ile yapılıyor
- [x] Özet kartlar doğru hesaplanıyor
