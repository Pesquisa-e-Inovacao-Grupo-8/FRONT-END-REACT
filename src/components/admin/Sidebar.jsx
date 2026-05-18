import { NavLink } from "react-router-dom";
import '../../styles/sidebar.css';

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">Tukotomi</div>

      <nav className="sidebar-menu">
        <NavLink 
          to="/admin/dashboard" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Dashboard
        </NavLink>

        <NavLink 
          to="/admin/agendamentos" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Agendamentos
        </NavLink>

        <NavLink 
          to="/admin/financeiro" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Financeiro
        </NavLink>

        <NavLink 
          to="/admin/clientes" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Clientes
        </NavLink>

        <NavLink 
          to="/admin/relatorios" 
          className={({ isActive }) => `item ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          Relatórios
        </NavLink>

        <NavLink 
          to="/" 
          className="item"
          onClick={onClose}
          style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}
        >
          ← Voltar à Home
        </NavLink>
      </nav>
    </aside>
  );
}