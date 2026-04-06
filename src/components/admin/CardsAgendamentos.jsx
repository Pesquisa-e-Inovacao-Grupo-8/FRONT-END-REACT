import { CardsAgendamentoMarcado } from "./Calendario";

// OcupadoSlot.jsx
export function OcupadoSlot({ agendamento, onClick }) {
  return (
    <div key={agendamento.id} className="agendamento-grid__card-wrapper agendamento-grid__occupied-slot" onClick={onClick} style={{ cursor: 'pointer' }}>
      <CardsAgendamentoMarcado agendamento={agendamento} />
    </div>
  );
}

// Disponivel Slot.jsx
export function DisponivelSlot({ hora, onQuickSchedule }) {
  return (
    <div key={hora} className="agendamento-grid__empty-slot">
      <span className="agendamento-grid__time">{hora}</span>
      <span className="agendamento-grid__available">HORÁRIO DISPONÍVEL</span>
      <button className="agendamento-grid__quick-btn" onClick={() => onQuickSchedule(hora)} title={`Agendar para ${hora}`}>+</button>
    </div>
  );
}