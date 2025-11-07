import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const NotifyContext = createContext(null);

let toastIdSeq = 1;

const ToastView = ({ toasts, onClose }) => {
  return createPortal(
    <div style={styles.toastContainer} aria-live="polite" aria-atomic="true">{
      toasts.map(t => (
        <div key={t.id} style={{ ...styles.toast, ...toastTypeStyle[t.type] }}>
          <div style={styles.toastMessage}>{t.message}</div>
          <button style={styles.toastClose} onClick={() => onClose(t.id)} aria-label="Cerrar">×</button>
        </div>
      ))
    }</div>,
    document.body
  );
};

const ConfirmView = ({ confirmState, resolve }) => {
  const { open, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar' } = confirmState;
  if (!open) return null;
  return createPortal(
    <div style={styles.modalOverlay} role="dialog" aria-modal="true">{
      <div style={styles.modal}>
        {title ? <h3 style={styles.modalTitle}>{title}</h3> : null}
        {message ? <p style={styles.modalMsg}>{message}</p> : null}
        <div style={styles.modalActions}>
          <button style={styles.btnCancel} onClick={() => resolve(false)}>{cancelText}</button>
          <button style={styles.btnConfirm} onClick={() => resolve(true)}>{confirmText}</button>
        </div>
      </div>
    }</div>,
    document.body
  );
};

export const NotifyProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutsRef = useRef(new Map());

  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current.clear();
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const to = timeoutsRef.current.get(id);
    if (to) {
      clearTimeout(to);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const push = useCallback((message, type = 'info', options = {}) => {
    const id = toastIdSeq++;
    const toast = { id, message, type };
    setToasts(prev => [...prev, toast]);
    const duration = options.duration ?? 3000;
    const to = setTimeout(() => removeToast(id), duration);
    timeoutsRef.current.set(id, to);
    return id;
  }, [removeToast]);

  const api = useMemo(() => ({
    info: (m, o) => push(m, 'info', o),
    success: (m, o) => push(m, 'success', o),
    error: (m, o) => push(m, 'error', o),
    warning: (m, o) => push(m, 'warning', o),
  }), [push]);

  const [confirmState, setConfirmState] = useState({ open: false });
  const confirm = useCallback((opts) => new Promise((resolve) => {
    const { title, message, confirmText, cancelText } = (typeof opts === 'string')
      ? { title: 'Confirmar', message: opts }
      : (opts || {});

    const handleResolve = (val) => {
      setConfirmState({ open: false });
      resolve(val);
    };

    setConfirmState({ open: true, title, message, confirmText, cancelText });
    confirm.resolveRef = handleResolve;
  }), []);
  confirm.resolveRef = confirm.resolveRef || (() => {});

  const contextValue = useMemo(() => ({
    notify: api,
    confirm,
  }), [api, confirm]);

  return (
    <NotifyContext.Provider value={contextValue}>
      {children}
      <ToastView toasts={toasts} onClose={removeToast} />
      <ConfirmView confirmState={confirmState} resolve={(v) => confirm.resolveRef(v)} />
    </NotifyContext.Provider>
  );
};

export const useNotify = () => {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify debe usarse dentro de NotifyProvider');
  return ctx;
};

const styles = {
  toastContainer: {
    position: 'fixed',
    top: 16,
    right: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    minWidth: 280,
    maxWidth: 420,
    padding: '10px 12px',
    borderRadius: 8,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    color: '#1F2937',
    background: '#F3F4F6',
    pointerEvents: 'auto',
  },
  toastMessage: { flex: 1, fontSize: 14 },
  toastClose: {
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 10,
    padding: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },
  modalTitle: { margin: '4px 0 8px', fontSize: 18 },
  modalMsg: { margin: '0 0 16px', color: '#374151' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 8 },
  btnCancel: {
    background: '#E5E7EB',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
  },
  btnConfirm: {
    background: '#10B981',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 12px',
    cursor: 'pointer',
  },
};

const toastTypeStyle = {
  info: {},
  success: { background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' },
  error: { background: '#FEF2F2', color: '#7F1D1D', border: '1px solid #FECACA' },
  warning: { background: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A' },
};

export default NotifyContext;

