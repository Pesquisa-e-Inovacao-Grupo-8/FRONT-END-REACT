//src/pages/Agendamento.jsx
import { useState, useEffect, Fragment } from "react";
import { useSearchParams } from "react-router-dom";
import { getServicos, agendarPeloCliente } from "../js/agendamento.js";
import { getFuncionarias } from "../js/funcionarias.js";
import { buscarMeusDados } from "../validate-access";
import api from "../api";
import "../styles/agendamento-usuario.css";

const STEP_LABELS = ["Serviço", "Data e Hora", "Seus Dados"];
const HORARIOS_POR_PAGINA = 20;

export default function Agendamento() {
  const [searchParams] = useSearchParams();
  const pacoteServicoId = searchParams.get("clientePacoteServicoId");
  const servicoPacoteId = searchParams.get("servicoId");
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados Dinâmicos puxados do Spring Boot
  const [servicosDb, setServicosDb] = useState([]);
  const [profissionaisDb, setProfissionaisDb] = useState([]);

  // Step 1
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [step1Errors, setStep1Errors] = useState({});

  // Step 2
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
    const [paginaHorarios, setPaginaHorarios] = useState(0);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [step2Errors, setStep2Errors] = useState({});

  // Step 3
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [step3Errors, setStep3Errors] = useState({});

  const servicosDisponiveis = servicosDb.filter((servico) => (
    !servicoPacoteId || String(servico.id) === String(servicoPacoteId)
  ));

  const profissionaisDoServico = profissionaisDb.filter((profissional) => (
    (profissional.servicos || []).some((vinculo) => {
      const vinculoId = typeof vinculo === "object"
        ? vinculo.id || vinculo.servico?.id
        : vinculo;
      return String(vinculoId) === String(serviceId);
    })
  ));

  const servicoSelecionado = servicosDb.find(servico => String(servico.id) === String(serviceId));
  const horariosDaPagina = horariosDisponiveis.slice(
    paginaHorarios * HORARIOS_POR_PAGINA,
    (paginaHorarios + 1) * HORARIOS_POR_PAGINA
  );
  const totalPaginasHorarios = Math.ceil(horariosDisponiveis.length / HORARIOS_POR_PAGINA);

  useEffect(() => {
    let ativo = true;
    if (!professionalId || !serviceId || !date) {
      setHorariosDisponiveis([]);
      return () => { ativo = false; };
    }

    api.get("/agendamentos/horarios-disponiveis", {
      params: { profissionalId: professionalId, servicoId: serviceId, data: date },
    }).then(response => {
      if (ativo) setHorariosDisponiveis(response.data || []);
    }).catch(() => {
      if (ativo) setHorariosDisponiveis([]);
    });

    return () => { ativo = false; };
  }, [professionalId, serviceId, date]);

  useEffect(() => {
    setPaginaHorarios(0);
  }, [professionalId, serviceId, date]);

  // Pré-preenche o formulário com os dados do usuário logado.
  // Usa /usuarios/me (via validate-access.js) em vez de /usuarios/{id},
  // então funciona pra qualquer role autenticada e não depende do
  // userId salvo no localStorage. Falha silenciosa: se não conseguir
  // buscar, o usuário simplesmente preenche manualmente.
  useEffect(() => {
    let ativo = true;

    async function carregarMeusDados() {
      const dados = await buscarMeusDados();
      if (!ativo || !dados) return;

      setForm(f => ({
        ...f,
        name: dados.nome || "",
        phone: dados.telefone || "",
        email: dados.email || "",
      }));
    }

    carregarMeusDados();
    return () => { ativo = false; };
  }, []);

  // Efeito para carregar Serviços e Profissionais do Backend ao montar a tela
  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [servicosApi, profissionaisApi] = await Promise.all([
          getServicos(),
          getFuncionarias()
        ]);
        setServicosDb(servicosApi || []);
        setProfissionaisDb(profissionaisApi || []);
        if (servicoPacoteId && servicosApi.some(servico => String(servico.id) === String(servicoPacoteId))) {
          setServiceId(servicoPacoteId);
        }
      } catch (error) {
        console.error("Falha ao carregar opções do backend:", error);
      }
    }
    carregarOpcoes();
  }, []);

  // ---- Validation ----
  function validateStep1() {
    const errs = {};
    if (!serviceId) errs.serviceId = "Selecione um serviço.";
    if (!professionalId) errs.professionalId = "Selecione um profissional.";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = {};
    if (!date) errs.date = "Selecione uma data.";
    else {
      const d = new Date(date + "T00:00:00");
      const today = new Date(); today.setHours(0,0,0,0);
      if (d < today) errs.date = "A data não pode ser no passado.";
    }
    if (!timeSlot) errs.timeSlot = "Selecione um horário.";
    setStep2Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep3() {
    const errs = {};
    if (!form.name.trim()) errs.name = "Informe seu nome completo.";
    if (!form.phone.trim()) errs.phone = "Informe seu telefone.";
    else if (!/^\(?\d{2}\)?[\s\-]?\d{4,5}[\-\s]?\d{4}$/.test(form.phone.trim()))
      errs.phone = "Formato inválido. Ex: (11) 99999-9999";
    if (!form.email.trim()) errs.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "E-mail inválido.";
    setStep3Errors(errs);
    return Object.keys(errs).length === 0;
  }

  // ---- Navigation ----
  function handleNext() {
    if (step === 1 && validateStep1()) setStep(2);
    if (step === 2 && validateStep2()) setStep(3);
    if (step === 3 && validateStep3()) handleConfirm();
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  async function handleConfirm() {
    setIsSubmitting(true);

    const servicoSelecionado = servicosDb.find(s => s.id === serviceId);
    const meuId = localStorage.getItem("userId");

    // Monta o payload no formato que nosso Orquestrador espera
    const payloadCompleto = {
      serviceId,
      professionalId,
      clienteId: meuId,
      date,
      time: timeSlot,
      clientePacoteServicoId: pacoteServicoId || null,
      duracaoServico: servicoSelecionado ? servicoSelecionado.duracaoMinutos : 60,
      ...form
    };

    try {
      await agendarPeloCliente(payloadCompleto);
      setDone(true);
    } catch (error) {
      alert("Ocorreu um erro ao salvar o agendamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetAll() {
    setStep(1); setDone(false);
    setServiceId(""); setProfessionalId(""); setStep1Errors({});
    setDate(""); setTimeSlot(""); setStep2Errors({});
    setForm({ name: "", phone: "", email: "", notes: "" }); setStep3Errors({});
  }

  // Pega os nomes bonitos para mostrar no resumo final
  const serviceLabel = servicosDb.find(s => s.id === serviceId)?.nome || '';
  const professionalLabel = profissionaisDb.find(p => p.id === professionalId)?.nome || '';

  return (
    <>
      <div className="page">
        <div className="booking-hero">
          <h1>Agende seu <em>Horário</em></h1>
          <p>Escolha o melhor horário para sua transformação</p>
        </div>

        <div className="stepper-container">
          {!done && (
            <div className="stepper" aria-label="Progresso do agendamento">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;

                return (
                  <Fragment key={label}>
                    <div className="step-item">
                      <div className={`step-circle ${isActive ? "active" : isDone ? "done" : "inactive"}`}>
                        {isDone ? "✓" : num}
                      </div>
                      <div className={`step-label ${isActive ? "active" : ""}`}>{label}</div>
                    </div>

                    {i < STEP_LABELS.length - 1 && (
                      <div className={`step-line ${isDone ? "done" : ""}`} aria-hidden="true" />
                    )}
                  </Fragment>
                );
              })}
            </div>
          )}
        </div>

        <div className="booking-card">

          {done && (
            <div className="success-screen">
              <div className="success-icon">✓</div>
              <h2>Agendamento Confirmado!</h2>
              <p>
                Seu horário foi reservado com sucesso.<br />
                Você receberá uma confirmação em <strong>{form.email}</strong>.<br />
                Até breve, <strong>{form.name.split(" ")[0]}</strong>! ✨
              </p>
              <div className="summary-box">
                <h3>Resumo do Agendamento</h3>
                <div className="summary-row"><span>Serviço</span><span>{serviceLabel}</span></div>
                <div className="summary-row"><span>Profissional</span><span>{professionalLabel}</span></div>
                <div className="summary-row"><span>Data</span><span>{new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span></div>
                <div className="summary-row"><span>Horário</span><span>{timeSlot}</span></div>
              </div>
              <button className="btn-new" onClick={resetAll}>Novo Agendamento</button>
            </div>
          )}

          {!done && step === 1 && (
            <>
              <div className="card-title">Escolha o Serviço e o Profissional</div>

              <div className="field">
                <label>Serviço</label>
                {servicosDisponiveis.length === 0 ? (
                  <div className="service-selection-empty">Nenhum serviço disponível no momento.</div>
                ) : (
                  <div className="booking-services-grid" role="radiogroup" aria-label="Serviços disponíveis">
                    {servicosDisponiveis.map(servico => {
                      const selecionado = serviceId === servico.id;
                      return (
                        <button
                          key={servico.id}
                          type="button"
                          className={`booking-service-card${selecionado ? " selected" : ""}`}
                          onClick={() => {
                            setServiceId(servico.id);
                            setProfessionalId("");
                            setStep1Errors(p => ({ ...p, serviceId: "", professionalId: "" }));
                          }}
                          role="radio"
                          aria-checked={selecionado}
                        >
                          <span className="booking-service-card__icon" aria-hidden="true">✨</span>
                          <span className="booking-service-card__content">
                            <strong>{servico.nome}</strong>
                            <span>{servico.descricao || "Serviço de beleza"}</span>
                            <small>R$ {Number(servico.preco || 0).toFixed(2).replace('.', ',')} · {servico.duracaoMinutos || 60} min</small>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {step1Errors.serviceId && <div className="error-msg">{step1Errors.serviceId}</div>}
              </div>

              <div className="field">
                <label>Profissional</label>
                {!serviceId ? (
                  <div className="service-selection-empty">Selecione um serviço primeiro.</div>
                ) : profissionaisDoServico.length === 0 ? (
                  <div className="service-selection-empty">Nenhum profissional realiza este serviço.</div>
                ) : (
                  <select
                    className={step1Errors.professionalId ? "error" : ""}
                    value={professionalId}
                    onChange={e => {
                      setProfessionalId(e.target.value);
                      setStep1Errors(p => ({ ...p, professionalId: "" }));
                    }}
                  >
                    <option value="">Selecione um profissional</option>
                    {profissionaisDoServico.map(profissional => (
                      <option key={profissional.id} value={profissional.id}>
                        {profissional.nome}
                      </option>
                    ))}
                  </select>
                )}
                {step1Errors.professionalId && <div className="error-msg">{step1Errors.professionalId}</div>}
              </div>

              <div className="card-actions">
                <span />
                <button className="btn-next" onClick={handleNext}>Próximo</button>
              </div>
            </>
          )}

          {!done && step === 2 && (
            <>
              <div className="card-title">Escolha Data e Horário</div>

              <div className="field">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Data
                </label>
                <input
                  type="date"
                  className={step2Errors.date ? "error" : ""}
                  value={date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => { setDate(e.target.value); setTimeSlot(""); setStep2Errors(p => ({ ...p, date: "" })); }}
                />
                {step2Errors.date && <div className="error-msg">{step2Errors.date}</div>}
              </div>

              <div className="field">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Horário
                </label>
                            <div className="time-grid">
                              {horariosDaPagina.map(t => (
                    <button
                      key={t}
                      className={`time-slot${timeSlot === t ? " selected" : ""}`}
                      onClick={() => { setTimeSlot(t); setStep2Errors(p => ({ ...p, timeSlot: "" })); }}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                  {horariosDisponiveis.length === 0 && (
                    <div className="service-selection-empty">Nenhum horário disponível para esta data.</div>
                  )}
                </div>
                {totalPaginasHorarios > 1 && (
                  <div className="horarios-paginacao" aria-label="Paginação de horários">
                    <button type="button" onClick={() => setPaginaHorarios(pagina => Math.max(0, pagina - 1))} disabled={paginaHorarios === 0}>Anterior</button>
                    <span>{paginaHorarios + 1} / {totalPaginasHorarios}</span>
                    <button type="button" onClick={() => setPaginaHorarios(pagina => Math.min(totalPaginasHorarios - 1, pagina + 1))} disabled={paginaHorarios === totalPaginasHorarios - 1}>Próxima</button>
                  </div>
                )}
                {step2Errors.timeSlot && <div className="error-msg" style={{ marginTop: 8 }}>{step2Errors.timeSlot}</div>}
              </div>

              <div className="card-actions">
                <button className="btn-back" onClick={handleBack}>Voltar</button>
                <button className="btn-next" onClick={handleNext}>Próximo</button>
              </div>
            </>
          )}

          {!done && step === 3 && (
            <>
              <div className="card-title">Seus Dados</div>

              <div className="summary-box">
                <h3>Resumo da Escolha</h3>
                <div className="summary-row"><span>Serviço</span><span>{serviceLabel}</span></div>
                <div className="summary-row"><span>Profissional</span><span>{professionalLabel}</span></div>
                {date && <div className="summary-row"><span>Data</span><span>{new Date(date + "T12:00:00").toLocaleDateString("pt-BR")}</span></div>}
                {timeSlot && <div className="summary-row"><span>Horário</span><span>{timeSlot}</span></div>}
              </div>

              <div className="field">
                <label>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Maria Silva"
                  className={step3Errors.name ? "error" : ""}
                  value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setStep3Errors(p => ({ ...p, name: "" })); }}
                />
                {step3Errors.name && <div className="error-msg">{step3Errors.name}</div>}
              </div>

              <div className="field">
                <label>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.6a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 3h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17.92z"/></svg>
                  Telefone
                </label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className={step3Errors.phone ? "error" : ""}
                  value={form.phone}
                  onChange={e => { setForm(f => ({ ...f, phone: e.target.value })); setStep3Errors(p => ({ ...p, phone: "" })); }}
                />
                {step3Errors.phone && <div className="error-msg">{step3Errors.phone}</div>}
              </div>

              <div className="field">
                <label>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="maria@email.com"
                  className={step3Errors.email ? "error" : ""}
                  value={form.email}
                  onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setStep3Errors(p => ({ ...p, email: "" })); }}
                />
                {step3Errors.email && <div className="error-msg">{step3Errors.email}</div>}
              </div>

              <div className="field">
                <label>Observações (opcional)</label>
                <textarea
                  placeholder="Alguma preferência ou observação especial?"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="card-actions">
                <button className="btn-back" onClick={handleBack} disabled={isSubmitting}>Voltar</button>
                <button className="btn-next" onClick={handleConfirm} disabled={isSubmitting}>
                  {isSubmitting ? "Processando..." : "Confirmar Agendamento"}
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}