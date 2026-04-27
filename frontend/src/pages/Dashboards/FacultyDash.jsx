import DashboardLayout from '../../components/DashboardLayout';

const FacultyDash = () => {
  const menuItems = [
    { label: 'Browse & Reserve', path: '/faculty', icon: '📚' },
    { label: 'Borrowed Books', path: '/faculty/borrowed', icon: '📖' },
    { label: 'Borrow History', path: '/faculty/history', icon: '📋' },
    { label: 'Recommend Books', path: '/faculty/recommend', icon: '💡' },
    { label: 'My Profile', path: '/faculty/profile', icon: '👤' },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="stats-grid">
        <StatCard title="Books Borrowed" value="5" icon="📖" color="var(--primary)" />
        <StatCard title="Reserved" value="1" icon="🔖" color="var(--accent)" />
        <StatCard title="Recommended" value="3" icon="💡" color="var(--secondary)" />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card glass">
          <h3>My Research Collection</h3>
          <p style={{color: 'var(--text-muted)'}}>No books in collection.</p>
        </div>
        <div className="dash-card glass">
          <h3>Librarian Feedback</h3>
          <p style={{color: 'var(--text-muted)'}}>All recommendations processed.</p>
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

export default FacultyDash;
