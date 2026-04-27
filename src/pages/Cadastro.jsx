import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cadastro.css";

export default function Cadastro() {
  const navigate = useNavigate();

  // Estado para controlar se é Cliente ou Profissional
  const [tipoUsuario, setTipoUsuario] = useState("CLIENTE");

  // Estados do formulário
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        nome: form.nome,
        cpf: form.cpf,
        telefone: form.telefone,
        email: form.email,
        senha: form.senha,
        tipo: tipoUsuario, // "CLIENTE" ou "PROFISSIONAL"
        ativo: true
      };

      await axios.post("http://localhost:8080/usuarios/usuarios", payload);

      alert("Conta criada com sucesso! Faça login para entrar no seu painel.");
      navigate("/login");

    } catch (error) {
      console.error("Erro no cadastro:", error);
      setErro(error.response?.data?.message || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-principal-cadastro">
      <div className="container-foto-cadastro"></div>
      <div className="container-cadastro">
        <h1>Crie sua conta</h1>
        <p>Junte-se a nós e descubra uma nova experiência em beleza</p>

        {/* BOTOES DE ESCOLHA DE PERFIL */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button 
            type="button" 
            onClick={() => setTipoUsuario("CLIENTE")}
            style={{ flex: 1, padding: "10px", backgroundColor: tipoUsuario === "CLIENTE" ? "#b8960c" : "#eee", color: tipoUsuario === "CLIENTE" ? "#fff" : "#333", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Sou Cliente
          </button>
          <button 
            type="button" 
            onClick={() => setTipoUsuario("PROFISSIONAL")}
            style={{ flex: 1, padding: "10px", backgroundColor: tipoUsuario === "PROFISSIONAL" ? "#1a1a2e" : "#eee", color: tipoUsuario === "PROFISSIONAL" ? "#fff" : "#333", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Sou Profissional
          </button>
        </div>

        {erro && <div style={{ color: "red", marginBottom: "15px" }}>{erro}</div>}

        <form onSubmit={handleSubmit}>
          <label>Nome Completo</label>
          <div>
            <input type="text" name="nome" placeholder="Seu nome" value={form.nome} onChange={handleChange} required />
          </div>

          <div className="input-wrapper">
            <div>
              <label>CPF</label>
              <div>
                <input type="text" name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required />
              </div>
            </div>
            <div>
              <label>Telefone</label>
              <div>
                <input type="text" name="telefone" placeholder="(11) 9999-9999" value={form.telefone} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <label>E-mail</label>
          <div>
            <input type="email" name="email" placeholder="seuemail@exemplo.com" value={form.email} onChange={handleChange} required />
          </div>

          <label>Senha</label>
          <div className="input-senha">
            <input type="password" name="senha" placeholder="********" value={form.senha} onChange={handleChange} required />
          </div>

          <label>Confirmar Senha</label>
          <div className="input-senha">
            <input type="password" name="confirmarSenha" placeholder="********" value={form.confirmarSenha} onChange={handleChange} required />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: "20px" }}>
            {loading ? "Criando conta..." : `Cadastrar como ${tipoUsuario === "CLIENTE" ? "Cliente" : "Profissional"}`}
          </button>

          <p className="cadastro">
            Já tem uma conta? <span style={{ cursor: "pointer", color: "blue" }} onClick={() => navigate("/login")}>Faça login</span>
          </p>
        </form>
      </div>
    </div>
  );
}