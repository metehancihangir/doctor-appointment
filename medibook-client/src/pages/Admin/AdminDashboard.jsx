import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyStats, setDailyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, dailyRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/stats/daily?days=7')
        ]);
        
        setStats(statsRes.data);
        setDailyStats(dailyRes.data);
      } catch (error) {
        console.error("Dashboard verileri çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="loading">Yükleniyor...</div>;
  if (!stats) return <div className="error">Veri bulunamadı.</div>;

  return (
    <div className="admin-dashboard">
      <header className="page-header">
        <h1>Sistem Özeti</h1>
        <p>MediBook sisteminin genel durumu</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patient-icon">👥</div>
          <div className="stat-info">
            <h3>Toplam Hasta</h3>
            <p className="stat-value">{stats.totalPatients}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon doctor-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>Toplam Doktor</h3>
            <p className="stat-value">{stats.totalDoctors}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon appt-icon">📅</div>
          <div className="stat-info">
            <h3>Toplam Randevu</h3>
            <p className="stat-value">{stats.totalAppointments}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today-icon">⚡</div>
          <div className="stat-info">
            <h3>Bugünkü Randevular</h3>
            <p className="stat-value">{stats.todayAppointments}</p>
          </div>
        </div>
      </div>

      {/* 7 Days Table */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2>Son 7 Günlük Randevu İstatistikleri</h2>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Toplam Randevu</th>
                <th>Tamamlanan</th>
                <th>İptal Edilen</th>
              </tr>
            </thead>
            <tbody>
              {dailyStats.map((day, idx) => (
                <tr key={idx}>
                  <td>{new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                  <td><strong>{day.total}</strong></td>
                  <td className="text-success">{day.completed}</td>
                  <td className="text-danger">{day.cancelled}</td>
                </tr>
              ))}
              {dailyStats.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">Veri bulunamadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .admin-dashboard {
          animation: fadeIn 0.4s ease-out;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 2rem;
          color: var(--secondary);
          margin-bottom: 0.5rem;
        }
        .page-header p {
          color: var(--text-muted);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.03);
          transition: transform 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
        .patient-icon { background: rgba(52, 152, 219, 0.1); color: #3498db; }
        .doctor-icon { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
        .appt-icon { background: rgba(155, 89, 182, 0.1); color: #9b59b6; }
        .today-icon { background: rgba(241, 196, 15, 0.1); color: #f1c40f; }
        
        .stat-info h3 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--secondary);
        }
        
        .dashboard-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .section-header {
          margin-bottom: 1.5rem;
        }
        .section-header h2 {
          font-size: 1.25rem;
          color: var(--secondary);
        }
        
        .text-success { color: var(--success); font-weight: 600; }
        .text-danger { color: var(--danger); font-weight: 600; }
        .text-center { text-align: center; color: var(--text-muted); padding: 2rem !important; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
