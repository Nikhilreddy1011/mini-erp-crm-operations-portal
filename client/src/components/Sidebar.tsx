import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Boxes, 
  FileSpreadsheet, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout, hasRole } = useAuth();

  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']
    },
    {
      title: 'Customer CRM',
      path: '/customers',
      icon: <Users size={20} />,
      roles: ['ADMIN', 'SALES', 'ACCOUNTS']
    },
    {
      title: 'Products',
      path: '/products',
      icon: <Package size={20} />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']
    },
    {
      title: 'Inventory & Stock',
      path: '/inventory',
      icon: <Boxes size={20} />,
      roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS']
    },
    {
      title: 'Sales Challans',
      path: '/challans',
      icon: <FileSpreadsheet size={20} />,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ background: 'var(--primary)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          ERP
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '1rem', fontFamily: 'var(--font-heading)' }}>OPS PORTAL</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wholesale & Distribution</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '1rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.5rem 0.75rem', fontWeight: '700' }}>
          NAVIGATION
        </div>
        {navItems.map((item) => {
          if (!hasRole(item.roles as any)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.35rem',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s'
              })}
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      {user && (
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', background: '#070d1e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600' }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.1rem' }}>
                <ShieldCheck size={12} color="var(--primary)" />
                <span className={`badge badge-primary`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>{user.role}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
