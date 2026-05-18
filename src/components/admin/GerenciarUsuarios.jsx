import { useState, useEffect } from 'react';
import api from '../../api';

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados de Filtro
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Erro ao carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  const deletarUsuario = async (id, tipo) => {
    if (tipo === 'ADMIN') {
      alert("Você não pode deletar um Administrador por aqui!");
      return;
    }

    if (window.confirm("Atenção: Deletar este usuário apagará também a ficha dele. Deseja continuar?")) {
      try {
        await api.delete(`/usuarios/${id}`);
        setUsuarios(usuarios.filter(u => u.id !== id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Não foi possível deletar o usuário.");
      }
    }
  };

  // 👇 FUNÇÃO MÁGICA PARA TIRAR ACENTOS 👇
  const removerAcentos = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  };

  // 👇 LÓGICA DO FILTRO DUPLO (Tipo + Texto) 👇
  const usuariosFiltrados = usuarios.filter(user => {
    // 1. Passa pelo filtro de Tipo (Dropdown)
    if (filtroTipo !== 'TODOS' && user.tipo !== filtroTipo) return false;

    // 2. Passa pelo filtro de Texto (Nome ou Email sem acento)
    const buscaLimpa = removerAcentos(termoBusca.toLowerCase());
    const nomeLimpo = removerAcentos(user.nome.toLowerCase());
    const emailLimpo = removerAcentos(user.email.toLowerCase());

    return nomeLimpo.includes(buscaLimpa) || emailLimpo.includes(buscaLimpa);
  });

  return (
    <div className="crud-section">
      <div className="crud-header">
        <h2>Gestão de Usuários</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* BARRA DE PESQUISA */}
          <input 
            type="text" 
            placeholder="Buscar nome ou email..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
          />

          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="TODOS">Todos os Usuários</option>
            <option value="CLIENTE">Apenas Clientes</option>
            <option value="PROFISSIONAL">Apenas Profissionais</option>
            <option value="ADMIN">Apenas Admins</option>
          </select>
          
          <button className="btn-novo" onClick={() => setModalAberto(true)}>
            + Novo Usuário
          </button>
        </div>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Permissão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(user => (
            <tr key={user.id}>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.telefone}</td>
              <td>
                <span className={`badge-role ${user.tipo?.toLowerCase()}`}>
                  {user.tipo}
                </span>
              </td>
              <td>
                <button className="action-btn" title="Editar">✏️</button>
                {user.tipo !== 'ADMIN' && (
                  <button className="action-btn" title="Deletar" onClick={() => deletarUsuario(user.id, user.tipo)}>🗑️</button>
                )}
              </td>
            </tr>
          ))}
          {usuariosFiltrados.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Nenhum usuário encontrado na pesquisa. 🕵️‍♂️</td></tr>
          )}
        </tbody>
      </table>

      {/* 👇 ESTRUTURA BÁSICA DO MODAL (ESCONDIDA ATÉ CLICAR NO BOTÃO) 👇 */}
      {modalAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '400px' }}>
            <h3>Criar Novo Usuário</h3>
            <p>O formulário entrará aqui!</p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setModalAberto(false)} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancelar</button>
              <button style={{ padding: '8px 15px', background: '#b8960c', color: '#fff', border: 'none', cursor: 'pointer' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}