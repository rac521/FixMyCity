import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, MapPin, Activity, ShieldAlert, PieChart, LogIn, LogOut, Bell, Check } from 'lucide-react';
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
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
        setNotifications([]);
        return;
    }
    
    const fetchNotifs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (e) {}
    };

    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (notifRef.current && !notifRef.current.contains(event.target)) {
            setShowNotifs(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {}
  };

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
          <ShieldAlert size={28} color="var(--primary)" />
          FixMyCity
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`nav-link-item ${isActive(item.path) ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              
              {/* Notifications Dropdown */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifs(!showNotifs)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <Bell size={20} color={notifications.length > 0 ? "var(--warning)" : "var(--text-main)"} />
                  {notifications.length > 0 && (
                    <span style={{
                      position: 'absolute', top: '-5px', right: '-5px', background: 'var(--danger)', color: 'white',
                      fontSize: '0.65rem', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showNotifs && (
                  <div className="glass-panel animate-scale-in" style={{
                    position: 'absolute', top: '40px', right: '-80px', width: '300px', padding: '1rem',
                    zIndex: 1000, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', overflow: 'hidden'
                  }}>
                    <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>Notifications</h4>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>You have no unread notifications.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.map(n => (
                          <div key={n.id} style={{
                            background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem'
                          }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0, lineHeight: '1.4' }}>{n.message}</p>
                            <button 
                              onClick={() => markAsRead(n.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', padding: '2px' }}
                              title="Mark as read"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
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
