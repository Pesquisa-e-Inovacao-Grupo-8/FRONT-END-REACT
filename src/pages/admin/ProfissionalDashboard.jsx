import { CalendarDays, ClipboardList, Settings, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "../../styles/admin-master.css";
import "../../styles/acesso-negado.css";

const atalhos = [
  {
    to: "/admin/agendamentos",
    titulo: "Minha agenda",
    descricao: "Visualize os atendimentos e organize seus horários.",
    icone: CalendarDays,
  },
  {
    to: "/admin/configuracoes",
    titulo: "Minhas especialidades",
    descricao: "Atualize os serviços que você realiza no salão.",
    icone: Settings,
  },
];

export default function ProfissionalDashboard() {
  const nome = localStorage.getItem("userName")?.split(" ")[0] || "profissional";

  return (
    <main className="perfil-dashboard">
      <header className="perfil-dashboard__hero">
        <span className="perfil-dashboard__eyebrow"><Sparkles size={16} /> Área profissional</span>
        <h1>Olá, <em>{nome}</em>.</h1>
        <p>Tenha uma visão rápida da sua rotina e mantenha seus serviços atualizados.</p>
      </header>

      <section className="perfil-dashboard__grid" aria-label="Atalhos profissionais">
        {atalhos.map(({ to, titulo, descricao, icone: Icon }) => (
          <Link className="perfil-dashboard__card" to={to} key={to}>
            <span className="perfil-dashboard__card-icon"><Icon size={24} /></span>
            <span>
              <strong>{titulo}</strong>
              <small>{descricao}</small>
            </span>
            <span className="perfil-dashboard__arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </section>

      <div className="perfil-dashboard__note">
        <ClipboardList size={20} />
        <span>Use a agenda para acompanhar os próximos clientes e atualizar o status dos atendimentos.</span>
      </div>
    </main>
  );
}
