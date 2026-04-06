import { NavLink } from "react-router-dom";
import '../../styles/sidebar.css';

export default function Sidebar({ open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-logo">Tukotomi</div>

      <nav className="sidebar-menu">
        <NavLink to="/adm_dashboard" className="item" onClick={onClose}>
          Dashboard
        </NavLink>

        <NavLink to="/admin/agendamentos" className="item" onClick={onClose}>
          Agendamentos
        </NavLink>

        <NavLink to="/adm_financeiro" className="item" onClick={onClose}>
          Financeiro
        </NavLink>

        <NavLink to="/adm_clientes" className="item" onClick={onClose}>
          Clientes
        </NavLink>

        <NavLink to="/admin/agendamentos" className="item" onClick={onClose}>
          Relatórios
        </NavLink>
      </nav>
    </aside>
  );
}