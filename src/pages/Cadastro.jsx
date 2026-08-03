//src/pages/Cadastro.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/cadastro.css";
import Toast from "../components/Toast";
import { validarCadastro } from "../utils/validacaoCadastro";

export default function Cadastro() {
  const navigate = useNavigate();

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
  const [toast, setToast] = useState({ mensagem: "", tipo: "erro" });

  const mostrarToast = (mensagem, tipo = "erro") => setToast({ mensagem, tipo });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const erroValidacao = validarCadastro(form);
    if (erroValidacao) {
      mostrarToast(erroValidacao);
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
        tipo: "CLIENTE", // Fixo como cliente
        ativo: true
      };

      await axios.post("http://localhost:8080/usuarios", payload);

      mostrarToast("Conta criada com sucesso! Redirecionando para o login.", "sucesso");
      setTimeout(() => navigate("/login"), 1200);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      mostrarToast(error.response?.data?.message || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-principal-cadastro">
      <Toast {...toast} onClose={() => setToast({ mensagem: "", tipo: "erro" })} />
      <div className="container-foto-cadastro"></div>
      <div className="container-cadastro">
        <h1>Crie sua conta</h1>
        <p>Junte-se a nós e descubra uma nova experiência em beleza</p>

        <form onSubmit={handleSubmit} noValidate>
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
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>

          <p className="cadastro">
            Já tem uma conta? <span style={{ cursor: "pointer", color: "blue" }} onClick={() => navigate("/login")}>Faça login</span>
          </p>
        </form>
      </div>
    </div>
  );
}
