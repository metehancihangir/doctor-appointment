import { useState } from 'react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Pazartesi' },
  { value: 2, label: 'Salı' },
  { value: 3, label: 'Çarşamba' },
  { value: 4, label: 'Perşembe' },
  { value: 5, label: 'Cuma' },
  { value: 6, label: 'Cumartesi' },
  { value: 0, label: 'Pazar' }
];

const AvailabilityEditor = ({ availability, onChange }) => {
  const handleToggle = (dayValue) => {
    const exists = availability.find(a => a.dayOfWeek === dayValue);
    if (exists) {
      onChange(availability.filter(a => a.dayOfWeek !== dayValue));
    } else {
      onChange([...availability, { dayOfWeek: dayValue, startTime: '09:00:00', endTime: '17:00:00' }]);
    }
  };

  const handleTimeChange = (dayValue, field, value) => {
    // value from input type="time" is like "09:00", we should append ":00" for TimeSpan compatibility
    const timeValue = value.length === 5 ? `${value}:00` : value;
    onChange(availability.map(a => 
      a.dayOfWeek === dayValue ? { ...a, [field]: timeValue } : a
    ));
  };

  return (
    <div className="availability-editor">
      <h4>Çalışma Saatleri</h4>
      <p className="help-text">Doktorun uygun olduğu günleri ve saat aralıklarını seçin.</p>
      
      <div className="days-list">
        {DAYS_OF_WEEK.map(day => {
          const current = availability.find(a => a.dayOfWeek === day.value);
          const isActive = !!current;

          return (
            <div key={day.value} className={`day-row ${isActive ? 'active' : ''}`}>
              <div className="day-toggle">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={() => handleToggle(day.value)} 
                  />
                  <span className="slider"></span>
                </label>
                <span className="day-label">{day.label}</span>
              </div>
              
              {isActive && (
                <div className="time-inputs">
                  <input 
                    type="time" 
                    value={current.startTime.substring(0, 5)} 
                    onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                    className="form-control"
                  />
                  <span>-</span>
                  <input 
                    type="time" 
                    value={current.endTime.substring(0, 5)} 
                    onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                    className="form-control"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .availability-editor {
          margin-top: 1rem;
        }
        .help-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
        }
        .days-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .day-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg);
          border-radius: 8px;
          border: 1px solid var(--border);
        }
        .day-row.active {
          border-color: var(--primary);
          background: rgba(52, 152, 219, 0.05);
        }
        .day-toggle {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .day-label {
          font-weight: 600;
          min-width: 100px;
        }
        .time-inputs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .time-inputs .form-control {
          width: 120px;
        }
        
        /* Toggle Switch CSS */
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 46px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary);
        }
        input:checked + .slider:before {
          transform: translateX(22px);
        }
      `}</style>
    </div>
  );
};

export default AvailabilityEditor;
