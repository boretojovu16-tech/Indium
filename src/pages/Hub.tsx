import { useNavigate } from 'react-router-dom';
import { PieChart, Upload, Download, HeadphonesIcon, Activity, Users } from 'lucide-react';
import './Pages.css';

const Hub = () => {
  const navigate = useNavigate();

  const controls = [
    {
      id: 'deposit',
      title: 'Deposit',
      desc: 'Add funds',
      icon: Download,
      color: '#c39c5b',
      bg: '#fdfaf3',
      action: () => navigate('/deposit')
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      desc: 'Transfer out',
      icon: Upload,
      color: '#2563eb',
      bg: '#eff6ff',
      action: () => navigate('/withdraw')
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      desc: 'View assets',
      icon: PieChart,
      color: '#10b981',
      bg: '#f0fdf4',
      action: () => navigate('/assets')
    },
    {
      id: 'activity',
      title: 'Activity',
      desc: 'Transaction log',
      icon: Activity,
      color: '#6366f1',
      bg: '#eef2ff',
      action: () => navigate('/transactions')
    },
    {
      id: 'support',
      title: 'Support',
      desc: '24/7 help',
      icon: HeadphonesIcon,
      color: '#ec4899',
      bg: '#fdf2f8',
      action: () => window.location.href = 'https://t.me/+5ufcu0hYv1kxZTg0'
    },
    {
      id: 'referral',
      title: 'Refer & Earn',
      desc: 'Invite network',
      icon: Users,
      color: '#14b8a6',
      bg: '#f0fdfa',
      action: () => navigate('/referral')
    }
  ];

  return (
    <div className="page-container">
      <div className="mb-2">
        <h1 className="page-title">Control Center</h1>
        <p className="page-subtitle">Manage your account and preferences.</p>
      </div>

      <div className="control-grid">
        {controls.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="control-card" onClick={item.action}>
              <div className="control-icon" style={{ backgroundColor: item.bg, color: item.color }}>
                <Icon size={20} />
              </div>
              <h3 className="control-title">{item.title}</h3>
              <p className="control-desc">{item.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="dark-card mt-4 mb-0">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">System Status</h2>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2" style={{ backgroundColor: '#10b981' }}></span>
            <span className="text-xs text-secondary">All Systems Operational</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hub;
