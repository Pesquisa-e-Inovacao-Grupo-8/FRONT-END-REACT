import api, { normalizeArray } from "../api";

function normalizarServico(servico) {
  return {
    ...servico,
    quantidadeDisponivel: Number(servico.quantidadeDisponivel ?? servico.quantidade_disponivel ?? 0),
    quantidadeConfigurada: Number(servico.quantidadeConfigurada ?? servico.quantidade_configurada ?? 0),
    clientePacoteServicoId: servico.clientePacoteServicoId || servico.idClientePacoteServico || null,
    duracaoMinutos: servico.duracaoMinutos ?? servico.duracao_minutos ?? 60
  };
}

export function normalizarPacote(pacote) {
  return {
    ...pacote,
    dtExpiracao: pacote.dtExpiracao || pacote.dt_expiracao || pacote.expiracao || null,
    ativo: pacote.ativo !== false && pacote.status !== "INATIVO",
    servicos: (pacote.servicos || []).map(normalizarServico)
  };
}

export async function getMeusPacotes() {
  const usuarioId = localStorage.getItem("userId");
  if (!usuarioId) return [];

  const response = await api.get(`/clientePacotes/meus/${usuarioId}`);
  return normalizeArray(response.data).map(normalizarPacote);
}
