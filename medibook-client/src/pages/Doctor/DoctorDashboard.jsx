import React, { useState } from 'react';
import { useDoctorAppointments } from '../../hooks/useDoctorAppointments';
import AppointmentDetailModal from '../../components/AppointmentDetailModal';
import SkeletonCard from '../../components/SkeletonCard';
import './DoctorDashboard.css';

const DoctorDashboard = () => {
  const { 
    appointments, 
    stats, 
    totalCount, 
    page, 
    setPage, 
    statusFilter, 
    setStatusFilter, 
    isLoading, 
    error, 
    refresh 
  } = useDoctorAppointments();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setModalOpen(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled': return 'badge-scheduled';
      case 'Confirmed': return 'badge-confirmed';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
      default: return '';
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case 'Scheduled': return 'Planlandı';
      case 'Confirmed': return 'Onaylandı';
      case 'Completed': return 'Tamamlandı';
      case 'Cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  // Bugünkü randevuları ayır
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.appointmentDate.startsWith(todayStr));

  return (
    <div className="doctor-dashboard">
      <div className="dashboard-header">
        <h1>Doktor Paneli</h1>
        <p>Randevularınızı, klinik notlarınızı ve hastalarınızı yönetin.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📅</div>
          <div className="stat-details">
            <h3>Bugünkü Randevular</h3>
            <span className="stat-value">{stats.todayCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-details">
            <h3>Bekleyen (Tümü)</h3>
            <span className="stat-value">{stats.pendingCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-details">
            <h3>Tamamlanan</h3>
            <span className="stat-value">{stats.completedCount}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">📊</div>
          <div className="stat-details">
            <h3>Toplam Kayıt</h3>
            <span className="stat-value">{stats.totalCount}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="today-schedule-panel">
          <h2>Bugünkü Program</h2>
          {todayAppointments.length === 0 ? (
            <div className="empty-state-mini">Bugün için planlanmış randevunuz bulunmuyor.</div>
          ) : (
            <div className="today-list">
              {todayAppointments.map(app => (
                <div className="today-item" key={app.id}>
                  <div className="today-time">{app.appointmentTime.substring(0, 5)}</div>
                  <div className="today-info">
                    <strong>{app.patientFullName}</strong>
                    <span className={`status-dot ${getStatusBadgeClass(app.status)}`}></span>
                  </div>
                  <button className="btn-action-sm" onClick={() => openModal(app)}>Detay</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="all-appointments-panel">
          <div className="panel-header">
            <h2>Tüm Randevular</h2>
            <div className="filters">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="Tümü">Tüm Durumlar</option>
                <option value="Scheduled">Planlandı</option>
                <option value="Confirmed">Onaylandı</option>
                <option value="Completed">Tamamlandı</option>
                <option value="Cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <SkeletonCard variant="appointment" />
               <SkeletonCard variant="appointment" />
               <SkeletonCard variant="appointment" />
            </div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">Kayıt bulunamadı.</div>
          ) : (
            <div className="table-responsive">
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Hasta</th>
                    <th>Tarih & Saat</th>
                    <th>Yaş</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td>
                        <div className="patient-name">{app.patientFullName}</div>
                        <div className="patient-phone">{app.patientPhone}</div>
                      </td>
                      <td>
                        <div className="date-time">
                          <span>{new Date(app.appointmentDate).toLocaleDateString('tr-TR')}</span>
                          <span className="time-badge">{app.appointmentTime.substring(0, 5)}</span>
                        </div>
                      </td>
                      <td>{app.patientAge}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(app.status)}`}>
                          {translateStatus(app.status)}
                        </span>
                      </td>
                      <td>
                        <button className="btn-action" onClick={() => openModal(app)}>İncele</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AppointmentDetailModal 
        isOpen={modalOpen} 
        onClose={closeModal} 
        appointment={selectedAppointment} 
        onUpdate={refresh} 
      />
    </div>
  );
};

export default DoctorDashboard;
