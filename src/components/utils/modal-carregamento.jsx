import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const CONFIG = {
  badge: '#f7f1df',
  accent: '#A8883A',
  border: '#D4B76A',
  gradient: 'linear-gradient(135deg, #C9A84C 0%, #A8883A 100%)'
};

export function LoadingModal({ isOpen, mensagem = 'Carregando ...', onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    // prevent background scroll while loading
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.52)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      aria-hidden={false}
    >
      <div
        role="dialog"
        aria-live="polite"
        style={{
          width: '100%',
          maxWidth: '360px',
          borderRadius: '18px',
          background: '#ffffff',
          border: `1px solid ${CONFIG.border}`,
          boxShadow: '0 20px 50px rgba(26, 28, 34, 0.18)',
          overflow: 'hidden',
          fontFamily: 'Jost, sans-serif',
          textAlign: 'center',
          padding: '28px 20px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '16px',
              background: CONFIG.badge,
              border: `1px solid ${CONFIG.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="40" height="40" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <defs />
              <circle cx="25" cy="25" r="18" stroke={CONFIG.accent} strokeWidth="4" strokeLinecap="round" strokeDasharray="85 113" fill="none">
                <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          <div style={{ color: '#3A3A3A', fontSize: '1rem', lineHeight: 1.4, fontWeight: 600 }}> {mensagem} </div>

        </div>
      </div>
    </div>
  );
}

export function mostrarCarregamento({ mensagem = 'Carregando ...' } = {}) {
  if (typeof document === 'undefined') return () => {};

  const containerId = 'modal-carregamento-root';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  // If there's already a mounted root, reuse its unmounting reference
  const root = createRoot(container);
  // store root reference for global hide
  container._reactRoot = root;

  const close = () => {
    try {
      if (container && container._reactRoot) container._reactRoot.unmount();
    } catch (e) {
      // ignore
    }
    if (container && container.parentNode) container.parentNode.removeChild(container);
    delete container._reactRoot;
  };

  root.render(<LoadingModal isOpen={true} mensagem={mensagem} onClose={close} />);

  return close;
}

export function esconderCarregamento() {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('modal-carregamento-root');
  if (!container) return;
  try {
    if (container._reactRoot) container._reactRoot.unmount();
  } catch (e) {
    // ignore
  }
  if (container.parentNode) container.parentNode.removeChild(container);
  delete container._reactRoot;
}

export default LoadingModal;


      var fechar = mostrarCarregamento({ mensagem: 'Criando conta...' });
      if (fechar) fechar();