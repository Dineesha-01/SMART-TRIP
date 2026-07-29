import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─────────────────────────────────────────────
   Toast Context & Provider
───────────────────────────────────────────── */
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const ICONS = {
  success: <CheckCircle2 size={18} color="#10b981" />,
  error:   <XCircle size={18} color="#ef4444" />,
  warning: <AlertTriangle size={18} color="#f59e0b" />,
  info:    <Info size={18} color="#60a5fa" />,
};

let _nextId = 0;

function ToastItem({ toast, onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const dur = toast.duration ?? 4000;
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(toast.id), 280);
    }, dur);
    return () => clearTimeout(exitTimer);
  }, [toast, onClose]);

  return (
    <div className={`toast toast-${toast.type}${exiting ? ' exit' : ''}`}>
      <span className="toast-icon">{ICONS[toast.type]}</span>
      <div className="toast-body">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        className="toast-close"
        onClick={() => {
          setExiting(true);
          setTimeout(() => onClose(toast.id), 280);
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((type, title, message, duration) => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    return id;
  }, []);

  const api = {
    success: (title, message, dur) => toast('success', title, message, dur),
    error:   (title, message, dur) => toast('error',   title, message, dur),
    warning: (title, message, dur) => toast('warning', title, message, dur),
    info:    (title, message, dur) => toast('info',    title, message, dur),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="toast-wrapper">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={dismiss} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ─────────────────────────────────────────────
   Error Boundary
───────────────────────────────────────────── */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SmartTrip ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', padding: '3rem', textAlign: 'center', gap: '1rem'
        }}>
          <div style={{
            background: 'var(--red-100)', padding: '1.25rem',
            borderRadius: '50%', marginBottom: '0.5rem'
          }}>
            <XCircle size={40} color="var(--red-600)" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-tertiary)', maxWidth: '420px', lineHeight: 1.6, fontSize: '0.9rem' }}>
            An unexpected error occurred in this section. The error has been logged.
          </p>
          <details style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', maxWidth: '480px', textAlign: 'left', fontFamily: 'monospace' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Technical Details</summary>
            {this.state.error?.message}
          </details>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
