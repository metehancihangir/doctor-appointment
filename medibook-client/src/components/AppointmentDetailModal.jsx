import React, { useState, useEffect } from 'react';
import StatusDropdown from './StatusDropdown';
import api from '../api/axiosInstance';
import './StatusDropdown.css';
import './AppointmentDetailModal.css';

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status);
      setDoctorNotes(appointment.doctorNotes || '');
      setDiagnosis(appointment.diagnosis || '');
      setError(null);
    }
  }, [appointment]);

  if (!isOpen || !appointment) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Durum değiştiyse statü güncelle
      if (status !== appointment.status) {
        await api.put(`/doctor/appointments/${appointment.id}/status`, { status });
      }

      // Notlar değiştiyse notları güncelle
      if (doctorNotes !== (appointment.doctorNotes || '') || diagnosis !== (appointment.diagnosis || '')) {
        await api.put(`/doctor/appointments/${appointment.id}/notes`, { doctorNotes, diagnosis });
      }

      onUpdate(); // Listeyi yenilemek için
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Güncelleme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const formattedDate = new Date(appointment.appointmentDate).toLocaleDateString('tr-TR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  const formattedTime = appointment.appointmentTime.substring(0, 5);

  return (
    <div className="modal-overlay">
      <div className="modal-container detail-modal">
        <div className="modal-header">
          <h2>Randevu Detayı</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <div className="modal-error">{error}</div>}

          <div className="patient-info-card">
            <div className="info-row">
              <span className="label">Hasta:</span>
              <span className="value">{appointment.patientFullName}</span>
            </div>
            <div className="info-row">
              <span className="label">Yaş:</span>
              <span className="value">{appointment.patientAge}</span>
            </div>
            <div className="info-row">
              <span className="label">Telefon:</span>
              <span className="value">{appointment.patientPhone}</span>
            </div>
            <div className="info-row">
              <span className="label">Tarih:</span>
              <span className="value">{formattedDate} - {formattedTime}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Randevu Durumu</label>
            <StatusDropdown 
              currentStatus={appointment.status} 
              value={status}
              onChange={setStatus} 
            />
          </div>

          <div className="form-group">
            <label>Semptomlar / Hasta Notları (Sadece Okunabilir)</label>
            <textarea 
              className="readonly-textarea"
              value={appointment.symptoms || 'Hasta semptom belirtmemiş.'} 
              readOnly 
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Klinik Notlar</label>
            <textarea 
              value={doctorNotes} 
              onChange={(e) => setDoctorNotes(e.target.value)} 
              placeholder="Muayene bulguları ve klinik notlar..."
              rows="4"
              disabled={appointment.status === 'Completed' || appointment.status === 'Cancelled'}
            />
          </div>

          <div className="form-group">
            <label>Tanı (Diagnosis)</label>
            <textarea 
              value={diagnosis} 
              onChange={(e) => setDiagnosis(e.target.value)} 
              placeholder="Konulan teşhis..."
              rows="2"
              disabled={appointment.status === 'Completed' || appointment.status === 'Cancelled'}
            />
          </div>

        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={isSaving}>İptal</button>
          <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
