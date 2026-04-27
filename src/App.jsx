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


const LayoutNavbar = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

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
        <Route element={<LayoutNavbar />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="cadastrar" element={<Cadastro />} />
          <Route path="servicos" element={<Serviços />} />
        </Route>

        <Route element={<LayoutNavbar />}>
          <Route
            path="agendamento"
            element={
              <PrivateRoute>
                <Agendamento />
              </PrivateRoute>
            }
          />

          <Route
            path="agendamentos"
            element={
              <PrivateRoute>
                <AgendamentosUsuário />
              </PrivateRoute>
            }
          />
        </Route>

        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <LayoutSidebar />
            </PrivateRoute>
          }
        >
          <Route path="agendamentos" element={<AgendamentosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}