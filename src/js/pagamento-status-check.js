import { useState, useEffect, useRef } from 'react';

const ENDPOINT = 'http://localhost:5000/agendamentos/pagos';
const INTERVALO = 5000; 

export function usePagamentoStatusCheck(interval = INTERVALO) {
  const [pendentes, setPendentes] = useState([]);
  const intervalRef = useRef(null);

  const checarPendentes = async () => {
    try {
      /* * CÓDIGO ORIGINAL (Comentado temporariamente para não dar erro)
       * const res = await fetch(ENDPOINT);
       * if (!res.ok) return;
       * const data = await res.json();
       * setPendentes(data);
       */

      // MOCK TEMPORÁRIO: Simplesmente diz que não tem nenhum pagamento atualizado
      // para não travar o console e nem a tela.
      setPendentes([]);

    } catch (err) {
      console.error('[PagamentoStatusCheck] Erro ao verificar pendentes:', err);
    }
  };

  useEffect(() => {
    checarPendentes();
    intervalRef.current = setInterval(checarPendentes, interval);
    return () => clearInterval(intervalRef.current);
  }, [interval]);

  return { pendentes };
}