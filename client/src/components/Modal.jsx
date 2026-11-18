import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// A window that opens over the page. Esc or a click outside closes it.
// It is drawn straight into the page body so it sits above everything, including the Ask AI helper.
export default function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-window" role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>×</button>
        <h3 className="modal-title">{title}</h3>
        {subtitle && <p className="muted small">{subtitle}</p>}
        {children}
      </div>
    </div>,
    document.body
  );
}
