// src/components/admin/Sidebar.jsx
import { NavLink } from "react-router-dom";
import "../../styles/sidebar.css";
import "../../styles/admin-master.css";

export default function Sidebar({ open, onClose }) {
  const role = localStorage.getItem("userRole"); // "ADMIN" ou "PROFISSIONAL"

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-logo">Tokutomi</div>

      <nav className="sidebar-menu">
        
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
          onClick={onClose}
        >
          Agenda
        </NavLink>

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
          onClick={onClose}
        >
          Configurações
        </NavLink>

        {/* Voltar Home - Disponível para todos */}
        <NavLink 
          to="/" 
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