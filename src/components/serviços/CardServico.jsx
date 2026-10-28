import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { normalizePage } from '../../api';
import { mostrarAvisoObrigatorio } from '../utils/confirm-dialog';

const SERVICOS_POR_PAGINA = 6;

export default function CardServico() {
  const navigate = useNavigate();
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const agendarServico = (servicoId) => {
    if (!localStorage.getItem('token')) {
      mostrarAvisoObrigatorio('Crie uma conta ou faça login para agendar');
      return;
    }

    navigate(`/agendamento?servicoId=${encodeURIComponent(servicoId)}`);
  };

  useEffect(() => {
    api.get('/servicos', { params: { page: paginaAtual, size: SERVICOS_POR_PAGINA, sort: 'nome,asc' } })
      .then((response) => {
        const pagina = normalizePage(response.data);
        setServicos(pagina.content);
        setTotalPaginas(pagina.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar serviços:", error);
        setErro('Não foi possível carregar os serviços. Tente novamente mais tarde.');
        setLoading(false);
      });
  }, [paginaAtual]);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando serviços...</div>;
  if (erro) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{erro}</div>;
  
    return (
      <main className="services-content">
        <div className="category-section">
        <h2 className="category-title">Todos os Serviços</h2>
        <div className="services-grid">
          {servicos.length > 0 ? servicos.map((svc) => (
            <div className="service-card" key={svc.id}>
              <div className="card-top">
                <div className="card-icon">✨</div>
                <div className="card-meta">
                  <div className="card-price">R$ {svc.preco.toFixed(2).replace('.', ',')}</div>
                  <div className="card-duration">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {svc.duracaoMinutos} min
                  </div>
                </div>
              </div>
              <div className="card-name">{svc.nome}</div>
              <div className="card-desc">{svc.descricao}</div>
              <button className="card-btn" onClick={() => agendarServico(svc.id)}>Agendar</button>
            </div>
          )) : (
            <div style={{ color: '#666', padding: '1rem 0' }}>Nenhum serviço disponível no momento.</div>
          )}
        </div>
        {totalPaginas > 1 && (
          <nav className="services-pagination" aria-label="Paginação de serviços">
            <button
              type="button"
              onClick={() => setPaginaAtual(pagina => Math.max(0, pagina - 1))}
              disabled={paginaAtual === 0}
            >
              Anterior
            </button>
            <span>Página {paginaAtual + 1} de {totalPaginas}</span>
            <button
              type="button"
              onClick={() => setPaginaAtual(pagina => Math.min(totalPaginas - 1, pagina + 1))}
              disabled={paginaAtual >= totalPaginas - 1}
            >
              Próxima
            </button>
          </nav>
        )}
      </div>
      </main>
    );
    }