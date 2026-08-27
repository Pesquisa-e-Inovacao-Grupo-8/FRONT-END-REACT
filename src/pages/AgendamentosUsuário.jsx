//src/pages/AgendamentoUsuario.jsx
import { useState, useEffect, useRef } from 'react';
import axios from "axios";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAgendamentosPorCliente, atualizarStatusAgendamento } from '../js/agendamento.js';
import '../styles/agendamentos-usuario.css'

const SOCKET_URL = "http://localhost:8088/ws-payment"; //rota do microservico

function formatDate(dateStr) {
  const d = new Date(dateStr.ano, dateStr.mes - 1, dateStr.dia, 12, 0, 0);
  return d.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    .replace(/^\w/, c => c.toUpperCase());
}

function StatusBadge({ status }) {
  const s = String(status).toUpperCase();
  if (s == "CONFIRMADO") return <span className="badge badge-confirmed"><span className="badge-dot"/>Confirmado</span>;
  if (s == "CANCELADO") return <span className="badge badge-cancelled"><span className="badge-dot"/>Cancelado</span>;
  if (s == "FINALIZADO" || s === "DONE") return <span className="badge badge-done"><span className="badge-dot"/>Concluído</span>;
  return <span className="badge badge-pending"><span className="badge-dot"/>Pendente</span>;
}

export default function AgendamentosUsuário() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelModal, setCancelModal] = useState(null);
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

          // Atualiza o estado
          setBookings(prev =>
            prev.map(b =>
              b.id === data.order_nsu
                ? { ...b, status: data.status ?? "CONFIRMADO" }
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
      return (status === "CONFIRMADO" || status === "PENDENTE") && bDate >= today;
    }
    if (activeTab === "history") {
      return status === "FINALIZADO" || status === "CANCELADO" || bDate < today;
    }
    return true;
  });

  // ─── Pagamento ────────────────────────────────────────────────────────────
  async function gerarPagamento(id) {
    const payload = {
      jwt: localStorage.getItem("token"),
      idAgendamento: id
    };
    const response = await axios.post("http://localhost:8088/flask-infinity-pay/create-checkout", payload);
    console.log("Resposta do pagamento:", response.data);
    window.open(response.data.url, "_blank");
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
          <div className="booking-card" key={b.id}>
            <div className="card-header">
              <div className="card-header-left">
                <span className="card-service-name">{b.servico}</span>
                <StatusBadge status={b.status} />
              </div>
              <div className="card-header-right">
                <div className="card-price">Pendente</div>
              </div>
            </div>

            <div className="card-professional">
               👤 {b.funcionaria}
            </div>

            <div className="card-details">
              <div className="detail-item">
                <div className="detail-label">📅 Data</div>
                <div className="detail-value">{formatDate(b)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">⏰ Horário</div>
                <div className="detail-value">{b.hora}</div>
              </div>
            </div>

            <div className="card-actions">
              {String(b.status).toUpperCase() === "PENDENTE" ? (
                <>
                  <button className="btn-payment" onClick={() => gerarPagamento(b.id)}>
                    Realizar Pagamento
                  </button>
                  <button className="btn-cancel" onClick={() => setCancelModal(b.id)}>
                    Cancelar Agendamento
                  </button>
                </>
              ) : (
                <span className="status-paid">
                  <button className="btn-rebook" onClick={() => setCancelModal(b.id)}>
                    Reagendar
                  </button>
                </span>
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
    </div>
  );
}