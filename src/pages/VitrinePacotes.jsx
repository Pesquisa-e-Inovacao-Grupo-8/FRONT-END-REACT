// src/pages/VitrinePacotes.jsx
import { useState, useEffect } from "react";
import api, { normalizeArray } from "../api";
import "../styles/agendamentos-usuario.css"; 

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
    const clienteId = localStorage.getItem("userId");
    
    if (!clienteId) {
      alert("Você precisa estar logado como cliente para adquirir um pacote.");
      return;
    }

    try {
      setComprandoId(pacoteId);

      // Regra de negócio: Pacote dura 6 meses e dá direito a 5 usos
      const dataExpiracao = new Date();
      dataExpiracao.setMonth(dataExpiracao.getMonth() + 6);

      const requestDto = {
        ativo: true,
        dtExpiracao: dataExpiracao.toISOString().split('.')[0], 
        qtdUsos: 5 
      };

      await api.post(`/clientePacotes?clienteId=${clienteId}&pacoteId=${pacoteId}`, requestDto);
      
      alert("Pacote adquirido com sucesso! Ele já está disponível no seu perfil.");
    } catch (error) {
      console.error("Erro ao comprar pacote", error);
      alert("Erro ao processar a aquisição do pacote.");
    } finally {
      setComprandoId(null);
    }
  };

  if (loading) return <div className="page" style={{ padding: "40px" }}>Carregando promoções...</div>;

  return (
    <>
      <div className="page" style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", minHeight: "70vh" }}>
        <div className="page-hero">
          <h1>Nossos <em>Pacotes</em></h1>
          <p>Economize adquirindo nossos combos exclusivos de serviços</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px", marginTop: "30px" }}>
          {pacotes.length === 0 ? (
            <p>Nenhum pacote promocional disponível no momento.</p>
          ) : (
            pacotes.map(pacote => (
              <div key={pacote.id} className="booking-card" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
                <h3 style={{ fontSize: "1.3rem", color: "#333", marginBottom: "10px" }}>{pacote.nome}</h3>
                <p style={{ color: "#666", marginBottom: "15px", flex: 1 }}>{pacote.descricao}</p>
                
                <div style={{ borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "auto" }}>
                  <span style={{ display: "block", fontSize: "0.9rem", color: "#888" }}>Valor total:</span>
                  <strong style={{ fontSize: "1.5rem", color: "#b8960c" }}>R$ {pacote.precoTotal.toFixed(2)}</strong>
                </div>

                <button 
                  onClick={() => handleComprarPacote(pacote.id)}
                  disabled={comprandoId === pacote.id}
                  style={{
                    marginTop: "20px",
                    padding: "12px",
                    backgroundColor: "#1a1a2e",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    cursor: comprandoId === pacote.id ? "not-allowed" : "pointer"
                  }}
                >
                  {comprandoId === pacote.id ? "Processando..." : "Adquirir Pacote"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER ADICIONADO AQUI */}
      <footer className="footer">
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