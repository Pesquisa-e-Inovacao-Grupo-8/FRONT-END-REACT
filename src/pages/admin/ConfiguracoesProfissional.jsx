//src/pages/admin/ConfiguracoesProfissional.jsx
import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/agendamentos-usuario.css"; // Reaproveitando estilos
import { mostrarSucessoMensagem } from '../../components/utils/mensagem';
import { mostrarAvisoObrigatorio } from '../../components/utils/confirm-dialog';

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "0.95rem",
  backgroundColor: "#fff",
};

const DIAS_DA_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const criarHorariosPadrao = () => Array.from({ length: 7 }, (_, index) => ({
  diaSemana: index + 1,
  horaInicio: "09:00",
  horaFim: "18:00",
  intervaloMinutos: 15,
  ativo: index < 6,
}));

export default function ConfiguracoesProfissional() {
  const [servicosDoSalao, setServicosDoSalao] = useState([]);
  const [meusServicos, setMeusServicos] = useState([]);
  const [horarios, setHorarios] = useState(criarHorariosPadrao);
  const [loading, setLoading] = useState(true);
  const [salvandoEspecialidades, setSalvandoEspecialidades] = useState(false);
  const [salvandoHorarios, setSalvandoHorarios] = useState(false);

  // Busca os dados ao carregar a página
useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        // 1. Busca todos os serviços que o salão oferece
        const resServicos = await api.get("/servicos");
        setServicosDoSalao(resServicos.data);

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
        // Pega apenas os IDs dos serviços retornados pelo banco para marcar os checkboxes
        if (resMeus.data) {
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
  // Controla o Checkbox
  const toggleServico = (idServico) => {
    if (meusServicos.includes(idServico)) {
      // Se já tem, tira
      setMeusServicos(meusServicos.filter(id => id !== idServico));
    } else {
      // Se não tem, adiciona
      setMeusServicos([...meusServicos, idServico]);
    }
  };

  const alterarHorario = (diaSemana, campo, valor) => {
    setHorarios(prev => prev.map(horario => (
      horario.diaSemana === diaSemana ? { ...horario, [campo]: valor } : horario
    )));
  };

  const salvarHorarios = async () => {
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
    try {
      setSalvandoEspecialidades(true);
      
      // Envia a lista de IDs (meusServicos) para o Java
      await api.post("/profissionais/vincular-servicos", meusServicos);
      
      mostrarSucessoMensagem("Suas especialidades foram salvas com sucesso no banco de dados!");
      
    } catch (error) {
      console.error(error);
      await mostrarAvisoObrigatorio("Erro ao salvar configurações no servidor. Contate o suporte.");
    } finally {
      setSalvandoEspecialidades(false);
    }
  };

  if (loading) return <div className="page profile-page" style={{ padding: "40px" }}>Carregando serviços disponíveis...</div>;

  return (
    <div className="page profile-page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <div className="page-hero">
        <h1>Meu <em>Perfil Profissional</em></h1>
        <p>Selecione quais serviços você está habilitado a realizar no salão</p>
      </div>

      <div className="booking-card" style={{ padding: "30px", marginTop: "20px" }}>
        <h3 style={{ marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          Especialidades
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {servicosDoSalao.length === 0 ? (
            <p>Nenhum serviço cadastrado no sistema do salão ainda.</p>
          ) : (
            servicosDoSalao.map(servico => (
              <label 
                key={servico.id} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  padding: "15px", 
                  backgroundColor: meusServicos.includes(servico.id) ? "#fcfaf2" : "#f9f9f9",
                  border: meusServicos.includes(servico.id) ? "1px solid #b8960c" : "1px solid #eee",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <input 
                  type="checkbox" 
                  checked={meusServicos.includes(servico.id)}
                  onChange={() => toggleServico(servico.id)}
                  style={{ width: "20px", height: "20px", accentColor: "#b8960c" }}
                />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "1.1rem", color: "#333" }}>{servico.nome}</strong>
                  <span style={{ color: "#777", fontSize: "0.9rem" }}>{servico.duracaoMinutos} min • R$ {servico.preco.toFixed(2)}</span>
                </div>
              </label>
            ))
          )}
        </div>

        <button 
          onClick={salvarEspecialidades}
          disabled={salvandoEspecialidades}
          style={{
            marginTop: "30px",
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

      <div className="booking-card" style={{ padding: "30px", marginTop: "20px" }}>
        <h3 style={{ marginBottom: "10px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          Meus horários de atendimento
        </h3>
        <p style={{ color: "#777", marginBottom: "20px" }}>
          Defina quando você atende e o espaço entre um agendamento e outro.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {horarios.map(horario => (
            <div key={horario.diaSemana} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr auto", gap: "10px", alignItems: "center" }}>
              <strong>{DIAS_DA_SEMANA[horario.diaSemana - 1]}</strong>
              <input type="time" value={horario.horaInicio} disabled={!horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "horaInicio", e.target.value)} style={inputStyle} />
              <input type="time" value={horario.horaFim} disabled={!horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "horaFim", e.target.value)} style={inputStyle} />
              <input type="number" min="0" max="240" step="5" value={horario.intervaloMinutos} disabled={!horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "intervaloMinutos", e.target.value)} style={inputStyle} />
              <label style={{ display: "flex", alignItems: "center", gap: "5px", whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={horario.ativo} onChange={e => alterarHorario(horario.diaSemana, "ativo", e.target.checked)} /> Ativo
              </label>
            </div>
          ))}
        </div>

        <button onClick={salvarHorarios} disabled={salvandoHorarios} style={{ marginTop: "20px", width: "100%", padding: "15px", backgroundColor: salvandoHorarios ? "#ccc" : "#1a1a2e", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: salvandoHorarios ? "not-allowed" : "pointer" }}>
          {salvandoHorarios ? "Salvando..." : "Salvar Meus Horários"}
        </button>
      </div>
    </div>
  );
}