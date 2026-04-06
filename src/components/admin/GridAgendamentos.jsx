import React, { useState , useEffect} from 'react';
import ModalAgendamento from './ModalAgendamentos';

import '../../styles/agendamento-grid.css';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 19;
const HOUR_HEIGHT = 84;

const toMinutes = (hora = '00:00') => {
  const [h, m] = hora.split(':').map(Number);
  return (h * 60) + (m || 0);
};

const toHourString = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');
  return `${h}:${m}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPagamentoStatus = (agendamento) => {
  return (agendamento.pagamentoStatus || agendamento.status_pagamento || (agendamento.pagamentoAdiantado ? 'PAGO' : 'PENDENTE')).toUpperCase();
};

export default function GridAgendamento({ dia, mes, ano, agendamentosDoDia = [], funcionaria }) {
  const [modalAgendamento, setModalAgendamento] = useState(null);
  const [agendamentos, setAgendamentos] = useState(agendamentosDoDia);
  const DAY_START_MINUTES = DAY_START_HOUR * 60;
  const DAY_END_MINUTES = DAY_END_HOUR * 60;
  const TOTAL_MINUTES = DAY_END_MINUTES - DAY_START_MINUTES;
  const totalHoras = DAY_END_HOUR - DAY_START_HOUR;

  useEffect(() => {
    setAgendamentos(agendamentosDoDia);
  }, [dia, mes, ano, agendamentosDoDia]);
  
  const agendamentosVisiveis = agendamentos.filter((item) => item.status !== "CANCELADO");
  const agendamentosTimeline = agendamentosVisiveis
    .map((a) => {
      const inicioOriginal = toMinutes(a.hora || '08:00');
      const duracao = clamp(parseInt(a.duracaoMinutos || a.duracao || 60, 10) || 60, 15, 360);
      const inicio = clamp(inicioOriginal, DAY_START_MINUTES, DAY_END_MINUTES - 15);
      const fim = clamp(inicio + duracao, DAY_START_MINUTES + 15, DAY_END_MINUTES);
      const offset = inicio - DAY_START_MINUTES;
      const duracaoRender = fim - inicio;

      return {
        ...a,
        inicio,
        fim,
        inicioLabel: toHourString(inicio),
        fimLabel: toHourString(fim),
        top: (offset / 60) * HOUR_HEIGHT,
        height: Math.max((duracaoRender / 60) * HOUR_HEIGHT, 38),
      };
    })
    .sort((a, b) => a.inicio - b.inicio);

  const totalOcupados = agendamentosVisiveis.length;
  const minutosOcupados = agendamentosTimeline.reduce((acc, item) => acc + (item.fim - item.inicio), 0);
  const minutosLivres = Math.max(TOTAL_MINUTES - minutosOcupados, 0);
  const totalLivres = `${Math.floor(minutosLivres / 60)}h ${String(minutosLivres % 60).padStart(2, '0')}m`;
  const timelineHeight = totalHoras * HOUR_HEIGHT;
  const marcadoresHora = Array.from({ length: totalHoras + 1 }, (_, i) => DAY_START_HOUR + i);
  const marcadoresMeiaHora = Array.from({ length: totalHoras * 2 + 1 }, (_, i) => i);

  return (
    <div className="agendamento-grid">
      <div className="agendamento-grid__header">
        <span className="agendamento-grid__header-title">Horários Marcados e Disponíveis</span>
        <span className="agendamento-grid__header-chip">{funcionaria || "Profissional"}</span>
      </div>

      <div className="agendamento-grid__summary">
        <p className="agendamento-grid__title">Calendário: {String(dia).padStart(2, '0')}/{String(mes).padStart(2, '0')}/{ano}</p>
        <div className="agendamento-grid__stats" aria-label="Resumo dos horários">
          <span className="agendamento-grid__stat agendamento-grid__stat--ocupados">Ocupados: {totalOcupados}</span>
          <span className="agendamento-grid__stat agendamento-grid__stat--livres">Livres: {totalLivres}</span>
        </div>
      </div>

      <div className="agendamento-grid__timeline">
        <div className="agendamento-grid__timeline-hours" style={{ height: `${timelineHeight}px` }}>
          {marcadoresHora.map((h, idx) => (
            <span key={h} className="agendamento-grid__timeline-hour" style={{ top: `${idx * HOUR_HEIGHT}px` }}>
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>

        <div className="agendamento-grid__timeline-track" style={{ height: `${timelineHeight}px` }}>
          {marcadoresMeiaHora.map((marker) => (
            <div
              key={`line-${marker}`}
              className={`agendamento-grid__line ${marker % 2 === 0 ? 'agendamento-grid__line--full' : 'agendamento-grid__line--half'}`}
              style={{ top: `${marker * (HOUR_HEIGHT / 2)}px` }}
            />
          ))}

          {agendamentosTimeline.map((agendamento) => {
            const isTiny = agendamento.height <= 52;
            const isSmall = agendamento.height > 52 && agendamento.height <= 76;
            const pagamentoStatus = getPagamentoStatus(agendamento);

            return (
              <button
                key={agendamento.id}
                type="button"
                className={`agendamento-grid__event agendamento-grid__event--${(agendamento.status || 'PENDENTE').toLowerCase()} ${isTiny ? 'agendamento-grid__event--tiny' : ''} ${isSmall ? 'agendamento-grid__event--small' : ''}`}
                style={{ top: `${agendamento.top}px`, height: `${agendamento.height}px` }}
                onClick={() => setModalAgendamento(agendamento)}
                title={`${agendamento.cliente} • ${agendamento.inicioLabel} - ${agendamento.fimLabel} • Pagamento: ${pagamentoStatus}`}
              >
                <span className="agendamento-grid__event-time">{agendamento.inicioLabel} - {agendamento.fimLabel}</span>
                <span className="agendamento-grid__event-client">{agendamento.cliente}</span>
                <span className="agendamento-grid__event-service">{agendamento.servico || 'Serviço'}</span>
                <span className="agendamento-grid__event-payment">{pagamentoStatus === 'PAGO' ? 'Pago' : pagamentoStatus === 'PENDENTE' ? 'Pendente' : pagamentoStatus}</span>
              </button>
            );
          })}
        </div>
      </div>

      {modalAgendamento && (
        <ModalAgendamento agendamento={modalAgendamento} onClose={() => setModalAgendamento(null)} />
      )}
    </div>
  );
}