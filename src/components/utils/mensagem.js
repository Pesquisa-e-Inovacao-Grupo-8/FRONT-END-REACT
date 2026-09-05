import { mostrarConfirmacao, mostrarErro, mostrarAtencao } from './modal-confirmação';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function isMobile() {
  if (typeof window === 'undefined') return false;

  try {
    const vw =
      (window.visualViewport && window.visualViewport.width) ||
      window.innerWidth ||
      document.documentElement.clientWidth;

    if (typeof vw === 'number' && vw <= 768) return true;

    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      return true;
    }
  } catch (e) {
    // ignore
  }

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return true;
  }

  return false;
}

export function mostrarMensagem(texto, tipo = 'info') {
  if (isMobile()) {
    switch (tipo) {
      case 'error':
        return toast.error(texto);
      case 'success':
        return toast.success(texto);
      default:
        return toast.info(texto);
    }
  }

  switch (tipo) {
    case 'error':
      return mostrarErro(texto);
    case 'success':
      return mostrarConfirmacao(texto);
    default:
      return mostrarAtencao(texto);
  }
}

export function mostrarErroMensagem(texto) {
  return mostrarMensagem(texto, 'error');
}

export function mostrarSucessoMensagem(texto) {
  return mostrarMensagem(texto, 'success');
}

export default mostrarMensagem;