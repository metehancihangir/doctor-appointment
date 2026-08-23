import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Sonraki render'da fallback UI gösterecek şekilde state'i güncelle
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Hata loglama servisine hata gönderilebilir
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Özel fallback UI'ını render et
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px' }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>Bir şeyler yanlış gitti!</h1>
          <p style={{ color: '#555', marginBottom: '24px' }}>Uygulama çalışırken beklenmedik bir hatayla karşılaştı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', backgroundColor: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
