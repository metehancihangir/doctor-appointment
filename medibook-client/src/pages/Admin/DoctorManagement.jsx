import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import CreateDoctorModal from '../../components/Admin/CreateDoctorModal';

const DoctorManagement = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchDoctors();
  }, [page]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Backend'deki AdminUsersController'ı kullanıyoruz
      const res = await api.get(`/admin/users?role=Doctor&page=${page}&pageSize=${pageSize}`);
      setDoctors(res.data.users);
      setTotalCount(res.data.totalCount);
    } catch (error) {
      console.error("Doktorlar getirilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);
    setPage(1); // İlk sayfaya dön
    fetchDoctors(); // Listeyi yenile
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="doctor-management">
      <header className="page-header d-flex-between">
        <div>
          <h1>Doktor Yönetimi</h1>
          <p>Sisteme kayıtlı doktorları listeleyin ve yeni doktor ekleyin</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Yeni Doktor Ekle
        </button>
      </header>

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
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td><strong>{doc.fullName}</strong></td>
                    <td>{doc.email}</td>
                    <td>
                      <span className={`badge ${doc.isActive ? 'active' : 'inactive'}`}>
                        {doc.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" disabled>
                        Detay (Yakında)
                      </button>
                    </td>
                  </tr>
                ))}
                {doctors.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center">Doktor bulunamadı.</td>
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

      {isModalOpen && (
        <CreateDoctorModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleModalSuccess} 
        />
      )}

      <style>{`
        .doctor-management {
          animation: fadeIn 0.4s ease-out;
        }
        .d-flex-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .page-header {
          margin-bottom: 2rem;
        }
        .page-header h1 {
          font-size: 2rem;
          color: var(--secondary);
          margin-bottom: 0.5rem;
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

export default DoctorManagement;
