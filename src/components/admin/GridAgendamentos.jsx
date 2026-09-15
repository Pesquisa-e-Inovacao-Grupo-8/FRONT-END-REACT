import React, { useState, useEffect } from 'react';
import ModalAgendamento from './ModalAgendamentos';
import '../../styles/agendamento-grid.css';
import api from '../../api';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 19;

const MINUTOS_POR_HORA = 60;
const ALTURA_POR_HORA = 437;
const AJUSTE_ALTURA_EVENTO = 5;
const INTERVALO_MARCACAO_MINUTOS = 10;

const toMinutes = (hora = '00:00') => {
  const [h, m] = String(hora).split(':').map(Number);
  return (h * 60) + (m || 0);
};

const toHourString = (minutes) => {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0');
  const m = String(minutes % 60).padStart(2, '0');

  return `${h}:${m}`;
};

const getPagamentoStatus = (agendamento) => {
  return (
    agendamento.pagamentoStatus
    || agendamento.status_pagamento
    || agendamento.pagamento
    || (agendamento.pagamentoAdiantado ? 'PAGO' : 'PENDENTE')
  ).toUpperCase();
};

const getPagamentoVisual = (status = '') => {
  if (['FINALIZADO', 'CONCLUIDO', 'CONCLUÍDO'].includes(status)) {
    return {
      label: 'Finalizado',
      className: 'finalizado'
    };
  }

  if (['PAGO', 'CONFIRMADO', 'APROVADO'].includes(status)) {
    return {
      label: 'Confirmado',
      className: 'confirmado'
    };
  }

  return {
    label: 'Pendente',
    className: 'pendente'
  };
};

