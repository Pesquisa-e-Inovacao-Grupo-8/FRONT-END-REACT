import { useState } from "react";
import "../styles/agendamento-usuario.css";

const SERVICES = [
  { value: "", label: "Selecione um serviço" },
  { value: "corte-feminino", label: "Corte Feminino — R$ 120 · 1h" },
  { value: "coloracao-completa", label: "Coloração Completa — R$ 280 · 2h30" },
  { value: "hidratacao-premium", label: "Hidratação Premium — R$ 150 · 1h30" },
  { value: "mechas-balayage", label: "Mechas Balayage — R$ 380 · 3h" },
  { value: "limpeza-pele", label: "Limpeza de Pele Profunda — R$ 180 · 1h30" },
  { value: "massagem-relaxante", label: "Massagem Relaxante — R$ 160 · 1h" },
  { value: "maquiagem-social", label: "Maquiagem Social — R$ 150 · 1h" },
  { value: "maquiagem-noiva", label: "Maquiagem Noiva — R$ 350 · 2h" },
  { value: "manicure-completa", label: "Manicure Completa — R$ 60 · 45min" },
  { value: "alongamento-gel", label: "Alongamento em Gel — R$ 180 · 2h" },
];

const PROFESSIONALS = [
  { value: "", label: "Selecione um profissional" },
  { value: "ana", label: "Ana Paula — Cabelo & Coloração" },
  { value: "juliana", label: "Juliana Costa — Estética & Massagem" },
  { value: "fernanda", label: "Fernanda Lima — Maquiagem" },
  { value: "patricia", label: "Patrícia Souza — Unhas & Estética" },
];

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];
const UNAVAILABLE = ["12:00", "16:00"];

const STEP_LABELS = ["Serviço", "Data e Hora", "Seus Dados"];

export default function Agendamento() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 1
  const [service, setService] = useState("");
  const [professional, setProfessional] = useState("");
  const [step1Errors, setStep1Errors] = useState({});

  // Step 2
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [step2Errors, setStep2Errors] = useState({});

  // Step 3
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });
  const [step3Errors, setStep3Errors] = useState({});

  // ---- Validation ----
  function validateStep1() {
    const errs = {};
    if (!service) errs.service = "Selecione um serviço.";
    if (!professional) errs.professional = "Selecione um profissional.";
    setStep1Errors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const errs = {};
    if (!date) errs.date = "Selecione uma data.";
    else {
      const d = new Date(date);
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

  function handleConfirm() {
    // CRUD: aqui você chamaria sua API/backend
    const booking = {
      id: `TUK-${Date.now()}`,
      service: SERVICES.find(s => s.value === service)?.label,
      professional: PROFESSIONALS.find(p => p.value === professional)?.label,
      date,
      time: timeSlot,
      ...form,
      createdAt: new Date().toISOString(),
    };
    console.log("✅ Agendamento criado:", booking);
    // Simula POST para API
    // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking) });
    setDone(true);
  }

  function resetAll() {
    setStep(1); setDone(false);
    setService(""); setProfessional(""); setStep1Errors({});
    setDate(""); setTimeSlot(""); setStep2Errors({});
    setForm({ name: "", phone: "", email: "", notes: "" }); setStep3Errors({});
  }

  const serviceLabel = SERVICES.find(s => s.value === service)?.label?.split("—")[0]?.trim();
  const professionalLabel = PROFESSIONALS.find(p => p.value === professional)?.label?.split("—")[0]?.trim();

  return (
    <>

      <div className="page">
        <div className="booking-hero">
          <h1>Agende seu <em>Horário</em></h1>
          <p>Escolha o melhor horário para sua transformação</p>
        </div>

        <div className="stepper-container">
          {!done && (
            <div className="stepper">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1;
                const isActive = step === num;
                const isDone = step > num;
                return (
                  <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <div className="step-item" style={{ flex: "none" }}>
                      <div className={`step-circle ${isActive ? "active" : isDone ? "done" : "inactive"}`}>
                        {isDone ? "✓" : num}
                      </div>
                      <div className={`step-label ${isActive ? "active" : ""}`}>{label}</div>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`step-line ${isDone ? "done" : ""}`} style={{ flex: 1, margin: "0 4px", marginTop: "-28px" }} />
                    )}
                  </div>
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
                  className={step1Errors.service ? "error" : ""}
                  value={service}
                  onChange={e => { setService(e.target.value); setStep1Errors(p => ({ ...p, service: "" })); }}
                >
                  {SERVICES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                {step1Errors.service && <div className="error-msg">{step1Errors.service}</div>}
              </div>

              <div className="field">
                <label>Profissional</label>
                <select
                  className={step1Errors.professional ? "error" : ""}
                  value={professional}
                  onChange={e => { setProfessional(e.target.value); setStep1Errors(p => ({ ...p, professional: "" })); }}
                >
                  {PROFESSIONALS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
                {step1Errors.professional && <div className="error-msg">{step1Errors.professional}</div>}
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
                <button className="btn-back" onClick={handleBack}>Voltar</button>
                <button className="btn-next" onClick={handleNext}>Confirmar Agendamento</button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
