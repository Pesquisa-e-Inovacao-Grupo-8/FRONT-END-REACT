import { useState, useEffect } from "react";
import api from "../../api";
import "../../styles/app.css"; 

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState("transacoes");
  const [cardsExpandidos, setCardsExpandidos] = useState([]);

  // Estados Reais para a integração com o Backend
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Vamos manter os pagamentos mockados até o endpoint de pagamentos ser construído
  const [pagamentos, setPagamentos] = useState([
    { id: 1, cliente: "Ana Clara Souza", valor: 150.0, data: "19/05/2026", metodo: "PIX", status: "PAGO" },
    { id: 2, cliente: "Beatriz Lima", valor: 320.0, data: "19/05/2026", metodo: "CARTÃO", status: "PENDENTE" },
    { id: 3, cliente: "Carlos Mendes", valor: 85.0, data: "18/05/2026", metodo: "DINHEIRO", status: "PAGO" },
  ]);

  // Dispara a busca de dados assim que a tela abre
  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const carregarDadosFinanceiros = async () => {
    try {
      setLoading(true);

      // Busca os serviços e a tabela associativa simultaneamente
      const [resServicos, resVinculos] = await Promise.all([
        api.get('/servicos'),
        api.get('/servico-produtos')
      ]);

      // MÁGICA DO FRONTEND: Cruzamos os dados
      // Para cada serviço, procuramos quais vínculos pertencem a ele
      const servicosMontados = resServicos.data.map(servico => {
        const produtosDesteServico = resVinculos.data.filter(
          vinculo => vinculo.servico.id === servico.id
        );

        return {
          ...servico,
          produtosUsados: produtosDesteServico // Injetamos a lista dentro do objeto do serviço
        };
      });

      setServicos(servicosMontados);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CÁLCULOS MATEMÁTICOS (Feitos no React)
  // ==========================================
  const totalRecebidos = pagamentos
    .filter(p => p.status === "PAGO" || p.status === "CONFIRMADO")
    .reduce((acc, p) => acc + p.valor, 0);

  const qtdTransacoesPagas = pagamentos.filter(p => p.status === "PAGO" || p.status === "CONFIRMADO").length;
  const ticketMedio = qtdTransacoesPagas > 0 ? totalRecebidos / qtdTransacoesPagas : 0;
  
  // Agora usa o tamanho do array real que veio do banco!
  const totalProcedimentos = servicos.length; 

  // Função para calcular as métricas de UM serviço
  const calcularMetricasServico = (servico) => {
    let custoTotalProdutos = 0;
    
    // Soma: (Quantidade Usada * Custo Unitário do Produto)
    if (servico.produtosUsados) {
      custoTotalProdutos = servico.produtosUsados.reduce((acc, sp) => {
        return acc + (sp.quantidadeUsada * sp.produto.custoUnitario);
      }, 0);
    }

    const lucroLiquido = servico.preco - custoTotalProdutos;
    const margemPercentual = servico.preco > 0 ? (lucroLiquido / servico.preco) * 100 : 0;
    
    // Regra de negócio: Se a margem for menor que 30%, vai para REVISÃO
    const status = margemPercentual >= 30 ? "ATIVO" : "REVISÃO";

    return { custoTotalProdutos, lucroLiquido, margemPercentual, status };
  };

  // Lógica do Accordion
  const toggleCard = (id) => {
    setCardsExpandidos(prev => 
      prev.includes(id) ? prev.filter(cardId => cardId !== id) : [...prev, id]
    );
  };

  // Tela de Loading enquanto busca do Backend
  if (loading) {
    return (
      <div className="crud-section" style={{ padding: "40px", textAlign: "center", maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ color: "#b8960c" }}>Calculando finanças e carregando dados...</h2>
      </div>
    );
  }

  return (
    <div className="crud-section" style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* CABEÇALHO */}
      <div className="crud-header" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", color: "#1a1a2e", margin: 0 }}>
          Painel <em>Financeiro</em>
        </h1>
      </div>

      {/* ========================================== */}
      {/* KPIS FIXOS NO TOPO */}
      {/* ========================================== */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Total Recebidos</h4>
          <h2 style={{ ...styles.kpiValue, color: "#2e7d32" }}>
            R$ {totalRecebidos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Total Procedimentos</h4>
          <h2 style={{ ...styles.kpiValue, color: "#1a1a2e" }}>
            {totalProcedimentos} Cadastrados
          </h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Ticket Médio</h4>
          <h2 style={{ ...styles.kpiValue, color: "#b8960c" }}>
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      {/* ========================================== */}
      {/* MENU DE ABAS */}
      {/* ========================================== */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <button 
          onClick={() => setAbaAtiva("transacoes")}
          style={abaAtiva === "transacoes" ? styles.tabActive : styles.tabInactive}
        >
          💰 Histórico de Transações
        </button>
        <button 
          onClick={() => setAbaAtiva("analise")}
          style={abaAtiva === "analise" ? styles.tabActive : styles.tabInactive}
        >
          📊 Análise de Procedimentos
        </button>
      </div>

      {/* ========================================== */}
      {/* CONTEÚDO DINÂMICO (ALTERNADO) */}
      {/* ========================================== */}
      
      {/* ABA 1: TRANSAÇÕES */}
      {abaAtiva === "transacoes" && (
        <div className="fade-in" style={{ overflowX: "auto" }}>
          <table className="crud-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Data</th>
                <th>Método</th>
                <th>Valor (R$)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.map((pag) => (
                <tr key={pag.id}>
                  <td><strong>{pag.cliente}</strong></td>
                  <td>{pag.data}</td>
                  <td>{pag.metodo}</td>
                  <td>R$ {pag.valor.toFixed(2)}</td>
                  <td>
                    <span className={`badge-role ${pag.status.toLowerCase()}`} style={styles.badge(pag.status)}>
                      {pag.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ABA 2: ANÁLISE DE PROCEDIMENTOS (ACCORDION) */}
      {abaAtiva === "analise" && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {/* Validação caso o banco de dados ainda não tenha serviços cadastrados */}
          {servicos.length === 0 && (
             <p style={{ textAlign: "center", color: "#888", marginTop: "20px" }}>Nenhum serviço cadastrado no sistema ainda.</p>
          )}

          {servicos.map((servico) => {
            const isExpanded = cardsExpandidos.includes(servico.id);
            const { custoTotalProdutos, lucroLiquido, margemPercentual, status } = calcularMetricasServico(servico);
            const margemCor = margemPercentual < 30 ? "#d32f2f" : "#2e7d32";

            return (
              <div key={servico.id} style={{ ...styles.sectionCard, padding: "0", overflow: "hidden" }}>
                
                {/* CABEÇALHO DO CARD (CLICÁVEL) */}
                <div 
                  style={{ ...styles.cardHeader, borderLeft: `5px solid ${status === "ATIVO" ? "#2e7d32" : "#ed6c02"}` }}
                  onClick={() => toggleCard(servico.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#1a1a2e" }}>{servico.nome}</h2>
                    <span style={styles.badge(status)}>{status}</span>
                  </div>

                  {/* AS 4 KPIs DO PROCEDIMENTO */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "25px", alignItems: "center" }}>
                    <div>
                      <span style={styles.labelSpan}>Valor Serviço</span>
                      <strong style={{ fontSize: "1.1rem" }}>R$ {(servico.preco || 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={styles.labelSpan}>Custo Produtos</span>
                      <strong style={{ fontSize: "1.1rem", color: "#d32f2f" }}>R$ {custoTotalProdutos.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={styles.labelSpan}>Lucro Líquido</span>
                      <strong style={{ fontSize: "1.1rem", color: "#2e7d32" }}>R$ {lucroLiquido.toFixed(2)}</strong>
                    </div>
                    <div>
                      <span style={styles.labelSpan}>Margem</span>
                      <strong style={{ fontSize: "1.1rem", color: margemCor }}>{margemPercentual.toFixed(1)}%</strong>
                    </div>
                    
                    <div style={{ marginLeft: "auto", color: "#888", fontSize: "0.9rem", fontWeight: "bold" }}>
                      {isExpanded ? "▲ Ocultar Produtos" : "▼ Ver Produtos"}
                    </div>
                  </div>
                </div>

                {/* CORPO DO CARD (TABELA EXPANSÍVEL DOS PRODUTOS) */}
                {isExpanded && (
                  <div style={{ padding: "20px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" }}>
                    <h4 style={{ marginBottom: "15px", color: "#555" }}>Insumos Utilizados</h4>
                    {servico.produtosUsados && servico.produtosUsados.length > 0 ? (
                      <div style={{ overflowX: "auto" }}>
                        <table className="crud-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th>Produto</th>
                              <th>Quantidade Usada</th>
                              <th>Custo Proporcional</th>
                            </tr>
                          </thead>
                          <tbody>
                            {servico.produtosUsados.map((sp, idx) => {
                              const custoDesteProduto = sp.quantidadeUsada * sp.produto.custoUnitario;
                              return (
                                <tr key={idx} style={{ backgroundColor: "#fff" }}>
                                  <td>{sp.produto.nome}</td>
                                  <td>{sp.quantidadeUsada} {sp.produto.unidadeMedida}</td>
                                  <td>R$ {custoDesteProduto.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p style={{ color: "#888", fontStyle: "italic", margin: 0 }}>Nenhum produto atrelado a este serviço.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

// ==========================================
// ESTILOS INLINE
// ==========================================
const styles = {
  kpiCard: {
    flex: "1 1 200px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eaeaea",
    textAlign: "center"
  },
  kpiTitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#777",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  kpiValue: {
    margin: "10px 0 0 0",
    fontSize: "1.8rem",
    fontWeight: "bold"
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eaeaea",
  },
  cardHeader: {
    padding: "20px", 
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "background-color 0.2s",
  },
  tabActive: {
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "3px solid #b8960c",
    padding: "10px 15px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#1a1a2e",
    cursor: "pointer"
  },
  tabInactive: {
    backgroundColor: "transparent",
    border: "none",
    padding: "10px 15px",
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#888",
    cursor: "pointer"
  },
  badge: (status) => {
    switch (status) {
      case "PAGO": return { backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "5px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" };
      case "PENDENTE": return { backgroundColor: "#fff3e0", color: "#ed6c02", padding: "5px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" };
      case "CONFIRMADO": return { backgroundColor: "#e3f2fd", color: "#0288d1", padding: "5px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold" };
      case "ATIVO": return { backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" };
      case "REVISÃO": return { backgroundColor: "#ffebee", color: "#d32f2f", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" };
      default: return {};
    }
  },
  labelSpan: {
    display: "block",
    fontSize: "0.8rem",
    color: "#777",
    marginBottom: "5px",
    textTransform: "uppercase"
  }
};