import { useEffect } from "react";
import "../styles/toast.css";

export default function Toast({ mensagem, tipo = "erro", onClose }) {
  useEffect(() => {
    if (!mensagem) return undefined;

    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [mensagem, onClose]);

  if (!mensagem) return null;

  return (
    <div className={`app-toast app-toast--${tipo}`} role="alert" aria-live="assertive">
      <span>{mensagem}</span>
      <button type="button" onClick={onClose} aria-label="Fechar mensagem">
        ×
      </button>
    </div>
  );
}
