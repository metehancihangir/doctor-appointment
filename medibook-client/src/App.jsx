import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Korumalı layout placeholder'ları (Faz 2'de ProtectedRoute ile doldurulacak)
const PatientLayout = () => <div>Hasta Paneli (Faz 3+)</div>;
const DoctorLayout  = () => <div>Doktor Paneli (Faz 6)</div>;
const AdminLayout   = () => <div>Admin Paneli (Faz 7)</div>;
const NotFoundPage  = () => <div>404 — Sayfa Bulunamadı</div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ana sayfa → Login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route'lar */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Korumalı route'lar (Faz 2'de ProtectedRoute sarmalayıcısı eklenecek) */}
        <Route path="/patient/*" element={<PatientLayout />} />
        <Route path="/doctor/*"  element={<DoctorLayout />} />
        <Route path="/admin/*"   element={<AdminLayout />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
