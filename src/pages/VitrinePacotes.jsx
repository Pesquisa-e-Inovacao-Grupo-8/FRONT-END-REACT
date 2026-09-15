// src/pages/VitrinePacotes.jsx
import { useState, useEffect } from "react";
import api, { normalizeArray } from "../api";
import { getUsuarioLogado, normalizarRole } from "../validate-access";
import { mostrarErroMensagem, mostrarSucessoMensagem } from "../components/utils/mensagem";
import "../styles/vitrine-pacotes.css";

export default function VitrinePacotes() {
  const [pacotes, setPacotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comprandoId, setComprandoId] = useState(null);

  useEffect(() => {
    api.get('/pacotes')
      .then(res => setPacotes(normalizeArray(res.data)))
      .catch(err => console.error("Erro ao buscar pacotes", err))
      .finally(() => setLoading(false));
  }, []);

  const handleComprarPacote = async (pacoteId) => {
    const usuario = getUsuarioLogado();
    const clienteId = localStorage.getItem("userId");
    
    if (!usuario || normalizarRole(usuario.tipo) !== "CLIENTE" || !clienteId) {
      mostrarErroMensagem("Você precisa estar logado como cliente para adquirir um pacote.");
      return;
    }

    try {
      setComprandoId(pacoteId);

      // O backend calcula a validade oficial a partir da data da compra.
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      const requestDto = {
        clienteId,
        pacoteId,
        ativo: true,
        dtExpiracao: dataExpiracao.toISOString().split('.')[0], 
        qtdUsos: 0
      };

      await api.post(`/clientePacotes?clienteId=${clienteId}&pacoteId=${pacoteId}`, requestDto);
      
      mostrarSucessoMensagem("Pacote adquirido com sucesso! Ele já está disponível no seu perfil.");
    } catch (error) {
      console.error("Erro ao comprar pacote", error);
      mostrarErroMensagem("Erro ao processar a aquisição do pacote.");
    } finally {
      setComprandoId(null);
    }
  };


  if (loading) return <main className="package-store-page package-store-page--loading">Carregando promoções...</main>;

  
  return (
    <>
      <main className="package-store-page">
        <header className="package-store-hero">
          <h1>Nossos <em>Pacotes</em></h1>
          <p>Economize adquirindo nossos combos exclusivos de serviços</p>
        </header>

        <div className="package-store-grid">
          {pacotes.length === 0 ? (
            <p>Nenhum pacote promocional disponível no momento.</p>
          ) : (
            pacotes.map(pacote => (
              <div key={pacote.id} className="package-store-card">
                <h3>{pacote.nome}</h3>
                <p className="package-store-card__description">{pacote.descricao}</p>
                
                <div className="package-store-card__price">
                  <span className="package-store-card__price-label">Valor total:</span>
                  <strong className="package-store-card__price-value">R$ {pacote.precoTotal.toFixed(2)}</strong>
                </div>

                <button 
                  onClick={() => handleComprarPacote(pacote.id)}
                  disabled={comprandoId === pacote.id}
                  className="package-buy-button"
                >
                  {comprandoId === pacote.id ? "Processando..." : "Adquirir Pacote"}
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {/* FOOTER ADICIONADO AQUI */}
      <footer className="package-store-footer">
        <div>
          <div className="footer-logo">Tokutomi</div>
          <div className="footer-tagline">Elegância e sofisticação em cada detalhe</div>
        </div>
        <div>
          <h4>Horário de Funcionamento</h4>
          <p>
            Segunda a Sexta: 9h às 20h<br />
            Sábado: 9h às 18h<br />
            Domingo: Fechado
          </p>
        </div>
        <div>
          <h4>Contato</h4>
          <address>
            Tel: (11) 9999-9999<br />
            Email: <a href="mailto:contato@tokutomi.com.br">contato@tokutomi.com.br</a><br />
            Endereço: Av. Elegância, 1000
          </address>
        </div>
      </footer>
    </>
  );
}