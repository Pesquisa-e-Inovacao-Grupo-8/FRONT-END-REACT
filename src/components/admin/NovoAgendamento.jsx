import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/app.css";

const INITIAL_STATE = {
  cliente: "",
  telefone: "",
  servico: "",
  data: "",
  hora: "",
  duracaoMinutos: 60,
  pagamentoAdiantado: false,
  funcionaria: ""
};

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
    (formData.telefone || "").trim() !== "" ||
    (formData.servico || "").trim() !== "" ||
    (formData.data || "") !== "" ||
    (formData.hora || "") !== "" ||
    parseInt(formData.duracaoMinutos, 10) !== 60 ||
    !!formData.pagamentoAdiantado ||
    ((formData.funcionaria || "") !== (funcionariaAtual || ""))
  );
};

export default function NovoAgendamento({ aoSalvar, dadosIniciais, funcionaria, profissionalId, servicosDisponiveis = [] }) {
  const [aberto, setAberto] = useState(false);
  const [formData, setFormData] = useState({ ...INITIAL_STATE, funcionaria });

  const tituloModal = dadosIniciais ? "Completar Agendamento" : "Novo Agendamento (Avulso ou Cliente)";
  const hojeInput = new Date().toISOString().split('T')[0];

  const [clientesCadastrados, setClientesCadastrados] = useState([]);
  const [isClienteAvulso, setIsClienteAvulso] = useState(false);
  const userRole = localStorage.getItem("userRole"); // Para verificar se é ADMIN
  const [profissionaisDisponiveis, setProfissionaisDisponiveis] = useState([]);

  const [buscaCliente, setBuscaCliente] = useState("");
  const [dropdownClienteAberto, setDropdownClienteAberto] = useState(false);

  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [dropdownProfissionalAberto, setDropdownProfissionalAberto] = useState(false);

  useEffect(() => {
    if (aberto) {
      api.get('/usuarios').then(res => {
        setClientesCadastrados(res.data.filter(u => u.tipo === 'CLIENTE'));
        if (userRole === 'ADMIN') {
          setProfissionaisDisponiveis(res.data.filter(u => u.tipo === 'PROFISSIONAL'));
        }
      });
    }
  }, [aberto, userRole]);

  useEffect(() => {
    if (dadosIniciais) {
      setFormData({
        ...INITIAL_STATE,
        ...dadosIniciais,
        data: normalizarDataParaInput(dadosIniciais.data),
        duracaoMinutos: parseInt(dadosIniciais.duracaoMinutos || dadosIniciais.duracao || 60, 10),
        funcionaria: dadosIniciais.funcionaria || funcionaria
      });
      setAberto(true);
    }
  }, [dadosIniciais, funcionaria]);

  const clientesFiltradosPesquisa = clientesCadastrados.filter(c =>
    c.nome.toLowerCase().includes(buscaCliente.toLowerCase()) ||
    (c.telefone && c.telefone.includes(buscaCliente))
  );

  const profissionaisFiltradosPesquisa = profissionaisDisponiveis.filter(p =>
    p.nome.toLowerCase().includes(buscaProfissional.toLowerCase())
  );

  // Funções ao selecionar nas listas
  const selecionarCliente = (cliente) => {
    setFormData(prev => ({ ...prev, clienteId: cliente.id }));
    setBuscaCliente(`${cliente.nome} - ${cliente.telefone || ''}`);
    setDropdownClienteAberto(false);
  };

  const selecionarProfissional = (prof) => {
    setFormData(prev => ({ ...prev, funcionaria: prof.nome }));
    setBuscaProfissional(prof.nome);
    setDropdownProfissionalAberto(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "servico") {
      const servicoEscolhido = servicosDisponiveis.find(s => String(s.id) === String(value));
      setFormData(prev => ({
        ...prev,
        servico: value,
        duracaoMinutos: servicoEscolhido ? servicoEscolhido.duracaoMinutos : 60
      }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };
  const calcularHoraFim = (horaInicio, duracao) => {
    if (!horaInicio) return "00:00:00";
    const [h, m] = horaInicio.split(':').map(Number);
    const data = new Date();
    data.setHours(h, m + parseInt(duracao, 10));
    return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}:00`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Monta o payload garantindo que enviamos os UUIDs corretos
    const payload = {
      data: formData.data,
      horaInicio: formData.hora + ":00",
      horaFim: calcularHoraFim(formData.hora, formData.duracaoMinutos),
      status: formData.pagamentoAdiantado ? "PAGO" : "PENDENTE",
      ordemPedido: "ADM-" + Date.now(),
      clienteId: formData.clienteId || null,
      nomeClienteAvulso: !formData.clienteId ? formData.cliente : null,
      telefoneClienteAvulso: !formData.clienteId ? formData.telefone : null,

      // Agora o profissionalId existe e vem direto do componente pai!
      profissionalId: profissionalId,
      servicoId: formData.servico
    };

    aoSalvar(payload);
    setFormData({ ...INITIAL_STATE, funcionaria });
    setAberto(false);
  };

  const fecharModal = () => {
    if (temAlteracoes(formData, funcionaria) && !window.confirm('Existem alterações não salvas. Deseja fechar mesmo assim?')) return;
    setAberto(false);
  };

  return (
    <div className="container novo-agendamento-container">
      <div className="header">
        <h2 className="agenda-header-title">Agendamentos</h2>
        <button className="btn-app agenda-new-button" onClick={() => setAberto(true)} type="button" style={{ backgroundColor: "#1a1a2e", color: "white", padding: "10px 20px", borderRadius: "5px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
          + {tituloModal}
        </button>
      </div>

      {aberto && (
        <div className="novo-agendamento-modal-overlay" onClick={fecharModal} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="novo-agendamento-modal admin-modal-panel" onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "10px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>

            <div className="novo-agendamento-modal__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, color: "#1a1a2e" }}>{tituloModal}</h3>
              <button type="button" onClick={fecharModal} style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
            </div>

            <form className="formulario" onSubmit={handleSubmit}>
              <h4 style={{ color: "#b8960c", marginBottom: "15px", fontSize: "1rem" }}>👤 Dados do Cliente</h4>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ marginRight: '15px', cursor: 'pointer' }}>
                  <input type="radio" checked={!isClienteAvulso} onChange={() => setIsClienteAvulso(false)} /> Cliente Cadastrado
                </label>
                <label style={{ cursor: 'pointer' }}>
                  <input type="radio" checked={isClienteAvulso} onChange={() => setIsClienteAvulso(true)} /> Cliente Avulso (Livre)
                </label>
              </div>

              <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
                {!isClienteAvulso ? (
                  <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Buscar Cliente</label>

                    {/* BARRA DE PESQUISA DO CLIENTE */}
                    <input
                      type="text"
                      placeholder="Digite o nome ou telefone..."
                      value={buscaCliente}
                      onChange={(e) => {
                        setBuscaCliente(e.target.value);
                        setDropdownClienteAberto(true);
                        setFormData(prev => ({ ...prev, clienteId: "" })); // Limpa o ID se o usuário voltar a digitar
                      }}
                      onFocus={() => setDropdownClienteAberto(true)}
                      onBlur={() => setTimeout(() => setDropdownClienteAberto(false), 200)} // Delay para dar tempo de clicar na opção
                      style={{ width: "100%", padding: "10px", borderRadius: "5px", border: formData.clienteId ? "1px solid #28a745" : "1px solid #ccc" }}
                    />

                    {/* LISTA SUSPENSA (DROPDOWN) */}
                    {dropdownClienteAberto && buscaCliente.length > 0 && (
                      <div style={{ position: "absolute", top: "70px", left: 0, right: 0, maxHeight: "200px", overflowY: "auto", background: "#fff", border: "1px solid #ccc", borderRadius: "5px", zIndex: 10, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                        {clientesFiltradosPesquisa.length > 0 ? (
                          clientesFiltradosPesquisa.map(c => (
                            <div
                              key={c.id}
                              onMouseDown={() => selecionarCliente(c)} // onMouseDown executa antes do onBlur do input
                              style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}
                            >
                              <strong>{c.nome}</strong> <br /><small style={{ color: "#666" }}>{c.telefone || "Sem telefone"}</small>
                            </div>
                          ))
                        ) : (
                          <div style={{ padding: "10px", color: "#888", fontSize: "0.9rem" }}>Nenhum cliente encontrado.</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 2, minWidth: "200px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Nome do Cliente (Avulso)</label>
                      <input type="text" name="cliente" value={formData.cliente} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: "150px" }}>
                      <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Telefone</label>
                      <input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
                    </div>
                  </>
                )}
              </div>

              <h4 style={{ color: "#b8960c", marginBottom: "15px", fontSize: "1rem" }}>✂️ Detalhes do Serviço</h4>
              <div style={{ display: "flex", gap: "15px", marginBottom: "15px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Serviço</label>
                  <select name="servico" value={formData.servico} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}>
                    <option value="">Selecione um serviço</option>
                    {(servicosDisponiveis || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.nome} ({s.duracaoMinutos} min)</option>
                    ))}
                  </select>
                </div>

                <div style={{ flex: 1, minWidth: "150px", position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Profissional</label>

                  {userRole === "ADMIN" ? (
                    <>
                      {/* BARRA DE PESQUISA DO PROFISSIONAL (SOMENTE ADMIN) */}
                      <input
                        type="text"
                        placeholder="Buscar profissional..."
                        value={buscaProfissional}
                        onChange={(e) => {
                          setBuscaProfissional(e.target.value);
                          setDropdownProfissionalAberto(true);
                          setFormData(prev => ({ ...prev, funcionaria: "" }));
                        }}
                        onFocus={() => setDropdownProfissionalAberto(true)}
                        onBlur={() => setTimeout(() => setDropdownProfissionalAberto(false), 200)}
                        style={{ width: "100%", padding: "10px", borderRadius: "5px", border: formData.funcionaria ? "1px solid #28a745" : "1px solid #ccc" }}
                      />

                      {/* LISTA SUSPENSA PROFISSIONAL */}
                      {dropdownProfissionalAberto && (
                        <div style={{ position: "absolute", top: "70px", left: 0, right: 0, maxHeight: "200px", overflowY: "auto", background: "#fff", border: "1px solid #ccc", borderRadius: "5px", zIndex: 10, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
                          {profissionaisFiltradosPesquisa.map(p => (
                            <div
                              key={p.id}
                              onMouseDown={() => selecionarProfissional(p)}
                              style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "0.9rem" }}
                            >
                              {p.nome}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <input type="text" name="funcionaria" value={formData.funcionaria} readOnly style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #eee", backgroundColor: "#f9f9f9", color: "#666" }} />
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Data</label>
                  <input type="date" name="data" value={formData.data} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", fontSize: "0.9rem", fontWeight: "bold" }}>Horário</label>
                  <input type="time" name="hora" value={formData.hora} onChange={handleChange} required style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />
                </div>
              </div>

              <div style={{ backgroundColor: "#fcfaf2", padding: "15px", borderRadius: "8px", border: "1px solid #e6dca8", marginBottom: "25px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: "bold", color: "#1a1a2e" }}>
                  <input type="checkbox" name="pagamentoAdiantado" checked={formData.pagamentoAdiantado} onChange={handleChange} style={{ width: "18px", height: "18px", accentColor: "#b8960c" }} />
                  Marcar como Pagamento Adiantado / Pago
                </label>
              </div>

              <div className="botoes" style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="btn-app btn-cancelar btn-cancelar-modal" onClick={fecharModal} style={{ padding: "10px 20px", backgroundColor: "#eee", color: "#333", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
                <button type="submit" className="btn-app btn-salvar" style={{ padding: "10px 20px", backgroundColor: "#b8960c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>Salvar Agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}