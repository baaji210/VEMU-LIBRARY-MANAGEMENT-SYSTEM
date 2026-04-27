import Navbar from '../components/Navbar';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-bg"></div>
        <div className="hero-glow"></div>
        <div className="container hero-container">
          <div className="hero-content animate-fade-in">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              NAAC A+ Accredited · Autonomous Institution
            </div>
            <h1 className="hero-title">
              VEMU Institute <br />
              of Technology <br />
              <span className="text-gradient">Digital Library</span>
            </h1>
            <p className="hero-description">
              Access 12,000+ books, research journals, and academic resources. 
              A unified platform for Students, Faculty, Librarians and Administrators.
            </p>
            <div className="hero-actions">
              <button className="btn-primary">Get Started Free →</button>
              <button className="btn-secondary">Member Sign In</button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-value">12,400+</span>
                <span className="stat-label">Books</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3,200+</span>
                <span className="stat-label">Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">480+</span>
                <span className="stat-label">Journals</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">4</span>
                <span className="stat-label">User Roles</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCREDITATION BAR */}
      <div className="accred-bar glass">
        <div className="container accred-content">
          <div className="acc-item"><span className="acc-tag">A+</span> NAAC Accredited</div>
          <div className="acc-item"><span className="acc-tag">NBA</span> NBA Certified</div>
          <div className="acc-item"><span className="acc-tag">UGC</span> Recognized</div>
          <div className="acc-item"><span className="acc-tag">AI</span> AI Enabled</div>
          <div className="acc-item"><span className="acc-tag">JN</span> JNTUA Affiliated</div>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section container">
        <div className="section-header">
          <span className="eyebrow">What We Offer</span>
          <h2 className="section-title">Powerful Library Services</h2>
          <p className="section-subtitle">
            Everything students, faculty, librarians and admins need — in one beautifully designed platform
          </p>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon="📚" 
            title="Book Management" 
            desc="Add, edit, delete books with full details. Track availability, editions, and subject categories."
            color="rgba(99, 102, 241, 0.1)"
          />
          <FeatureCard 
            icon="🔄" 
            title="Issue & Return" 
            desc="Seamless book issue and return with automated fine calculation at ₹5/day for late returns."
            color="rgba(139, 92, 246, 0.1)"
          />
          <FeatureCard 
            icon="🔍" 
            title="Smart Search" 
            desc="Search by title, author, ISBN, or subject. Filter by category, availability, and publication year."
            color="rgba(6, 182, 212, 0.1)"
          />
          <FeatureCard 
            icon="👥" 
            title="Role-Based Access" 
            desc="Separate dashboards for Admin, Librarian, Faculty and Student — each with tailored permissions."
            color="rgba(16, 185, 129, 0.1)"
          />
          <FeatureCard 
            icon="🔔" 
            title="Alerts & Notices" 
            desc="Automatic due date reminders, overdue notices, and fine alerts for all active members."
            color="rgba(239, 68, 68, 0.1)"
          />
          <FeatureCard 
            icon="📊" 
            title="Reports & Analytics" 
            desc="Generate detailed reports on borrowing activity, user behaviour, and inventory status."
            color="rgba(245, 158, 11, 0.1)"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer container">
        <div className="footer-content">
          <p>&copy; 2026 VEMU Institute of Technology. Digital Library Management System.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="feature-card glass">
    <div className="feature-icon" style={{ backgroundColor: color }}>{icon}</div>
    <h3>{title}</h3>
    <p>{desc}</p>
  </div>
);

export default Home;
