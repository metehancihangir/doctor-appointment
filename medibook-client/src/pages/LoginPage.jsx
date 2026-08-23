import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await login(email, password);
      
      const from = location.state?.from?.pathname;
      
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (data.role === 'Patient') navigate('/patient/dashboard', { replace: true });
        else if (data.role === 'Doctor') navigate('/doctor/dashboard', { replace: true });
        else if (data.role === 'Admin') navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        setError("Çok fazla deneme yaptınız. Lütfen 15 dakika bekleyin.");
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>MediBook'a Hoş Geldiniz</h2>
          <p>Devam etmek için giriş yapın</p>
        </div>
        
        {error && <div className="auth-error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="ornek@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? <span className="spinner"></span> : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
