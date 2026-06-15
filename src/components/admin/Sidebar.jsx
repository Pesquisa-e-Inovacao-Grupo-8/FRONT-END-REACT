// src/components/admin/Sidebar.jsx
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";

export default function Sidebar({ open, onClose }) {
  const role = localStorage.getItem("userRole"); // "ADMIN" ou "PROFISSIONAL"

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-logo">Tukotomi</div>

      <nav className="sidebar-menu">
<<<<<<< HEAD
        
        {/* Renderiza apenas para ADMIN */}
        {role === "ADMIN" && (
          <>
            <NavLink 
              to="/admin/dashboard" 
              className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              Dashboard
            </NavLink>

            <NavLink 
              to="/admin/usuarios" 
              className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              Usuários
            </NavLink>

            <NavLink 
              to="/admin/servicos" 
              className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              Serviços
            </NavLink>

            <NavLink 
              to="/admin/pacotes-gestao" 
              className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              Pacotes
            </NavLink>
          </>
        )}

        {/* Renderiza para ADMIN e PROFISSIONAL */}
        <NavLink 
          to="/admin/agendamentos" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
=======
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/agendamentos"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
>>>>>>> e3ef8066e8a8a7960666b2224ba6b73c808baac9
          onClick={onClose}
        >
          Agenda
        </NavLink>

<<<<<<< HEAD
        {/* Renderiza apenas para ADMIN */}
        {role === "ADMIN" && (
          <NavLink 
            to="/admin/financeiro" 
            className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            Financeiro
          </NavLink>
        )}

        {/* Renderiza para ADMIN e PROFISSIONAL */}
        <NavLink 
          to="/admin/configuracoes" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
=======
        <NavLink
          to="/admin/financeiro"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          Financeiro
        </NavLink>

        <NavLink
          to="/admin/configuracoes-usuario"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
>>>>>>> e3ef8066e8a8a7960666b2224ba6b73c808baac9
          onClick={onClose}
        >
          Configurações
        </NavLink>

<<<<<<< HEAD
        {/* Voltar Home - Disponível para todos */}
        <NavLink 
          to="/" 
=======
        <NavLink
          to="/admin/configuracoes-profissional"
          className={({ isActive }) => `item ${isActive ? "active" : ""}`}
          onClick={onClose}
        >
          Config. Profissional
        </NavLink>

        <NavLink
          to="/"
>>>>>>> e3ef8066e8a8a7960666b2224ba6b73c808baac9
          className="item"
          onClick={onClose}
          style={{
            marginTop: "auto",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "16px",
          }}
        >
          ← Voltar à Home
        </NavLink>
      </nav>
    </aside>
  );
}