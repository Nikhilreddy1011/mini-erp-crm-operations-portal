import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SalesChallan } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle2, XCircle, Printer, AlertTriangle, Building, User, Calendar } from 'lucide-react';

export const ChallanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [challan, setChallan] = useState<SalesChallan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const { hasRole } = useAuth();
  const canConfirmOrCancel = hasRole(['ADMIN', 'SALES']);

  const fetchChallan = async () => {
    try {
      const res = await apiRequest<SalesChallan>(`/challans/${id}`);
      setChallan(res.data);
    } catch (err) {
      console.error('Failed to load challan details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleConfirmChallan = async () => {
    setError('');
    setActionLoading(true);
    try {
      await apiRequest(`/challans/${id}/confirm`, { method: 'POST' });
      setShowConfirmModal(false);
      fetchChallan();
    } catch (err: any) {
      setError(err.message || 'Challan confirmation failed');
      setShowConfirmModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelChallan = async () => {
    if (!window.confirm('Are you sure you want to cancel this draft sales challan?')) return;
    setError('');
    setActionLoading(true);
    try {
      await apiRequest(`/challans/${id}/cancel`, { method: 'POST' });
      fetchChallan();
    } catch (err: any) {
      setError(err.message || 'Challan cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Loading sales challan...</div>;
  if (!challan) return <div>Sales Challan not found.</div>;

  const grandTotal = challan.items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/challans" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Back to Sales Challans</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontFamily: 'monospace' }}>{challan.challanNumber}</h1>
              <span className={`badge ${challan.status === 'CONFIRMED' ? 'badge-success' : challan.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                {challan.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Created on {new Date(challan.createdAt).toLocaleString()}</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => window.print()} className="btn btn-secondary">
              <Printer size={18} />
              <span>Print / Export PDF</span>
            </button>

            {canConfirmOrCancel && challan.status === 'DRAFT' && (
              <>
                <button onClick={() => setShowConfirmModal(true)} className="btn btn-primary">
                  <CheckCircle2 size={18} />
                  <span>Confirm & Deduct Stock</span>
                </button>
                <button onClick={handleCancelChallan} disabled={actionLoading} className="btn btn-danger">
                  <XCircle size={18} />
                  <span>Cancel Challan</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.95rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={24} />
          <div>
            <strong>Transaction Failed!</strong>
            <div>{error}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Customer Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={16} color="var(--text-dim)" />
              <strong style={{ fontSize: '1rem' }}>{challan.customer?.customerName}</strong>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>Business: {challan.customer?.businessName}</div>
            <div style={{ color: 'var(--text-muted)' }}>GST #: {challan.customer?.gstNumber || 'N/A'}</div>
            <div style={{ color: 'var(--text-muted)' }}>Address: {challan.customer?.address}</div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Challan Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Issued By:</span>
              <strong>{challan.creator?.name || 'Staff'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Status:</span>
              <strong>{challan.status}</strong>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Note: Challan items record historical price & product snapshots at time of creation.
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Challan Itemization</h3>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product Snapshot</th>
                <th>SKU Snapshot</th>
                <th>Unit Price Snapshot ($)</th>
                <th>Quantity</th>
                <th>Line Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.productNameSnapshot}</strong></td>
                  <td><code>{item.skuSnapshot}</code></td>
                  <td>${item.unitPriceSnapshot.toFixed(2)}</td>
                  <td><strong style={{ fontSize: '1rem' }}>{item.quantity}</strong></td>
                  <td><strong>${item.lineTotal.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', marginTop: '1.5rem', background: '#0f172a', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Items Quantity: </span>
            <strong style={{ fontSize: '1.1rem' }}>{challan.totalQuantity}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Grand Total Value: </span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>${grandTotal.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} />
              Confirm Sales Challan
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Confirming this sales challan will automatically check stock availability and <strong>deduct product stock in an atomic database transaction</strong>.
              <br /><br />
              Do you want to proceed?
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirmModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleConfirmChallan} disabled={actionLoading} className="btn btn-primary">
                {actionLoading ? 'Executing Transaction...' : 'Yes, Confirm & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
