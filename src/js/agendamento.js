import axios from 'axios';
import api, { normalizeArray } from '../api';

const FLASK_URL = 'https://spring.renatahtokutomi.com:8088/flask-infinity-pay';

export function cancelarAgendamento(agendamento) {
    agendamento.status = 'CANCELADO';
    return agendamento;
}

export function finalizarAgendamento(agendamento) {
    agendamento.status = 'FINALIZADO';
    return agendamento;
}

export async function gerarLinkPagamento(agendamento) {
    try {
        const response = await axios.post(`${FLASK_URL}/create-checkout`, agendamento);
        console.log('Resposta do Infinity Pay:', response.data);
        return response.data;
    } catch (error) {
        console.error('Falha ao gerar link de pagamento no Infinity Pay', error);
        throw new Error('Falha ao gerar link de pagamento');
    }
}

export async function salvarAgendamento(payload) {
    try {
        // O payload vindo do NovoAgendamento.jsx JÁ ESTÁ FORMATADO corretamente.
        // Não precisamos de .split aqui.
        const agendamentoDTO = {
            data: payload.data, // YYYY-MM-DD
            horaInicio: payload.horaInicio, 
            horaFim: payload.horaFim,
            status: payload.status || 'PENDENTE',
            ordemPedido: payload.ordemPedido,
            clienteId: payload.clienteId || null, 
            nomeClienteAvulso: payload.nomeClienteAvulso || null,
            telefoneClienteAvulso: payload.telefoneClienteAvulso || null,
            profissionalId: payload.profissionalId,
            servicoId: payload.servicoId
        };

        console.log("Enviando para Spring Boot:", agendamentoDTO);
        const response = await api.post(`/agendamentos`, agendamentoDTO);
        return response.data;

    } catch (error) {
        console.error('Falha ao criar agendamento no Spring Boot:', error);
        throw new Error('Falha ao criar agendamento');
    }
}
export async function criarAgendamento(payload) {
    return salvarAgendamento(payload);
}

export async function getAgendamentos() {
   try {
        const [agendamentosRes, agendamentoServicosRes, servicosRes] = await Promise.all([
            api.get(`/agendamentos`),
            api.get(`/agendamentoServicos`),
            api.get(`/servicos`)
        ]);

        const agendamentosBrutos = normalizeArray(agendamentosRes.data);
        const relacoesServicos = normalizeArray(agendamentoServicosRes.data);
        const servicos = normalizeArray(servicosRes.data);

        return agendamentosBrutos.map(agend => {
            // Extração segura da data
            const [ano, mes, dia] = (agend.data || "2000-01-01").toString().split("-").map(Number);
            
            const relacao = relacoesServicos.find(rel =>
                rel.agendamento?.id === agend.id || rel.agendamentoId === agend.id || rel.fk_agendamento === agend.id
            );
            const nomeServico = relacao?.servico?.nome ||
                relacao?.servico?.nomeServico ||
                (relacao?.servicoId ? servicos.find(servico => servico.id === relacao.servicoId)?.nome : null) ||
                (agend.servicoId ? servicos.find(servico => servico.id === agend.servicoId)?.nome : null) ||
                'Serviço Padrão';
            
            const horaInicio = (agend.horaInicio || agend.hora_inicio) ?
                (agend.horaInicio || agend.hora_inicio).toString().substring(0, 5) : "00:00";
            const horaFim = (agend.horaFim || agend.hora_fim) ?
                (agend.horaFim || agend.hora_fim).toString().substring(0, 5) : "00:00";

            return {
                id: agend.id,
                dia, mes, ano,
                hora: horaInicio,
                cliente: agend.cliente?.usuario?.nome || agend.nomeClienteAvulso || 'Avulso',
                clienteId: agend.clienteId || agend.cliente?.id || agend.fk_cliente,
                funcionaria: agend.profissional?.usuario?.nome || 'Profissional Não Informado',
                servico: nomeServico,
                status: agend.status,
                pagamentoStatus: agend.pagamentoStatus || 'PENDENTE'
            };
        });
    } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        return [];
    }
}

export async function getServicos() {
    try {
        const response = await api.get(`/servicos`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        return [];
    }
}

export async function agendarPeloCliente(dadosFormulario) {
    try {
        const [hInicio, mInicio] = dadosFormulario.time.split(':').map(Number);
        
        const duracao = dadosFormulario.duracaoServico || 60;
        const totalMinutosFim = (hInicio * 60) + mInicio + duracao;
        const hFim = Math.floor(totalMinutosFim / 60);
        const mFim = totalMinutosFim % 60;

        const horaInicioFormatada = `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')}:00`;
        const horaFimFormatada = `${String(hFim).padStart(2, '0')}:${String(mFim).padStart(2, '0')}:00`;

        const meuId = localStorage.getItem("userId");

        const agendamentoDTO = {
            data: dadosFormulario.date, 
            horaInicio: horaInicioFormatada,
            horaFim: horaFimFormatada,
            status: 'PENDENTE',
            ordemPedido: `WEB-${Date.now()}`,
            clienteId: meuId,
            profissionalId: dadosFormulario.professionalId,
            servicoId: dadosFormulario.serviceId
        };

        console.log("Criando agendamento...", agendamentoDTO);
        const responseAgendamento = await api.post(`/agendamentos`, agendamentoDTO);
        const novoAgendamento = responseAgendamento.data;

        console.log("Vinculando serviço...");
        await api.post(`/agendamentoServicos`, {
            agendamentoId: novoAgendamento.id,
            servicoId: dadosFormulario.serviceId
        });

        return novoAgendamento;

    } catch (error) {
        console.error("Falha geral ao criar agendamento do cliente:", error);
        throw error;
    }
}

export async function getAgendamentosPorCliente(clienteId) {
    try {
        const meuNome = localStorage.getItem("userName");
        const todosAgendamentos = await getAgendamentos(); 
        
        return todosAgendamentos.filter(a =>
            (clienteId && a.clienteId === clienteId) ||
            (meuNome && a.cliente === meuNome)
        );
    } catch (error) {
        console.error("Erro ao filtrar meus agendamentos:", error);
        return [];
    }
}

export async function atualizarStatusAgendamento(agendamentoId, novoStatus) {
    try {
        const res = await api.get(`/agendamentos/${agendamentoId}`);
        const agendamentoAtual = res.data;

        const agendamentoAtualizado = {
            ...agendamentoAtual,
            status: novoStatus
        };

        const response = await api.put(`/agendamentos/${agendamentoId}`, agendamentoAtualizado);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar status no servidor:", error);
        throw error;
    }
}