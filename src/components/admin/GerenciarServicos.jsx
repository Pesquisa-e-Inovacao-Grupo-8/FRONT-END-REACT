import { useState, useEffect } from 'react';
import api from '../../api';

export default function GerenciarServicos() {
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicos');
      setServicos(response.data);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarServico = async (id) => {
    if (window.confirm("Certeza que deseja remover este serviço?")) {
      try {
        await api.delete(`/servicos/${id}`);
        setServicos(servicos.filter(s => s.id !== id));
      } catch (error) {
        alert("Erro ao deletar. Ele pode estar vinculado a um agendamento.");
      }
    }
  };

  if (loading) return <div>Carregando serviços...</div>;

  return (
    <div className="crud-section">
      <div className="crud-header">
        <h2>Gestão de Serviços</h2>
        <button className="btn-novo">+ Novo Serviço</button>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nome do Serviço</th>
            <th>Duração (Min)</th>
            <th>Preço (R$)</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {servicos.map(servico => (
            <tr key={servico.id}>
              <td><strong>{servico.nome}</strong></td>
              <td>{servico.duracaoMinutos} min</td>
              <td>R$ {servico.preco?.toFixed(2)}</td>
              <td>
                <span className={`badge-role ${servico.ativo ? 'cliente' : 'admin'}`}>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td>
                <button className="action-btn" title="Editar">✏️</button>
                <button className="action-btn" title="Deletar" onClick={() => deletarServico(servico.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}