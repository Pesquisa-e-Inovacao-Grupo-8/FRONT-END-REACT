import { useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const MODAL_STYLES = {
  confirmacao: {
    icon: '✓',
    color: '#16a34a',
    background: '#dcfce7',
    border: '#86efac',
    label: 'Confirmação'
  },
  erro: {
    icon: '!',
    color: '#b91c1c',
    background: '#fee2e2',
    border: '#fca5a5',
    label: 'Erro'
  },
  atencao: {
    icon: '⚠',
    color: '#b45309',
    background: '#fef3c7',
    border: '#fcd34d',
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
        background: 'rgba(15, 23, 42, 0.38)',
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
          borderRadius: '14px',
          background: '#fff',
          border: `2px solid ${config.border}`,
          boxShadow: '0 18px 45px rgba(15, 23, 42, 0.20)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: config.background,
            color: config.color,
            padding: '14px 18px',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fff',
              fontSize: '1rem',
              fontWeight: 800
            }}
          >
            {config.icon}
          </span>
          {config.label}
        </div>

        <div style={{ padding: '22px 20px 20px', fontSize: '1rem', color: '#1f2937', lineHeight: 1.5 }}>
          {mensagem}
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
