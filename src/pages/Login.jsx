//src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { mostrarConfirmacao, mostrarErro } from "../components/utils/modal-confirmação";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();

async function handleSubmit(e) {
  e.preventDefault();

  try {
    const mockAdmin = import.meta.env.DEV ? window.__mockAuthUsers?.ADMIN : null;

    if (mockAdmin && email.trim().toLowerCase() === mockAdmin.email && senha === mockAdmin.senha) {
      localStorage.setItem("token", mockAdmin.token);
      localStorage.setItem("userId", mockAdmin.userId);
      localStorage.setItem("userName", mockAdmin.userName);
      localStorage.setItem("userRole", mockAdmin.userRole);

      mostrarConfirmacao("Login mock admin realizado!", 1800);
      setIsRedirecting(true);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
      return;
    }

    const response = await api.post("/auth/login", {
      email,
      senha
    });

    const token = response.data.token;
    localStorage.setItem("token", token);

    const usersRes = await api.get("/usuarios");
    console.log("Usuários recebidos do backend:", usersRes.data);

    const usuarioLogado = usersRes.data.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!usuarioLogado) {
      mostrarErro("Usuário não encontrado.", 2600);
      return;
    }

    localStorage.setItem("userId", usuarioLogado.id);
    localStorage.setItem("clientId", usuarioLogado.cliente_id);
    localStorage.setItem("userName", usuarioLogado.nome);
    localStorage.setItem("userRole", usuarioLogado.tipo);

    // Mostra o modal
    mostrarConfirmacao("Login realizado com sucesso!", 2500);
    setIsRedirecting(true);

    // Aguarda o modal terminar antes de navegar
    setTimeout(() => {
      if (usuarioLogado.tipo === "ADMIN") {
        navigate("/admin/dashboard");
      } else if (usuarioLogado.tipo === "PROFISSIONAL") {
        navigate("/admin/agendamentos");
      } else {
        navigate("/");
      }

      // setTimeout(() => {
      //     window.location.reload();
      // }, 100);

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
      {isRedirecting && (
        <div className="login-loading-overlay" role="status" aria-live="polite" aria-label="Carregando próxima página">
          <div className="login-loader" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => <span key={index} />)}
          </div>
        </div>
      )}

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

          <button type="submit" disabled={isRedirecting}>Entrar</button>
        </form>
      </div>
    </div>
  );
}