import React, { useEffect, useState } from 'react';
import { Customer, CustomerType, CustomerStatus } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Eye, Edit3, Calendar, Phone, Mail, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomerForm } from './CustomerForm';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'SALES']);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('customerType', typeFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await apiRequest<Customer[]>(`/customers?${params.toString()}`);
      setCustomers(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter, typeFilter, page]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Customer CRM</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage wholesale clients, leads, contact history, and follow-ups</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingCustomer(null); setShowAddModal(true); }} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Customer</span>
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by customer name, business, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="LEAD">LEAD</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>

            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="">All Types</option>
              <option value="RETAIL">RETAIL</option>
              <option value="WHOLESALE">WHOLESALE</option>
              <option value="DISTRIBUTOR">DISTRIBUTOR</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Business Name</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th>Next Follow-Up</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading customers...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customers found matching filter.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} color="var(--text-dim)" />
                        <span>{c.businessName}</span>
                      </div>
                    </td>
                    <td>{c.mobileNumber}</td>
                    <td><span className="badge badge-info">{c.customerType}</span></td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.followUpDate ? (
                        <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning)' }}>
                          <Calendar size={14} />
                          {new Date(c.followUpDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>None scheduled</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Link to={`/customers/${c.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                          <Eye size={14} />
                          <span>View</span>
                        </Link>
                        {canEdit && (
                          <button
                            onClick={() => { setEditingCustomer(c); setShowAddModal(true); }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.65rem' }}
                          >
                            <Edit3 size={14} />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {page} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-secondary btn-sm">Previous</button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-secondary btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <CustomerForm
          customer={editingCustomer}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchCustomers(); }}
        />
      )}
    </div>
  );
};
