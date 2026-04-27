import { useState, useEffect } from 'react';
import { getAgendamentosPorCliente, atualizarStatusAgendamento } from '../js/agendamento.js';
import '../styles/agendamentos-usuario.css'

const ID_CLIENTE_TESTE = '523e4567-e89b-12d3-a456-426614174001';

function formatDate(dateStr) {
  const d = new Date(dateStr.ano, dateStr.mes - 1, dateStr.dia, 12, 0, 0);
  return d.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    .replace(/^\w/, c => c.toUpperCase());
}

function StatusBadge({ status }) {
  const s = String(status).toUpperCase();
  if (s === "CONFIRMADO") return <span className="badge badge-confirmed"><span className="badge-dot"/>Confirmado</span>;
  if (s === "CANCELADO") return <span className="badge badge-cancelled"><span className="badge-dot"/>Cancelado</span>;
  if (s === "FINALIZADO" || s === "DONE") return <span className="badge badge-done"><span className="badge-dot"/>Concluído</span>;
  return <span className="badge badge-pending"><span className="badge-dot"/>Pendente</span>;
}

export default function AgendamentosUsuário() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelModal, setCancelModal] = useState(null);

  const carregarMeusDados = async () => {
    setLoading(true);
    const dados = await getAgendamentosPorCliente(ID_CLIENTE_TESTE);
    setBookings(dados);
    setLoading(false);
  };

  useEffect(() => {
    carregarMeusDados();
  }, []);

  async function handleCancelConfirm() {
    try {
      await atualizarStatusAgendamento(cancelModal, 'CANCELADO');
      setCancelModal(null);
      carregarMeusDados(); // Recarrega a lista do banco
    } catch (error) {
      alert("Erro ao cancelar agendamento.");
    }
  }

  const today = new Date(); today.setHours(0,0,0,0);
  
  const filtered = bookings.filter(b => {
    const bDate = new Date(b.ano, b.mes - 1, b.dia);
    const status = String(b.status).toUpperCase();

    // MUDANÇA: Aceitando PENDENTE na aba de Próximos
    if (activeTab === "upcoming") {
        return (status === "CONFIRMADO" || status === "PENDENTE") && bDate >= today;
    }
    
    if (activeTab === "history") {
        return status === "FINALIZADO" || status === "CANCELADO" || bDate < today;
    }
    
    return true;
  });

  if (loading) return <div className="page"><p>Carregando seus compromissos...</p></div>;

  return (
    <div className="page">
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
                <div className="card-price">Pendente</div> {/* Preço virá do banco futuramente */}
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
               {/* MUDANÇA: Botão aparece para CONFIRMADO ou PENDENTE */}
              {(String(b.status).toUpperCase() === "CONFIRMADO" || String(b.status).toUpperCase() === "PENDENTE") && (
                <button className="btn-cancel" onClick={() => setCancelModal(b.id)}>Cancelar Agendamento</button>
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