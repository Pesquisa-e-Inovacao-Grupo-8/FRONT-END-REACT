import { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const MODAL_STYLES = {
  confirmacao: {
    icon: '✓',
    badge: '#f7f1df',
    accent: '#A8883A',
    border: '#D4B76A',
    gradient: 'linear-gradient(135deg, #C9A84C 0%, #A8883A 100%)',
    label: 'Confirmação'
  },
  erro: {
    icon: '!',
    badge: '#fceaea',
    accent: '#8a1f1f',
    border: '#dcb0b0',
    gradient: 'linear-gradient(135deg, #b05f5f 0%, #8a1f1f 100%)',
    label: 'Erro'
  },
  atencao: {
    icon: '⚠',
    badge: '#fdf6e6',
    accent: '#9a6a0c',
    border: '#e7c77d',
    gradient: 'linear-gradient(135deg, #d9b75d 0%, #b8842c 100%)',
    label: 'Atenção'
  }
};

export function ModalConfirmacao({ isOpen, mensagem, tipo = 'confirmacao', tempo = 2500, onClose }) {
  const config = useMemo(() => MODAL_STYLES[tipo] || MODAL_STYLES.confirmacao, [tipo]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, tempo);

    return () => clearTimeout(timer);
  }, [isOpen, tempo, onClose]);

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
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-live="polite"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '18px',
          background: '#ffffff',
          border: `1px solid ${config.border}`,
          boxShadow: '0 20px 50px rgba(26, 28, 34, 0.18)',
          overflow: 'hidden',
          fontFamily: 'Jost, sans-serif'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: config.gradient,
            color: '#ffffff',
            padding: '16px 18px',
            fontWeight: 600,
            fontSize: '0.8rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.28)',
              fontSize: '1rem',
              fontWeight: 800,
              lineHeight: 1
            }}
          >
            {config.icon}
          </span>
          {config.label}
        </div>

        <div style={{ padding: '22px 20px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              flex: '0 0 auto',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: config.badge,
              border: `1px solid ${config.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: config.accent,
              fontWeight: 800,
              fontSize: '1.2rem'
            }}
          >
            {config.icon}
          </div>

          <div style={{ flex: 1, color: '#3A3A3A', fontSize: '1rem', lineHeight: 1.6, paddingTop: '4px', fontWeight: 400 }}>
            {mensagem}
          </div>
        </div>
      </div>
    </div>
  );
}

export function mostrarModal({ mensagem, tipo = 'confirmacao', tempo = 2500, onClose } = {}) {
  if (typeof document === 'undefined') return null;

  const containerId = 'modal-confirmacao-root';
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);

  const close = () => {
    root.unmount();
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (onClose) onClose();
  };

  root.render(
    <ModalConfirmacao
      isOpen={true}
      mensagem={mensagem}
      tipo={tipo}
      tempo={tempo}
      onClose={close}
    />
  );

  return close;
}

export const mostrarConfirmacao = (mensagem, tempo = 2500) =>
  mostrarModal({ mensagem, tipo: 'confirmacao', tempo });

export const mostrarErro = (mensagem, tempo = 3000) =>
  mostrarModal({ mensagem, tipo: 'erro', tempo });

export const mostrarAtencao = (mensagem, tempo = 3500) =>
  mostrarModal({ mensagem, tipo: 'atencao', tempo });

export default ModalConfirmacao;
