// src/components/home/Navbar.jsx
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoImage from "../../assets/renatah.png";

export default function Navbar() {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nomeSalvo = localStorage.getItem("userName");
    const roleSalvo = localStorage.getItem("userRole");

    if (token) {
      setIsLoggedIn(true);
      setUserName(nomeSalvo ? nomeSalvo.split(" ")[0] : "Usuário");
      setUserRole(roleSalvo || "CLIENTE");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    setIsLoggedIn(false);
    setUserRole("");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  let navLinks = [{ to: "/", label: "Início" }];

  if (userRole === "PROFISSIONAL") {
    navLinks.push({ to: "/admin/agendamentos", label: "Painel Profissional" });
  } else if (userRole === "ADMIN") {
    navLinks.push({ to: "/admin/dashboard", label: "Painel Master" });
  } else {
    navLinks.push({ to: "/servicos", label: "Serviços" });
    navLinks.push({ to: "/pacotes", label: "Pacotes" });
    navLinks.push({ to: "/agendamento", label: "Agendamento" });

    if (isLoggedIn) {
      navLinks.push({ to: "/agendamentos", label: "Meus Agendamentos" });
      navLinks.push({ to: "/configuracoes-usuario", label: "Minha Conta" });
    }
  }

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
        <img src={logoImage} alt="" className="navbar-logo-image" />
        Tokutomi
      </NavLink>

      <button
        type="button"
        className="navbar-toggle"
        aria-label="Abrir menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`navbar-links ${menuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          </li>
        ))}

        {isLoggedIn ? (
          <li className="navbar-user-area">
            <span className="navbar-user-name">Olá, {userName}</span>

            <button
              onClick={handleLogout}
              className="btn-cadastrar navbar-logout-btn"
              style={{
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "48px",
                padding: "0 28px",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Sair
            </button>
          </li>
        ) : (
          <>
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={closeMenu}
              >
                Login
              </NavLink>
            </li>

            <li>
              <NavLink
                to="/cadastrar"
                className={({ isActive }) => (isActive ? "btn-cadastrar active" : "btn-cadastrar")}
                onClick={closeMenu}
              >
                Cadastrar
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}