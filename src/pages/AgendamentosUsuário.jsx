//src/pages/AgendamentoUsuario.jsx
import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAgendamentosPorCliente, atualizarStatusAgendamento, gerarLinkPagamento } from '../js/agendamento.js';
import '../styles/agendamentos-usuario.css'

const SOCKET_URL = "https://infinity-pay.renatahtokutomi.com/ws-payment"; //rota do microservico

function formatDate(dateStr) {
  const d = new Date(dateStr.ano, dateStr.mes - 1, dateStr.dia, 12, 0, 0);
  return d.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    .replace(/^\w/, c => c.toUpperCase());
}

function isPaidBooking(booking) {
  const status = String(booking.status).toUpperCase();
  const paymentStatus = String(booking.pagamentoStatus || booking.status_pagamento).toUpperCase();
  return status === "CONFIRMADO" || status === "PAGO & CONFIRMADO" ||
    paymentStatus === "PAGO" || paymentStatus === "APROVADO";
}

export default function AgendamentosUsuário() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelModal, setCancelModal] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [paymentTermsAccepted, setPaymentTermsAccepted] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState("connecting"); // "connecting" | "connected" | "disconnected"
  const [notification, setNotification] = useState(null); // { message, type }
  const socketRef = useRef(null);

  // ─── WebSocket (Stomp) ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const client = new Client({
      // SockJS como fallback de conexão
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("[STOMP] Conectado ao WebSocket Java");
        setSocketStatus("connected");

        // se "inscreve" no canal de pagamentos
        client.subscribe('/topic/pagamentos', (message) => {
          const data = JSON.parse(message.body);
          console.log("[STOMP] Pagamento confirmado recebido:", data);
          const orderNsu = data.order_nsu || data.orderNsu || data.id;

          // Atualiza o estado
          setBookings(prev =>
            prev.map(b =>
              String(b.id) === String(orderNsu)
                ? {
                    ...b,
                    status: "CONFIRMADO",
                    status_pagamento: "PAGO",
                    pagamentoStatus: "PAGO"
                  }
                : b
            )
          );
          showNotification("Pagamento confirmado! Seu agendamento foi atualizado.", "success");
        });
      },
      onDisconnect: () => {
        console.log("[STOMP] Desconectado");
        setSocketStatus("disconnected");
      },
      onWebSocketError: (err) => {
        console.warn("[STOMP] Erro de WebSocket:", err);
        setSocketStatus("disconnected");
      }
    });

    client.activate();
    socketRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  // ─── Notificação temporária ───────────────────────────────────────────────
  function showNotification(message, type = "success") {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }

  // ─── Carregamento de dados ────────────────────────────────────────────────
  const carregarMeusDados = async () => {
    setLoading(true);
    const meuId = localStorage.getItem("userId");
    console.log("userId:", meuId); // ← tem valor?

    if (!meuId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      console.log("Chamando getAgendamentosPorCliente...");
      const dados = await getAgendamentosPorCliente(meuId);
      console.log("Dados recebidos:", dados); // ← chega aqui?
      setBookings(dados);
    } catch (error) {
      console.error("Erro:", error); // ← ou cai aqui?
    } finally {
      console.log("finally executado"); // ← esse aparece?
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMeusDados();
  }, []);

  // ─── Cancelamento ─────────────────────────────────────────────────────────
  async function handleCancelConfirm() {
    try {
      await atualizarStatusAgendamento(cancelModal, 'CANCELADO');
      setCancelModal(null);
      carregarMeusDados();
    } catch (error) {
      alert("Erro ao cancelar agendamento.");
    }
  }

  // ─── Filtros de aba ───────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0,0,0,0);

  const filtered = bookings.filter(b => {
    const bDate = new Date(b.ano, b.mes - 1, b.dia);
    const status = String(b.status).toUpperCase();

    if (activeTab === "upcoming") {
      return (status === "CONFIRMADO" || status === "PENDENTE" || status === "PAGO & CONFIRMADO") && bDate >= today;
    }
    if (activeTab === "history") {
      return status === "FINALIZADO" || status === "CANCELADO" || bDate < today;
    }
    return true;
  });

  // ─── Pagamento ────────────────────────────────────────────────────────────
  function abrirRevisaoPagamento(booking) {
    setPaymentBooking(booking);
    setPaymentTermsAccepted(false);
  }

  async function gerarPagamento() {
    if (!paymentBooking || !paymentTermsAccepted) return;

    setIsPaymentLoading(true);
    try {
      let checkoutUrl = paymentBooking.link_pagamento;

      if (!checkoutUrl) {
        const response = await gerarLinkPagamento(paymentBooking);
        checkoutUrl = response?.url || response?.checkoutUrl;
      }

      if (!checkoutUrl) {
        throw new Error("A API não retornou um link de checkout");
      }

      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      setPaymentBooking(null);
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      showNotification("Não foi possível iniciar o pagamento. Tente novamente.", "error");
    } finally {
      setIsPaymentLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (loading) return <div className="page"><p>Carregando seus compromissos...</p></div>;

  return (
    <div className="page">

      {/* Indicador de conexão WebSocket */}
      <div className={`socket-indicator socket-${socketStatus}`}>
        <span className="socket-dot" />
        {socketStatus === "connected" && "Atualização em tempo real ativa"}
        {socketStatus === "connecting" && "Conectando..."}
        {socketStatus === "disconnected" && "Sem conexão em tempo real"}
      </div>

      {/* Notificação de pagamento confirmado */}
      {notification && (
        <div className={`toast toast-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="page-hero">
        <h1>Meus <em>Agendamentos</em></h1>
        <p>Gerencie seus horários e acompanhe seu histórico</p>
      </div>

      <div className="tabs">
        {[{key:"upcoming", label:"Próximos"}, {key:"history", label:"Histórico"}, {key:"all", label:"Todos"}].map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty"><p>Nenhum agendamento encontrado.</p></div>
      ) : (
        filtered.map(b => (
          <div className="appointment-card" key={b.id}>
            <div className="appointment-card__header">
              <div className="appointment-card__header-left">
                <span className="appointment-card__service-name">{b.servico}</span>
              </div>
              <div className="appointment-card__header-right">
                <div className="appointment-card__price">
                  {isPaidBooking(b) ? "Confirmado" : "Pendente"}
                </div>
              </div>
            </div>

            <div className="appointment-card__professional">
               👤 {b.funcionaria}
            </div>

            <div className="appointment-card__details">
              <div className="appointment-card__detail-item">
                <div className="appointment-card__detail-label">📅 Data</div>
                <div className="appointment-card__detail-value">{formatDate(b)}</div>
              </div>
              <div className="appointment-card__detail-item">
                <div className="appointment-card__detail-label">⏰ Horário</div>
                <div className="appointment-card__detail-value">{b.hora}</div>
              </div>
            </div>

            <div className="appointment-card__actions">
              {!isPaidBooking(b) ? (
                <>
                  <button className="appointment-card__payment" onClick={() => abrirRevisaoPagamento(b)}>
                    {b.link_pagamento ? "Efetuar pagamento" : "Gerar link"}
                  </button>
                  <button className="appointment-card__cancel" onClick={() => setCancelModal(b.id)}>
                    Cancelar Agendamento
                  </button>
                </>
              ) : (
                <div className="status-paid">
                  <strong>AGENDAMENTO PAGO</strong>
                  <span>
                    Em caso de cancelamento ou reagendamento, entre em contato com um
                    administrador ou profissional.
                  </span>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {cancelModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Confirmar Cancelamento</h2>
            <p>Deseja realmente cancelar este agendamento? Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setCancelModal(null)}>Voltar</button>
              <button className="btn-modal-confirm" onClick={handleCancelConfirm}>Sim, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {paymentBooking && (
        <div className="modal-overlay">
          <div className="modal payment-review-modal">
            <h2>Revise seu agendamento</h2>
            <div className="payment-booking-summary">
              <div><span>Serviço</span><strong>{paymentBooking.servico}</strong></div>
              <div><span>Profissional</span><strong>{paymentBooking.funcionaria}</strong></div>
              <div><span>Data</span><strong>{formatDate(paymentBooking)}</strong></div>
              <div><span>Horário</span><strong>{paymentBooking.hora}</strong></div>
            </div>

            <div className="booking-terms">
              <h3>Antes de pagar</h3>
              <p>
                Após o pagamento, o agendamento só poderá ser cancelado com 24 horas de
                antecedência. Caso contrário, será cobrada uma taxa de 25% sobre o reembolso.
              </p>
              <p>
                A taxa de cancelamento de 25% também se aplica a agendamentos comuns sem
                pagamento antecipado.
              </p>
              <label className="terms-checkbox">
                <input
                  type="checkbox"
                  checked={paymentTermsAccepted}
                  onChange={event => setPaymentTermsAccepted(event.target.checked)}
                />
                <span>Li os termos de agendamento e estou de acordo</span>
              </label>
            </div>

            <div className="modal-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setPaymentBooking(null)}
                disabled={isPaymentLoading}
              >
                Voltar
              </button>
              <button
                className="btn-modal-save"
                onClick={gerarPagamento}
                disabled={!paymentTermsAccepted || isPaymentLoading}
              >
                {isPaymentLoading
                  ? "Abrindo pagamento..."
                  : paymentBooking.link_pagamento
                    ? "Efetuar pagamento"
                    : "Gerar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
