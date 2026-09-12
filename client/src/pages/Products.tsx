import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter, Edit3, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { ProductForm } from './ProductForm';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'WAREHOUSE']);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await apiRequest<Product[]>(`/products?${params.toString()}`);
      setProducts(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, page]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Products & Catalog</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage products, pricing, stock thresholds, and locations</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingProduct(null); setShowAddModal(true); }} className="btn btn-primary">
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by category..."
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Product Name & SKU</th>
                <th>Category</th>
                <th>Unit Price ($)</th>
                <th>Current Stock</th>
                <th>Min Alert Qty</th>
                <th>Warehouse Loc</th>
                <th>Stock Status</th>
                {canEdit && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                    </td>
                    <td>{p.category}</td>
                    <td><strong>${p.unitPrice.toFixed(2)}</strong></td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: p.currentStock <= p.minimumStockAlertQuantity ? 'var(--danger)' : 'var(--text-main)' }}>
                        {p.currentStock}
                      </strong>
                    </td>
                    <td>{p.minimumStockAlertQuantity}</td>
                    <td><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.warehouseLocation}</span></td>
                    <td>
                      <span className={`badge ${p.stockStatus === 'IN STOCK' ? 'badge-success' : p.stockStatus === 'LOW STOCK' ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stockStatus}
                      </span>
                    </td>
                    {canEdit && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => { setEditingProduct(p); setShowAddModal(true); }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                      </td>
                    )}
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
        <ProductForm
          product={editingProduct}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { setShowAddModal(false); fetchProducts(); }}
        />
      )}
    </div>
  );
};
