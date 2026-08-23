import React from 'react';
import './SearchFilter.css';

const SearchFilter = ({ search, onSearchChange, specialty, onSpecialtyChange, onClear }) => {
  const specialties = [
    "Dahiliye",
    "Kardiyoloji",
    "Nöroloji",
    "Ortopedi",
    "Pediatri",
    "Psikiyatri",
    "Göz Hastalıkları",
    "Kulak Burun Boğaz",
    "Cildiye",
    "Üroloji",
    "Kadın Hastalıkları ve Doğum",
    "Genel Cerrahi"
  ];

  return (
    <div className="search-filter-container">
      <div className="search-group">
        <input 
          type="text" 
          placeholder="Doktor adı veya soyadı..." 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filter-group">
        <select 
          value={specialty} 
          onChange={(e) => onSpecialtyChange(e.target.value)}
          className="specialty-select"
        >
          <option value="">Tüm Uzmanlıklar</option>
          {specialties.map(spec => (
            <option key={spec} value={spec}>{spec}</option>
          ))}
        </select>
      </div>

      <button className="clear-btn" onClick={onClear}>
        Temizle
      </button>
    </div>
  );
};

export default SearchFilter;
