import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DoctorCard.css';

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  // Avatar için ismin baş harflerini alma (Örn: Ali Veli -> AV)
  const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleBookAppointment = () => {
    navigate(`/patient/appointment/${doctor.doctorId}`);
  };

  return (
    <div className="doctor-card">
      <div className="doctor-avatar">
        {getInitials(doctor.fullName)}
      </div>
      <div className="doctor-info">
        <h3 className="doctor-name">{doctor.fullName}</h3>
        <span className="doctor-specialty">{doctor.specialty}</span>
        <p className="doctor-experience">{doctor.yearsOfExperience} Yıl Deneyim</p>
      </div>
      <div className="doctor-actions">
        <button className="book-btn" onClick={handleBookAppointment}>
          Randevu Al
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;
