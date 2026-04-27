import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "../../styles/agendamentos-usuario.css"; // Reaproveitando estilos

export default function ConfiguracoesProfissional() {
    const navigate = useNavigate();
  const [servicosDoSalao, setServicosDoSalao] = useState([]);
  const [meusServicos, setMeusServicos] = useState([]); // IDs dos serviços que eu faço
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  // Busca os dados ao carregar a página
useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        // 1. Busca todos os serviços que o salão oferece
        const resServicos = await api.get("/servicos");
        setServicosDoSalao(resServicos.data);

        // 2. Busca no banco de dados (Java) os serviços já marcados deste profissional
        const meuId = localStorage.getItem("userId");
        if (meuId) {
            const resMeus = await api.get(`/profissionais/meus-servicos/${meuId}`);
            // Pega apenas os IDs dos serviços retornados pelo banco para marcar os checkboxes
            if (resMeus.data) {
                setMeusServicos(resMeus.data.map(s => s.id));
            }
        }

      } catch (error) {
        console.error("Erro ao carregar serviços:", error);
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

const salvarEspecialidades = async () => {
    try {
      setSalvando(true);
      
      const meuId = localStorage.getItem("userId");
      
      // Envia a lista de IDs (meusServicos) para o Java
      await api.post(`/profissionais/vincular-servicos/${meuId}`, meusServicos);
      
      alert("Suas especialidades foram salvas com sucesso no banco de dados!");
      
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações no servidor.");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <div className="page" style={{ padding: "40px" }}>Carregando serviços disponíveis...</div>;

  return (
    <div className="page" style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
        <button 
        onClick={() => navigate("/admin/agendamentos")}
        style={{ 
          marginBottom: "20px", 
          padding: "8px 0", 
          cursor: "pointer", 
          border: "none", 
          backgroundColor: "transparent", 
          color: "#b8960c", 
          fontWeight: "bold", 
          fontSize: "1rem", 
          display: "flex", 
          alignItems: "center", 
          gap: "5px" 
        }}
      >
        Voltar
      </button>
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
          disabled={salvando || meusServicos.length === 0}
          style={{
            marginTop: "30px",
            width: "100%",
            padding: "15px",
            backgroundColor: salvando || meusServicos.length === 0 ? "#ccc" : "#1a1a2e",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: salvando || meusServicos.length === 0 ? "not-allowed" : "pointer"
          }}
        >
          {salvando ? "Salvando..." : "Salvar Minhas Especialidades"}
        </button>
      </div>
    </div>
  );
}