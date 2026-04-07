import { useState, useEffect } from "react";
import "../../styles/app.css";

const INITIAL_STATE = { cliente: "", servico: "", data: "", hora: "", duracaoMinutos: 60, pagamentoAdiantado: false, funcionaria: "" };

const normalizarDataParaInput = (valor = "") => {
  if (!valor) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dia, mes, ano] = valor.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return "";
};

const temAlteracoes = (formData, funcionariaAtual) => {
  return (
    (formData.cliente || "").trim() !== "" ||
    (formData.servico || "").trim() !== "" ||
    (formData.data || "") !== "" ||
    (formData.hora || "") !== "" ||
    parseInt(formData.duracaoMinutos, 10) !== 60 ||
    !!formData.pagamentoAdiantado ||
    ((formData.funcionaria || "") !== (funcionariaAtual || ""))
  );
};

export default function NovoAgendamento({ aoSalvar, dadosIniciais, funcionaria, servicosDisponiveis = [] }) {
  const [aberto, setAberto] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_STATE, funcionaria });
  const tituloModal = dadosIniciais ? "Completar Agendamento" : "Criar Agendamento";
  const hojeInput = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (dadosIniciais) {
      const dataFormatada = normalizarDataParaInput(dadosIniciais.data);
      setFormData({
        ...INITIAL_STATE,
        ...dadosIniciais,
        data: dataFormatada,
        duracaoMinutos: parseInt(dadosIniciais.duracaoMinutos || dadosIniciais.duracao || 60, 10) || 60,
        funcionaria: dadosIniciais.funcionaria || funcionaria
      });
      setAberto(true);
    }
  }, [dadosIniciais, funcionaria]);

  useEffect(() => {
    if (!aberto) setFormData(prev => ({ ...prev, funcionaria }));
  }, [funcionaria, aberto]);

  useEffect(() => {
    setFormData((prev) => {
      if (!prev.servico) return prev;
      if (servicosDisponiveis.includes(prev.servico)) return prev;
      return { ...prev, servico: "" };
    });
  }, [servicosDisponiveis]);

  useEffect(() => {
    const onEscape = (e) => {
      if (e.key === "Escape") setAberto(false);
    };

    if (aberto) window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [aberto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cliente || !formData.data || !formData.hora) {
      alert("Preencha cliente, data e horário!");
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataSelecionada = new Date(`${formData.data}T00:00:00`);
    if (dataSelecionada < hoje) {
      alert("Não é permitido criar agendamento em data passada.");
      return;
    }

    const duracaoMinutos = parseInt(formData.duracaoMinutos, 10) || 60;

    aoSalvar({
      ...formData,
      duracaoMinutos,
      dia: parseInt(formData.data.split("-")[2], 10),
      pagamentoStatus: formData.pagamentoAdiantado ? 'PAGO' : 'PENDENTE',
      funcionaria: formData.funcionaria || funcionaria
    });
    setFormData({ ...INITIAL_STATE, funcionaria });
    setAberto(false);
  };

  const fecharModal = () => {
    if (temAlteracoes(formData, funcionaria)) {
      const confirmar = window.confirm('Existem alterações não salvas. Deseja fechar mesmo assim?');
      if (!confirmar) return;
    }
    setAberto(false);
  };

  return (
    <div className="container novo-agendamento-container">
      <div className="header">
        <h2>Agendamentos</h2>
        <button className="btn-app" onClick={() => setAberto(true)} type="button">
          {tituloModal}
        </button>
      </div>

      {aberto && (
        <div className="novo-agendamento-modal-overlay" onClick={fecharModal}>
          <div
            className="novo-agendamento-modal"
            role="dialog"
            aria-modal="true"
            aria-label={tituloModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="novo-agendamento-modal__header">
              <h3>{tituloModal}</h3>
              <button type="button" className="novo-agendamento-modal__close" onClick={fecharModal} aria-label="Fechar modal">
                ×
              </button>
            </div>

            <form className="formulario" onSubmit={handleSubmit}>
              <div className="campos">
                <div className="campo">
                  <label>Cliente</label>
                  <input type="text" name="cliente" placeholder="Nome do cliente" value={formData.cliente} onChange={handleChange} required />
                </div>
                <div className="campo">
                  <label>Serviço</label>
                  <select name="servico" value={formData.servico} onChange={handleChange} required>
                    <option value="" disabled>Selecione um serviço</option>
                    {(servicosDisponiveis || []).map((servico) => (
                      <option key={servico} value={servico}>{servico}</option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label>Data</label>
                  <input type="date" name="data" min={hojeInput} value={formData.data} onChange={handleChange} required />
                </div>
                <div className="campo">
                  <label>Horário</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
                </div>
                <div className="campo">
                  <label>Duração</label>
                  <select name="duracaoMinutos" value={formData.duracaoMinutos || 60} onChange={handleChange}>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                    <option value={120}>120 min</option>
                    <option value={150}>150 min</option>
                    <option value={180}>180 min</option>
                  </select>
                </div>
                <div className="campo">
                  <label>Funcionária</label>
                  <input type="text" name="funcionaria" value={formData.funcionaria || ""} readOnly />
                </div>
                <div className="campo">
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input type="checkbox" name="pagamentoAdiantado" checked={formData.pagamentoAdiantado} onChange={handleChange} style={{ margin: 0, width: "auto" }} />
                    Pagamento Adiantado?
                  </label>
                </div>
              </div>

              <div className="botoes">
                <button type="submit" className="btn-app btn-salvar">Salvar</button>
                <button type="button" className="btn-app btn-cancelar" onClick={fecharModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}