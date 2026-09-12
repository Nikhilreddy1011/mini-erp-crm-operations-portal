import React, { useEffect, useState } from 'react';
import { SalesChallan } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { hasRole } = useAuth();
  const navigate = useNavigate();
  const canCreate = hasRole(['ADMIN', 'SALES']);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await apiRequest<SalesChallan[]>(`/challans?${params.toString()}`);
      setChallans(res.data);
      if (res.pagination) setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch challans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [search, statusFilter, page]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Sales Challans</h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate wholesale dispatch challans, save drafts, and confirm stock reductions</p>
        </div>
        {canCreate && (
          <button onClick={() => navigate('/challans/new')} className="btn btn-primary">
            <Plus size={18} />
            <span>Create New Challan</span>
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by Challan # or Customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Challan Number</th>
                <th>Customer</th>
                <th>Total Items Qty</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading sales challans...</td></tr>
              ) : challans.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales challans found.</td></tr>
              ) : (
                challans.map((ch) => (
                  <tr key={ch.id}>
                    <td><strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{ch.challanNumber}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ch.customer?.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ch.customer?.businessName}</div>
                    </td>
                    <td><strong style={{ fontSize: '1rem' }}>{ch.totalQuantity}</strong></td>
                    <td>{ch.creator?.name}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(ch.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ch.status === 'CONFIRMED' ? 'badge-success' : ch.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {ch.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/challans/${ch.id}`} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem' }}>
                        <Eye size={14} />
                        <span>View Details</span>
                      </Link>
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
    </div>
  );
};
