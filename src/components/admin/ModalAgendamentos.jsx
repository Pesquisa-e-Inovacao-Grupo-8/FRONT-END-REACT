// src/components/admin/ModalAgendamentos.jsx
import React, { useState } from "react";
import { cancelarAgendamento , finalizarAgendamento , gerarLinkPagamento } from "../../js/agendamento.js";
import api from "../../api";
import "../../styles/agendamento-grid.css";
import "../../styles/app.css";
import mostrarMensagem, { mostrarErroMensagem, mostrarSucessoMensagem } from "../utils/mensagem";
import mostrarConfirmacaoAssincrona from "../utils/confirm-dialog";

export default function ModalAgendamento({ agendamento, onClose, onAtualizar, onFinalizar, onCancelar }) {
  const [checkoutUrl, setCheckoutUrl] = useState(agendamento.link_pagamento || "");
  const [gerandoLink, setGerandoLink] = useState(false);
  const [dandoBaixa, setDandoBaixa] = useState(false);

  const statusPagamento = (agendamento.pagamentoStatus || agendamento.status_pagamento || (agendamento.pagamentoAdiantado ? 'PAGO' : 'PENDENTE')).toUpperCase();
  const telefone = agendamento.telefone || '';
  const telefoneLimpo = String(telefone).replace(/\D/g, '');
  const ordemPagamento = agendamento.ordem_pagamento || agendamento.ordemPagamento || 'Não informada';
  const mensagemWhats = encodeURIComponent(`Olá, ${agendamento.cliente}! Sobre seu agendamento de ${agendamento.servico} em ${agendamento.data} às ${agendamento.hora}.`);
  const whatsappUrl = telefoneLimpo ? `https://wa.me/${telefoneLimpo}?text=${mensagemWhats}` : '';

  const jaEstaPago = statusPagamento === 'PAGO' || statusPagamento === 'APROVADO';

  const handleGerarLink = async () => {
    try {
      setGerandoLink(true);
      const response = await gerarLinkPagamento(agendamento);
      const url = response?.url || response?.checkoutUrl || '';
      if (url) {
        setCheckoutUrl(url);
      } else {
        mostrarErroMensagem('Não foi possível obter o link de pagamento.');
      }
    } catch (error) {
      console.error(error);
      mostrarErroMensagem('Erro ao gerar link de pagamento.');
    } finally {
      setGerandoLink(false);
    }
  };

  const handleDarBaixa = async () => {
    try {
      const confirmar = await mostrarConfirmacaoAssincrona("Confirmar o recebimento deste valor por fora (Dinheiro/Pix Direto)? O status será alterado para PAGO.");
      if (!confirmar) return;

      setDandoBaixa(true);
      await api.patch(`/agendamentos/${agendamento.id}/pagamento`, { status: "PAGO" });

      mostrarSucessoMensagem("Baixa realizada com sucesso!");

      if (onAtualizar) onAtualizar();
      onClose();

    } catch (error) {
      console.error("Erro ao dar baixa:", error);
      mostrarErroMensagem("Não foi possível processar a baixa. Verifique a API.");
    } finally {
      setDandoBaixa(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>Detalhes do Agendamento</h2>
        <div className="modal-info">
          <div className="modal-highlight">
            <div><b>Telefone:</b> {telefone || 'Não informado'}</div>
            <div><b>Ordem de pagamento:</b> {ordemPagamento}</div>
            {whatsappUrl ? (
              <a className="btn-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
                Chamar no WhatsApp
              </a>
            ) : (
              <button className="btn-whatsapp" type="button" disabled>
                WhatsApp indisponível
              </button>
            )}
          </div>

          <div><b>Cliente:</b> {agendamento.cliente}</div>
          <div><b>Serviço:</b> {agendamento.servico}</div>
          <div><b>Data:</b> {agendamento.data}</div>
          <div><b>Horário:</b> {agendamento.hora}</div>
          <div><b>Funcionária:</b> {agendamento.funcionaria}</div>
          <div><b>Duração:</b> {agendamento.duracaoMinutos || agendamento.duracao || 60} min</div>
          <div><b>Pagamento adiantado:</b> {agendamento.pagamentoAdiantado ? 'Sim' : 'Não'}</div>
          <div><b>Status do pagamento:</b> {statusPagamento}</div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              className="btn-app"
              onClick={handleGerarLink}
              disabled={gerandoLink || jaEstaPago}
              style={{ flex: 1 }}
            >
              {gerandoLink ? 'Gerando...' : 'Gerar Link'}
            </button>

            {!jaEstaPago && (
              <button 
                className="btn-app"
                onClick={handleDarBaixa}
                disabled={dandoBaixa}
                style={{ flex: 1, backgroundColor: '#28a745', color: '#fff', border: 'none' }}
              >
                {dandoBaixa ? 'Processando...' : 'Receber (Baixa)'}
              </button>
            )}
          </div>

          {checkoutUrl && (
            <div className="redirect" style={{ marginTop: '10px' }}>
              <a href={checkoutUrl} target="_blank" rel="noreferrer">Abrir Checkout</a>
            </div>
          )}
        </div>

        <div className="display-flex linha" style={{ marginTop: '20px' }}>
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