//src/pages/Agendamento.jsx
import { useState, useEffect, Fragment } from "react";
import { getServicos, agendarPeloCliente } from "../js/agendamento.js";
import { getFuncionarias } from "../js/funcionarias.js";
import "../styles/agendamento-usuario.css";
import api from '../api.js'

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const UNAVAILABLE = ["12:00", "16:00"];

const STEP_LABELS = ["Serviço", "Data e Hora", "Seus Dados"];

export default function Agendamento() {
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
  const [step2Errors, setStep2Errors] = useState({});

  // Step 3
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [step3Errors, setStep3Errors] = useState({});

   // Filtro: mostra profissionais que fazem o serviço selecionado
  const profissionaisFiltrados = serviceId 
    ? profissionaisDb.filter(p => {
        const servicoSelecionado = servicosDb.find(s => s.id === serviceId);
        if (!servicoSelecionado) return true;
        
        // Verifica se na lista de serviços do profissional existe o ID ou o Nome do serviço
        return p.servicos && p.servicos.some(s => 
          s === serviceId || s.id === serviceId || s === servicoSelecionado.nome || s.nome === servicoSelecionado.nome
        );
      })
    : profissionaisDb;

    useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    // Busca dados reais se logado
    api.get(`/usuarios/${userId}`).then(res => {
      setForm({
        name: res.data.nome || "",
        phone: res.data.telefone || "",
        email: res.data.email || "",
        notes: ""
      });
    }).catch(err => console.log("Usuário não encontrado", err));
  }
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
              <div className="card-title">Escolha o Serviço e Profissional</div>

              <div className="field">
                <label>Serviço</label>
                <select
                  className={step1Errors.serviceId ? "error" : ""}
                  value={serviceId}
                  onChange={e => { setServiceId(e.target.value); setStep1Errors(p => ({ ...p, serviceId: "" })); }}
                >
                  <option value="">Selecione um serviço</option>
                  {servicosDb.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nome} — R$ {s.preco.toFixed(2).replace('.', ',')} · {s.duracaoMinutos}min
                    </option>
                  ))}
                </select>
                {step1Errors.serviceId && <div className="error-msg">{step1Errors.serviceId}</div>}
              </div>

              <div className="field">
                <label>Profissional</label>
                <select
                  className={step1Errors.professionalId ? "error" : ""}
                  value={professionalId}
                  onChange={e => { setProfessionalId(e.target.value); setStep1Errors(p => ({ ...p, professionalId: "" })); }}
                >
                  <option value="">Selecione um profissional</option>
                  {profissionaisFiltrados.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
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
                  {TIME_SLOTS.map(t => (
                    <button
                      key={t}
                      className={`time-slot${timeSlot === t ? " selected" : ""}${UNAVAILABLE.includes(t) ? " disabled" : ""}`}
                      onClick={() => { if (!UNAVAILABLE.includes(t)) { setTimeSlot(t); setStep2Errors(p => ({ ...p, timeSlot: "" })); } }}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>
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
