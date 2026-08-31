import { useEffect, useState } from "react";
import api from "../../api";
import "../../styles/agendamentos-usuario.css";

export default function ConfiguracoesUsuario({ visao = "usuario" }) {
  const [usuario, setUsuario] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    email: "",
    tipo: "",
    ativo: true,
    criacao: "",
  });

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

 useEffect(() => {
  async function carregarUsuario() {
    try {
      const id = localStorage.getItem("userId");
      const res = await api.get(`/usuarios/${id}`);
      setUsuario(res.data);
    } catch (erro) {
      console.error(erro);
      alert("Erro ao carregar os dados do seu usuário.");
    } finally {
      setLoading(false);
    }
  }
  carregarUsuario();
}, []);

  function alterarCampo(campo, valor) {
    if (campo === "cpf") return;

    setUsuario({
      ...usuario,
      [campo]: valor,
    });
  }

  async function salvarUsuario() {
    try {
      setSalvando(true);

      const id = localStorage.getItem("userId");

      const dadosAtualizados = {
        ...usuario,
        cpf: usuario.cpf,
      };

      await api.put(`/usuarios/${id}`, dadosAtualizados);

      alert("Usuário atualizado com sucesso!");
    } catch (erro) {
      console.error(erro);
      alert("Erro ao salvar usuário.");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="page" style={{ padding: "40px" }}>
        Carregando usuário...
      </div>
    );
  }

  return (
    <div
      className="page"
      style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}
    >
      <div className="page-hero">
        <h1>
          Configurações de <em>Usuários</em>
        </h1>
        <p>Atualize os dados do usuário. O CPF não pode ser alterado.</p>
      </div>

      <div className="booking-card" style={{ padding: "30px", marginTop: "20px" }}>
        <label>Nome</label>
        <input
          type="text"
          value={usuario.nome}
          onChange={(e) => alterarCampo("nome", e.target.value)}
          style={inputStyle}
        />

        <label>Telefone</label>
        <input
          type="text"
          value={usuario.telefone}
          onChange={(e) => alterarCampo("telefone", e.target.value)}
          style={inputStyle}
        />

        <label>CPF</label>
        <input
          type="text"
          value={usuario.cpf}
          disabled
          style={{
            ...inputStyle,
            backgroundColor: "#eee",
            cursor: "not-allowed",
            color: "#777",
          }}
        />

        <label>Email</label>
        <input
          type="email"
          value={usuario.email}
          onChange={(e) => alterarCampo("email", e.target.value)}
          style={inputStyle}
        />

        {visao === "admin" && (
          <>
            <label>Tipo de usuário</label>
            <select
              value={usuario.tipo}
              onChange={(e) => alterarCampo("tipo", e.target.value)}
              style={inputStyle}
            >
              <option value="ADM">Administrador</option>
              <option value="CLIENTE">Cliente</option>
              <option value="PROFISSIONAL">Profissional</option>
            </select>

            <label>Status</label>
            <select
              value={usuario.ativo ? "true" : "false"}
              onChange={(e) => alterarCampo("ativo", e.target.value === "true")}
              style={inputStyle}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </>
        )}

        <button
          onClick={salvarUsuario}
          disabled={salvando}
          style={{
            marginTop: "25px",
            width: "100%",
            padding: "15px",
            backgroundColor: salvando ? "#ccc" : "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            fontSize: "1.1rem",
            fontWeight: "bold",
            cursor: salvando ? "not-allowed" : "pointer",
          }}
        >
          {salvando ? "Salvando..." : "Salvar Alterações"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "6px",
  marginBottom: "18px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  fontSize: "1rem",
};