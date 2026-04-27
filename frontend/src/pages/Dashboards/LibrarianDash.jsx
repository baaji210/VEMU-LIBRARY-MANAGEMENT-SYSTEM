import DashboardLayout from '../../components/DashboardLayout';

const LibrarianDash = () => {
  const menuItems = [
    { label: 'Dashboard', path: '/librarian', icon: '🏠' },
    { label: 'Books', path: '/librarian/books', icon: '📚' },
    { label: 'Issue Book', path: '/librarian/issue', icon: '➕' },
    { label: 'Return Book', path: '/librarian/return', icon: '↩️' },
    { label: 'Requests', path: '/librarian/requests', icon: '📬' },
    { label: 'Members', path: '/librarian/members', icon: '👥' },
    { label: 'Fines', path: '/librarian/fines', icon: '💰' },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="stats-grid">
        <StatCard title="Books Issued" value="124" icon="📖" color="var(--primary)" />
        <StatCard title="Overdue" value="8" icon="⚠️" color="var(--error)" />
        <StatCard title="Requests" value="15" icon="📬" color="var(--accent)" />
        <StatCard title="Fine Coll." value="₹1,250" icon="💰" color="var(--success)" />
      </div>

      <div className="dash-grid-2">
        <div className="dash-card glass">
          <h3>Active Issues</h3>
          <p style={{color: 'var(--text-muted)'}}>Loading data...</p>
        </div>
        <div className="dash-card glass">
          <h3>Quick Links</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
             <button className="btn-primary" style={{width: '100%'}}>+ Add New Book</button>
             <button className="btn-secondary" style={{width: '100%'}}>Issue Workflow</button>
          </div>
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

export default LibrarianDash;
