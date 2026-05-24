import { createPortal } from 'react-dom'

// Shared modal overlay — renders at document.body via Portal to escape stacking contexts
export function ModalOverlay({ onClose, children, maxWidth = 560 }) {
  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(12,12,13,.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--paper)', borderRadius: 20,
        padding: '36px 32px', maxWidth, width: '100%',
        boxShadow: '0 32px 80px -20px rgba(12,12,13,.45)',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            border: 0, background: 'var(--paper-2)', color: 'var(--muted)',
            width: 32, height: 32, borderRadius: 999, cursor: 'pointer',
            fontFamily: 'var(--f-sub)', fontWeight: 800, fontSize: 16,
          }}
        >×</button>
        {children}
      </div>
    </div>,
    document.body
  )
}
