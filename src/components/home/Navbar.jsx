import { NavLink } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/agendamento", label: "Agendamento" },
  { to: "/agendamentos", label: "Meus Agendamentos" },
  { to: "/login", label: "Login" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        Tukotomi
      </NavLink>

      <ul className="navbar-links">
        {NAV_LINKS.map(link => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {link.label}
            </NavLink>
          </li>
        ))}

        <li>
          <NavLink to="/cadastrar" className="btn-cadastrar">
            Cadastrar
          </NavLink>
        </li>
        
      </ul>
    </nav>
  );
}