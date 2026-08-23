import React from 'react';
import './SlotGrid.css';

const SlotGrid = ({ slots, selectedSlot, onSelectSlot }) => {
  if (!slots || slots.length === 0) {
    return <div className="no-slots">Seçilen tarihte uygun randevu saati bulunmuyor.</div>;
  }

  // Format HH:mm
  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  return (
    <div className="slot-grid">
      {slots.map((slot, index) => {
        const isSelected = selectedSlot === slot.time;
        const className = `slot-item ${!slot.isAvailable ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`;
        
        return (
          <button
            key={index}
            className={className}
            disabled={!slot.isAvailable}
            onClick={() => onSelectSlot(slot.time)}
            type="button"
          >
            {formatTime(slot.time)}
          </button>
        );
      })}
    </div>
  );
};

export default SlotGrid;
