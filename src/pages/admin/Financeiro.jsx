import { useState } from "react";
import "../../styles/app.css"; 

export default function Financeiro() {
  const [abaAtiva, setAbaAtiva] = useState("pagamentos");
  const [cardsExpandidos, setCardsExpandidos] = useState([]);

  const mockPagamentos = [
    { id: 1, cliente: "Ana Clara Souza", valor: 150.0, data: "19/05/2026", metodo: "PIX", status: "PAGO" },
    { id: 2, cliente: "Beatriz Lima", valor: 320.0, data: "19/05/2026", metodo: "CARTÃO", status: "PENDENTE" },
    { id: 3, cliente: "Carlos Mendes", valor: 85.0, data: "18/05/2026", metodo: "DINHEIRO", status: "CONFIRMADO" },
  ];

  const mockProcedimentos = [
    {
      id: 1,
      nome: "Corte & Hidratação Ouro",
      valor: 250.0,
      custo: 41.7,
      lucro: 208.3,
      margem: 83.3,
      status: "ATIVO",
      produtos: [
        { id: 1, produto: "Shampoo Premium Tukotomi", qtd: "50ml", custoUnit: 12.5 },
        { id: 2, produto: "Máscara de Hidratação Ouro", qtd: "30g", custoUnit: 25.0 },
        { id: 3, produto: "Protetor Térmico", qtd: "10ml", custoUnit: 4.2 },
      ]
    },
    {
      id: 2,
      nome: "Coloração Premium",
      valor: 180.0,
      custo: 153.0,
      lucro: 27.0,
      margem: 15.0,
      status: "REVISÃO",
      produtos: [
        { id: 4, produto: "Tinta Premium Importada", qtd: "1 tubo", custoUnit: 120.0 },
        { id: 5, produto: "Água Oxigenada", qtd: "90ml", custoUnit: 15.0 },
        { id: 6, produto: "Pó Descolorante", qtd: "50g", custoUnit: 18.0 },
      ]
    },
    {
      id: 3,
      nome: "Limpeza de Pele Profunda",
      valor: 150.0,
      custo: 30.0,
      lucro: 120.0,
      margem: 80.0,
      status: "ATIVO",
      produtos: [
        { id: 7, produto: "Sabonete Líquido Facial", qtd: "10ml", custoUnit: 5.0 },
        { id: 8, produto: "Esfoliante", qtd: "15g", custoUnit: 10.0 },
        { id: 9, produto: "Máscara Calmante", qtd: "20g", custoUnit: 15.0 },
      ]
    }
  ];

  const toggleCard = (id) => {
    if (cardsExpandidos.includes(id)) {
      setCardsExpandidos(cardsExpandidos.filter(cardId => cardId !== id));
    } else {
      setCardsExpandidos([...cardsExpandidos, id]);
    }
  };

  const renderPagamentos = () => (
    <div className="fade-in">
      {/* KPIs */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Total Recebidos</h4>
          <h2 style={{ ...styles.kpiValue, color: "#2e7d32" }}>R$ 4.500,00</h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Pendentes</h4>
          <h2 style={{ ...styles.kpiValue, color: "#ed6c02" }}>R$ 850,00</h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Confirmados</h4>
          <h2 style={{ ...styles.kpiValue, color: "#0288d1" }}>R$ 1.200,00</h2>
        </div>
      </div>

      {/* GERADOR DE LINK */}
      <div style={styles.sectionCard}>
        <h3 style={{ marginBottom: "15px" }}>Gerar Link de Pagamento</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={styles.labelForm}>Cliente</label>
            <input type="text" placeholder="Nome do cliente" style={styles.input} />
          </div>
          <div style={{ flex: 1, minWidth: "150px" }}>
            <label style={styles.labelForm}>Valor (R$)</label>
            <input type="number" placeholder="0,00" style={styles.input} />
          </div>
          <div style={{ flex: 2, minWidth: "250px" }}>
            <label style={styles.labelForm}>Descrição</label>
            <input type="text" placeholder="Ex: Pacote Verão + Massagem" style={styles.input} />
          </div>
          <button 
            type="button" 
            style={{ ...styles.btnAction, backgroundColor: "#00c853" }}
            onClick={() => alert("Integração com Infinity Pay em desenvolvimento!")}
          >
            Gerar Link Infinity Pay
          </button>
        </div>
      </div>

      {/* TABELA DE PAGAMENTOS */}
      <h3 style={{ marginTop: "30px", marginBottom: "15px" }}>Histórico de Transações</h3>
      <div style={{ overflowX: "auto" }}>
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
            {mockPagamentos.map((pag) => (
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
    </div>
  );


  const renderCustos = () => (
    <div className="fade-in">
      {/* KPIs GLOBAIS */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Total Procedimentos</h4>
          <h2 style={styles.kpiValue}>24 Ativos</h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Custo Médio</h4>
          <h2 style={{ ...styles.kpiValue, color: "#d32f2f" }}>R$ 45,30</h2>
        </div>
        <div className="kpi-card" style={styles.kpiCard}>
          <h4 style={styles.kpiTitle}>Margem Média</h4>
          <h2 style={{ ...styles.kpiValue, color: "#2e7d32" }}>68%</h2>
        </div>
      </div>

      <h3 style={{ marginBottom: "15px" }}>Análise de Procedimentos</h3>

      {/* LISTA DE PROCEDIMENTOS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {mockProcedimentos.map((proc) => {
          const isExpanded = cardsExpandidos.includes(proc.id);
          const margemCor = proc.margem < 30 ? "red" : "#2e7d32";

          return (
            <div key={proc.id} style={{ ...styles.sectionCard, padding: "0", overflow: "hidden" }}>
              
              {/* CABEÇALHO DO CARD */}
              <div 
                style={{ ...styles.cardHeader, borderLeft: `5px solid ${proc.status === "ATIVO" ? "#2e7d32" : "#ed6c02"}` }}
                onClick={() => toggleCard(proc.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                  <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#1a1a2e" }}>{proc.nome}</h2>
                  <span style={styles.badge(proc.status)}>{proc.status}</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center" }}>
                  <div>
                    <span style={styles.labelSpan}>Valor Serviço</span>
                    <strong style={{ fontSize: "1.1rem" }}>R$ {proc.valor.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={styles.labelSpan}>Custo Produtos</span>
                    <strong style={{ fontSize: "1.1rem", color: "#d32f2f" }}>R$ {proc.custo.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={styles.labelSpan}>Lucro Líquido</span>
                    <strong style={{ fontSize: "1.1rem", color: "#2e7d32" }}>R$ {proc.lucro.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span style={styles.labelSpan}>Margem</span>
                    <strong style={{ fontSize: "1.1rem", color: margemCor }}>{proc.margem}%</strong>
                  </div>
                  
                  <div style={{ marginLeft: "auto", color: "#888" }}>
                    {isExpanded ? "▲ Ocultar" : "▼ Ver Produtos"}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: "20px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" }}>
                  <h4 style={{ marginBottom: "15px", color: "#555" }}>Produtos Utilizados</h4>
                  <div style={{ overflowX: "auto" }}>
                    <table className="crud-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                          <th>Custo Unitário (Proporcional)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {proc.produtos.map((prod) => (
                          <tr key={prod.id} style={{ backgroundColor: "#fff" }}>
                            <td>{prod.produto}</td>
                            <td>{prod.qtd}</td>
                            <td>R$ {prod.custoUnit.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="crud-section" style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
      <div className="crud-header" style={{ borderBottom: "none", paddingBottom: 0, marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", color: "#1a1a2e", margin: 0 }}>
          Painel Financeiro
        </h1>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        <button 
          onClick={() => setAbaAtiva("pagamentos")}
          style={abaAtiva === "pagamentos" ? styles.tabActive : styles.tabInactive}
        >
          Pagamentos
        </button>
        <button 
          onClick={() => setAbaAtiva("custos")}
          style={abaAtiva === "custos" ? styles.tabActive : styles.tabInactive}
        >
          Custos por Procedimento
        </button>
      </div>

      {abaAtiva === "pagamentos" ? renderPagamentos() : renderCustos()}
    </div>
  );
}

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
    fontSize: "0.9rem",
    color: "#777",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  },
  kpiValue: {
    margin: "10px 0 0 0",
    fontSize: "2rem",
    color: "#1a1a2e",
    fontWeight: "bold"
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #eaeaea",
    padding: "25px"
  },
  cardHeader: {
    padding: "20px", 
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "background-color 0.2s",
  },
  labelForm: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    fontSize: "0.9rem",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    fontFamily: "inherit"
  },
  btnAction: {
    padding: "11px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "opacity 0.2s",
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
      case "REVISÃO": return { backgroundColor: "#fff3e0", color: "#ed6c02", padding: "4px 12px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" };
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