export default function GridAgendamento({
  dia,
  mes,
  ano,
  agendamentosDoDia = [],
  funcionaria,
  mostrarProfissional = true,
  todasAsProfissionais = false,
  profissionais = [],
  onAtualizar
}) {
  const [modalAgendamento, setModalAgendamento] = useState(null);
  const [agendamentos, setAgendamentos] = useState(agendamentosDoDia);
  const [servicos, setServicos] = useState([]);

  /*
   * Mantém os agendamentos sincronizados
   * com o componente pai.
   */
  useEffect(() => {
    setAgendamentos(agendamentosDoDia);
  }, [dia, mes, ano, agendamentosDoDia]);

  /*
   * Busca os serviços para descobrir a duração
   * quando o agendamento não possui duracaoMinutos.
   */
  useEffect(() => {
    let ativo = true;

    async function carregarServicos() {
      try {
        const response = await api.get('/servicos');

        if (ativo) {
          setServicos(response.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);

        if (ativo) {
          setServicos([]);
        }
      }
    }

    carregarServicos();

    return () => {
      ativo = false;
    };
  }, []);

  /*
   * Remove cancelados.
   */
  const agendamentosVisiveis = agendamentos.filter(
    item => item.status !== 'CANCELADO'
  );

  const profissionaisDaTimeline = todasAsProfissionais
    ? profissionais
    : [funcionaria];

  /*
   * Descobre a duração correta.
   *
   * Prioridade:
   *
   * 1. duracaoMinutos do agendamento
   * 2. duracao do agendamento
   * 3. duração cadastrada no serviço
   * 4. 60 minutos
   */
  const getDuracaoAgendamento = (agendamento) => {
    const duracaoDoAgendamento = Number(
      agendamento.duracaoMinutos ?? agendamento.duracao
    );

    if (
      Number.isFinite(duracaoDoAgendamento) &&
      duracaoDoAgendamento > 0
    ) {
      return duracaoDoAgendamento;
    }

    const servico = servicos.find((s) => {
      const mesmoId =
        String(s.id) === String(agendamento.servicoId);

      const mesmoNome =
        String(s.nome || '').trim().toLowerCase() ===
        String(agendamento.servico || '').trim().toLowerCase();

      return mesmoId || mesmoNome;
    });

    const duracaoDoServico = Number(
      servico?.duracaoMinutos
    );

    if (
      Number.isFinite(duracaoDoServico) &&
      duracaoDoServico > 0
    ) {
      return duracaoDoServico;
    }

    return 60;
  };

  /*
   * Cria apenas as linhas visuais das horas.
   *
   * 08:00
   * 09:00
   * 10:00
   * ...
   * 19:00
   */
  const raiasHorarios = Array.from(
    {
      length: DAY_END_HOUR - DAY_START_HOUR
    },
    (_, i) => {
      const horaInicio = DAY_START_HOUR + i;

      return {
        horaLabel: `${String(horaInicio).padStart(2, '0')}:00`
      };
    }
  );

  /*
   * Calcula a posição vertical do agendamento.
   *
   * Exemplo:
   *
   * 08:00 -> top 0
   * 08:30 -> top 40
  * 09:00 -> top 96
  * 09:30 -> top 144
   */
  const getEventPosition = (agendamento) => {
    const inicio = toMinutes(
      agendamento.hora || '08:00'
    );

    const duracao = getDuracaoAgendamento(
      agendamento
    );

    const inicioDaAgenda =
      DAY_START_HOUR * MINUTOS_POR_HORA;

    const top =
      ((inicio - inicioDaAgenda) / MINUTOS_POR_HORA) *
      ALTURA_POR_HORA;

    const height =
      (duracao / MINUTOS_POR_HORA) *
      ALTURA_POR_HORA;

    return {
      top: Math.max(0, top),
      height: Math.max(30, height + AJUSTE_ALTURA_EVENTO),
      inicio,
      duracao
    };
  };

  return (
    <div className={`agendamento-grid ${todasAsProfissionais ? 'agendamento-grid--todas' : ''}`}>

      {/* ============================================================
          CABEÇALHO
          ============================================================ */}

      <div className="agendamento-grid__header">
        <span className="agendamento-grid__header-title">
          Timeline - {String(dia).padStart(2, '0')}/
          {String(mes).padStart(2, '0')}/
          {ano}
        </span>

        {mostrarProfissional && (
          <span className="agendamento-grid__header-chip">
            {todasAsProfissionais ? 'Todas as profissionais' : (funcionaria || 'Profissional')}
          </span>
        )}
      </div>

      {/* ============================================================
          RESUMO
          ============================================================ */}

      <div className="agendamento-grid__summary">
        <p className="agendamento-grid__title">
          Calendário:{' '}
          {String(dia).padStart(2, '0')}/
          {String(mes).padStart(2, '0')}/
          {ano}
        </p>

        <div className="agendamento-grid__stats">
          <span className="agendamento-grid__stat agendamento-grid__stat--ocupados">
            Ocupados: {agendamentosVisiveis.length}
          </span>
        </div>
      </div>

      <div className="agendamento-grid__timeline-scroll">
        {/* ============================================================
            TIMELINE
            ============================================================ */}

      <div
        className="agendamento-grid__dynamic-timeline"
        style={todasAsProfissionais ? {
          minWidth: `calc(var(--agenda-time-rail, 56px) + ${Math.max(profissionaisDaTimeline.length, 1) * 220}px)`
        } : undefined}
      >

        {todasAsProfissionais && (
          <div
            className="agendamento-grid__professional-columns"
            style={{
              gridTemplateColumns: `var(--agenda-time-rail, 56px) repeat(${Math.max(profissionaisDaTimeline.length, 1)}, minmax(var(--professional-column-min, 220px), 1fr))`,
              minWidth: `calc(var(--agenda-time-rail, 56px) + ${Math.max(profissionaisDaTimeline.length, 1) * 220}px)`
            }}
          >
            <span aria-hidden="true" />
            {profissionaisDaTimeline.map((nome) => (
              <span key={nome} className="agendamento-grid__professional-column-title">
                {nome}
              </span>
            ))}
          </div>
        )}

        <div className="agendamento-grid__timeline-body">

          {/* ========================================================
              LINHAS DAS HORAS
              ======================================================== */}

          <div className="agendamento-grid__hour-lines">

            {raiasHorarios.map((raia) => (
              <div
                key={raia.horaLabel}
                className="agendamento-grid__hour-row"
              >
                <span className="agendamento-grid__raia-time">
                  {raia.horaLabel}
                </span>

                <div className="agendamento-grid__hour-line" />

                <div className="agendamento-grid__minute-lines">
                  {Array.from(
                    {
                      length: MINUTOS_POR_HORA / INTERVALO_MARCACAO_MINUTOS - 1
                    },
                    (_, index) => {
                      const minuto = (index + 1) * INTERVALO_MARCACAO_MINUTOS;
                      const hora = raia.horaLabel.split(':')[0];
                      const minutoLabel = `${hora}:${String(minuto).padStart(2, '0')}`;

                      return (
                        <div
                          key={minuto}
                          className="agendamento-grid__minute-line"
                          style={{
                            top: `${(minuto / MINUTOS_POR_HORA) * 100}%`
                          }}
                        >
                          <span className="agendamento-grid__minute-label">
                            {minutoLabel}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            ))}

            {/* Linha final das 19:00 */}
            <div className="agendamento-grid__hour-row agendamento-grid__hour-row--final">
              <span className="agendamento-grid__raia-time">
                {String(DAY_END_HOUR).padStart(2, '0')}:00
              </span>

              <div className="agendamento-grid__hour-line" />
            </div>

          </div>

          {/* ========================================================
              EVENTOS
              ======================================================== */}

          <div
            className="agendamento-grid__events-layer"
            style={{
              gridTemplateColumns: `repeat(${Math.max(profissionaisDaTimeline.length, 1)}, minmax(220px, 1fr))`
            }}
          >

            {profissionaisDaTimeline.map((nomeProfissional, profissionalIndex) => (
              <div
                key={nomeProfissional || profissionalIndex}
                className="agendamento-grid__professional-column"
              >
              {agendamentosVisiveis
                .filter(agendamento => agendamento.funcionaria === nomeProfissional)
                .map((agendamento) => {

              const {
                top,
                height,
                inicio,
                duracao
              } = getEventPosition(agendamento);

              const fim = inicio + duracao;

              const fimLabel = toHourString(fim);

              const pagamentoStatus =
                getPagamentoStatus(agendamento);

              const pagamentoVisual =
                getPagamentoVisual(pagamentoStatus);

              return (
                <button
                  key={`${nomeProfissional}-${agendamento.id}`}
                  type="button"
                  className={`agendamento-grid__event agendamento-grid__event--coluna-${profissionalIndex % 6} agendamento-grid__event--${(
                    agendamento.status || 'PENDENTE'
                  ).toLowerCase()}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`
                  }}
                  onClick={() =>
                    setModalAgendamento(agendamento)
                  }
                >

                  <div className="agendamento-grid__event-time-group">

                    <span className="agendamento-grid__event-time">
                      {agendamento.hora || '--:--'} - {fimLabel}
                    </span>

                    <span className="agendamento-grid__event-service">
                      {agendamento.servico || 'Serviço'}
                    </span>

                  </div>

                  <span className="agendamento-grid__event-client">
                    {agendamento.cliente || 'Cliente'}
                  </span>

                  <span
                    className={`agendamento-grid__event-payment agendamento-grid__event-payment--${pagamentoVisual.className}`}
                  >
                    {pagamentoVisual.label}
                  </span>

                </button>
              );
                })}
              </div>
            ))}

          </div>

        </div>

      </div>
      </div>

      {/* ============================================================
          MODAL
          ============================================================ */}

      {modalAgendamento && (
        <ModalAgendamento
          agendamento={modalAgendamento}
          onClose={() => setModalAgendamento(null)}
          onAtualizar={onAtualizar}
        />
      )}

    </div>
  );
}
