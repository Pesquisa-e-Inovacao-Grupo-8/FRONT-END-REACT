import React from 'react';
import { createRoot } from 'react-dom/client';

function ConfirmDialog({ mensagem, onConfirm, onCancel, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', showCancel = true }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.52)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
    >
      <div
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          borderRadius: '12px',
          background: '#fff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
          padding: '18px',
          fontFamily: 'Jost, sans-serif'
        }}
      >
        <div style={{ marginBottom: '12px', fontWeight: 700, color: '#222' }}>Confirmação</div>
        <div style={{ marginBottom: '18px', color: '#333' }}>{mensagem}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {showCancel && (
            <button
              style={{ padding: '8px 12px', background: '#e5e7eb', border: 'none', borderRadius: '8px' }}
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            style={{ padding: '8px 12px', background: '#A8883A', color: '#fff', border: 'none', borderRadius: '8px' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function mostrarConfirmacaoAssincrona(mensagem, opts = {}) {
  if (typeof document === 'undefined') return Promise.resolve(false);

  const containerId = 'confirm-dialog-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);

  return new Promise((resolve) => {
    const cleanup = () => {
      try {
        root.unmount();
      } catch (e) {
        // ignore
      }
      if (container && container.parentNode) container.parentNode.removeChild(container);
    };

    const handleConfirm = () => {
      resolve(true);
      cleanup();
    };

    const handleCancel = () => {
      resolve(false);
      cleanup();
    };

    root.render(
      <ConfirmDialog
        mensagem={mensagem}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmLabel={opts.confirmLabel}
        cancelLabel={opts.cancelLabel}
      />
    );
  });
}

export default mostrarConfirmacaoAssincrona;

export function mostrarAvisoObrigatorio(mensagem, opts = {}) {
  if (typeof document === 'undefined') return Promise.resolve();

  const containerId = 'confirm-dialog-root';
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  const root = createRoot(container);

  return new Promise((resolve) => {
    const cleanup = () => {
      try {
        root.unmount();
      } catch (e) {}
      if (container && container.parentNode) container.parentNode.removeChild(container);
    };

    const handleOk = () => {
      resolve();
      cleanup();
    };

    root.render(
      <ConfirmDialog
        mensagem={mensagem}
        onConfirm={handleOk}
        onCancel={handleOk}
        confirmLabel={opts.okLabel || 'OK'}
        showCancel={false}
      />
    );
  });
}
