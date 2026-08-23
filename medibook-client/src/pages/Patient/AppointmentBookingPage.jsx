import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import DoctorProfileCard from '../../components/DoctorProfileCard';
import SlotGrid from '../../components/SlotGrid';
import { useAvailableSlots } from '../../hooks/useAvailableSlots';
import './AppointmentBookingPage.css';

const AppointmentBookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  
  // Multi-step form state
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().setHours(0,0,0,0)));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const { slots, loading: slotsLoading, error: slotsError } = useAvailableSlots(doctorId, selectedDate);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await api.get(`/doctors/${doctorId}`);
        setDoctor(response.data);
      } catch (err) {
        console.error('Doktor detayı alınamadı', err);
        // Hata durumunda ana sayfaya dön
        navigate('/patient');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [doctorId, navigate]);

  // Sadece bu hafta + 4 haftalık tarih oluştur (35 gün)
  const generateDates = () => {
    const dates = [];
    const today = new Date(new Date().setHours(0,0,0,0));
    for (let i = 0; i < 35; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const handleDateSelect = (e) => {
    const dateVal = e.target.value;
    setSelectedDate(new Date(dateVal));
    setSelectedSlot(null);
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    const formattedDate = selectedDate.toISOString().split('T')[0];

    try {
      await api.post('/appointments', {
        doctorId: parseInt(doctorId),
        appointmentDate: formattedDate,
        appointmentTime: selectedSlot,
        symptoms,
        patientNotes: notes
      });

      setShowSuccess(true);
      setTimeout(() => {
        // Geçici olarak ana sayfaya yönlendiriyoruz, dashboard yapılınca '/patient/dashboard' olacak
        navigate('/patient');
      }, 2500);

    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Randevu oluşturulurken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) {
    return <div className="loading-container">Doktor bilgileri yükleniyor...</div>;
  }

  const availableDates = generateDates().filter(d => 
    doctor?.availableDays?.includes(d.getDay())
  );

  return (
    <div className="appointment-booking-page">
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Randevunuz Onaylandı!</h2>
            <p>Yönlendiriliyorsunuz...</p>
          </div>
        </div>
      )}

      <h1>Randevu Al</h1>
      
      <DoctorProfileCard doctor={doctor} />

      <div className="booking-steps-container">
        
        {/* Adım 1 */}
        <div className={`step-section ${step >= 1 ? 'active' : ''}`}>
          <div className="step-header">
            <div className="step-number">1</div>
            <h3>Tarih Seçimi</h3>
          </div>
          <div className="step-content">
            <select 
              className="date-select" 
              value={selectedDate.toISOString()} 
              onChange={handleDateSelect}
            >
              <option value="" disabled>Lütfen bir tarih seçin</option>
              {availableDates.map((date, idx) => (
                <option key={idx} value={date.toISOString()}>
                  {date.toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Adım 2 */}
        <div className={`step-section ${step >= 2 ? 'active' : 'disabled'}`}>
          <div className="step-header">
            <div className="step-number">2</div>
            <h3>Saat Seçimi</h3>
          </div>
          <div className="step-content">
            {slotsLoading ? (
              <p>Saatler yükleniyor...</p>
            ) : slotsError ? (
              <p className="error-text">{slotsError}</p>
            ) : (
              <SlotGrid 
                slots={slots} 
                selectedSlot={selectedSlot} 
                onSelectSlot={handleSlotSelect} 
              />
            )}
          </div>
        </div>

        {/* Adım 3 */}
        <div className={`step-section ${step >= 3 ? 'active' : 'disabled'}`}>
          <div className="step-header">
            <div className="step-number">3</div>
            <h3>Randevu Detayları</h3>
          </div>
          <div className="step-content">
            <form onSubmit={handleSubmit} className="appointment-form">
              <div className="form-group">
                <label>Semptomlar / Şikayetler (Zorunlu)</label>
                <textarea 
                  required 
                  value={symptoms} 
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Lütfen şikayetlerinizi kısaca belirtin..."
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Ek Notlar (Opsiyonel)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Doktorunuza iletmek istediğiniz ek bilgiler..."
                  rows="2"
                ></textarea>
              </div>

              {submitError && <div className="alert alert-error">{submitError}</div>}

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={submitting || !selectedSlot}
              >
                {submitting ? 'Randevu Oluşturuluyor...' : 'Randevuyu Onayla'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AppointmentBookingPage;
