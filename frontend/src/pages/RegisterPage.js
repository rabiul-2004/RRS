import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.phone);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <i className="fas fa-train"></i>
            <h2>Register on IRCTC</h2>
            <p>Create your account to book train tickets.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="fas fa-user"></i> Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Enter your full name" required />
            </div>

            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Enter your email" required />
            </div>

            <div className="form-group">
              <label><i className="fas fa-phone"></i> Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="Enter your phone number" required />
            </div>

            <div className="form-group">
              <label><i className="fas fa-lock"></i> Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="Create a password (min 6 chars)" required />
            </div>

            <div className="form-group">
              <label><i className="fas fa-check-circle"></i> Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                placeholder="Confirm your password" required />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-user-plus"></i>}
              {' '}Register
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
