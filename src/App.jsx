// src/App.jsx
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { useState } from "react";

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
import AdminMasterDashboard from "./pages/admin/AdminMasterDashboard";
import VitrinePacotes from "./pages/VitrinePacotes";
import Financeiro from "./pages/admin/Financeiro";
import Dashboard from "./pages/admin/Dashboard";
import GerenciarUsuarios from "./components/admin/GerenciarUsuarios";
import GerenciarServicos from "./components/admin/GerenciarServicos";
import GerenciarPacotes from "./components/admin/GerenciarPacotes";

const LayoutNavbar = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

// PrivateRoute atualizado com RBAC (Role-Based Access Control)
const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole"); // Ex: "CLIENTE", "PROFISSIONAL", "ADMIN"

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redireciona o usuário para a tela principal dele se tentar acessar rota proibida
    if (role === "CLIENTE") return <Navigate to="/agendamentos" replace />;
    if (role === "PROFISSIONAL") return <Navigate to="/admin/agendamentos" replace />;
    if (role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
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

export default function App() {
  return (
    <BrowserRouter>
      <VLibras />
      <Routes>
        {/* ROTAS PÚBLICAS COM NAVBAR */}
        <Route element={<LayoutNavbar />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cadastrar" element={<Cadastro />} />
          <Route path="servicos" element={<Serviços />} />
          
          {/* PACOTES: Você tinha colocado no PrivateRoute, movi para público caso seja apenas visualização. 
              Se precisar de login, basta voltar para o bloco abaixo. */}
          <Route path="pacotes" element={<VitrinePacotes />} />
        </Route>

        {/* ROTAS PRIVADAS DO CLIENTE COM NAVBAR */}
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
        </Route>
       {/* ROTAS ADMINISTRATIVAS / PROFISSIONAIS COM SIDEBAR UNIFICADA */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN", "PROFISSIONAL"]}>
              <LayoutSidebar />
            </PrivateRoute>
          }
        >
          {/* ROTAS EXCLUSIVAS DE ADMIN */}
          <Route 
            path="dashboard" 
            element={<PrivateRoute allowedRoles={["ADMIN"]}><Dashboard /></PrivateRoute>} 
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
            path="pacotes-gestao" // Nome diferente da rota pública para não dar conflito
            element={<PrivateRoute allowedRoles={["ADMIN"]}><GerenciarPacotes /></PrivateRoute>} 
          />
          <Route 
            path="financeiro" 
            element={<PrivateRoute allowedRoles={["ADMIN"]}><Financeiro /></PrivateRoute>} 
          />

          {/* ROTAS COMPARTILHADAS (ADMIN e PROFISSIONAL) */}
          <Route 
            path="agendamentos" 
            element={<PrivateRoute allowedRoles={["ADMIN", "PROFISSIONAL"]}><AgendamentosPage /></PrivateRoute>} 
          />
          <Route 
            path="configuracoes" 
            element={<PrivateRoute allowedRoles={["ADMIN", "PROFISSIONAL"]}><ConfiguracoesProfissional /></PrivateRoute>} 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}