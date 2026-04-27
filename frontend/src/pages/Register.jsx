import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pass: '',
    role: 'student',
    roll: '',
    empId: '',
    dept: '',
    deg: '',
    year: '',
    sec: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await register(formData);
    if (res.success) {
      navigate('/' + formData.role);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
      </div>
      
      <Link to="/" className="auth-back">← Back to Home</Link>
      
      <div className="auth-card glass animate-fade-in" style={{ maxWidth: '600px', margin: '4rem 0' }}>
        <div className="auth-header">
          <div className="auth-logo">V</div>
          <h2>Create Account</h2>
          <p>Join the VEMU Library community</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="role-tabs">
            {['student', 'faculty', 'librarian', 'admin'].map(r => (
              <button 
                key={r}
                type="button" 
                className={`role-tab ${formData.role === r ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, role: r })}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="auth-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" className="input-field" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" className="input-field" onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input name="phone" className="input-field" onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="pass" type="password" className="input-field" onChange={handleChange} required />
            </div>

            {formData.role === 'student' && (
              <>
                <div className="form-group">
                  <label>Roll Number</label>
                  <input name="roll" className="input-field" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Degree</label>
                  <select name="deg" className="input-field" onChange={handleChange}>
                    <option value="">Select Degree</option>
                    <option>B.Tech</option>
                    <option>MBA</option>
                    <option>MCA</option>
                  </select>
                </div>
              </>
            )}

            {(formData.role === 'faculty' || formData.role === 'librarian' || formData.role === 'admin') && (
              <div className="form-group">
                <label>Employee ID</label>
                <input name="empId" className="input-field" onChange={handleChange} required />
              </div>
            )}
            
            <div className="form-group">
              <label>Department</label>
              <select name="dept" className="input-field" onChange={handleChange}>
                <option value="">Select Department</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>ME</option>
                <option>CE</option>
                <option>MBA</option>
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>
        
        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
