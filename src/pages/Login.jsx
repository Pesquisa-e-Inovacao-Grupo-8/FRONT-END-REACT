//src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

async function handleSubmit(e) {
    e.preventDefault();

    try {
      // 1. Faz o login e pega o token
      const response = await api.post("/auth/login", {
        email,
        senha
      });
      const token = response.data.token;
      localStorage.setItem("token", token);

      // 2. Busca a lista de usuários para saber quem logou
      const usersRes = await api.get("/usuarios");

      const usuarioLogado = usersRes.data.find(u => u.email === email);

      if (usuarioLogado) {
          localStorage.setItem("userId", usuarioLogado.id);
          localStorage.setItem("userName", usuarioLogado.nome);
          localStorage.setItem("userRole", usuarioLogado.tipo); // Guarda se é CLIENTE ou PROFISSIONAL

          alert("Login realizado com sucesso!");

        if (usuarioLogado.tipo === "ADMIN") {
              navigate("/admin/dashboard");
          } else if (usuarioLogado.tipo === "PROFISSIONAL") {
            navigate("/admin/agendamentos"); 
          } else {
            navigate("/"); 
          }
      } else {
          navigate("/");
      }

    } catch (error) {
      console.error(error);
      alert("Email ou senha inválidos");
    }
  }
  return (
    <div className="container-principal">
      <div className="container-foto"></div>

      <div className="container-login">
        <div className="titulo">
          <h2>Bem-vinda de volta</h2>
          <p>Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="credenciais">
            <label>E-mail</label>
            <input
              type="email" placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="credenciais">
            <label>Senha</label>
            <input
              type="password" placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <button type="submit">Entrar</button>
        </form>
      </div>
    </div>
  );
}