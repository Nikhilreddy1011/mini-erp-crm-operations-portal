import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/client';
import { DashboardMetrics } from '../types';
import { Users, Package, AlertTriangle, FileSpreadsheet, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiRequest<DashboardMetrics>('/dashboard/metrics');
        setMetrics(res.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading Executive Dashboard...</div>;
  }

  if (!metrics) {
    return <div style={{ color: 'var(--danger)' }}>Failed to load metrics.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Executive Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time wholesale operational summary and analytics</p>
      </div>

      <div className="grid-metrics">
        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Customers</div>
            <div className="metric-value">{metrics.customers.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.3rem' }}>
              {metrics.customers.active} Active | {metrics.customers.lead} Leads
            </div>
          </div>
          <div className="metric-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Products in Catalog</div>
            <div className="metric-value">{metrics.products.total}</div>
            <div style={{ fontSize: '0.75rem', color: metrics.products.lowStock > 0 ? 'var(--warning)' : 'var(--text-muted)', marginTop: '0.3rem' }}>
              {metrics.products.lowStock} Low Stock Alert
            </div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Out of Stock</div>
            <div className="metric-value" style={{ color: metrics.products.outOfStock > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
              {metrics.products.outOfStock}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.3rem' }}>Requires Stock In</div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sales Challans</div>
            <div className="metric-value">{metrics.challans.confirmed + metrics.challans.draft}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--info)', marginTop: '0.3rem' }}>
              {metrics.challans.confirmed} Confirmed | {metrics.challans.draft} Drafts
            </div>
          </div>
          <div className="metric-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--info)' }}>
            <FileSpreadsheet size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Sales Challans</h3>
            <Link to="/challans" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentChallans.map((ch) => (
                  <tr key={ch.id}>
                    <td><strong>{ch.challanNumber}</strong></td>
                    <td>{ch.customer?.customerName}</td>
                    <td>{ch.totalQuantity}</td>
                    <td>
                      <span className={`badge ${ch.status === 'CONFIRMED' ? 'badge-success' : ch.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {ch.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {metrics.recentChallans.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent challans found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Recent Stock Movements</h3>
            <Link to="/inventory" className="btn btn-secondary btn-sm">Inventory Log</Link>
          </div>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentStockMovements.map((sm) => (
                  <tr key={sm.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sm.product?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sm.product?.sku}</div>
                    </td>
                    <td>
                      <span className={`badge ${sm.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                        {sm.movementType === 'IN' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {sm.movementType}
                      </span>
                    </td>
                    <td><strong>{sm.quantityChanged}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sm.reason}</td>
                  </tr>
                ))}
                {metrics.recentStockMovements.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No recent stock movements.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
