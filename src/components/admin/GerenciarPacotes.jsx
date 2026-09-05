//src/components/admin/GerenciarPacotes.jsx
import { useState, useEffect } from 'react';
import api, { normalizeArray } from '../../api';
import mostrarMensagem, { mostrarErroMensagem, mostrarSucessoMensagem } from '../utils/mensagem';
import mostrarConfirmacaoAssincrona, { mostrarAvisoObrigatorio } from '../utils/confirm-dialog';

export default function GerenciarPacotes() {
  const [pacotes, setPacotes] = useState([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Dados do formulário
  const [novoPacote, setNovoPacote] = useState({ nome: '', descricao: '', precoTotal: '' });
  const [servicosSelecionados, setServicosSelecionados] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resPacotes, resServicos] = await Promise.all([
        api.get('/pacotes'),
        api.get('/servicos')
      ]);
      setPacotes(normalizeArray(resPacotes.data));
      setServicosDisponiveis(normalizeArray(resServicos.data));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServico = (idServico) => {
    if (servicosSelecionados.includes(idServico)) {
      setServicosSelecionados(servicosSelecionados.filter(id => id !== idServico));
    } else {
      setServicosSelecionados([...servicosSelecionados, idServico]);
    }
  };

  const handleSalvarPacote = async () => {
    if (!novoPacote.nome || !novoPacote.precoTotal) {
      await mostrarAvisoObrigatorio("Preencha o nome e o preço do pacote!");
      return;
    }

    try {
      setSalvando(true);
      
      // 1. Cria o Pacote
      const payloadPacote = {
        nome: novoPacote.nome,
        descricao: novoPacote.descricao,
        precoTotal: parseFloat(novoPacote.precoTotal)
      };
      
      const res = await api.post('/pacotes', payloadPacote);
      const pacoteCriadoId = res.data.id;

      // 2. Vincula os serviços escolhidos a este pacote na tabela pacote_servico
      for (let servicoId of servicosSelecionados) {
        // Preço zerado ou mockado aqui, pois o preço real do pacote está no precoTotal
        await api.post(`/pacoteServicos?pacoteId=${pacoteCriadoId}&servicoId=${servicoId}`, {
          preco: 0.0 
        });
      }

      mostrarSucessoMensagem("Pacote criado com sucesso!");
      setModalAberto(false);
      setNovoPacote({ nome: '', descricao: '', precoTotal: '' });
      setServicosSelecionados([]);
      carregarDados();

    } catch (error) {
      console.error("Erro ao salvar pacote", error);
      await mostrarAvisoObrigatorio("Erro ao criar pacote. Contate o suporte.");
    } finally {
      setSalvando(false);
    }
  };

  const deletarPacote = async (id) => {
    const confirmar = await mostrarConfirmacaoAssincrona("Certeza que deseja remover este pacote?");
    if (!confirmar) return;
    try {
      await api.delete(`/pacotes/${id}`);
      setPacotes(pacotes.filter(p => p.id !== id));
    } catch (error) {
      await mostrarAvisoObrigatorio("Erro ao deletar pacote. Contate o suporte.");
    }
  };

  if (loading) return <div>Carregando pacotes...</div>;

  return (
    <div className="crud-section">
      <div className="crud-header">
        <h2>Gestão de Pacotes Promocionais</h2>
        <button className="btn-novo" onClick={() => setModalAberto(true)}>+ Novo Pacote</button>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nome do Pacote</th>
            <th>Descrição</th>
            <th>Preço (R$)</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pacotes.length === 0 ? (
            <tr><td colSpan="4" style={{textAlign: 'center'}}>Nenhum pacote cadastrado ainda.</td></tr>
          ) : (
            pacotes.map(pacote => (
              <tr key={pacote.id}>
                <td><strong>{pacote.nome}</strong></td>
                <td>{pacote.descricao}</td>
                <td>R$ {pacote.precoTotal?.toFixed(2)}</td>
                <td>
                  <button className="action-btn" title="Editar">✏️</button>
                  <button className="action-btn" title="Deletar" onClick={() => deletarPacote(pacote.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL DE CRIAÇÃO */}
      {modalAberto && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div className="admin-modal-panel" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Criar Novo Pacote</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
              <label>
                Nome do Pacote
                <input type="text" value={novoPacote.nome} onChange={e => setNovoPacote({...novoPacote, nome: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </label>

              <label>
                Descrição
                <textarea value={novoPacote.descricao} onChange={e => setNovoPacote({...novoPacote, descricao: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </label>

              <label>
                Preço Total (R$)
                <input type="number" step="0.01" value={novoPacote.precoTotal} onChange={e => setNovoPacote({...novoPacote, precoTotal: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
              </label>

              <h4 style={{ marginTop: '15px' }}>Serviços Inclusos</h4>
              <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {servicosDisponiveis.map(servico => (
                  <label key={servico.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input 
                      type="checkbox" 
                      checked={servicosSelecionados.includes(servico.id)}
                      onChange={() => toggleServico(servico.id)}
                    />
                    {servico.nome} (R$ {servico.preco.toFixed(2)})
                  </label>
                ))}
              </div>
            </div>
            
            <div className="pacote-modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
              <button className="btn-cancelar-modal" onClick={() => setModalAberto(false)} disabled={salvando} style={{ padding: '8px 15px', cursor: 'pointer' }}>Cancelar</button>
              <button className="btn-salvar-pacote" onClick={handleSalvarPacote} disabled={salvando} style={{ padding: '8px 15px', background: '#b8960c', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {salvando ? "Salvando..." : "Salvar Pacote"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}