import { useState, useEffect } from 'react';
import NewSchedule from "../../components/admin/NovoAgendamento";
import Calendar from "../../components/admin/Calendario";
import AgendamentoGrid from "../../components/admin/GridAgendamentos";
import { usePagamentoStatusCheck } from '../../js/pagamento-status-check';

const toMinutes = (hora = '00:00') => {
  const [h, m] = String(hora).split(':').map(Number);
  return (h * 60) + (m || 0);
};

const temConflitoHorario = (novo, existentes, funcionariaAtual) => {
  const duracaoNova = parseInt(novo.duracaoMinutos || novo.duracao || 60, 10) || 60;
  const inicioNovo = toMinutes(novo.hora || '00:00');
  const fimNovo = inicioNovo + duracaoNova;

  return existentes.some((agendamento) => {
    if ((agendamento.status || '').toUpperCase() === 'CANCELADO') return false;
    if ((agendamento.funcionaria || funcionariaAtual) !== (novo.funcionaria || funcionariaAtual)) return false;
    if (agendamento.dia !== novo.dia || agendamento.mes !== novo.mes || agendamento.ano !== novo.ano) return false;

    const duracaoExistente = parseInt(agendamento.duracaoMinutos || agendamento.duracao || 60, 10) || 60;
    const inicioExistente = toMinutes(agendamento.hora || '00:00');
    const fimExistente = inicioExistente + duracaoExistente;

    return inicioNovo < fimExistente && inicioExistente < fimNovo;
  });
};

export default function AgendamentosPage() {
  const FUNCIONARIAS = ["Ana", "Beatriz", "Camila"];
  const [funcionariaAtual, setFuncionariaAtual] = useState(FUNCIONARIAS[0]);

  // Estado de agendamentos
  const [agendamentos, setAgendamentos] = useState([
    { 
      id: 1, dia: 10, mes: 3, ano: 2026, data: "10/03/2026", servico:"Cabelo + Unha", preco: 100, 
      cliente: "João Silva", email: "Joao@gmail.com", telefone:"5511983536784", hora: "10:00", 
      status: "CONFIRMADO", funcionaria: "Ana", 
      ordem_pagamento: "46b5d26b-e627-4c24-a0b9-dc6240975f3e-JoãoSilva"
    },
    { 
      id: 2, dia: 15, mes: 3, ano: 2026, data: "15/03/2026", servico:"Cabelo + Unha", preco: 100, 
      cliente: "Maria Souza", email: "Maria@gmail.com", telefone:"5511983536784", hora: "14:00", 
      status: "PENDENTE", funcionaria: "Beatriz", 
      ordem_pagamento: "a1b2c3d4-e111-2222-3333-444455556666-MariaSouza"
    },
    { 
      id: 3, dia: 18, mes: 3, ano: 2026, data: "18/03/2026", servico:"Cabelo + Unha", preco: 1000, 
      cliente: "Carlos Pereira", email: "Carlos@gmail.com", telefone:"5511983536784", hora: "09:00", 
      status: "PENDENTE", funcionaria: "Camila", 
      ordem_pagamento: "f9e8d7c6-b555-6666-7777-888899990000-CarlosPereira"
    },
  ]);

  // Dia, mês e ano selecionados
  const [diaAtual, setDiaAtual] = useState(10);
  const [mesAtual, setMesAtual] = useState(3);
  const [anoAtual, setAnoAtual] = useState(2026);

  // Agendamento rápido
  const [dadosRapidos, setDadosRapidos] = useState(null);

  // Polling de pendentes a cada 5 segundos
  const { pendentes } = usePagamentoStatusCheck();

  useEffect(() => {
    if (!pendentes.length) return;

    console.log('[PendingPoller] Agendamentos pendentes encontrados:', pendentes);

    setAgendamentos(prev =>
      prev.map(a => {
        const encontrado = pendentes.find(p => p.id === a.id);
        return encontrado ? { ...a, ...encontrado } : a;
      })
    );
  }, [pendentes]);

  // Função para adicionar agendamento novo
  const adicionarAgendamento = (novo) => {
    const [ano, mes, dia] = novo.data.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;
    const novoFormatado = {
      ...novo,
      dia: parseInt(dia, 10),
      mes: parseInt(mes, 10),
      ano: parseInt(ano, 10),
      funcionaria: novo.funcionaria || funcionariaAtual
    };

    if (temConflitoHorario(novoFormatado, agendamentos, funcionariaAtual)) {
      alert('Conflito de horário: já existe um agendamento nesse período para essa profissional.');
      return;
    }

    setAgendamentos(prev => [
      ...prev,
      {
        ...novoFormatado,
        id: Math.random(), // ou gerar uuid
        data: dataFormatada,
        status: novo.status || "PENDENTE"
      }
    ]);
    setDadosRapidos(null);
  };

  // Filtra agendamentos da profissional e do dia selecionado
  const agendamentosDaProfissional = agendamentos.filter(a => a.funcionaria === funcionariaAtual);
  const filtrados = agendamentosDaProfissional.filter(a => a.dia === diaAtual && a.mes === mesAtual && a.ano === anoAtual);

  return (
    <div style={{ padding: '20px' }}>
      {/* Seleção de funcionária */}
      <div className="funcionaria-selector-box">
        <span className="funcionaria-selector-label">Profissional</span>
        <div className="aba-funcionaria">
          {FUNCIONARIAS.map((nome) => (
            <button
              key={nome}
              type="button"
              className={`btn-app btn-funcionarias ${funcionariaAtual === nome ? 'ativo' : ''}`}
              onClick={() => setFuncionariaAtual(nome)}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      {/* Formulário de novo agendamento */}
      <NewSchedule aoSalvar={adicionarAgendamento} dadosIniciais={dadosRapidos} funcionaria={funcionariaAtual} />

      {/* Layout principal: calendário + grade de horários */}
      <div className="display-flex linha layout-principal" style={{ display: 'flex', gap: '40px', height: 'calc(100vh - 280px)', marginTop: '20px' }}>
        <div className="layout-principal__calendar">
          <Calendar
            agendamentos={agendamentosDaProfissional}
            selectedDay={diaAtual}
            selectedMonth={mesAtual}
            selectedYear={anoAtual}
            onDaySelect={setDiaAtual}
            onMonthChange={(m, y) => { setMesAtual(m); setAnoAtual(y); setDiaAtual(1); }}
            funcionaria={funcionariaAtual}
          />
        </div>
        <div className="layout-principal__grid" style={{ flex: 1, height: '100%' }}>
          <AgendamentoGrid
            dia={diaAtual}
            mes={mesAtual}
            ano={anoAtual}
            agendamentosDoDia={filtrados}
            funcionaria={funcionariaAtual}
          />
        </div>
      </div>
    </div>
  );
}