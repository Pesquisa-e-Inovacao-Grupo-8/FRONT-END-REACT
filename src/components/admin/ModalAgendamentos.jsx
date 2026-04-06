import React, { useState } from "react";
import { cancelarAgendamento , finalizarAgendamento , gerarLinkPagamento } from "../../js/agendamento.js";
import "../../styles/agendamento-grid.css";
import "../../styles/app.css";

export default function ModalAgendamento({ agendamento, onClose, onFinalizar, onCancelar }) {
  const [checkoutUrl, setCheckoutUrl] = useState(agendamento.link_pagamento || "");
  const [gerandoLink, setGerandoLink] = useState(false);

  const statusPagamento = (agendamento.pagamentoStatus || agendamento.status_pagamento || (agendamento.pagamentoAdiantado ? 'PAGO' : 'PENDENTE')).toUpperCase();

  const handleGerarLink = async () => {
    try {
      setGerandoLink(true);
      const response = await gerarLinkPagamento(agendamento);
      const url = response?.url || response?.checkoutUrl || '';
      if (url) {
        setCheckoutUrl(url);
      } else {
        alert('Não foi possível obter o link de pagamento.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar link de pagamento.');
    } finally {
      setGerandoLink(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Detalhes do Agendamento</h2>
        <div className="modal-info">
          <div><b>Cliente:</b> {agendamento.cliente}</div>
          <div><b>Serviço:</b> {agendamento.servico}</div>
          <div><b>Data:</b> {agendamento.data}</div>
          <div><b>Horário:</b> {agendamento.hora}</div>
          <div><b>Funcionária:</b> {agendamento.funcionaria}</div>
          <div><b>Duração:</b> {agendamento.duracaoMinutos || agendamento.duracao || 60} min</div>
          <div><b>Pagamento adiantado:</b> {agendamento.pagamentoAdiantado ? 'Sim' : 'Não'}</div>
          <div><b>Status do pagamento:</b> {statusPagamento}</div>
          <button 
          className="btn-app"
          onClick={handleGerarLink}
          disabled={gerandoLink}
          >
            {gerandoLink ? 'Gerando...' : 'Gerar Link de Pagamento'}
            </button>
            {checkoutUrl && (
              <div className="redirect">
                <a href={checkoutUrl} target="_blank" rel="noreferrer">Abrir Checkout</a>
              </div>
            )}
        </div>
        <div className="display-flex linha">
          <button
            className="btn-app btn-salvar"
            style={{width: '50%'}}
            onClick={() => {
              finalizarAgendamento(agendamento);
              onClose();
            }}
          >
            Finalizar Agendamento

          </button>
          <button
            className="btn-app btn-cancelar"
            style={{width: '50%'}}
            onClick={() => {
              cancelarAgendamento(agendamento);
              onClose();
            }}
          >
            Cancelar Agendamento

          </button>
        </div>
      </div>
    </div>
  );
}
