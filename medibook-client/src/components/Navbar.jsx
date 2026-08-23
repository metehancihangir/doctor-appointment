// Navbar iskeleti — Faz 2'de AuthContext ile rol bazlı menü ve hamburger menü doldurulacak
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="navbar-brand">
          <span className="navbar-logo">🏥</span>
          <span className="navbar-title">MediBook</span>
        </a>
        {/* Hamburger butonu (mobil) — Faz 2'de aktif olacak */}
        <button className="navbar-hamburger" aria-label="Menü">
          <span />
          <span />
          <span />
        </button>
        {/* Navigasyon linkleri — Faz 2'de rol bazlı dolacak */}
        <ul className="navbar-links">
          <li><a href="/login">Giriş Yap</a></li>
          <li><a href="/register" className="btn btn-primary">Kayıt Ol</a></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
