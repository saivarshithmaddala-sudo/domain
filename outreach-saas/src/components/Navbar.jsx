import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Outreach<span className="nav-brand-dot">.io</span>
      </Link>
      <div className="nav-links">
        <Link 
          to="/how-it-works" 
          className={`nav-link ${location.pathname === '/how-it-works' ? 'active' : ''}`}
        >
          How It Works
        </Link>
        <Link 
          to="/demo" 
          className="btn-primary"
        >
          Watch It Run
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
