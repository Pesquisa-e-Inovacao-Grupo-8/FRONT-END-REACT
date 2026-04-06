export function cancelarAgendamento(agendamento) {
    agendamento.status = 'CANCELADO';
    return agendamento;
}

export function finalizarAgendamento(agendamento) {
    agendamento.status = 'FINALIZADO';
    return agendamento;
}

export async function criarAgendamento(payload) {
     const response = await fetch('http://127.0.0.1:5000/flask-infinity-pay/create-agendamento', {
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
    if (!response.ok) {
        throw new Error('Falha ao gerar link de pagamento');
    }
    const responseData = await response.json();
    return responseData;
}
