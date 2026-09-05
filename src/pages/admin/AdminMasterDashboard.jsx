//src/pages/admin/AdminMasterDashboard.jsx
import { useState } from 'react';
import '../../styles/admin-master.css'; 

import GerenciarUsuarios from '../../components/admin/GerenciarUsuarios';
import GerenciarServicos from '../../components/admin/GerenciarServicos';
import GerenciarPacotes from '../../components/admin/GerenciarPacotes';

export default function AdminMasterDashboard() {
  const [abaAtiva, setAbaAtiva] = useState('usuarios');

  const renderizarConteudo = () => {
    switch (abaAtiva) {
      case 'usuarios':
        return <GerenciarUsuarios />;
      case 'servicos':
        return <GerenciarServicos />;
      case 'pacotes':
        return <GerenciarPacotes />;
      default:
        return <div>Selecione uma aba.</div>;
    }
  };

  return (
    <div className="dashboard-master-container" style={{ padding: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      <div className="header-painel-master" style={{ marginBottom: '20px' }}>
        <h2 style={{ margin: '0 0 5px 0', color: '#1a1a2e' }}>🛠️ Painel Master</h2>
        <p style={{ margin: 0, color: '#666' }}>Gerencie os dados centrais do sistema Tokutomi.</p>
      </div>

      {/* NAVEGAÇÃO EM ABAS */}
      <div 
        className="abas-navegacao" 
        style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '25px', 
          borderBottom: '2px solid #eee', 
          paddingBottom: '15px' 
        }}
      >
        <button 
          onClick={() => setAbaAtiva('usuarios')}
          style={{
            padding: '10px 20px',
            backgroundColor: abaAtiva === 'usuarios' ? '#b8960c' : '#f5f5f5',
            color: abaAtiva === 'usuarios' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          👥 Usuários & Equipe
        </button>
        
        <button 
          onClick={() => setAbaAtiva('servicos')}
          style={{
            padding: '10px 20px',
            backgroundColor: abaAtiva === 'servicos' ? '#b8960c' : '#f5f5f5',
            color: abaAtiva === 'servicos' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          ✂️ Serviços
        </button>

        <button 
          onClick={() => setAbaAtiva('pacotes')}
          style={{
            padding: '10px 20px',
            backgroundColor: abaAtiva === 'pacotes' ? '#b8960c' : '#f5f5f5',
            color: abaAtiva === 'pacotes' ? '#fff' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.3s'
          }}
        >
          📦 Pacotes
        </button>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}
      <main className="dashboard-content" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        {renderizarConteudo()}
      </main>

    </div>
  );
}