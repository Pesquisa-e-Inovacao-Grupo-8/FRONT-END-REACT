import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin-master.css'; 

import GerenciarUsuarios from '../../components/admin/GerenciarUsuarios';
import GerenciarServicos from '../../components/admin/GerenciarServicos';
import GerenciarPacotes from '../../components/admin/GerenciarPacotes';

export default function AdminMasterDashboard() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  useEffect(() => {
    // A muralha do castelo: Se não for ADMIN, manda embora!
    const role = localStorage.getItem("userRole");
    if (role !== "ADMIN") {
      alert("Acesso Negado. Esta área é restrita para o Administrador Master.");
      navigate("/");
    }
  }, [navigate]);

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'usuarios':
        return <GerenciarUsuarios />;
      case 'servicos':
        return <GerenciarServicos />;
      case 'pacotes':
        return <GerenciarPacotes />;
      default:
        return <div>Selecione uma opção no menu lateral.</div>;
    }
  };

  return (
    <div className="dashboard-master-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>Painel <em>Master</em></h2>
          <span className="badge-admin">Super Admin</span>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={abaAtiva === 'usuarios' ? 'active' : ''} 
            onClick={() => setAbaAtiva('usuarios')}
          >
            👥 Usuários & Equipe
          </button>
          
          <button 
            className={abaAtiva === 'servicos' ? 'active' : ''} 
            onClick={() => setAbaAtiva('servicos')}
          >
            ✂️ Serviços
          </button>

          <button 
            className={abaAtiva === 'pacotes' ? 'active' : ''} 
            onClick={() => setAbaAtiva('pacotes')}
          >
            📦 Pacotes
          </button>
          
          <button style={{marginTop: 'auto', borderTop: '1px solid #333'}} onClick={() => navigate("/")}>
            ⬅️ Voltar ao Site
          </button>
        </nav>
      </aside>

      <main className="dashboard-content">
        {renderizarConteudo()}
      </main>
    </div>
  );
}