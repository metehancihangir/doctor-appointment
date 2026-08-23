import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import UserManagement from '../pages/Admin/UserManagement';
import DoctorManagement from '../pages/Admin/DoctorManagement';
import AppointmentManagement from '../pages/Admin/AppointmentManagement';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>MediBook Admin</h2>
          <p className="admin-email">{user?.email}</p>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin/dashboard" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Kullanıcılar
          </NavLink>
          <NavLink 
            to="/admin/doctors" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Doktorlar
          </NavLink>
          <NavLink 
            to="/admin/appointments" 
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            Randevular
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/doctors" element={<DoctorManagement />} />
          <Route path="/appointments" element={<AppointmentManagement />} />
        </Routes>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg);
        }
        .admin-sidebar {
          width: 260px;
          background-color: white;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .sidebar-header h2 {
          font-size: 1.25rem;
          color: var(--primary);
          margin-bottom: 0.25rem;
        }
        .admin-email {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nav-item {
          display: block;
          padding: 0.75rem 1rem;
          color: var(--text);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .nav-item:hover {
          background-color: rgba(52, 152, 219, 0.05);
          color: var(--primary);
        }
        .nav-item.active {
          background-color: var(--primary);
          color: white;
        }
        .sidebar-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .admin-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
        }
        
        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            height: auto;
            position: static;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding: 1rem;
          }
          .nav-item {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
