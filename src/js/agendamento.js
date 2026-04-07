const CREATE_AGENDAMENTO_URL = 'http://127.0.0.1:5000/flask-infinity-pay/create-agendamento';
const LISTAR_AGENDAMENTOS_URL = 'http://127.0.0.1:8080/spring/agendamentos/listar';

export function cancelarAgendamento(agendamento) {
    agendamento.status = 'CANCELADO';
    return agendamento;
}

export function finalizarAgendamento(agendamento) {
    agendamento.status = 'FINALIZADO';
    return agendamento;
}

export async function criarAgendamento(payload) {
    const response = await fetch(CREATE_AGENDAMENTO_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error('Falha ao criar agendamento');
    }
    const responseData = await response.json();
    return responseData;
}


export async function gerarLinkPagamento(agendamento) {
    const response = await fetch('http://127.0.0.1:5000/flask-infinity-pay/create-checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(agendamento)
    });
    console.log('Resposta do servidor:', response);
    if (!response.ok) {
        throw new Error('Falha ao gerar link de pagamento');
    }
    const responseData = await response.json();
    return responseData;
}

export async function getAgendamentos() {
    const res = await fetch(LISTAR_AGENDAMENTOS_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Falha ao listar agendamentos (${res.status})`);
    }

    return res.json();
}

export async function salvarAgendamento(agendamento) {
    const res = await fetch(CREATE_AGENDAMENTO_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(agendamento)
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Falha ao criar agendamento (${res.status})`);
    }

    return res.json();
}
