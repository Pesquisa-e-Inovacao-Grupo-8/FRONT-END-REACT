// src/components/admin/GerenciarServicos.jsx
import { useState, useEffect } from 'react';
import api from '../../api';
import mostrarMensagem, { mostrarErroMensagem, mostrarSucessoMensagem } from '../utils/mensagem';
import mostrarConfirmacaoAssincrona, { mostrarAvisoObrigatorio } from '../utils/confirm-dialog';

const ESTADO_INICIAL_FORM = {
  nome: '',
  descricao: '',
  duracaoMinutos: '',
  preco: '',
  produtosIds: [] 
};

export default function GerenciarServicos() {
  const [servicos, setServicos] = useState([]);
  const [produtos, setProdutos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Modal Principal (Serviço)
  const [modalAberto, setModalAberto] = useState(false);
  const [formNovoServico, setFormNovoServico] = useState(ESTADO_INICIAL_FORM);
  const [salvando, setSalvando] = useState(false);
  
  // Estados para a Edição
  const [servicoEditandoId, setServicoEditandoId] = useState(null);
  const [linksOriginais, setLinksOriginais] = useState([]); // Guarda os vínculos antigos para comparar

  // Estados do Cadastro Rápido de Produto
  const [mostrandoNovoProduto, setMostrandoNovoProduto] = useState(false);
  const [formProduto, setFormProduto] = useState({ nome: '', unidadeMedida: 'un', custoUnitario: '' });
  const [salvandoProduto, setSalvandoProduto] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resServicos, resProdutos] = await Promise.all([
        api.get('/servicos'),
        api.get('/produtos') 
      ]);
      setServicos(resServicos.data);
      setProdutos(resProdutos.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      await mostrarAvisoObrigatorio("Erro ao carregar os dados. Contate o suporte.");
    } finally {
      setLoading(false);
    }
  };

  const deletarServico = async (id) => {
    if (window.confirm("Deseja realmente excluir este serviço?")) {
      try {
        await api.delete(`/servicos/${id}`);
        setServicos(servicos.filter(s => s.id !== id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Não foi possível deletar o serviço. Ele pode estar vinculado a um agendamento.");
      }
    }
  };

  const abrirModalNovo = () => {
    setServicoEditandoId(null);
    setFormNovoServico(ESTADO_INICIAL_FORM);
    setLinksOriginais([]);
    setMostrandoNovoProduto(false);
    setModalAberto(true);
  };

  const abrirModalEditar = async (servico) => {
    setServicoEditandoId(servico.id);
    setMostrandoNovoProduto(false);
    
    // Preenche o form básico
    setFormNovoServico({
      nome: servico.nome,
      descricao: servico.descricao,
      duracaoMinutos: servico.duracaoMinutos,
      preco: servico.preco.toString(),
      produtosIds: [] // Preencheremos assim que a API responder abaixo
    });
    setModalAberto(true);

    try {
      // Busca quais produtos estão atrelados a este serviço
      const resVinculos = await api.get(`/servico-produtos/servico/${servico.id}`);
      setLinksOriginais(resVinculos.data); // Guarda tudo (incluindo os IDs dos vínculos para podermos deletar)
      
      const idsVinculados = resVinculos.data.map(link => link.produto.id);
      setFormNovoServico(prev => ({ ...prev, produtosIds: idsVinculados }));
    } catch (error) {
      console.error("Erro ao buscar produtos do serviço:", error);
    }
  };

  const removerAcentos = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  const servicosFiltrados = servicos.filter(servico => {
    const buscaLimpa = removerAcentos(termoBusca.toLowerCase());
    const nomeLimpo = removerAcentos(servico.nome.toLowerCase());
    return nomeLimpo.includes(buscaLimpa);
  });

  const handleInputChange = (e) => {
    setFormNovoServico({ ...formNovoServico, [e.target.name]: e.target.value });
  };

  const handleProdutoToggle = (produtoId) => {
    setFormNovoServico((prev) => {
      const jaSelecionado = prev.produtosIds.includes(produtoId);
      if (jaSelecionado) {
        return { ...prev, produtosIds: prev.produtosIds.filter(id => id !== produtoId) };
      } else {
        return { ...prev, produtosIds: [...prev.produtosIds, produtoId] };
      }
    });
  };

  const handleSalvarProdutoRapido = async () => {
    if (!formProduto.nome || !formProduto.custoUnitario) {
      await mostrarAvisoObrigatorio("Preencha o nome e o custo do produto!");
      return;
    }
    
    try {
      setSalvandoProduto(true);
      
      // 👇 MUDE AQUI PARA CAMELCASE (Igual está no seu Java) 👇
      const payload = {
        nome: formProduto.nome,
        unidadeMedida: formProduto.unidadeMedida,
        custoUnitario: parseFloat(formProduto.custoUnitario.replace(',', '.'))
      };

      const res = await api.post('/produtos', payload);
      const novoProduto = res.data;

      // Adiciona na lista geral da tela
      setProdutos([...produtos, novoProduto]);
      // Já deixa ele marcado (checkbox ticado) para o serviço atual!
      setFormNovoServico(prev => ({ ...prev, produtosIds: [...prev.produtosIds, novoProduto.id] }));
      
      // Fecha o mini-form e limpa
      setMostrandoNovoProduto(false);
      setFormProduto({ nome: '', unidadeMedida: 'un', custoUnitario: '' });
      
    } catch (error) {
      console.error("Erro ao criar produto expresso:", error);
      await mostrarAvisoObrigatorio("Erro ao cadastrar produto. Contate o suporte.");
    } finally {
      setSalvandoProduto(false);
    }
  };

  // --- FUNÇÃO DE SALVAR O SERVIÇO (CRIAR OU EDITAR) ---
  const handleSalvarServico = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      
      const payloadServico = {
        nome: formNovoServico.nome,
        descricao: formNovoServico.descricao,
        duracaoMinutos: parseInt(formNovoServico.duracaoMinutos),
        preco: parseFloat(formNovoServico.preco.toString().replace(',', '.')),
        ativo: true
      };

      if (servicoEditandoId) {
        // === MODO EDIÇÃO ===
        await api.put(`/servicos/${servicoEditandoId}`, payloadServico);

        // Lógica Inteligente para não duplicar vínculos de produtos
        const idsAntigos = linksOriginais.map(l => l.produto.id);
        const idsNovos = formNovoServico.produtosIds;

        // O que ele marcou agora, mas não tinha antes? (Vamos Adicionar)
        const idsParaAdicionar = idsNovos.filter(id => !idsAntigos.includes(id));
        
        // O que tinha antes, mas ele desmarcou agora? (Vamos Deletar)
        const linksParaDeletar = linksOriginais.filter(l => !idsNovos.includes(l.produto.id));

        const promessasAdicionar = idsParaAdicionar.map(pId => api.post('/servico-produtos', {
          servicoId: servicoEditandoId,
          produtoId: pId,
          quantidadeUsada: 1.0
        }));

        const promessasDeletar = linksParaDeletar.map(link => api.delete(`/servico-produtos/${link.id}`));

        await Promise.all([...promessasAdicionar, ...promessasDeletar]);
        mostrarSucessoMensagem("Serviço atualizado com sucesso!");

      } else {
        // === MODO CRIAÇÃO ===
        const responseServico = await api.post('/servicos', payloadServico);
        const novoServicoId = responseServico.data.id; 

        if (formNovoServico.produtosIds.length > 0) {
          const promessasVinculo = formNovoServico.produtosIds.map(produtoId => {
            return api.post('/servico-produtos', {
              servicoId: novoServicoId,
              produtoId: produtoId,
              quantidadeUsada: 1.0
            });
          });
          await Promise.all(promessasVinculo);
        }
        mostrarSucessoMensagem("Serviço cadastrado com sucesso!");
      }
      
      setModalAberto(false);
      carregarDados(); 
      
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      const msg = error.response?.data?.message || "Erro ao salvar serviço.";
      await mostrarAvisoObrigatorio(`${msg} Contate o suporte.`);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="crud-section">
      <div className="crud-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Gestão de Serviços</h2>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar serviço..." 
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '250px' }}
          />
          <button onClick={abrirModalNovo} style={{ padding: '8px 15px', background: '#b8960c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Novo Serviço
          </button>
        </div>
      </div>

      {loading ? (
        <p>Carregando serviços...</p>
      ) : (
        <table className="crud-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Nome</th>
              <th style={{ padding: '12px' }}>Duração (min)</th>
              <th style={{ padding: '12px' }}>Preço</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicosFiltrados.map(servico => (
              <tr key={servico.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}><strong>{servico.nome}</strong><br/><small style={{color: '#666'}}>{servico.descricao}</small></td>
                <td style={{ padding: '12px' }}>{servico.duracaoMinutos} min</td>
                <td style={{ padding: '12px' }}>R$ {servico.preco?.toFixed(2).replace('.', ',')}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', backgroundColor: servico.ativo ? '#d4edda' : '#f8d7da', color: servico.ativo ? '#155724' : '#721c24' }}>
                    {servico.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => abrirModalEditar(servico)} title="Editar" style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem', marginRight: '10px' }}>✏️</button>
                  <button onClick={() => deletarServico(servico.id)} title="Deletar" style={{ cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>🗑️</button>
                </td>
              </tr>
            ))}
            {servicosFiltrados.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Nenhum serviço encontrado.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* === MODAL DE CADASTRO/EDIÇÃO === */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div className="admin-modal-panel" style={{ background: '#fff', padding: '30px', borderRadius: '8px', width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              {servicoEditandoId ? '✏️ Editar Serviço' : '✨ Cadastrar Novo Serviço'}
            </h3>
            
            <form onSubmit={handleSalvarServico} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Nome do Serviço</label>
                <input type="text" name="nome" value={formNovoServico.nome} onChange={handleInputChange} required placeholder="Ex: Corte Feminino" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Descrição</label>
                <textarea name="descricao" value={formNovoServico.descricao} onChange={handleInputChange} required placeholder="Detalhes do serviço..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '60px' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Duração (Minutos)</label>
                  <input type="number" name="duracaoMinutos" placeholder="Ex: 60" value={formNovoServico.duracaoMinutos} onChange={handleInputChange} required min="1" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '0.9rem' }}>Preço (R$)</label>
                  <input type="number" step="0.01" name="preco" placeholder="Ex: 150.00" value={formNovoServico.preco} onChange={handleInputChange} required min="0" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
              </div>

              {/* === SESSÃO DE PRODUTOS === */}
              <div style={{ marginTop: '10px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1a1a2e', margin: 0 }}>
                    🧴 Produtos Utilizados
                  </label>
                  <button 
                    type="button" 
                    className={mostrandoNovoProduto ? 'btn-cancelar-modal' : ''}
                    onClick={() => setMostrandoNovoProduto(!mostrandoNovoProduto)}
                    style={{ background: '#b8960c', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    {mostrandoNovoProduto ? 'Cancelar' : '+ Cadastrar Novo'}
                  </button>
                </div>

                {/* FORMULÁRIO EXPRESS DE PRODUTO (Escondido por padrão) */}
                {mostrandoNovoProduto && (
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '15px', background: '#fff', padding: '10px', borderRadius: '4px', border: '1px dashed #ccc' }}>
                    <input type="text" placeholder="Nome do Produto" value={formProduto.nome} onChange={(e) => setFormProduto({...formProduto, nome: e.target.value})} style={{ flex: 2, padding: '6px', fontSize: '0.8rem' }} />
                    <input type="text" placeholder="UN (ex: ml, g)" value={formProduto.unidadeMedida} onChange={(e) => setFormProduto({...formProduto, unidadeMedida: e.target.value})} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }} />
                    <input type="number" placeholder="Custo (R$)" value={formProduto.custoUnitario} onChange={(e) => setFormProduto({...formProduto, custoUnitario: e.target.value})} style={{ flex: 1, padding: '6px', fontSize: '0.8rem' }} />
                    <button type="button" onClick={handleSalvarProdutoRapido} disabled={salvandoProduto} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '0 10px', borderRadius: '4px', cursor: 'pointer' }}>
                      ✓
                    </button>
                  </div>
                )}
                
                {/* LISTA DE CHECKBOXES */}
                {produtos.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Nenhum produto cadastrado no sistema.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    {produtos.map(produto => (
                      <label key={produto.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={formNovoServico.produtosIds.includes(produto.id)}
                          onChange={() => handleProdutoToggle(produto.id)}
                        />
                        {produto.nome} <span style={{color: '#888', fontSize: '0.8rem'}}>({produto.unidade_medida || 'un'})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {/* BOTÕES FINAIS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" className="btn-cancelar-modal" onClick={() => setModalAberto(false)} disabled={salvando} style={{ padding: '10px 15px', cursor: 'pointer', background: '#eee', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar-modal" disabled={salvando} style={{ padding: '10px 15px', background: salvando ? '#ccc' : '#b8960c', color: '#fff', border: 'none', borderRadius: '4px', cursor: salvando ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                  {salvando ? 'Salvando...' : 'Salvar Serviço'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}