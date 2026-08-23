import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Basit sayfalama (örneğin sadece aktif sayfayı ve etrafını gösterme eklenebilir ama basit tutalım)
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="pagination">
      <button 
        className="page-btn" 
        onClick={handlePrev} 
        disabled={currentPage === 1}
      >
        Önceki
      </button>
      
      <div className="page-numbers">
        {pages.map(page => (
          <button 
            key={page} 
            className={`page-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button 
        className="page-btn" 
        onClick={handleNext} 
        disabled={currentPage === totalPages}
      >
        Sonraki
      </button>
    </div>
  );
};

export default Pagination;
