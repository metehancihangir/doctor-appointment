import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';
import AppointmentCard from '../../components/AppointmentCard';
import CancelModal from '../../components/CancelModal';
import api from '../../api/axiosInstance';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { 
    appointments, 
    totalCount, 
    statusFilter, 
    setStatusFilter, 
    dateFilter, 
    setDateFilter, 
    isLoading, 
    error, 
    refresh 
  } = usePatientAppointments('Tümü', { startDate: null, endDate: null }, 50);

  // Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedAppointment) return;
    setIsCanceling(true);
    try {
      await api.put(`/appointments/${selectedAppointment.id}/cancel`);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      refresh(); // Listeyi güncelle
    } catch (err) {
      alert(err.response?.data?.message || 'İptal işlemi sırasında bir hata oluştu.');
    } finally {
      setIsCanceling(false);
    }
  };

  // Özet istatistikler
  const pendingCount = appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length;
  const completedCount = appointments.filter(a => a.status === 'Completed').length;

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>Randevularım</h1>
        <p>Tüm randevularınızı buradan takip edebilir ve yönetebilirsiniz.</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon total">📋</div>
          <div className="summary-info">
            <h3>Toplam Randevu</h3>
            <span className="summary-number">{totalCount}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pending">⏳</div>
          <div className="summary-info">
            <h3>Bekleyen</h3>
            <span className="summary-number">{pendingCount}</span>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon completed">✅</div>
          <div className="summary-info">
            <h3>Tamamlanan</h3>
            <span className="summary-number">{completedCount}</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Durum Filtresi</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="Tümü">Tümü</option>
            <option value="Scheduled">Planlandı (Scheduled)</option>
            <option value="Confirmed">Onaylandı (Confirmed)</option>
            <option value="Completed">Tamamlandı (Completed)</option>
            <option value="Cancelled">İptal Edildi (Cancelled)</option>
          </select>
        </div>
        
        {/* Tarih filtreleri de eklenebilir. Şimdilik basit tutuyoruz. */}
      </div>

      <div className="appointments-list-container">
        {isLoading ? (
          <div className="loading-state">Randevular yükleniyor...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏥</div>
            <h3>Henüz Randevunuz Yok</h3>
            <p>Seçilen filtrelere uygun randevu bulunamadı veya henüz hiç randevu almadınız.</p>
            <button 
              className="btn-book-new" 
              onClick={() => navigate('/patient/doctors')}
            >
              Yeni Randevu Al
            </button>
          </div>
        ) : (
          <div className="appointments-grid">
            {appointments.map(appointment => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                onCancel={handleCancelClick} 
              />
            ))}
          </div>
        )}
      </div>

      <CancelModal 
        isOpen={cancelModalOpen} 
        onClose={() => setCancelModalOpen(false)}
        onConfirm={confirmCancel}
        isCanceling={isCanceling}
      />
    </div>
  );
};

export default PatientDashboard;
