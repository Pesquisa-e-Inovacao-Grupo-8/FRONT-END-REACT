import { isMobile, mostrarConfirmacao, mostrarErro, mostrarAtencao } from './modal-confirmação';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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