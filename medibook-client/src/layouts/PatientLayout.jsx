import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import DoctorsPage from '../pages/Patient/DoctorsPage';
import { useAuth } from '../context/AuthContext';
import './PatientLayout.css';

const PatientLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="patient-layout">
      <nav className="patient-nav">
        <div className="nav-brand">MediBook</div>
        <div className="nav-links">
          <Link to="/patient/doctors">Doktorlar</Link>
          <button className="logout-btn" onClick={logout}>Çıkış Yap</button>
        </div>
      </nav>

      <main className="patient-content">
        <Routes>
          <Route path="doctors" element={<DoctorsPage />} />
          {/* Gelecek sayfa: appointment */}
          <Route path="appointment/:id" element={<div>Randevu Ekranı (Faz 4)</div>} />
          
          <Route path="" element={<Navigate to="doctors" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default PatientLayout;
