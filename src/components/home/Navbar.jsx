import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
const navigate = useNavigate();

const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nomeSalvo = localStorage.getItem("userName");

    if (token) {
      setIsLoggedIn(true);
      setUserName(nomeSalvo ? nomeSalvo.split(" ")[0] : "Cliente");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    
    setIsLoggedIn(false);
    navigate("/login");
  };

  const BASE_LINKS = [
    { to: "/", label: "Início" },
    { to: "/servicos", label: "Serviços" },
    { to: "/agendamento", label: "Agendamento" },
  ];

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        Tukotomi
      </NavLink>

      <ul className="navbar-links">
        {BASE_LINKS.map(link => (
          <li key={link.to}>
            <NavLink to={link.to} className={({ isActive }) => (isActive ? "active" : "")}>
              {link.label}
            </NavLink>
          </li>
        ))}

        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/agendamentos" className={({ isActive }) => (isActive ? "active" : "")}>
                Meus Agendamentos
              </NavLink>
            </li>
            
            <li style={{ display: "flex", alignItems: "center", marginLeft: "15px", gap: "15px" }}>
              <span style={{ fontWeight: "bold", color: "#b8960c" }}>
                Olá, {userName}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn-cadastrar" 
                style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
              >
                Sair
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/cadastrar" className="btn-cadastrar">
                Cadastrar
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}