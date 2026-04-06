import React from 'react';
import { ChevronLeft, ChevronRight, User, Calendar as CalIcon, Clock } from 'lucide-react';
import '../../styles/calendar.css';
import '../../styles/agendamento-card.css';

export const CardsAgendamentoMarcado = ({ agendamento }) => (
  <div className="agendamento-card">
    <div className="agendamento-card__body">
      <div className="agendamento-card__left">
        <div className="agendamento-card__avatar" />
        <div>
          <div className="agendamento-card__client-name">{agendamento.cliente}</div>
          <span className='agendamento-card__detail-item'><CalIcon size={12}/> Serviço: {agendamento.servico}</span>
          <div className="agendamento-card__details">
            <span className="agendamento-card__detail-item"><User size={12}/> Cliente</span>
            <span className="agendamento-card__detail-item"><CalIcon size={12}/> {agendamento.data}</span>
            <span className="agendamento-card__detail-item"><Clock size={12}/> {agendamento.hora}</span>
          </div>
        </div>
      </div>
      <div className={`agendamento-card__status agendamento-card__status--${agendamento.status?.toLowerCase() || 'pendente'}`}>
        {agendamento.status || 'PENDENTE'}
      </div>
    </div>

    <div className="agendamento-card__footer">
      <span className="agendamento-card__footer-label">Ordem de Serviço:</span>
      <span className="agendamento-card__footer-ordem">{agendamento.ordem_pagamento}</span>
    </div>
  </div>
);

export default function Calendario({ agendamentos, selectedDay, selectedMonth, selectedYear, onDaySelect, onMonthChange, funcionaria }) {
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const hoje = new Date();

  const getDaysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const firstWeekday = new Date(selectedYear, selectedMonth - 1, 1).getDay();
  const daysCount = getDaysInMonth(selectedMonth, selectedYear);
  const dias = Array.from({ length: daysCount }, (_, i) => i + 1);

  const temAgendamento = (dia) => agendamentos.some(a => a.dia === dia && a.mes === selectedMonth && a.ano === selectedYear && a.funcionaria === funcionaria);
  const ehHoje = (dia) => (
    dia === hoje.getDate()
    && selectedMonth === (hoje.getMonth() + 1)
    && selectedYear === hoje.getFullYear()
  );

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12, selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1, selectedYear);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onMonthChange(1, selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1, selectedYear);
    }
  };

  return (
    <div className="calendario-wrapper">
      <div className="calendario-header">
        <button onClick={handlePrevMonth}><ChevronLeft size={18} /></button>
        <div className="calendario-header__center">
          <span className="mes-label">{`${MESES[selectedMonth - 1]} ${selectedYear}`}</span>
          {funcionaria && (
            <span className="calendario-funcionaria-tag">
              <User size={13} /> {funcionaria}
            </span>
          )}
        </div>
        <button onClick={handleNextMonth}><ChevronRight size={18} /></button>
      </div>

      <div className="calendario-grid">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="dia-semana">{d}</div>
        ))}
        
        {/* Offset inicial */}
        {Array.from({ length: firstWeekday }, (_, i) => <div key={`vazio-${i}`} className="dia-vazio" />)}

        {dias.map(dia => {
          const comAgendamento = temAgendamento(dia);
          return (
          <button
            key={dia}
            type="button"
            className={`dia-celula ${selectedDay === dia ? 'selecionado' : ''} ${comAgendamento ? 'com-agendamento' : ''} ${ehHoje(dia) ? 'hoje' : ''}`}
            onClick={() => onDaySelect(dia)}
            aria-label={`Dia ${dia}${comAgendamento ? ', com agendamento' : ''}${selectedDay === dia ? ', selecionado' : ''}`}
          >
            <span className="dia-numero">{dia}</span>
            {comAgendamento && (
              <div className="badge-agendamento" title="Agendamentos marcados neste dia">📅</div>
            )}
          </button>
        )})}
      </div>

      <div className="calendario-mobile-hint">
        Toque no dia para ver horários • Selecionado: {selectedDay.toString().padStart(2, '0')}/{selectedMonth.toString().padStart(2, '0')}/{selectedYear}
      </div>
    </div>
  );
}