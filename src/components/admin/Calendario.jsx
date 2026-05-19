//src/components/admin/Calendario.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import '../../styles/calendar.css';

export default function Calendario({ agendamentos, selectedDay, selectedMonth, selectedYear, onDaySelect, onMonthChange, funcionaria }) {
  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const hoje = new Date();
  const hojeSemHorario = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

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

  const ehPassado = (dia) => {
    const dataDia = new Date(selectedYear, selectedMonth - 1, dia);
    return dataDia < hojeSemHorario;
  };

  const podeVoltarMes = (() => {
    const inicioMesSelecionado = new Date(selectedYear, selectedMonth - 1, 1);
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return inicioMesSelecionado > inicioMesAtual;
  })();

  const handlePrevMonth = () => {
    if (!podeVoltarMes) return;
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
        <button onClick={handlePrevMonth} disabled={!podeVoltarMes} aria-label="Mês anterior"><ChevronLeft size={18} /></button>
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
          const isHoje = ehHoje(dia);
          const isPassado = ehPassado(dia);
          return (
          <button
            key={dia}
            type="button"
            className={`dia-celula ${selectedDay === dia ? 'selecionado' : ''} ${comAgendamento ? 'com-agendamento' : ''} ${isHoje ? 'hoje' : ''} ${isPassado ? 'dia-celula--passado' : ''}`}
            onClick={() => !isPassado && onDaySelect(dia)}
            disabled={isPassado}
            aria-label={`Dia ${dia}${isPassado ? ', indisponível' : ''}${comAgendamento ? ', com agendamento' : ''}${selectedDay === dia ? ', selecionado' : ''}`}
          >
            {isHoje && <span className="dia-hoje-badge">Hoje</span>}
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