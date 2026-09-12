import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Customer, Product } from '../types';
import { apiRequest } from '../api/client';
import { ArrowLeft, Plus, Trash2, Save, FileSpreadsheet } from 'lucide-react';

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const ChallanForm: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          apiRequest<Customer[]>('/customers?limit=100'),
          apiRequest<Product[]>('/products?limit=100')
        ]);
        setCustomers(cRes.data);
        setProducts(pRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItemRow = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const handleItemChange = (index: number, field: 'productId' | 'quantity', value: any) => {
    const updated = [...items];
    if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    } else {
      updated[index].productId = value;
    }
    setItems(updated);
  };

  const handleRemoveRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const productMap = new Map(products.map(p => [p.id, p]));

  const calculateTotalQuantity = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => {
      const prod = productMap.get(item.productId);
      return sum + (prod ? prod.unitPrice * (item.quantity || 0) : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCustomerId) {
      setError('Please select a customer.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one product item to the challan.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest('/challans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          items
        })
      });

      navigate(`/challans/${res.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create sales challan draft.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading form configuration...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/challans" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Back to Sales Challans</span>
        </Link>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Create Sales Challan (Draft)</h1>
        <p style={{ color: 'var(--text-muted)' }}>Challan number will be generated automatically. Inventory will NOT be deducted until confirmed.</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--primary)' }}>1. Select Customer</h3>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
              style={{ width: '100%' }}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.customerName} ({c.businessName}) — {c.customerType}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>2. Products & Quantities</h3>
            <button type="button" onClick={handleAddItemRow} className="btn btn-secondary btn-sm">
              <Plus size={16} />
              <span>Add Product Row</span>
            </button>
          </div>

          <div className="table-responsive" style={{ marginBottom: '1rem' }}>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Available Stock</th>
                  <th>Unit Price ($)</th>
                  <th style={{ width: '120px' }}>Quantity</th>
                  <th>Line Total ($)</th>
                  <th style={{ textAlign: 'center' }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No items added yet. Click "Add Product Row" to begin.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const prod = productMap.get(item.productId);
                    const lineTotal = prod ? prod.unitPrice * (item.quantity || 0) : 0;
                    const isStockLow = prod && prod.currentStock < item.quantity;

                    return (
                      <tr key={idx}>
                        <td>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            style={{ width: '100%' }}
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td><code>{prod?.sku || 'N/A'}</code></td>
                        <td>
                          <strong style={{ color: isStockLow ? 'var(--danger)' : 'var(--success)' }}>
                            {prod?.currentStock ?? 0}
                          </strong>
                          {isStockLow && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', display: 'block' }}>Low Stock!</span>}
                        </td>
                        <td>${prod?.unitPrice.toFixed(2) || '0.00'}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td><strong>${lineTotal.toFixed(2)}</strong></td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            style={{ background: 'none', border: 'none', color: 'var(--danger)' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', background: '#0f172a', padding: '1rem 1.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Items Quantity: </span>
              <strong style={{ fontSize: '1.1rem' }}>{calculateTotalQuantity()}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Value: </span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>${calculateGrandTotal().toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Link to="/challans" className="btn btn-secondary">Cancel</Link>
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
            <Save size={18} />
            <span>{submitting ? 'Saving Draft...' : 'Save Draft Challan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
