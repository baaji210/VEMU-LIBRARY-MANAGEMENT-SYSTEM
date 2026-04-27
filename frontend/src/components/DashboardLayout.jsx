import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = ({ children, menuItems }) => {
  return (
    <div className="dashboard-container">
      <Sidebar menuItems={menuItems} />
      <main className="dashboard-main animate-fade-in">
        <header className="dashboard-header">
          <h2>Overview</h2>
          <div className="header-actions">
            <button className="notif-btn">🔔</button>
          </div>
        </header>
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
