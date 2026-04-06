import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Início", active: true },
  { to: "/servicos", label: "Serviços" },
  { to: "/agendamento", label: "Agendamento" },
  { to: "/agendamentos", label: "Meus Agendamentos" },
  { to: "/login", label: "Login" },
];

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Tukotomi</Link>
      <ul className="navbar-links">
        {NAV_LINKS.map(link => (
          <li key={link.to}>
            <Link to={link.to} className={link.active ? "active" : ""}>
              {link.label}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/cadastrar" className="btn-cadastrar">Cadastrar</Link>
        </li>
      </ul>
    </nav>
  );
}