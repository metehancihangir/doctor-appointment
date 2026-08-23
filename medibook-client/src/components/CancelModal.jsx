import React from 'react';
import './CancelModal.css';

const CancelModal = ({ isOpen, onClose, onConfirm, isCanceling }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Randevuyu İptal Et</h2>
        <p>Bu randevuyu iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
        
        <div className="modal-actions">
          <button 
            className="btn-cancel-modal" 
            onClick={onClose} 
            disabled={isCanceling}
          >
            Vazgeç
          </button>
          <button 
            className="btn-confirm-modal" 
            onClick={onConfirm} 
            disabled={isCanceling}
          >
            {isCanceling ? 'İptal Ediliyor...' : 'Evet, İptal Et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
