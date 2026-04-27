import DashboardLayout from '../../components/DashboardLayout';

const StudentDash = () => {
  const menuItems = [
    { label: 'Browse Books', path: '/student', icon: '📚' },
    { label: 'My Requests', path: '/student/requests', icon: '📬' },
    { label: 'My History', path: '/student/history', icon: '📋' },
    { label: 'My Fines', path: '/student/fines', icon: '💰' },
    { label: 'My Profile', path: '/student/profile', icon: '👤' },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="stats-grid">
        <StatCard title="Books Borrowed" value="2" icon="📖" color="var(--primary)" />
        <StatCard title="Active Requests" value="1" icon="📬" color="var(--accent)" />
        <StatCard title="Fine Due" value="₹0" icon="💰" color="var(--success)" />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card glass">
          <h3>Current Books</h3>
          <p style={{color: 'var(--text-muted)'}}>No books currently borrowed.</p>
        </div>
        <div className="dash-card glass">
          <h3>Recommendations</h3>
          <p style={{color: 'var(--text-muted)'}}>Based on your department (CSE)...</p>
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

export default StudentDash;
