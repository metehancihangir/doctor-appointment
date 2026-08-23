import React from 'react';

const StatusDropdown = ({ currentStatus, value, onChange }) => {
  // Geçiş kurallarına göre hangi seçeneklerin aktif olacağını belirle
  const options = [];

  switch (currentStatus) {
    case 'Scheduled':
      options.push({ value: 'Scheduled', label: 'Planlandı' });
      options.push({ value: 'Confirmed', label: 'Onaylandı' });
      options.push({ value: 'Cancelled', label: 'İptal Edildi' });
      break;
    case 'Confirmed':
      options.push({ value: 'Confirmed', label: 'Onaylandı' });
      options.push({ value: 'Completed', label: 'Tamamlandı' });
      options.push({ value: 'Cancelled', label: 'İptal Edildi' });
      break;
    case 'Completed':
      options.push({ value: 'Completed', label: 'Tamamlandı' });
      break;
    case 'Cancelled':
      options.push({ value: 'Cancelled', label: 'İptal Edildi' });
      break;
    default:
      options.push({ value: currentStatus, label: currentStatus });
  }

  const disabled = currentStatus === 'Completed' || currentStatus === 'Cancelled';

  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`status-dropdown ${disabled ? 'disabled' : ''}`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default StatusDropdown;
