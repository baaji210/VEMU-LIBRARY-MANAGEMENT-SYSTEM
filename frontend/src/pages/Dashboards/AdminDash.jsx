import DashboardLayout from '../../components/DashboardLayout';

const AdminDash = () => {
  const menuItems = [
    { label: 'Dashboard', path: '/admin', icon: '🏠' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Books', path: '/admin/books', icon: '📚' },
    { label: 'Transactions', path: '/admin/txns', icon: '🔄' },
    { label: 'Reports', path: '/admin/reports', icon: '📊' },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="stats-grid">
        <StatCard title="Total Books" value="12,400" icon="📚" color="var(--primary)" />
        <StatCard title="Total Users" value="3,200" icon="👥" color="var(--secondary)" />
        <StatCard title="Issued" value="450" icon="🔄" color="var(--success)" />
        <StatCard title="Overdue" value="12" icon="⚠️" color="var(--error)" />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card glass">
          <h3>Recent Transactions</h3>
          <p style={{color: 'var(--text-muted)'}}>No recent transactions to display.</p>
        </div>
        <div className="dash-card glass">
          <h3>Top Members</h3>
          <p style={{color: 'var(--text-muted)'}}>Loading members...</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="stat-card glass">
    <div className="stat-icon" style={{background: color + '20', color: color}}>{icon}</div>
    <div className="stat-info">
      <span className="stat-label">{title}</span>
      <span className="stat-value">{value}</span>
    </div>
  </div>
);

export default AdminDash;
