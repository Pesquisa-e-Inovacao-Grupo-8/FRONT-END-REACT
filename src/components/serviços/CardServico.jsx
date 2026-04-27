import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function CardServico() {
const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(''); 

  useEffect(() => {
    axios.get('http://localhost:8080/servicos')
      .then((response) => {
        setServicos(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar serviços:", error);
        setErro('Não foi possível carregar os serviços. Tente novamente mais tarde.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando serviços...</div>;
  if (erro) return <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{erro}</div>;
  
    return (
      <main className="services-content">
        <div className="category-section">
        <h2 className="category-title">Todos os Serviços</h2>
        <div className="services-grid">
          {servicos.map((svc) => (
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
              <button className="card-btn">Agendar</button>
            </div>
          ))}
        </div>
      </div>
      </main>
    );
    }