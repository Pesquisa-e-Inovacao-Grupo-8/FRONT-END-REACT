import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMeusPacotes } from "../js/pacotes";
import { agendarPeloCliente } from "../js/agendamento";
import { getFuncionarias } from "../js/funcionarias";
import "../styles/meus-pacotes.css";

const HORARIOS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const HORARIOS_INDISPONIVEIS = ["12:00", "16:00"];

function formatarValidade(data) {
  if (!data) return "Validade não informada";
  return `Válido até ${new Date(data).toLocaleDateString("pt-BR")}`;
}

export default function MeusPacotes() {
  const navigate = useNavigate();
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [profissionais, setProfissionais] = useState([]);
  const [agendamento, setAgendamento] = useState(null);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mensagemAgendamento, setMensagemAgendamento] = useState("");

  useEffect(() => {
    getMeusPacotes()
      .then(setPacotes)
      .catch(() => setErro("Não foi possível carregar seus pacotes."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getFuncionarias().then(setProfissionais);
  }, []);

  const profissionaisDoServico = agendamento
    ? profissionais.filter(profissional => (profissional.servicos || []).some(vinculo => {
        const vinculoId = typeof vinculo === "object"
          ? vinculo.id || vinculo.servico?.id
          : vinculo;
        return String(vinculoId) === String(agendamento.servico.id);
      }))
    : [];

  function abrirAgendamento(pacote, servico) {
    setAgendamento({ pacote, servico });
    setData("");
    setHorario("");
    setMensagemAgendamento("");
  }

  async function confirmarAgendamento() {
    if (!agendamento || !agendamento.profissionalId || !data || !horario) return;

    try {
      setSalvando(true);
      await agendarPeloCliente({
        serviceId: agendamento.servico.id,
        professionalId: agendamento.profissionalId,
        date: data,
        time: horario,
        duracaoServico: agendamento.servico.duracaoMinutos,
        clientePacoteServicoId: agendamento.servico.clientePacoteServicoId
      });
      setMensagemAgendamento("Agendamento criado. O saldo será atualizado após a confirmação do pagamento.");
    } catch (error) {
      setMensagemAgendamento(error.response?.data?.message || "Não foi possível criar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <main className="my-packages page"><p className="my-packages-state">Carregando seus pacotes...</p></main>;
  if (erro) return <main className="my-packages page"><p className="my-packages-state my-packages-error">{erro}</p></main>;

  return (
    <main className="my-packages page">
      <header className="page-hero">
        <h1>Meus <em>Pacotes</em></h1>
        <p>Acompanhe seus serviços disponíveis e agende seu próximo horário.</p>
      </header>

      {pacotes.length === 0 ? (
        <section className="my-packages-state">
          <div className="my-packages-state__icon" aria-hidden="true">✦</div>
          <h2>Você ainda não possui pacotes</h2>
          <p>Adquira um pacote para aproveitar seus serviços com condições especiais.</p>
          <button className="package-action" onClick={() => navigate("/pacotes")}>Ver pacotes</button>
        </section>
      ) : (
        <section className="my-packages-list" aria-label="Pacotes adquiridos">
          {pacotes.map(pacote => (
            <article className={`package-card${pacote.ativo ? "" : " package-card--inactive"}`} key={pacote.id}>
              <div className="package-card__header">
                <div>
                  <p className="package-card__eyebrow">Pacote adquirido</p>
                  <h2>{pacote.nome}</h2>
                </div>
                <span className={`package-status${pacote.ativo ? " package-status--active" : ""}`}>
                  {pacote.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <p className="package-card__description">{pacote.descricao}</p>
              <p className="package-card__validity">{formatarValidade(pacote.dtExpiracao)}</p>

              <div className="package-services">
                <h3>Serviços disponíveis</h3>
                <div className="package-services__grid">
                  {pacote.servicos.map(servico => {
                    const podeAgendar = pacote.ativo && servico.quantidadeDisponivel > 0 && servico.clientePacoteServicoId;
                    return (
                      <div className="package-service" key={`${pacote.id}-${servico.id}`}>
                        <div>
                          <h4>{servico.nome}</h4>
                          <p>{servico.quantidadeDisponivel} de {servico.quantidadeConfigurada || servico.quantidadeDisponivel} agendamentos disponíveis</p>
                        </div>
                        <button
                          className="package-action package-action--small"
                          disabled={!podeAgendar}
                          onClick={() => abrirAgendamento(pacote, servico)}
                        >
                          {servico.quantidadeDisponivel > 0 ? "Agendar" : "Sem saldo"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {agendamento && (
        <div className="package-booking-backdrop" role="presentation" onClick={() => setAgendamento(null)}>
          <section className="package-booking-modal" role="dialog" aria-modal="true" aria-labelledby="package-booking-title" onClick={event => event.stopPropagation()}>
            <div className="package-booking-modal__header">
              <div>
                <p className="package-card__eyebrow">Agendamento pelo pacote</p>
                <h2 id="package-booking-title">{agendamento.servico.nome}</h2>
              </div>
              <button className="package-booking-close" onClick={() => setAgendamento(null)} aria-label="Fechar">×</button>
            </div>

            {mensagemAgendamento ? (
              <div className="package-booking-result">
                <div className="package-booking-result__icon" aria-hidden="true">✓</div>
                <p>{mensagemAgendamento}</p>
                <button className="package-action" onClick={() => setAgendamento(null)}>Fechar</button>
              </div>
            ) : (
              <>
                <div className="package-booking-summary">
                  <span>{agendamento.pacote.nome}</span>
                  <strong>{agendamento.servico.quantidadeDisponivel} usos disponíveis</strong>
                </div>

                <label className="package-booking-field">
                  Profissional
                  <select value={agendamento.profissionalId || ""} onChange={event => setAgendamento(prev => ({ ...prev, profissionalId: event.target.value }))}>
                    <option value="">Selecione um profissional</option>
                    {profissionaisDoServico.map(profissional => <option key={profissional.id} value={profissional.id}>{profissional.nome}</option>)}
                  </select>
                </label>

                <label className="package-booking-field">
                  Data
                  <input type="date" min={new Date().toISOString().split("T")[0]} value={data} onChange={event => setData(event.target.value)} />
                </label>

                <div className="package-booking-field">
                  <span>Horário</span>
                  <div className="package-time-grid">
                    {HORARIOS.map(horarioDisponivel => {
                      const indisponivel = HORARIOS_INDISPONIVEIS.includes(horarioDisponivel);
                      return <button key={horarioDisponivel} type="button" disabled={indisponivel} className={horario === horarioDisponivel ? "selected" : ""} onClick={() => setHorario(horarioDisponivel)}>{horarioDisponivel}</button>;
                    })}
                  </div>
                </div>

                <div className="package-booking-actions">
                  <button className="package-booking-cancel" onClick={() => setAgendamento(null)}>Cancelar</button>
                  <button className="package-action" disabled={salvando || !agendamento.profissionalId || !data || !horario} onClick={confirmarAgendamento}>
                    {salvando ? "Salvando..." : "Confirmar agendamento"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
