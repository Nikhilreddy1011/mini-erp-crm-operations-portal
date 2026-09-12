import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <ShieldCheck size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Operations Portal</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Wholesale Mini ERP + CRM Portal</p>
        </div>

        <div className="card">
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
              DEMO CREDENTIALS (CLICK TO PRE-FILL)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@example.com', 'Admin@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                ADMIN
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('sales@example.com', 'Sales@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                SALES
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('warehouse@example.com', 'Warehouse@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                WAREHOUSE
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('accounts@example.com', 'Accounts@123')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', justifyContent: 'flex-start' }}
              >
                ACCOUNTS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
