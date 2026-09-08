// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/home/Navbar";
import Sidebar from "./components/admin/Sidebar";
import VLibras from "./components/utils/VLibras";

import AgendamentosPage from "./pages/admin/Agendamentos";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Serviços from "./pages/Serviços";
import Agendamento from "./pages/Agendamento";
import AgendamentosUsuário from "./pages/AgendamentosUsuário";
import ConfiguracoesProfissional from "./pages/admin/ConfiguracoesProfissional";
import ConfiguracoesUsuario from "./pages/admin/ConfiguracoesUsuario";
import AdminMasterDashboard from "./pages/admin/AdminMasterDashboard";
import VitrinePacotes from "./pages/VitrinePacotes";
import MeusPacotes from "./pages/MeusPacotes";
import Financeiro from "./pages/admin/Financeiro";
import Dashboard from "./pages/admin/Dashboard";
import ProfissionalDashboard from "./pages/admin/ProfissionalDashboard";
import AcessoNegado from "./pages/AcessoNegado";
import { getUsuarioLogado, normalizarRole, validarAcessoNoBackend } from "./validate-access";
import GerenciarUsuarios from "./components/admin/GerenciarUsuarios";
import GerenciarServicos from "./components/admin/GerenciarServicos";
import GerenciarPacotes from "./components/admin/GerenciarPacotes";

const isDevEnvironment = () => {
  const mode = (window._env_?.VITE_ENV || "production").toLowerCase();
  return mode === "development" || mode === "DEV";
};

const setupDevMockAuth = () => {
  if (!isDevEnvironment()) return;

  const mockUsers = {
    CLIENTE: {
      token: "mock-client-token",
      userId: "mock-client-id",
      userName: "Cliente Mock",
      userRole: "CLIENTE",
      email: "cliente.mock@tokutomi.com", 
      senha: "Cliente123!"
    },
    PROFISSIONAL: {
      token: "mock-profissional-token",
      userId: "mock-profissional-id",
      userName: "Profissional Mock",
      userRole: "PROFISSIONAL",
      email: "profissional.mock@tokutomi.com",
      senha: "Profissional123!"
    },
    ADMIN: {
      token: "mock-admin-token",
      userId: "mock-admin-id",
      userName: "Admin Mock",
      userRole: "ADMIN",
      email: "admin.mock@tokutomi.com",
      senha: "Admin123!",
    },
  };

  window.__mockAuthUsers = mockUsers;

  window.loginMock = (role = "CLIENTE") => {
    const user = mockUsers[role] || mockUsers.CLIENTE;
    localStorage.setItem("token", user.token);
    localStorage.setItem("userId", user.userId);
    localStorage.setItem("userName", user.userName);
    localStorage.setItem("userRole", user.userRole);
    window.location.reload();
  };

  window.logoutMock = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.reload();
  };

  window.loginMockCliente = () => window.loginMock("CLIENTE");
  window.loginMockProfissional = () => window.loginMock("PROFISSIONAL");
  window.loginMockAdmin = () => window.loginMock("ADMIN");
};

if (typeof window !== "undefined") {
  setupDevMockAuth();
}

const LayoutNavbar = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const getSessionRole = (token) => {
  try {
    const decoded = jwtDecode(token);
    const tokenRole = normalizarRole(decoded.tipo || decoded.role);
    if (tokenRole) return tokenRole;
  } catch {
    // Mocks locais não são JWTs; nesses casos usamos o valor salvo.
  }

  return normalizarRole(localStorage.getItem("userRole"));
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const [estado, setEstado] = useState("validando");
  const [role, setRole] = useState("");

  useEffect(() => {
    let ativo = true;

    async function validarSessao() {
      const usuarioLocal = getUsuarioLogado();

      if (!usuarioLocal) {
        if (ativo) setEstado("login");
        return;
      }

      const acesso = await validarAcessoNoBackend();
      if (!ativo) return;

      if (!acesso.valido) {
        clearSession();
        setEstado("login");
        return;
      }

      setRole(normalizarRole(acesso.tipo || usuarioLocal.tipo));
      setEstado("autorizado");
    }

    validarSessao();
    return () => { ativo = false; };
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  if (estado === "validando") return <div style={{ padding: "40px", textAlign: "center" }}>Validando acesso...</div>;
  if (estado === "login") return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.map(normalizarRole).includes(role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};

const isTokenUsable = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return !exp || exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const clearSession = () => {
  ["token", "userId", "userName", "userRole"].forEach((key) => localStorage.removeItem(key));
};

const LayoutSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className="content-admin"
        style={{
          flex: 1,
          transition: "margin-left 0.3s",
        }}
      >
        <button
          className="hamburger-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "fixed",
            top: "10px",
            left: "10px",
            zIndex: 2001,
            background: "#333",
            color: "white",
            border: "none",
            borderRadius: "4px",
            paddingBottom: "5px",
            cursor: "pointer",
            fontSize: "20px",
            transition: "all 0.6s ease",
          }}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>

        <Outlet />
      </div>
    </div>
  );
};

