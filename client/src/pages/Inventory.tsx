import React, { useEffect, useState } from 'react';
import { StockMovement, Product, MovementType } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Filter, Plus, Minus, X } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stock Adjustment Modal
  const [showModal, setShowModal] = useState(false);
  const [adjType, setAdjType] = useState<'IN' | 'OUT'>('IN');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const { hasRole } = useAuth();
  const canAdjustStock = hasRole(['ADMIN', 'WAREHOUSE']);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('movementType', typeFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await apiRequest<StockMovement[]>(`/stock-movements?${params.toString()}`);
      setMovements(res.data);
      if (res.pagination) setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error('Failed to fetch stock movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsList = async () => {
    try {
      const res = await apiRequest<Product[]>('/products?limit=100');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products for modal:', err);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [typeFilter, page]);

  const handleOpenModal = (type: 'IN' | 'OUT') => {
    setAdjType(type);
    setModalError('');
    setSelectedProduct('');
    setAdjQty('');
    setAdjReason('');
    fetchProductsList();
    setShowModal(true);
  };

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const endpoint = adjType === 'IN' 
        ? `/products/${selectedProduct}/stock-in`
        : `/products/${selectedProduct}/stock-out`;

      await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          quantity: parseInt(adjQty, 10),
          reason: adjReason
        })
      });

      setShowModal(false);
      fetchMovements();
    } catch (err: any) {
      setModalError(err.message || 'Adjustment failed');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Inventory & Stock Movements</h1>
          <p style={{ color: 'var(--text-muted)' }}>Audit log of stock intake, challan deductions, and warehouse adjustments</p>
        </div>

        {canAdjustStock && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => handleOpenModal('IN')} className="btn btn-primary" style={{ background: 'var(--success)' }}>
              <Plus size={18} />
              <span>Stock IN</span>
            </button>
            <button onClick={() => handleOpenModal('OUT')} className="btn btn-danger">
              <Minus size={18} />
              <span>Stock OUT</span>
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter by Movement Type:</label>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Movement Types</option>
            <option value="IN">IN (Stock Intake)</option>
            <option value="OUT">OUT (Dispatched / Challan)</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Movement Type</th>
                <th>Qty Changed</th>
                <th>Reason / Trigger</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading stock log...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stock movements recorded.</td></tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleString()}</td>
                    <td><strong>{m.product?.name}</strong></td>
                    <td><code>{m.product?.sku}</code></td>
                    <td>
                      <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                        {m.movementType === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {m.movementType}
                      </span>
                    </td>
                    <td><strong style={{ fontSize: '1rem' }}>{m.quantityChanged}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{m.reason}</td>
                    <td>{m.creator?.name || 'Staff'}</td>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Perform Stock {adjType}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            {modalError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleStockAdjustment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Select Product *</label>
                <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required style={{ width: '100%' }}>
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (SKU: {p.sku} | Current Stock: {p.currentStock})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Quantity to {adjType} *</label>
                <input type="number" min="1" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} required style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Reason / Purchase Order Ref *</label>
                <input type="text" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} required placeholder="e.g. PO-9812 intake / Damaged stock write-off" style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={modalLoading} className={`btn ${adjType === 'IN' ? 'btn-primary' : 'btn-danger'}`}>
                  {modalLoading ? 'Processing...' : `Submit Stock ${adjType}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
