//src/pages/Cadastro.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import api from "../api";
import "../styles/cadastro.css";
import "react-toastify/dist/ReactToastify.css";

const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const validarCpf = (cpf) => {
  const numeros = cpf.replace(/\D/g, "");

  if (numeros.length !== 11 || /^(\d)\1+$/.test(numeros)) return false;

  let soma = 0;
  for (let indice = 0; indice < 9; indice += 1) {
    soma += Number(numeros[indice]) * (10 - indice);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(numeros[9])) return false;

  soma = 0;
  for (let indice = 0; indice < 10; indice += 1) {
    soma += Number(numeros[indice]) * (11 - indice);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(numeros[10]);
};

const validarTelefone = (telefone) => {
  const numeros = telefone.replace(/\D/g, "");
  return numeros.length === 10 || numeros.length === 11;
};

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarEmail(form.email)) {
      toast.error("Informe um e-mail válido.");
      return;
    }

    if (!validarCpf(form.cpf)) {
      toast.error("Informe um CPF válido.");
      return;
    }

    if (!validarTelefone(form.telefone)) {
      toast.error("Informe um telefone válido com DDD.");
      return;
    }

    if (form.senha.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      toast.error("As senhas não coincidem.");
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

      await api.post("/usuarios", payload);

      toast.success("Conta criada com sucesso! Redirecionando para o login.");
      setTimeout(() => navigate("/login"), 1500);

    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error(error.response?.data?.message || "Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        theme="light"
        limit={3}
        className="cadastro-toast-container"
        toastClassName="cadastro-toast"
      />
      <div className="container-principal-cadastro">
        <div className="container-foto-cadastro"></div>
        <div className="container-cadastro">
          <h1>Crie sua conta</h1>
          <p>Junte-se a nós e descubra uma nova experiência em beleza</p>

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
              {loading ? "Criando conta..." : "Cadastrar"}
            </button>

            <p className="cadastro">
              Já tem uma conta? <span style={{ cursor: "pointer", color: "blue" }} onClick={() => navigate("/login")}>Faça login</span>
            </p>
          </form>
        </div>
      </div>
    </>
  );
}