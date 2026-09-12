import React from 'react';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="header">
      <button 
        onClick={onToggleSidebar} 
        className="btn btn-secondary btn-sm"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Menu size={20} />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(30, 41, 59, 0.6)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <Shield size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role:</span>
            <strong style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{user.role}</strong>
          </div>
        )}
      </div>
    </header>
  );
};
