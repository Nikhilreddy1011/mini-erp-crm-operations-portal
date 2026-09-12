import React, { useState } from 'react';
import { Product } from '../types';
import { apiRequest } from '../api/client';
import { X } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    unitPrice: product?.unitPrice ? product.unitPrice.toString() : '',
    currentStock: product?.currentStock ? product.currentStock.toString() : '0',
    minimumStockAlertQuantity: product?.minimumStockAlertQuantity ? product.minimumStockAlertQuantity.toString() : '10',
    warehouseLocation: product?.warehouseLocation || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        unitPrice: parseFloat(formData.unitPrice),
        currentStock: parseInt(formData.currentStock, 10),
        minimumStockAlertQuantity: parseInt(formData.minimumStockAlertQuantity, 10)
      };

      if (product) {
        await apiRequest(`/products/${product.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
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
      <div className="modal-content" style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>SKU (Unique) *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} required style={{ width: '100%' }} placeholder="PROD-001" />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Category *</label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%' }} placeholder="Category..." />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Unit Price ($) *</label>
              <input type="number" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                {product ? 'Current Stock' : 'Initial Stock'} *
              </label>
              <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} required disabled={!!product} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Min Stock Alert Qty *</label>
              <input type="number" name="minimumStockAlertQuantity" value={formData.minimumStockAlertQuantity} onChange={handleChange} required style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Warehouse Location *</label>
              <input type="text" name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} required style={{ width: '100%' }} placeholder="Rack A-01" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
