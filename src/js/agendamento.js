import axios from 'axios';

const CREATE_AGENDAMENTO_URL = 'http://127.0.0.1:5000/flask-infinity-pay/create-agendamento';
const LISTAR_AGENDAMENTOS_URL = 'http://localhost:8080';

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
        const response = await axios.post(`${CREATE_AGENDAMENTO_URL}/create-checkout`, agendamento);
        console.log('Resposta do Infinity Pay:', response.data);
        return response.data;
    } catch (error) {
        console.error('Falha ao gerar link de pagamento no Infinity Pay', error);
        throw new Error('Falha ao gerar link de pagamento');
    }
}
/*
export async function salvarAgendamento(agendamento) {
   try {
        const response = await axios.post(`${CREATE_AGENDAMENTO_URL}/create-agendamento`, agendamento);
        return response.data;
    } catch (error) {
        console.error('Falha ao criar agendamento via Flask:', error);
        throw new Error('Falha ao criar agendamento');
    }
}*/

// Salvar agendamento (Ignorando o Flask para teste)
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
            ordemPedido: 'ORD-TESTE-FRONT', // Fake
            clienteId: '523e4567-e89b-12d3-a456-426614174001', // ID da Maria (criada no data.sql)
            profissionalId: '323e4567-e89b-12d3-a456-426614174001' // ID da Ana Paula
        };

        console.log("Tentando criar no Spring Boot:", agendamentoDTO);
        const response = await axios.post(`${LISTAR_AGENDAMENTOS_URL}/agendamentos`, agendamentoDTO);
        const novoAgendamento = response.data;
                
        return novoAgendamento;

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
            axios.get(`${LISTAR_AGENDAMENTOS_URL}/agendamentos`),
            axios.get(`${LISTAR_AGENDAMENTOS_URL}/agendamentoServicos`)
        ]);

        const agendamentosBrutos = agendamentosRes.data;
        const relacoesServicos = agendamentoServicosRes.data;

        const agendamentosFormatados = agendamentosBrutos.map(agend => {
            
            const relacao = relacoesServicos.find(rel => rel.agendamento && rel.agendamento.id === agend.id);
            const nomeServico = relacao && relacao.servico ? relacao.servico.nome : 'Serviço Padrão';

            const [ano, mes, dia] = agend.data.split('-');
            
            const horaInicio = agend.horaInicio.substring(0, 5); // Ex: 14:00
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
        console.error("Erro ao buscar agendamentos do Spring Boot:", error);
        return [];
    }
    
}

// Função para buscar os serviços disponíveis para o Select
export async function getServicos() {
    try {
        const response = await axios.get(`${LISTAR_AGENDAMENTOS_URL}/servicos`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        return [];
    }
}

// Orquestrador: Salva o agendamento e depois vincula o serviço
export async function agendarPeloCliente(dadosFormulario) {
    try {
        // 1. Prepara os horários (Convertendo de "14:00" para "14:00:00")
        const [hInicio, mInicio] = dadosFormulario.time.split(':').map(Number);
        
        // Pega a duração do serviço (ou chuta 60 min) e calcula a hora do fim
        const duracao = dadosFormulario.duracaoServico || 60;
        const totalMinutosFim = (hInicio * 60) + mInicio + duracao;
        const hFim = Math.floor(totalMinutosFim / 60);
        const mFim = totalMinutosFim % 60;

        const horaInicioFormatada = `${String(hInicio).padStart(2, '0')}:${String(mInicio).padStart(2, '0')}:00`;
        const horaFimFormatada = `${String(hFim).padStart(2, '0')}:${String(mFim).padStart(2, '0')}:00`;

        // 2. Monta o DTO do Agendamento
        const agendamentoDTO = {
            data: dadosFormulario.date, // Ex: "2026-04-25"
            horaInicio: horaInicioFormatada,
            horaFim: horaFimFormatada,
            status: 'PENDENTE',
            ordemPedido: `WEB-${Date.now()}`,
            // MOCK: Usando o ID da Maria Silva até fazermos o Login
            clienteId: '523e4567-e89b-12d3-a456-426614174001', 
            profissionalId: dadosFormulario.professionalId // Vem do select
        };

        // 3. Cria o Agendamento no Spring Boot
        console.log("Criando agendamento...", agendamentoDTO);
        const responseAgendamento = await axios.post(`${LISTAR_AGENDAMENTOS_URL}/agendamentos`, agendamentoDTO);
        const novoAgendamento = responseAgendamento.data;

        // 4. Cria a relação do Serviço com esse Agendamento
        console.log("Vinculando serviço...");
        await axios.post(`${LISTAR_AGENDAMENTOS_URL}/agendamentoServicos`, {
            agendamentoId: novoAgendamento.id,
            servicoId: dadosFormulario.serviceId
        });

        return novoAgendamento;

    } catch (error) {
        console.error("Falha geral ao criar agendamento do cliente:", error);
        throw error;
    }
}
// ----------------------------------------------------------------------
// 4. MEUS AGENDAMENTOS (Fluxo do Cliente Logado)
// ----------------------------------------------------------------------

// Busca agendamentos de um cliente específico e formata para a tela de histórico
export async function getAgendamentosPorCliente(clienteId) {
    try {
        const todosAgendamentos = await getAgendamentos(); // Reaproveita nossa lógica de 'costura'
        // Filtra apenas os agendamentos que pertencem à ID da Maria (ou do logado futuramente)
        // Nota: No nosso tradutor, o objeto cliente não estava vindo com ID. 
        // Vamos ajustar o getAgendamentos original ou filtrar pelo nome por enquanto:
        return todosAgendamentos.filter(a => a.cliente === 'Maria Silva');
    } catch (error) {
        console.error("Erro ao filtrar meus agendamentos:", error);
        return [];
    }
}

// Envia a alteração de status para o Spring Boot (ex: CANCELADO ou FINALIZADO)
export async function atualizarStatusAgendamento(agendamentoId, novoStatus) {
    try {
        // Primeiro buscamos o agendamento atual para não perder os outros dados no PUT
        const res = await axios.get(`${LISTAR_AGENDAMENTOS_URL}/agendamentos/${agendamentoId}`);
        const agendamentoAtual = res.data;

        const agendamentoAtualizado = {
            ...agendamentoAtual,
            status: novoStatus
        };

        const response = await axios.put(`${LISTAR_AGENDAMENTOS_URL}/agendamentos/${agendamentoId}`, agendamentoAtualizado);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar status no servidor:", error);
        throw error;
    }
}