//src/components/admin/GerenciarUsuarios.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import mostrarMensagem, { mostrarErroMensagem, mostrarSucessoMensagem } from '../utils/mensagem';
import mostrarConfirmacaoAssincrona, { mostrarAvisoObrigatorio } from '../utils/confirm-dialog';

const ESTADO_INICIAL_FORM = {
  nome: '',
  cpf: '',
  telefone: '',
  email: '',
  senha: '',
  tipo: 'PROFISSIONAL' // Padrão ao abrir o modal
};

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de Filtro
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [formNovoUsuario, setFormNovoUsuario] = useState(ESTADO_INICIAL_FORM);
  const [salvando, setSalvando] = useState(false);

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
      await mostrarAvisoObrigatorio("Erro ao carregar a lista de usuários. Contate o suporte.");
    } finally {
      setLoading(false);
    }
  };

  const abrirModalEditar = (user) => {
    setUsuarioEditandoId(user.id);
    setFormNovoUsuario({
      nome: user.nome,
      cpf: user.cpf,
      telefone: user.telefone,
      email: user.email,
      senha: '', // Deixe em branco, a menos que vá resetar
      tipo: user.tipo || 'CLIENTE'
    });
    setModalAberto(true);
  };

  const deletarUsuario = async (id, tipo) => {
    if (tipo === 'ADMIN') {
      await mostrarAvisoObrigatorio("Você não pode deletar um Administrador por aqui!");
      return;
    }

    const confirmar = await mostrarConfirmacaoAssincrona("Atenção: Deletar este usuário apagará também a ficha dele. Deseja continuar?");
    if (!confirmar) return;

    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (error) {
      console.error("Erro ao deletar:", error);
      await mostrarAvisoObrigatorio("Não foi possível deletar o usuário. Contate o suporte.");
    }
  };

  // FUNÇÃO MÁGICA PARA TIRAR ACENTOS
  const removerAcentos = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  };

  // LÓGICA DO FILTRO DUPLO (Tipo + Texto)
  const usuariosFiltrados = usuarios.filter(user => {
    if (filtroTipo !== 'TODOS' && user.tipo !== filtroTipo) return false;

    const buscaLimpa = removerAcentos(termoBusca.toLowerCase());
    const nomeLimpo = removerAcentos(user.nome.toLowerCase());
    const emailLimpo = removerAcentos(user.email.toLowerCase());

    return nomeLimpo.includes(buscaLimpa) || emailLimpo.includes(buscaLimpa);
  });

  // LÓGICA DE CADASTRO NO MODAL
  const handleInputChange = (e) => {
    setFormNovoUsuario({ ...formNovoUsuario, [e.target.name]: e.target.value });
  };

  const handleSalvarUsuario = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      const payload = {
        ...formNovoUsuario,
        ativo: true
      };

      await api.post('/usuarios', payload);
      
      mostrarSucessoMensagem(`Usuário ${formNovoUsuario.nome} cadastrado com sucesso!`);
      setModalAberto(false);
      setFormNovoUsuario(ESTADO_INICIAL_FORM);
      carregarUsuarios(); // Atualiza a tabela imediatamente
      
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      const msg = error.response?.data?.message || "Erro ao cadastrar usuário. Verifique os dados.";
      await mostrarAvisoObrigatorio(`${msg} Contate o suporte.`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="crud-section">
      <div className="crud-header">
        <h2>Gestão de Usuários</h2>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
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
                <button className="action-btn" title="Editar" onClick={() => abrirModalEditar(user)}>✏️</button>
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

      {/* MODAL DE CADASTRO */}
      {modalAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="admin-modal-panel" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Cadastrar Novo Usuário</h3>
            
            <form onSubmit={handleSalvarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Tipo de Perfil</label>
                <select 
                  name="tipo" 
                  value={formNovoUsuario.tipo} 
                  onChange={handleInputChange} 
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                >
                  <option value="PROFISSIONAL">Profissional (Funcionário)</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Nome Completo</label>
                <input type="text" name="nome" value={formNovoUsuario.nome} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>CPF</label>
                  <input type="text" name="cpf" placeholder="000.000.000-00" value={formNovoUsuario.cpf} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Telefone</label>
                  <input type="text" name="telefone" placeholder="(11) 9999-9999" value={formNovoUsuario.telefone} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>E-mail</label>
                <input type="email" name="email" value={formNovoUsuario.email} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Senha Temporária</label>
                <input type="password" name="senha" value={formNovoUsuario.senha} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                <small style={{ color: '#666' }}>O usuário usará esta senha no primeiro login.</small>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-cancelar-modal" onClick={() => setModalAberto(false)} disabled={salvando} style={{ padding: '10px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar-modal" disabled={salvando} style={{ padding: '10px 15px', background: salvando ? '#ccc' : '#1a1a2e', color: '#fff', border: 'none', borderRadius: '4px', cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                  {salvando ? 'Salvando...' : 'Salvar Usuário'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}