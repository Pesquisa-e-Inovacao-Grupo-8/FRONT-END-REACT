// src/pages/admin/ConfiguracoesProfissional.jsx
import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/configuracoes-profissional.css";
import { mostrarSucessoMensagem } from "../../components/utils/mensagem";
import { mostrarAvisoObrigatorio } from "../../components/utils/confirm-dialog";
import { getUsuarioLogado, normalizarRole } from "../../validate-access";

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "0.95rem",
  backgroundColor: "#fff",
};

const DIAS_DA_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const HORA_MINIMA = 6 * 60;
const HORA_MAXIMA = 23 * 60;
const PASSO_HORARIO = 15;

const criarHorariosPadrao = () => Array.from({ length: 7 }, (_, index) => ({
  diaSemana: index + 1,
  horaInicio: "09:00",
  horaFim: "18:00",
  intervaloMinutos: 15,
  ativo: index < 6,
}));

const horaParaMinutos = (hora) => {
  const [horas, minutos] = String(hora || "00:00").split(":").map(Number);
  return (horas * 60) + minutos;
};

const minutosParaHora = (minutos) => {
  const horas = Math.floor(minutos / 60).toString().padStart(2, "0");
  const resto = (minutos % 60).toString().padStart(2, "0");
  return `${horas}:${resto}`;
};

const removerAcentos = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const textoContem = (texto, busca) => removerAcentos(texto.toLowerCase()).includes(removerAcentos(busca.toLowerCase()));

// Garante que o usuário logado é um profissional real (não mock) antes de
// permitir salvar. Usado tanto para especialidades quanto para horários.
const validarUsuarioProfissional = async () => {
  const usuario = getUsuarioLogado();

  if (!usuario || normalizarRole(usuario.tipo) !== "PROFISSIONAL" || usuario.mock) {
    await mostrarAvisoObrigatorio("Entre com uma conta profissional real para salvar.");
    return false;
  }

  return true;
};

