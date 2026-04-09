import { useState } from 'react';
import '../styles/agendamentos-usuario.css'

const TIME_SLOTS = ["09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00"];

const initialBookings = [
  {
    id: 1, service: "Corte Feminino", professional: "Ana Paula", specialty: "Cabelo",
    status: "confirmed", price: "R$ 120", duration: "1h",
    date: "2026-03-17", time: "14:00", location: "Av. Elegância, 1000", contact: "(11) 9999-9999",
  },
  {
    id: 2, service: "Maquiagem Social", professional: "Daniela Santos", specialty: "Maquiagem",
    status: "confirmed", price: "R$ 150", duration: "1h",
    date: "2026-03-21", time: "10:00", location: "Av. Elegância, 1000", contact: "(11) 9999-9999",
  },
  {
    id: 3, service: "Hidratação Premium", professional: "Beatriz Costa", specialty: "Cabelo",
    status: "done", price: "R$ 150", duration: "1h30",
    date: "2026-03-09", time: "16:00", location: "Av. Elegância, 1000", contact: "(11) 9999-9999",
  },
];

function formatDate(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" })
    .replace(/^\w/, c => c.toUpperCase());
}

function StatusBadge({ status }) {
  if (status === "confirmed") return <span className="badge badge-confirmed"><span className="badge-dot"/>Confirmado</span>;
  if (status === "cancelled") return <span className="badge badge-cancelled"><span className="badge-dot"/>Cancelado</span>;
  if (status === "done")      return <span className="badge badge-done"><span className="badge-dot"/>Concluído</span>;
  return null;
}

const TABS = [
  { key: "upcoming", label: "Próximos Agendamentos" },
  { key: "history",  label: "Histórico" },
  { key: "all",      label: "Todos" },
];

export default function AgendamentosUsuário() {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Cancel modal
  const [cancelModal, setCancelModal] = useState(null); // booking id

  // Reschedule modal
  const [rescheduleModal, setRescheduleModal] = useState(null); // booking
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // ── CRUD: Cancel ──
  function handleCancelConfirm() {
    setBookings(prev => prev.map(b => b.id === cancelModal ? { ...b, status: "cancelled" } : b));
    setCancelModal(null);
  }

  // ── CRUD: Reschedule (Update) ──
  function openReschedule(booking) {
    setRescheduleModal(booking);
    setNewDate(booking.date);
    setNewTime(booking.time);
  }
  function handleRescheduleConfirm() {
    setBookings(prev => prev.map(b =>
      b.id === rescheduleModal.id ? { ...b, date: newDate, time: newTime } : b
    ));
    setRescheduleModal(null);
  }

  // ── CRUD: Rebook (Create clone as new confirmed) ──
  function handleRebook(booking) {
    const newBooking = {
      ...booking,
      id: Date.now(),
      status: "confirmed",
      date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      time: booking.time,
    };
    setBookings(prev => [newBooking, ...prev]);
  }

  // ── Filter tabs ──
  const today = new Date(); today.setHours(0,0,0,0);
  const filtered = bookings.filter(b => {
    const bDate = new Date(b.date + "T12:00:00");
    if (activeTab === "upcoming") return b.status === "confirmed" && bDate >= today;
    if (activeTab === "history")  return b.status === "done" || b.status === "cancelled" || bDate < today;
    return true;
  });

  return (
    <>

      <div className="page">
        <div className="page-hero">
          <h1>Meus <em>Agendamentos</em></h1>
          <p>Gerencie seus horários e acompanhe seu histórico</p>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button key={t.key} className={`tab ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty">
            <div className="empty-icon">📅</div>
            <p>Nenhum agendamento encontrado nesta categoria.</p>
          </div>
        )}

        {filtered.map(b => {
          const isUpcoming = b.status === "confirmed" && new Date(b.date + "T12:00:00") >= today;
          const isDone = b.status === "done";
          const isCancelled = b.status === "cancelled";

          return (
            <div className="booking-card" key={b.id}>
              <div className="card-header">
                <div className="card-header-left">
                  <span className="card-service-name">{b.service}</span>
                  <StatusBadge status={b.status} />
                </div>
                <div className="card-header-right">
                  <div className="card-price">{b.price}</div>
                  <div className="card-duration">{b.duration}</div>
                </div>
              </div>

              <div className="card-professional">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {b.professional} · {b.specialty}
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Data
                  </div>
                  <div className="detail-value">{formatDate(b.date)}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Horário
                  </div>
                  <div className="detail-value">{b.time}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Local
                  </div>
                  <div className="detail-value">{b.location}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                    Contato
                  </div>
                  <div className="detail-value">{b.contact}</div>
                </div>
              </div>

              <hr className="card-divider" />

              <div className="card-actions">
                {isUpcoming && (
                  <>
                    <button className="btn-reschedule" onClick={() => openReschedule(b)}>Reagendar</button>
                    <button className="btn-cancel" onClick={() => setCancelModal(b.id)}>Cancelar Agendamento</button>
                  </>
                )}
                {(isDone || isCancelled) && (
                  <button className="btn-rebook" onClick={() => handleRebook(b)}>Agendar Novamente</button>
                )}
                {!isUpcoming && !isDone && !isCancelled && (
                  <>
                    <button className="btn-reschedule" onClick={() => openReschedule(b)}>Reagendar</button>
                    <button className="btn-cancel" onClick={() => setCancelModal(b.id)}>Cancelar Agendamento</button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cancelModal !== null && (
        <div className="modal-overlay" onClick={() => setCancelModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Cancelar Agendamento</h2>
            <p>
              Tem certeza que deseja cancelar este agendamento?<br />
              Essa ação não pode ser desfeita. Para remarcar, use a opção <strong>Reagendar</strong>.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setCancelModal(null)}>Voltar</button>
              <button className="btn-modal-confirm" onClick={handleCancelConfirm}>Sim, cancelar</button>
            </div>
          </div>
        </div>
      )}

      {rescheduleModal !== null && (
        <div className="modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reagendar</h2>
            <p style={{ marginBottom: 20 }}>
              Escolha uma nova data e horário para <strong>{rescheduleModal.service}</strong>.
            </p>

            <div className="field">
              <label>Nova Data</label>
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => { setNewDate(e.target.value); setNewTime(""); }}
              />
            </div>

            <div className="field">
              <label>Novo Horário</label>
              <div className="time-grid-sm">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    className={`time-slot-sm ${newTime === t ? "selected" : ""}`}
                    onClick={() => setNewTime(t)}
                    type="button"
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setRescheduleModal(null)}>Cancelar</button>
              <button
                className="btn-modal-save"
                disabled={!newDate || !newTime}
                onClick={handleRescheduleConfirm}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
