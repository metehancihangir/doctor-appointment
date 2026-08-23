import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roleTab, setRoleTab] = useState('Patient'); // 'Patient' or 'Doctor'
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchUsers();
  }, [roleTab, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/users?role=${roleTab}&page=${page}&pageSize=${pageSize}`);
      setUsers(res.data.users);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      console.error("Kullanıcılar getirilirken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.put(`/admin/users/${id}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === id ? { ...u, isActive: !currentStatus } : u));
    } catch (error) {
      console.error("Durum güncellenirken hata oluştu:", error);
      alert("Durum güncellenirken bir hata oluştu.");
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="user-management">
      <header className="page-header">
        <h1>Kullanıcı Yönetimi</h1>
        <p>Sistemdeki tüm hasta ve doktorları yönetin</p>
      </header>

      <div className="tabs">
        <button 
          className={`tab-btn ${roleTab === 'Patient' ? 'active' : ''}`}
          onClick={() => { setRoleTab('Patient'); setPage(1); }}
        >
          Hastalar
        </button>
        <button 
          className={`tab-btn ${roleTab === 'Doctor' ? 'active' : ''}`}
          onClick={() => { setRoleTab('Doctor'); setPage(1); }}
        >
          Doktorlar
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Yükleniyor...</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td><strong>{user.fullName}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.role.toLowerCase()}`}>
                        {user.role === 'Patient' ? 'Hasta' : 'Doktor'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'} btn-sm`}
                        onClick={() => toggleStatus(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center">Kullanıcı bulunamadı.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
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
        .user-management {
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
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid var(--border);
          padding-bottom: 1rem;
        }
        .tab-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          background: rgba(52, 152, 219, 0.1);
        }
        .tab-btn.active {
          color: var(--primary);
          background: rgba(52, 152, 219, 0.15);
        }
        .table-container {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.02);
        }
        .badge {
          padding: 0.4rem 0.8rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge.patient { background: #e3f2fd; color: #1976d2; }
        .badge.doctor { background: #e8f5e9; color: #2e7d32; }
        .badge.active { background: #e8f5e9; color: #2e7d32; }
        .badge.inactive { background: #ffebee; color: #c62828; }
        
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        .loading-state {
          padding: 3rem;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