export default function ConfiguracoesProfissional() {
  const [servicosDoSalao, setServicosDoSalao] = useState([]);
  const [meusServicos, setMeusServicos] = useState([]);
  const [horarios, setHorarios] = useState(criarHorariosPadrao);
  const [loading, setLoading] = useState(true);
  const [salvandoEspecialidades, setSalvandoEspecialidades] = useState(false);
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);

  // Busca independente para cada tabela — "Meus Serviços" e "Todos os
  // Serviços" são listas separadas, cada uma com seu próprio filtro.
  const [buscaMeusServicos, setBuscaMeusServicos] = useState("");
  const [buscaTodosServicos, setBuscaTodosServicos] = useState("");

  // Busca os dados ao carregar a página
  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        // 1. Busca todos os serviços que o salão oferece
        const resServicos = await api.get("/servicos");
        setServicosDoSalao(resServicos.data || []);

        try {
          const resHorarios = await api.get("/profissionais/me/horarios");
          if (Array.isArray(resHorarios.data) && resHorarios.data.length) {
            const horariosSalvos = new Map(resHorarios.data.map(horario => [horario.diaSemana, horario]));
            setHorarios(criarHorariosPadrao().map(padrao => {
              const horario = horariosSalvos.get(padrao.diaSemana);
              if (!horario) return padrao;

              return {
                ...padrao,
                ...horario,
                horaInicio: String(horario.horaInicio || padrao.horaInicio).slice(0, 5),
                horaFim: String(horario.horaFim || padrao.horaFim).slice(0, 5),
                intervaloMinutos: Number(horario.intervaloMinutos ?? padrao.intervaloMinutos),
                ativo: horario.ativo !== false,
              };
            }));
          }
        } catch (erroHorarios) {
          console.warn("Horários ainda não disponíveis; usando configuração padrão.", erroHorarios);
        }

        // 2. Busca no banco de dados (Java) os serviços já marcados deste profissional
        const resMeus = await api.get("/profissionais/meus-servicos");
        if (Array.isArray(resMeus.data)) {
          setMeusServicos(resMeus.data.map(s => s.id));
        }

      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        await mostrarAvisoObrigatorio("Erro ao carregar serviços. Contate o suporte.");
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  // Controla adicionar/remover uma especialidade
  const toggleServico = (idServico) => {
    setMeusServicos((prev) => (
      prev.includes(idServico)
        ? prev.filter(id => id !== idServico) // Se já tem, tira
        : [...prev, idServico]                // Se não tem, adiciona
    ));
  };

  // Tabela "Meus Serviços": só os que o profissional já tem, filtrados pela busca própria
  const listaMeusServicos = servicosDoSalao
    .filter(servico => meusServicos.includes(servico.id))
    .filter(servico => textoContem(servico.nome, buscaMeusServicos));

  // Tabela "Todos os Serviços": apenas os que AINDA NÃO foram adicionados às
  // minhas especialidades — assim que um serviço é adicionado, ele some
  // daqui e passa a aparecer só na tabela "Meus Serviços".
  const listaTodosServicos = servicosDoSalao
    .filter(servico => !meusServicos.includes(servico.id))
    .filter(servico => textoContem(servico.nome, buscaTodosServicos));

  const alterarHorario = (diaSemana, campo, valor) => {
    setHorarios(prev => prev.map(horario => (
      horario.diaSemana === diaSemana ? { ...horario, [campo]: valor } : horario
    )));
  };

  const alterarFaixaHorario = (horario, campo, valor) => {
    const minutos = Number(valor);
    const inicioAtual = horaParaMinutos(horario.horaInicio);
    const fimAtual = horaParaMinutos(horario.horaFim);
    const novoInicio = campo === "horaInicio" ? minutos : inicioAtual;
    const novoFim = campo === "horaFim" ? minutos : fimAtual;

    if (campo === "horaInicio" && novoInicio >= novoFim) return;
    if (campo === "horaFim" && novoFim <= novoInicio) return;

    alterarHorario(horario.diaSemana, campo, minutosParaHora(minutos));
  };

  const salvarHorarios = async () => {
    if (!(await validarUsuarioProfissional())) return;

    const dias = horarios.map(horario => horario.diaSemana);
    const horariosInvalidos = horarios.some(horario => {
      const intervalo = Number(horario.intervaloMinutos);
      const ativo = horario.ativo;
      return !Number.isInteger(horario.diaSemana) ||
        horario.diaSemana < 1 ||
        horario.diaSemana > 7 ||
        !Number.isInteger(intervalo) ||
        intervalo < 0 ||
        intervalo > 240 ||
        (ativo && (!horario.horaInicio || !horario.horaFim || horario.horaInicio >= horario.horaFim));
    });

    if (horarios.length !== 7 || new Set(dias).size !== 7 || horariosInvalidos) {
      await mostrarAvisoObrigatorio("Informe um horário válido para cada dia da semana.");
      return;
    }

    try {
      setSalvandoHorarios(true);
      await api.put("/profissionais/me/horarios", horarios.map(horario => ({
        diaSemana: horario.diaSemana,
        horaInicio: horario.ativo ? `${horario.horaInicio}:00` : "00:00:00",
        horaFim: horario.ativo ? `${horario.horaFim}:00` : "00:00:00",
        intervaloMinutos: Number(horario.intervaloMinutos) || 0,
        ativo: horario.ativo,
      })));
      mostrarSucessoMensagem("Seus horários foram salvos com sucesso!");
    } catch (error) {
      console.error(error);
      await mostrarAvisoObrigatorio("Erro ao salvar seus horários.");
    } finally {
      setSalvandoHorarios(false);
    }
  };

  const salvarEspecialidades = async () => {
    if (!(await validarUsuarioProfissional())) return;

    try {
      setSalvandoEspecialidades(true);

      // Envia a lista inteira de IDs (meusServicos) para o Java — o back
      // agora faz o sync completo (apaga tudo e recria) numa transação só.
      await api.post("/profissionais/vincular-servicos", meusServicos);

      mostrarSucessoMensagem("Suas especialidades foram salvas com sucesso no banco de dados!");

    } catch (error) {
      console.error(error);
      await mostrarAvisoObrigatorio("Erro ao salvar configurações no servidor. Contate o suporte.");
    } finally {
      setSalvandoEspecialidades(false);
    }
  };

  if (loading) return <div className="professional-settings-page" style={{ padding: "40px" }}>Carregando serviços disponíveis...</div>;

  return (
    <div className="professional-settings-page" style={{ padding: "40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
      <div className="professional-settings-hero">
        <h1>Meu <em>Perfil Profissional</em></h1>
        <p>Selecione quais serviços você está habilitado a realizar no salão</p>
      </div>

      {servicosDoSalao.length === 0 ? (
        <div className="professional-settings-card" style={{ padding: "10px", marginTop: "20px" }}>
          <p>Nenhum serviço cadastrado no sistema do salão ainda.</p>
        </div>
      ) : (
        <>
          {/* Duas tabelas SEPARADAS, cada uma em seu próprio card e com sua
              própria busca — igual ao padrão usado em Gestão de Serviços. */}
          <div className="professional-services-grid">
            {/* ===== TABELA: MEUS SERVIÇOS ===== */}
            <div className="professional-settings-card" style={{ padding: "10px", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ margin: 0 }}>Meus Serviços</h3>
                <input
                  type="text"
                  placeholder="Buscar nos meus serviços..."
                  value={buscaMeusServicos}
                  onChange={(e) => setBuscaMeusServicos(e.target.value)}
                  className="professional-search-input"
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="crud-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "8px" }}>Nome</th>
                      <th style={{ padding: "8px" }}>Duração</th>
                      <th style={{ padding: "8px" }}>Preço</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaMeusServicos.map(servico => (
                      <tr key={servico.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}><strong>{servico.nome}</strong></td>
                        <td style={{ padding: "8px" }}>{servico.duracaoMinutos} min</td>
                        <td style={{ padding: "8px" }}>R$ {Number(servico.preco || 0).toFixed(2).replace(".", ",")}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => toggleServico(servico.id)}
                              style={{
                                cursor: "pointer",
                                border: "none",
                                borderRadius: "4px",
                                padding: "6px 6px",
                                fontSize: "0.7rem",
                                fontWeight: "bold",
                                color:  "#721c24",
                                backgroundColor: "#f8d7da",
                              }}
                            >
                              Remover
                            </button>
                        </td>
                      </tr>
                    ))}
                    {listaMeusServicos.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                          {buscaMeusServicos ? "Nenhum serviço encontrado." : "Você ainda não tem especialidades adicionadas."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ===== TABELA: TODOS OS SERVIÇOS ===== */}
            <div className="professional-settings-card" style={{ padding: "10px", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <h3 style={{ margin: 0 }}>Todos os Serviços</h3>
                <input
                  type="text"
                  placeholder="Buscar serviço..."
                  value={buscaTodosServicos}
                  onChange={(e) => setBuscaTodosServicos(e.target.value)}
                  className="professional-search-input"
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="crud-table" style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                      <th style={{ padding: "8px" }}>Nome</th>
                      <th style={{ padding: "8px" }}>Duração</th>
                      <th style={{ padding: "8px" }}>Preço</th>
                      <th style={{ padding: "8px", textAlign: "center" }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listaTodosServicos.map(servico => (
                      <tr key={servico.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "8px" }}><strong>{servico.nome}</strong></td>
                        <td style={{ padding: "8px" }}>{servico.duracaoMinutos} min</td>
                        <td style={{ padding: "8px" }}>R$ {Number(servico.preco || 0).toFixed(2).replace(".", ",")}</td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <button
                            type="button"
                            onClick={() => toggleServico(servico.id)}
                            style={{
                              cursor: "pointer",
                              border: "none",
                              borderRadius: "4px",
                              padding: "6px 6px",
                              fontSize: "0.7rem",
                              fontWeight: "bold",
                              color: "#155724",
                              backgroundColor: "#d4edda",
                            }}
                          >
                            Adicionar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {listaTodosServicos.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>
                          {buscaTodosServicos ? "Nenhum serviço encontrado." : "Você já adicionou todos os serviços disponíveis."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={salvarEspecialidades}
              disabled={salvandoEspecialidades}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: salvandoEspecialidades ? "#ccc" : "#1a1a2e",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontSize: "0.95rem",
                fontWeight: "bold",
                cursor: salvandoEspecialidades ? "not-allowed" : "pointer"
              }}
            >
              {salvandoEspecialidades ? "Salvando..." : "Salvar Minhas Especialidades"}
            </button>
          </div>
        </>
      )}

      <div className="professional-settings-card" style={{ padding: "10px", marginTop: "20px" }}>
        <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          Meus horários de atendimento
        </h3>
        <p style={{ color: "#777", marginBottom: "20px" }}>
          Defina quando você atende e o espaço entre um agendamento e outro.
        </p>

        {/* Um card por dia da semana, lado a lado (quebra a linha conforme
            o espaço disponível), em vez da lista vertical anterior. */}
        <div className="professional-hours-scroll">
          <div className="professional-hours-grid">
            {horarios.map(horario => (
            <div
              key={horario.diaSemana}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "16px",
                backgroundColor: horario.ativo ? "#fcfaf2" : "#f9f9f9",
                border: horario.ativo ? "1px solid #b8960c" : "1px solid #eee",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>{DIAS_DA_SEMANA[horario.diaSemana - 1]}</strong>
                <label style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "ativo", e.target.checked)} /> Ativo
                </label>
              </div>

              <div className="professional-hours-range">
                <div className="professional-hours-range__labels">
                  <span>Início <strong>{horario.horaInicio}</strong></span>
                  <span>Fim <strong>{horario.horaFim}</strong></span>
                </div>
                <div className="professional-hours-range__track">
                  <div className="professional-hours-range__fill" style={{
                    left: `${((horaParaMinutos(horario.horaInicio) - HORA_MINIMA) / (HORA_MAXIMA - HORA_MINIMA)) * 100}%`,
                    right: `${100 - ((horaParaMinutos(horario.horaFim) - HORA_MINIMA) / (HORA_MAXIMA - HORA_MINIMA)) * 100}%`,
                  }} />
                  <input
                    className="professional-hours-range__input"
                    type="range"
                    min={HORA_MINIMA}
                    max={HORA_MAXIMA}
                    step={PASSO_HORARIO}
                    value={horaParaMinutos(horario.horaInicio)}
                    disabled={!horario.ativo}
                    aria-label={`Início do atendimento de ${DIAS_DA_SEMANA[horario.diaSemana - 1]}`}
                    onChange={event => alterarFaixaHorario(horario, "horaInicio", event.target.value)}
                  />
                  <input
                    className="professional-hours-range__input"
                    type="range"
                    min={HORA_MINIMA}
                    max={HORA_MAXIMA}
                    step={PASSO_HORARIO}
                    value={horaParaMinutos(horario.horaFim)}
                    disabled={!horario.ativo}
                    aria-label={`Fim do atendimento de ${DIAS_DA_SEMANA[horario.diaSemana - 1]}`}
                    onChange={event => alterarFaixaHorario(horario, "horaFim", event.target.value)}
                  />
                </div>
                <div className="professional-hours-range__scale">
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>23:00</span>
                </div>
              </div>

              <div>
                <span style={{ display: "block", fontSize: "0.75rem", color: "#777", marginBottom: "4px" }}>Intervalo Entre Agendas (min)</span>
                <input type="number" min="0" max="240" step="5" value={horario.intervaloMinutos} disabled={!horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "intervaloMinutos", e.target.value)} style={inputStyle} />
              </div>
            </div>
            ))}
          </div>
        </div>

        <button onClick={salvarHorarios} disabled={salvandoHorarios} style={{ marginTop: "20px", width: "100%", padding: "15px", backgroundColor: salvandoHorarios ? "#ccc" : "#1a1a2e", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: salvandoHorarios ? "not-allowed" : "pointer" }}>
          {salvandoHorarios ? "Salvando..." : "Salvar Meus Horários"}
        </button>
      </div>
    </div>
  );
}
