import React from 'react';
import './DoctorProfileCard.css';

const DoctorProfileCard = ({ doctor }) => {
  if (!doctor) return null;

  return (
    <div className="doctor-profile-card">
      <div className="doctor-profile-header">
        <div className="doctor-avatar">
          {doctor.fullName.charAt(0)}
        </div>
        <div className="doctor-info">
          <h2>Dr. {doctor.fullName}</h2>
          <p className="specialty">{doctor.specialty}</p>
          <span className="experience">{doctor.yearsOfExperience} Yıl Deneyim</span>
        </div>
      </div>
      {doctor.bio && (
        <div className="doctor-bio">
          <p>{doctor.bio}</p>
        </div>
      )}
    </div>
  );
};

export default DoctorProfileCard;
