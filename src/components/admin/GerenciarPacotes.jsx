import { useState, useEffect } from 'react';
import api from '../../api';

export default function GerenciarPacotes() {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarPacotes();
  }, []);

  const carregarPacotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pacotes'); // Rota do seu colega
      setPacotes(response.data);
    } catch (error) {
      console.error("Erro ao buscar pacotes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Carregando pacotes...</div>;

  return (
    <div className="crud-section">
      <div className="crud-header">
        <h2>Gestão de Pacotes Promocionais</h2>
        <button className="btn-novo">+ Novo Pacote</button>
      </div>

      <table className="crud-table">
        <thead>
          <tr>
            <th>Nome do Pacote</th>
            <th>Descrição</th>
            <th>Desconto / Preço</th>
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
                <td>R$ {pacote.preco?.toFixed(2)}</td>
                <td>
                  <button className="action-btn" title="Editar">✏️</button>
                  <button className="action-btn" title="Deletar">🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}