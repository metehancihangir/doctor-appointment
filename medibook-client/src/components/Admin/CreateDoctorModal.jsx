import { useState } from 'react';
import api from '../../api/axiosInstance';
import AvailabilityEditor from './AvailabilityEditor';

const CreateDoctorModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialty: '',
    yearsOfExperience: 0,
    bio: '',
    availability: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 3) return;

    try {
      setLoading(true);
      setError('');
      await api.post('/admin/doctors', {
        ...formData,
        yearsOfExperience: parseInt(formData.yearsOfExperience) || 0
      });
      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Doktor kaydedilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content doctor-modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Yeni Doktor Ekle</h2>
        
        {/* Step Indicator */}
        <div className="step-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Kişisel</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Mesleki</div>
          <div className="step-line"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Saatler</div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          {step === 1 && (
            <div className="step-content">
              <div className="form-group">
                <label>Ad</label>
                <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Soyad</label>
                <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Geçici Şifre</label>
                <input required type="text" name="password" value={formData.password} onChange={handleChange} className="form-control" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content">
              <div className="form-group">
                <label>Uzmanlık Alanı</label>
                <input required type="text" name="specialty" value={formData.specialty} onChange={handleChange} className="form-control" placeholder="Örn: Kardiyoloji" />
              </div>
              <div className="form-group">
                <label>Deneyim (Yıl)</label>
                <input required type="number" min="0" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="form-control" />
              </div>
              <div className="form-group">
                <label>Kısa Özgeçmiş / Biyografi</label>
                <textarea rows="4" name="bio" value={formData.bio} onChange={handleChange} className="form-control"></textarea>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content">
              <AvailabilityEditor 
                availability={formData.availability} 
                onChange={(avail) => setFormData(prev => ({ ...prev, availability: avail }))} 
              />
            </div>
          )}

          <div className="modal-actions mt-4">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={handlePrev} disabled={loading}>
                Geri
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>
                İleri
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Doktoru Kaydet'}
              </button>
            )}
          </div>
        </form>
      </div>

      <style>{`
        .doctor-modal {
          max-width: 600px;
        }
        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding: 1rem 0;
        }
        .step {
          font-weight: 600;
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          background: var(--bg);
          transition: all 0.3s ease;
        }
        .step.active {
          color: white;
          background: var(--primary);
        }
        .step-line {
          flex: 1;
          height: 2px;
          background: var(--border);
          margin: 0 1rem;
        }
        .step-content {
          animation: slideIn 0.3s ease-out;
        }
        .mt-4 {
          margin-top: 2rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CreateDoctorModal;
