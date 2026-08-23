import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Sayfa Bulunamadı</h2>
        <p className="not-found-text">
          Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
        </p>
        <Link to="/" className="btn-primary not-found-btn">
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
