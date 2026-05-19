//src/pages/admin/Agendamentos.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewSchedule from "../../components/admin/NovoAgendamento";
import Calendar from "../../components/admin/Calendario";
import AgendamentoGrid from "../../components/admin/GridAgendamentos";
import { usePagamentoStatusCheck } from '../../js/pagamento-status-check';
import { getFuncionarias } from '../../js/funcionarias';
import { getAgendamentos, salvarAgendamento } from '../../js/agendamento';

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

const normalizarAgendamento = (agendamento) => {
  const statusNormalizado = typeof agendamento.status === 'string'
    ? agendamento.status.toUpperCase()
    : (agendamento.status ? 'CONFIRMADO' : 'PENDENTE');

  return {
    ...agendamento,
    status: statusNormalizado,
    pagamentoStatus: (agendamento.pagamentoStatus || agendamento.status_pagamento || agendamento.pagamento || '').toUpperCase()
  };
};

export default function AgendamentosPage() {
  const navigate = useNavigate();
  const [perfisProfissionais, setPerfisProfissionais] = useState({});
  const FUNCIONARIAS = Object.keys(perfisProfissionais);
  const [funcionariaAtual, setFuncionariaAtual] = useState('');

  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState('');

  const [diaAtual, setDiaAtual] = useState(() => new Date().getDate());
  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());

  const [dadosRapidos, setDadosRapidos] = useState(null);
  const { pendentes } = usePagamentoStatusCheck();

  const carregarAgendamentos = async () => {
    try {
      const agendamentosApi = await getAgendamentos();
      setAgendamentos((agendamentosApi || []).map(normalizarAgendamento));
    } catch (error) {
      console.error('[AgendamentosPage] Falha ao recarregar agendamentos:', error);
    }
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        setLoading(true);
        setErroApi('');

        const nomeLogado = localStorage.getItem("userName");
        const papelLogado = localStorage.getItem("userRole");

        const [funcionariasApi, agendamentosApi] = await Promise.all([
          getFuncionarias(),
          getAgendamentos()
        ]);

        const perfis = (funcionariasApi || []).reduce((acc, profissional) => {
          // Se o profissional é novo e não tem especialidade, colocamos "Geral"
          acc[profissional.nome] = profissional.servicos.length > 0 
            ? profissional.servicos 
            : ['Configuração Pendente'];
          return acc;
        }, {});
        
        setPerfisProfissionais(perfis);

        // LÓGICA DE SELEÇÃO INICIAL:
        // Se eu sou profissional, quero ver MINHA agenda primeiro.
        // Se eu for admin ou o nome não bater, pega a primeira da lista.
        if (papelLogado === "PROFISSIONAL" && perfis[nomeLogado]) {
          setFuncionariaAtual(nomeLogado);
        } else {
          const primeira = Object.keys(perfis)[0] || '';
          setFuncionariaAtual(primeira);
        }

        setAgendamentos((agendamentosApi || []).map(normalizarAgendamento));
      } catch (error) {
        console.error('[AgendamentosPage] Falha ao carregar dados:', error);
        setErroApi('Não foi possível carregar dados do backend. Verifique se está logado.');
      } finally {
        setLoading(false);
      }
    };

    carregarDadosIniciais();
  }, []);

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
  const adicionarAgendamento = async (novo) => {
    const [ano, mes, dia] = novo.data.split("-");
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

    try {
      const payload = {
        ...novoFormatado,
        data: novo.data,
        duracaoMinutos: parseInt(novoFormatado.duracaoMinutos, 10) || 60,
        status: (novo.status || 'PENDENTE').toUpperCase(),
        pagamento: novo.pagamentoStatus || 'PENDENTE'
      };

      await salvarAgendamento(payload);
      await carregarAgendamentos();
    } catch (error) {
      console.error('[AgendamentosPage] Falha ao salvar agendamento:', error);
      alert('Erro ao salvar agendamento no backend.');
      return;
    }

    setDadosRapidos(null);
  };

  // Filtra agendamentos da profissional e do dia selecionado
  const agendamentosDaProfissional = agendamentos.filter(a => a.funcionaria === funcionariaAtual);
  const filtrados = agendamentosDaProfissional.filter(a => a.dia === diaAtual && a.mes === mesAtual && a.ano === anoAtual);

  return (
    <div style={{ padding: '20px' }}>
      {erroApi && (
        <div style={{ marginBottom: '10px', color: '#b91c1c', fontWeight: 600 }}>
          {erroApi}
        </div>
      )}

      <div className="agendamentos-topbar">
        <div className="funcionaria-selector-box">
          <span className="funcionaria-selector-label">
            {localStorage.getItem("userRole") === "PROFISSIONAL" ? "Minha Agenda e Equipe" : "Profissionais"}
          </span>
          {localStorage.getItem("userRole") === "PROFISSIONAL" && (
              <button 
                onClick={() => navigate("/admin/configuracoes")}
                style={{
                  backgroundColor: "transparent", 
                  color: "#b8960c", 
                  border: "1px solid #b8960c", 
                  padding: "4px 10px", 
                  borderRadius: "5px", 
                  cursor: "pointer", 
                  fontSize: "0.85rem",
                  fontWeight: "bold"
                }}
                title="Configurar meus serviços"
              >
                ⚙️ Especialidades
              </button>
            )}
          <div className="aba-funcionaria">
            {loading ? (
              <span>Carregando profissionais...</span>
            ) : (
              FUNCIONARIAS.map((nome) => (
                <button
                  key={nome}
                  type="button"
                  className={`btn-app btn-funcionarias ${funcionariaAtual === nome ? 'ativo' : ''}`}
                  onClick={() => setFuncionariaAtual(nome)}
                >
                  {/*Se for o próprio profissional loggado, vai aparecer a estrelinha */}
                  {nome === localStorage.getItem("userName") ? `⭐ ${nome}` : nome}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Barra de abrir modal */}
        <NewSchedule
          aoSalvar={adicionarAgendamento}
          dadosIniciais={dadosRapidos}
          funcionaria={funcionariaAtual}
          servicosDisponiveis={perfisProfissionais[funcionariaAtual] || []}
        />
      </div>

      {/* Layout principal: calendário + grade de horários */}
      <div className="display-flex linha layout-principal" style={{ display: 'flex' }}>
        <div className="layout-principal__calendar">
          <Calendar
            agendamentos={agendamentosDaProfissional}
            selectedDay={diaAtual}
            selectedMonth={mesAtual}
            selectedYear={anoAtual}
            onDaySelect={setDiaAtual}
            onMonthChange={(m, y) => {
              const hoje = new Date();
              const mesAtualReal = hoje.getMonth() + 1;
              const anoAtualReal = hoje.getFullYear();
              const diaInicial = (m === mesAtualReal && y === anoAtualReal) ? hoje.getDate() : 1;
              setMesAtual(m);
              setAnoAtual(y);
              setDiaAtual(diaInicial);
            }}
            funcionaria={funcionariaAtual}
          />
        </div>
        <div className="layout-principal__grid">
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