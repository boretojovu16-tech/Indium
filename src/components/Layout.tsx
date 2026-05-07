import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, Home, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Header = () => {
  return (
    <header className="app-header" style={{ justifyContent: 'center' }}>
      <div className="logo-title" style={{ margin: 0 }}>Indium.</div>
    </header>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'assets', label: 'ASSETS', icon: Wallet, path: '/assets' },
    { id: 'hub', label: 'HUB', icon: Home, path: '/hub' },
    { id: 'rewards', label: 'REWARDS', icon: Gift, path: '/rewards' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '');
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} className="nav-icon" />
            </div>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

const Layout = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <p style={{ fontWeight: 'bold', color: '#64748b' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;
