import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, MapPin, Activity, ShieldAlert, PieChart, LogIn, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueMapPage from './pages/IssueMapPage';
import ComplaintTrackingPage from './pages/ComplaintTrackingPage';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import LoginPage from './pages/LoginPage';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: <Activity size={18} /> },
    { name: 'Report', path: '/report', icon: <ShieldAlert size={18} /> },
    { name: 'Map', path: '/map', icon: <MapPin size={18} /> },
    { name: 'Track', path: '/track', icon: <Activity size={18} /> },
  ];

  if (user?.role === 'officer' || user?.role === 'admin') {
    navItems.push({ name: 'Officer', path: '/officer', icon: <ShieldAlert size={18} /> });
    navItems.push({ name: 'Admin', path: '/admin', icon: <PieChart size={18} /> });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Activity color="#8b5cf6" />
          <span className="title-gradient">CivicPulse</span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                color: isActive(item.path) ? 'white' : 'var(--text-muted)',
                fontWeight: isActive(item.path) ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'color 0.2s'
              }}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <Link to="/login" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <LogIn size={18} /> Login
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="btn-secondary" 
          style={{ display: 'none', padding: '0.5rem', borderRadius: '8px' }} // Controlled by JS for MVP
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Simplified for MVP */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: '64px', left: 0, right: 0, 
          background: 'rgba(15, 23, 42, 0.95)', borderBottom: '1px solid var(--card-border)',
          padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          {navItems.map(item => (
             <Link 
             key={item.path} 
             to={item.path}
             onClick={() => setIsOpen(false)}
             style={{ color: 'white', padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             {item.icon} {item.name}
           </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route path="/map" element={<IssueMapPage />} />
            <Route path="/track" element={<ComplaintTrackingPage />} />
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="/admin" element={<AdminAnalyticsPage />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
