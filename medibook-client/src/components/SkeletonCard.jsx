import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = ({ variant = 'doctor' }) => {
  if (variant === 'appointment') {
    return (
      <div className="skeleton-wrapper skeleton-appointment">
        <div style={{ padding: '16px' }}>
          <div className="skeleton-text" style={{ width: '60%' }}></div>
          <div className="skeleton-text" style={{ width: '40%' }}></div>
          <div className="skeleton-text" style={{ width: '80%', marginTop: '20px' }}></div>
        </div>
      </div>
    );
  }

  // Default is doctor variant
  return (
    <div className="skeleton-wrapper skeleton-doctor">
       <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="skeleton-text" style={{ width: '70%', height: '24px' }}></div>
          <div className="skeleton-text" style={{ width: '50%' }}></div>
          <div className="skeleton-text" style={{ width: '100%', marginTop: 'auto' }}></div>
       </div>
    </div>
  );
};

export default SkeletonCard;
