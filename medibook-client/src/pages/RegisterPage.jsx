import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); // null, 'loading', 'valid', 'invalid'
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    
    // Temizle
    if (errors[id]) setErrors((prev) => ({ ...prev, [id]: null }));
    
    // Email async kontrol
    if (id === 'email') {
      setEmailStatus('loading');
      if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
      
      const timeout = setTimeout(async () => {
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setEmailStatus('invalid');
          return;
        }
        
        try {
          const res = await api.get(`/auth/check-email?email=${encodeURIComponent(value)}`);
          setEmailStatus(res.data.available ? 'valid' : 'invalid');
          if (!res.data.available) {
            setErrors((prev) => ({ ...prev, email: 'Bu email zaten kullanılıyor.' }));
          }
        } catch (err) {
          setEmailStatus('invalid');
        }
      }, 800);
      
      setEmailCheckTimeout(timeout);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Ad zorunludur.';
    if (!formData.lastName) newErrors.lastName = 'Soyad zorunludur.';
    
    if (!formData.email) newErrors.email = 'Email zorunludur.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Geçerli bir email girin.';
    
    if (!formData.phone) newErrors.phone = 'Telefon zorunludur.';
    else if (!/^\d{10,11}$/.test(formData.phone)) newErrors.phone = 'Sadece rakam (10-11 hane).';
    
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Doğum tarihi zorunludur.';
    
    if (!formData.password) newErrors.password = 'Şifre zorunludur.';
    else if (formData.password.length < 6) newErrors.password = 'En az 6 karakter olmalıdır.';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
    }

    if (emailStatus === 'invalid' && !newErrors.email) {
      newErrors.email = 'Bu email kullanılamaz.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    if (!validate()) return;
    
    setIsLoading(true);

    try {
      await api.post('/auth/register', formData);
      // Başarılı kayıttan sonra login'e yönlendir
      navigate('/login', { replace: true, state: { message: 'Kayıt başarılı! Lütfen giriş yapın.' } });
    } catch (err) {
      if (err.response?.data?.message) {
        setGlobalError(err.response.data.message);
      } else {
        setGlobalError("Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h2>Hesap Oluştur</h2>
          <p>Randevu almak için hemen kayıt olun</p>
        </div>
        
        {globalError && <div className="auth-error-alert">{globalError}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Ad</label>
              <input 
                type="text" 
                id="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="validation-error">{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Soyad</label>
              <input 
                type="text" 
                id="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="validation-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              className={errors.email ? 'error' : ''}
            />
            {emailStatus === 'loading' && <span className="email-status loading">Kontrol ediliyor...</span>}
            {emailStatus === 'valid' && <span className="email-status valid">✓ Bu email kullanılabilir</span>}
            {emailStatus === 'invalid' && <span className="email-status invalid">✗ Bu email geçersiz veya kullanımda</span>}
            {errors.email && <span className="validation-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Telefon</label>
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="5XXXXXXXXX"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="validation-error">{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Doğum Tarihi</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
                className={errors.dateOfBirth ? 'error' : ''}
              />
              {errors.dateOfBirth && <span className="validation-error">{errors.dateOfBirth}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input 
                type="password" 
                id="password" 
                value={formData.password} 
                onChange={handleChange} 
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="validation-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Şifre (Tekrar)</label>
              <input 
                type="password" 
                id="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="validation-error">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading || emailStatus === 'loading'}>
            {isLoading ? <span className="spinner"></span> : 'Kayıt Ol'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
