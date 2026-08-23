import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // Just using a single date for startDate=endDate for simplicity
  
  const pageSize = 10;

  useEffect(() => {
    fetchAppointments();
  }, [page, statusFilter, dateFilter]); // Text filters will trigger on form submit

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let query = `/admin/appointments?page=${page}&pageSize=${pageSize}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (doctorFilter) query += `&doctor=${doctorFilter}`;
      if (patientFilter) query += `&patient=${patientFilter}`;
      if (dateFilter) {
        query += `&startDate=${dateFilter}&endDate=${dateFilter}`;
      }

      const res = await api.get(query);
      setAppointments(res.data.appointments);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      console.error("Randevular getirilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status: newStatus });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (error) {
      alert('Durum güncellenirken hata oluştu');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="appt-management">
      <header className="page-header">
        <h1>Tüm Randevular</h1>
        <p>Sistemdeki tüm randevuları filtreleyip yönetebilirsiniz.</p>
      </header>

      <div className="filter-card">
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="form-group">
            <label>Durum</label>
            <select 
              className="form-control" 
              value={statusFilter} 
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">Tümü</option>
              <option value="Scheduled">Bekliyor (Scheduled)</option>
              <option value="Completed">Tamamlandı (Completed)</option>
              <option value="Cancelled">İptal Edildi (Cancelled)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Tarih</label>
            <input 
              type="date" 
              className="form-control" 
              value={dateFilter} 
              onChange={e => { setDateFilter(e.target.value); setPage(1); }}
            />
          </div>

          <div className="form-group">
            <label>Doktor Adı</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ara..." 
              value={doctorFilter}
              onChange={e => setDoctorFilter(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Hasta Adı</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ara..." 
              value={patientFilter}
              onChange={e => setPatientFilter(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Filtrele
            </button>
          </div>
        </form>
      </div>

      <div className="table-container mt-4">
        {loading ? (
          <div className="loading-state">Yükleniyor...</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Tarih & Saat</th>
                  <th>Hasta</th>
                  <th>Doktor</th>
                  <th>Durum</th>
                  <th>Durum Güncelle</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt.id}>
                    <td>
                      <div className="fw-bold">{new Date(appt.appointmentDate).toLocaleDateString('tr-TR')}</div>
                      <div className="text-muted">{appt.appointmentTime.substring(0, 5)}</div>
                    </td>
                    <td>{appt.patientFullName}</td>
                    <td>{appt.doctorFullName}</td>
                    <td>
                      <span className={`badge status-${appt.status.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-control form-control-sm"
                        value={appt.status}
                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                        style={{ width: 'auto' }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">Randevu bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Önceki
                </button>
                <span>Sayfa {page} / {totalPages}</span>
                <button 
                  className="btn btn-secondary btn-sm" 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .appt-management { animation: fadeIn 0.4s ease-out; }
        .page-header { margin-bottom: 2rem; }
        .page-header h1 { font-size: 2rem; color: var(--secondary); margin-bottom: 0.5rem; }
        .filter-card { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 1.5rem; }
        .filter-form { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .mt-4 { margin-top: 1.5rem; }
        .table-container { background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
        .fw-bold { font-weight: 600; }
        .text-muted { color: var(--text-muted); font-size: 0.85rem; }
        .badge { padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
        .status-scheduled { background: #e3f2fd; color: #1976d2; }
        .status-completed { background: #e8f5e9; color: #2e7d32; }
        .status-cancelled { background: #ffebee; color: #c62828; }
        .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 2rem; }
      `}</style>
    </div>
  );
};

export default AppointmentManagement;
