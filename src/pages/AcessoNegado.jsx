import { Link, useLocation } from "react-router-dom";
import "../styles/acesso-negado.css";

export default function AcessoNegado() {
  const location = useLocation();
  const destino = "/";

  return (
    <main className="acesso-negado-page">
      <section className="acesso-negado-card" aria-labelledby="acesso-negado-titulo">
        <span className="acesso-negado-code">403</span>
        <div className="acesso-negado-icon" aria-hidden="true">!</div>
        <p className="acesso-negado-eyebrow">Área restrita</p>
        <h1 id="acesso-negado-titulo">Acesso não autorizado</h1>
        <p>
          Seu perfil não possui permissão para visualizar esta tela.
          Entre com uma conta autorizada para continuar.
        </p>
        <Link className="acesso-negado-button" to={destino} state={{ from: location.pathname }}>
          Voltar à página principal
        </Link>
      </section>
    </main>
  );
}
