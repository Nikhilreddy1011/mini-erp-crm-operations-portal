import React, { useState } from 'react';
import { Customer } from '../types';
import { apiRequest } from '../api/client';
import { X } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: customer?.customerName || '',
    mobileNumber: customer?.mobileNumber || '',
    email: customer?.email || '',
    businessName: customer?.businessName || '',
    gstNumber: customer?.gstNumber || '',
    customerType: customer?.customerType || 'RETAIL',
    address: customer?.address || '',
    status: customer?.status || 'LEAD',
    followUpDate: customer?.followUpDate ? customer.followUpDate.split('T')[0] : '',
    notes: customer?.notes || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (customer) {
        await apiRequest(`/customers/${customer.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/customers', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* SECTION 1: Contact Information */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>1. Contact Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer Name *</label>
                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Mobile Number *</label>
                <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          {/* SECTION 2: Business Information */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>2. Business Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Business Name *</label>
                <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>GST Number (Optional)</label>
                <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer Type *</label>
                <select name="customerType" value={formData.customerType} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="RETAIL">RETAIL</option>
                  <option value="WHOLESALE">WHOLESALE</option>
                  <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: Address */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>3. Address</h4>
            <div>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} style={{ width: '100%' }} placeholder="Full street address..." />
            </div>
          </div>

          {/* SECTION 4: CRM Details */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>4. CRM Status & Follow-up</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} style={{ width: '100%' }}>
                  <option value="LEAD">LEAD</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Next Follow-Up Date</label>
                <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} style={{ width: '100%' }} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>CRM Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} style={{ width: '100%' }} placeholder="Additional client requirements..." />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