const AdminHomeRedirect = () => {
  const role = getSessionRole(localStorage.getItem("token"));
  return <Navigate to={role === "PROFISSIONAL" ? "/admin/inicio-profissional" : "/admin/dashboard"} replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <VLibras />
      <ToastContainer position="top-right" newestOnTop closeOnClick />
      <Routes>
        <Route element={<LayoutNavbar />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cadastrar" element={<Cadastro />} />
          <Route path="servicos" element={<Serviços />} />
          <Route path="pacotes" element={<VitrinePacotes />} />
        </Route>

        <Route element={<LayoutNavbar />}>
          <Route
            path="agendamento"
            element={
              <PrivateRoute allowedRoles={["CLIENTE"]}>
                <Agendamento />
              </PrivateRoute>
            }
          />
          <Route
            path="agendamentos"
            element={
              <PrivateRoute allowedRoles={["CLIENTE"]}>
                <AgendamentosUsuário />
              </PrivateRoute>
            }
          />
          <Route
            path="meus-pacotes"
            element={
              <PrivateRoute allowedRoles={["CLIENTE"]}>
                <MeusPacotes />
              </PrivateRoute>
            }
          />
          <Route
            path="configuracoes-usuario"
            element={
              <PrivateRoute allowedRoles={["CLIENTE"]}>
                <ConfiguracoesUsuario />
              </PrivateRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PROFISSIONAL"]}>
              <LayoutSidebar />
            </PrivateRoute>
          }
        >
          <Route
            path="dashboard"
            element={<PrivateRoute allowedRoles={["ADMIN"]}><Dashboard /></PrivateRoute>}
          />
          <Route index element={<AdminHomeRedirect />} />
          <Route
            path="inicio-profissional"
            element={<PrivateRoute allowedRoles={["PROFISSIONAL"]}><ProfissionalDashboard /></PrivateRoute>}
          />
          <Route
            path="usuarios"
            element={<PrivateRoute allowedRoles={["ADMIN"]}><GerenciarUsuarios /></PrivateRoute>}
          />
          <Route
            path="servicos"
            element={<PrivateRoute allowedRoles={["ADMIN"]}><GerenciarServicos /></PrivateRoute>}
          />
          <Route
            path="pacotes-gestao"
            element={<PrivateRoute allowedRoles={["ADMIN"]}><GerenciarPacotes /></PrivateRoute>}
          />
          <Route
            path="financeiro"
            element={<PrivateRoute allowedRoles={["ADMIN"]}><Financeiro /></PrivateRoute>}
          />

          <Route
            path="agendamentos"
            element={<PrivateRoute allowedRoles={["ADMIN", "PROFISSIONAL"]}><AgendamentosPage /></PrivateRoute>}
          />
          <Route
            path="configuracoes"
            element={
              <PrivateRoute allowedRoles={["PROFISSIONAL"]}>
                <ConfiguracoesProfissional />
              </PrivateRoute>
            }
          />
          <Route path="acesso-negado" element={<AcessoNegado />} />
        </Route>

        <Route path="/acesso-negado" element={<AcessoNegado />} />
      </Routes>
    </BrowserRouter>
  );
}