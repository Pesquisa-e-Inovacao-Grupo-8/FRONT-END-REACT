//src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { mostrarConfirmacao, mostrarErro } from "../components/utils/modal-confirmação";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const navigate = useNavigate();

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await api.post("/auth/login", {
      email,
      senha
    });

    const token = response.data.token;
    localStorage.setItem("token", token);

    const usersRes = await api.get("/usuarios");

    const usuarioLogado = usersRes.data.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!usuarioLogado) {
      mostrarErro("Usuário não encontrado.", 2600);
      return;
    }

    localStorage.setItem("userId", usuarioLogado.id);
    localStorage.setItem("userName", usuarioLogado.nome);
    localStorage.setItem("userRole", usuarioLogado.tipo);

    // Mostra o modal
    mostrarConfirmacao("Login realizado com sucesso!", 2800);

    // Aguarda o modal terminar antes de navegar
    setTimeout(() => {
      if (usuarioLogado.tipo === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (usuarioLogado.tipo === "PROFISSIONAL") {
        navigate("/admin/agendamentos");
      } else {
        navigate("/");
      }
    }, 2200);

  } catch (error) {
    console.error("Erro no login:", error);

    if (error.response?.status === 401) {
      mostrarErro("Email ou senha inválidos", 2600);
    } else if (error.response?.status === 403) {
      mostrarErro("Você não tem permissão para acessar.", 2600);
    } else {
      mostrarErro("Erro ao realizar login.", 2600);
    }
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