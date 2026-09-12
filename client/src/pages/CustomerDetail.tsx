import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Customer } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Building, Mail, Phone, MapPin, Calendar, Clock, Plus, FileText } from 'lucide-react';

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { hasRole } = useAuth();
  const canAddFollowUp = hasRole(['ADMIN', 'SALES']);

  const fetchCustomer = async () => {
    try {
      const res = await apiRequest<Customer>(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiRequest(`/customers/${id}/follow-ups`, {
        method: 'POST',
        body: JSON.stringify({ note: followUpNote, followUpDate: followUpDate || null })
      });
      setShowFollowUpModal(false);
      setFollowUpNote('');
      setFollowUpDate('');
      fetchCustomer();
    } catch (err) {
      console.error('Failed to add follow-up:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading customer details...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/customers" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Back to Customers</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{customer.customerName}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge ${customer.status === 'ACTIVE' ? 'badge-success' : customer.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                {customer.status}
              </span>
              <span className="badge badge-info">{customer.customerType}</span>
            </div>
          </div>

          {canAddFollowUp && (
            <button onClick={() => setShowFollowUpModal(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>Log Follow-Up Note</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>Business & Contact Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Building size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Business Name:</span>
              <strong>{customer.businessName}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>GST Number:</span>
              <strong>{customer.gstNumber || 'N/A'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Mobile:</span>
              <strong>{customer.mobileNumber}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} color="var(--text-dim)" />
              <span style={{ color: 'var(--text-muted)' }}>Email:</span>
              <strong>{customer.email}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={16} color="var(--text-dim)" style={{ marginTop: '0.2rem' }} />
              <span style={{ color: 'var(--text-muted)' }}>Address:</span>
              <span>{customer.address}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>CRM & Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={16} color="var(--warning)" />
              <span style={{ color: 'var(--text-muted)' }}>Next Follow-Up Date:</span>
              <strong style={{ color: customer.followUpDate ? 'var(--warning)' : 'var(--text-main)' }}>
                {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None scheduled'}
              </strong>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>General Notes:</span>
              <div style={{ background: '#0f172a', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                {customer.notes || 'No general notes recorded.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Follow-Up History Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {customer.followUps && customer.followUps.length > 0 ? (
            customer.followUps.map((fu) => (
              <div key={fu.id} style={{ background: '#0f172a', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Logged by: <strong>{fu.creator?.name || 'Staff'}</strong></span>
                  <span>{new Date(fu.createdAt).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{fu.note}</div>
              </div>
            ))
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No previous follow-up history records.</div>
          )}
        </div>
      </div>

      {showFollowUpModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Log New Follow-Up Note</h3>
            <form onSubmit={handleAddFollowUp}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Follow-up Note *</label>
                <textarea
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter details of conversation..."
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Next Scheduled Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowFollowUpModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Add Follow-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
