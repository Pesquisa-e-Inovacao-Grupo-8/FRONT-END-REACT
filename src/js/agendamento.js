import axios from 'axios';
import api from '../api';

const FLASK_URL = 'http://127.0.0.1:5000/flask-infinity-pay';

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
        const [hInicio, mInicio] = payload.hora.split(':').map(Number);
        
        const totalMinutosFim = (hInicio * 60) + mInicio + parseInt(payload.duracaoMinutos);
        const hFim = Math.floor(totalMinutosFim / 60);
        const mFim = totalMinutosFim % 60;
        
        const horaInicioFormatada = `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')}:00`;
        const horaFimFormatada = `${String(hFim).padStart(2, '0')}:${String(mFim).padStart(2, '0')}:00`;

        const agendamentoDTO = {
            data: payload.data, // YYYY-MM-DD
            horaInicio: horaInicioFormatada,
            horaFim: horaFimFormatada,
            status: payload.status || 'PENDENTE',
            ordemPedido: 'ORD-TESTE-FRONT',
            clienteId: '523e4567-e89b-12d3-a456-426614174001', // MOCK Maria Silva
            profissionalId: '323e4567-e89b-12d3-a456-426614174001' // MOCK Ana Paula
        };

        console.log("Tentando criar no Spring Boot:", agendamentoDTO);
        const response = await api.post(`/agendamentos`, agendamentoDTO);
        return response.data;

    } catch (error) {
        console.error('Falha ao criar agendamento via Spring Boot Mock:', error);
        throw new Error('Falha ao criar agendamento');
    }
}

export async function criarAgendamento(payload) {
    return salvarAgendamento(payload);
}

export async function getAgendamentos() {
   try {
        const [agendamentosRes, agendamentoServicosRes] = await Promise.all([
            api.get(`/agendamentos`),
            api.get(`/agendamentoServicos`)
        ]);

        const agendamentosBrutos = agendamentosRes.data;
        const relacoesServicos = agendamentoServicosRes.data;

        const agendamentosFormatados = agendamentosBrutos.map(agend => {
            const relacao = relacoesServicos.find(rel => rel.agendamento && rel.agendamento.id === agend.id);
            const nomeServico = relacao && relacao.servico ? relacao.servico.nome : 'Serviço Padrão';

            const [ano, mes, dia] = agend.data.split('-');
            
            const horaInicio = agend.horaInicio.substring(0, 5);
            const horaFim = agend.horaFim.substring(0, 5);
            
            const [hInicio, mInicio] = horaInicio.split(':').map(Number);
            const [hFim, mFim] = horaFim.split(':').map(Number);
            const duracaoTotal = ((hFim * 60) + mFim) - ((hInicio * 60) + mInicio);

            return {
                id: agend.id,
                dia: parseInt(dia, 10),
                mes: parseInt(mes, 10),
                ano: parseInt(ano, 10),
                hora: horaInicio,
                duracaoMinutos: duracaoTotal > 0 ? duracaoTotal : 60, 
                
                cliente: agend.cliente && agend.cliente.usuario ? agend.cliente.usuario.nome : 'Cliente Não Informado',
                funcionaria: agend.profissional && agend.profissional.usuario ? agend.profissional.usuario.nome : 'Profissional Não Informado',
                servico: nomeServico,
                
                status: agend.status,
                pagamentoStatus: agend.pagamentoStatus || 'PENDENTE' 
            };
        });

        return agendamentosFormatados;

    } catch (error) {
        console.error("Erro ao buscar agendamentos com Token JWT:", error);
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
            profissionalId: dadosFormulario.professionalId 
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
        
        return todosAgendamentos.filter(a => a.cliente === meuNome);
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