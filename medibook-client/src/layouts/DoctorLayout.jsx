import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import DoctorDashboard from '../pages/Doctor/DoctorDashboard';
import { useAuth } from '../context/AuthContext';
import './DoctorLayout.css';

const DoctorLayout = () => {
  const { logout } = useAuth();

  return (
    <div className="doctor-layout">
      <nav className="doctor-nav">
        <div className="nav-brand">MediBook <span className="badge">Doctor</span></div>
        <div className="nav-links">
          <Link to="/doctor/dashboard">Dashboard</Link>
          <button className="logout-btn" onClick={logout}>Çıkış Yap</button>
        </div>
      </nav>

      <main className="doctor-content">
        <Routes>
          <Route path="dashboard" element={<DoctorDashboard />} />
          
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default DoctorLayout;
