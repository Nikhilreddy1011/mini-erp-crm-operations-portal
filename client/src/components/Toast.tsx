import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <CheckCircle2 color="var(--success)" size={20} />
          ) : (
            <AlertTriangle color="var(--danger)" size={20} />
          )}
          <span style={{ flex: 1, fontSize: '0.875rem' }}>{toast.text}</span>
          <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
