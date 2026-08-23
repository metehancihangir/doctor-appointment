import React from 'react';
import './AppointmentCard.css';

const AppointmentCard = ({ appointment, onCancel }) => {
  if (!appointment) return null;

  // Duruma göre badge rengi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <span className="status-badge status-scheduled">Planlandı</span>;
      case 'Confirmed':
        return <span className="status-badge status-confirmed">Onaylandı</span>;
      case 'Completed':
        return <span className="status-badge status-completed">Tamamlandı</span>;
      case 'Cancelled':
        return <span className="status-badge status-cancelled">İptal Edildi</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const isCancelable = appointment.status === 'Scheduled' || appointment.status === 'Confirmed';
  const appointmentDate = new Date(appointment.appointmentDate);
  const formattedDate = appointmentDate.toLocaleDateString('tr-TR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    weekday: 'long' 
  });
  
  // Format HH:mm
  const formattedTime = appointment.appointmentTime.substring(0, 5);

  return (
    <div className="appointment-card">
      <div className="appointment-card-header">
        <div className="doctor-info">
          <h3>Dr. {appointment.doctorFullName}</h3>
          <span className="specialty">{appointment.doctorSpecialty}</span>
        </div>
        <div className="appointment-status">
          {getStatusBadge(appointment.status)}
        </div>
      </div>
      
      <div className="appointment-card-body">
        <div className="datetime-info">
          <div className="date">
            <span className="icon">📅</span>
            <span>{formattedDate}</span>
          </div>
          <div className="time">
            <span className="icon">⏰</span>
            <span>{formattedTime}</span>
          </div>
        </div>
        
        {appointment.symptoms && (
          <div className="symptoms">
            <strong>Semptomlar: </strong>
            <span>{appointment.symptoms}</span>
          </div>
        )}
      </div>

      {isCancelable && (
        <div className="appointment-card-footer">
          <button 
            className="btn-cancel-appointment"
            onClick={() => onCancel(appointment)}
          >
            İptal Et
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentCard;
