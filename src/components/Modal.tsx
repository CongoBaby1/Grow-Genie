// ===== MODAL LAYOUT =====
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

export default function Modal({ title, children, onClose, actions }: ModalProps) {
  // Prevent body scroll while modal open
  useEffect(() => {
    const root = document.getElementById('root') as HTMLElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => { root.style.overflow = prev; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
      }}
    >
      {/* Modal header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ padding: '6px 12px', fontSize: 14 }}
        >
          Cancel
        </button>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-bright)' }}>{title}</span>
        <div>{actions}</div>
      </div>

      {/* Modal body */}
      <div className="scroll-area">
        <div style={{ padding: '16px 16px 80px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
