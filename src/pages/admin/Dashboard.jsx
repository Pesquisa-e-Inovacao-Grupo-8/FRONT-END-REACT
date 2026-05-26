import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { Calendar, DollarSign, Clock, TrendingUp } from "lucide-react";
import api from "../../api";
import "../../styles/app.css";

export default function Dashboard() {
  const [nomeUsuario, setNomeUsuario] = useState("Administrador");
  const [dataAtual, setDataAtual] = useState("");
  const [loading, setLoading] = useState(true);

  // Estados dos Dados Dinâmicos
  const [kpis, setKpis] = useState({
    agendamentosHoje: 0,
    receitaMes: 0,
    pendentesQtd: 0,
    pendentesValor: 0,
    crescimento: 0
  });
  
  const [graficoSeries, setGraficoSeries] = useState([{ name: "Receita", data: [0, 0, 0, 0, 0, 0] }]);
  const [graficoCategorias, setGraficoCategorias] = useState(["", "", "", "", "", ""]);
  const [agendamentosRecentes, setAgendamentosRecentes] = useState([]);

  useEffect(() => {
    // 1. Configura Nome e Data
    const nomeSalvo = localStorage.getItem("userName");
    if (nomeSalvo) setNomeUsuario(nomeSalvo.split(" ")[0]);

    const opcoesData = { day: "numeric", month: "long", year: "numeric" };
    setDataAtual(new Date().toLocaleDateString("pt-BR", opcoesData));

    // 2. Busca os dados da API
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Busca todos os agendamentos do sistema
      const response = await api.get('/agendamentos');
      const agendamentos = response.data;

      processarMetricas(agendamentos);
      
    } catch (error) {
      console.error("Erro ao buscar agendamentos para a dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const processarMetricas = (agendamentos) => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    // Ajuste de fuso horário para evitar bugs de virada de dia
    const hojeString = new Date(hoje.getTime() - (hoje.getTimezoneOffset() * 60000))
                          .toISOString().split('T')[0]; 

    let contHoje = 0;
    let recMes = 0;
    let pendQtd = 0;
    let pendValor = 0;

    // Preparar arrays para o gráfico (Últimos 6 meses)
    const ultimos6MesesNomes = [];
    const ultimos6MesesValores = [0, 0, 0, 0, 0, 0];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(anoAtual, mesAtual - i, 1);
      // Pega os nomes dos meses curtos (Jan, Fev, Mar...)
      ultimos6MesesNomes.push(d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase());
    }

    // Varre todos os agendamentos UMA única vez
    agendamentos.forEach(ag => {
      // Extração segura dos dados do Java
      const dataAg = ag.data; 
      const valor = parseFloat(ag.valorTotal || ag.valor_total || ag.preco || 0);
      const status = ag.status ? ag.status.toUpperCase() : "PENDENTE";

      // 1. Agendamentos de Hoje
      if (dataAg === hojeString) {
        contHoje++;
      }

      // Converte a data do banco para objeto Date para comparar os meses
      const dateObj = new Date(dataAg + "T12:00:00");
      const agMes = dateObj.getMonth();
      const agAno = dateObj.getFullYear();

      // 2. Métricas do Mês Atual
      if (agMes === mesAtual && agAno === anoAtual) {
        if (status === "PAGO" || status === "CONFIRMADO" || status === "FINALIZADO") {
          recMes += valor;
        } else if (status === "PENDENTE") {
          pendQtd++;
          pendValor += valor;
        }
      }

      // 3. Preencher os dados do Gráfico
      for (let i = 0; i < 6; i++) {
        const targetDate = new Date(anoAtual, mesAtual - (5 - i), 1);
        if (agMes === targetDate.getMonth() && agAno === targetDate.getFullYear()) {
          if (status === "PAGO" || status === "CONFIRMADO" || status === "FINALIZADO") {
            ultimos6MesesValores[i] += valor;
          }
        }
      }
    });

    // 4. Calcular Crescimento (Mês atual vs Mês anterior)
    const receitaMesPassado = ultimos6MesesValores[4];
    const receitaMesAtual = ultimos6MesesValores[5];
    let calcCrescimento = 0;
    
    if (receitaMesPassado > 0) {
      calcCrescimento = ((receitaMesAtual - receitaMesPassado) / receitaMesPassado) * 100;
    } else if (receitaMesAtual > 0) {
      calcCrescimento = 100; // Se mês passado foi 0 e esse mês vendeu, cresceu 100%
    }

    // 5. Agendamentos Recentes (Ordena por data/hora mais próxima e pega os 5 primeiros)
    const recentes = [...agendamentos]
      .sort((a, b) => new Date(b.data + "T" + (b.horaInicio || b.hora_inicio || "00:00")) - new Date(a.data + "T" + (a.horaInicio || a.hora_inicio || "00:00")))
      .slice(0, 5);

    // Atualiza os estados do React para renderizar a tela
    setKpis({
      agendamentosHoje: contHoje,
      receitaMes: recMes,
      pendentesQtd: pendQtd,
      pendentesValor: pendValor,
      crescimento: calcCrescimento
    });

    setGraficoCategorias(ultimos6MesesNomes);
    setGraficoSeries([{ name: "Receita", data: ultimos6MesesValores }]);
    setAgendamentosRecentes(recentes);
  };

  // ==========================================
  // CONFIGURAÇÕES DO GRÁFICO (APEXCHARTS)
  // ==========================================
  const chartOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
    colors: ["#b8960c"],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: graficoCategorias, // Dinâmico!
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (value) => `R$ ${value.toFixed(0)}` }
    },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 }
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", fontSize: "1.2rem", color: "#b8960c" }}>Construindo Dashboard...</div>;
  }

  return (
    <div className="crud-section" style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#f9f9fb", minHeight: "100vh" }}>
      
      {/* CABEÇALHO */}
      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2rem", color: "#1a1a2e", margin: "0 0 5px 0" }}>
          Bom dia, <em>{nomeUsuario}</em>
        </h1>
        <p style={{ color: "#777", margin: 0, fontSize: "1rem" }}>{dataAtual}</p>
      </div>

      {/* GRADE DE KPIS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        
        {/* KPI 1 */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Agendamentos do Dia</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: "#e3f2fd", color: "#0288d1" }}><Calendar size={20} /></div>
          </div>
          <h2 style={styles.kpiValue}>{kpis.agendamentosHoje}</h2>
          <p style={styles.kpiSubtext}>marcados para hoje</p>
        </div>

        {/* KPI 2 */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Receita do Mês</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: "#e8f5e9", color: "#2e7d32" }}><DollarSign size={20} /></div>
          </div>
          <h2 style={styles.kpiValue}>R$ {kpis.receitaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <p style={styles.kpiSubtext}>
            <span style={{ color: kpis.crescimento >= 0 ? "#2e7d32" : "#d32f2f", fontWeight: "bold" }}>
              {kpis.crescimento > 0 ? "+" : ""}{kpis.crescimento.toFixed(1)}%
            </span> vs. mês ant.
          </p>
        </div>

        {/* KPI 3 */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Pagamentos Pendentes</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: "#fff3e0", color: "#ed6c02" }}><Clock size={20} /></div>
          </div>
          <h2 style={styles.kpiValue}>{kpis.pendentesQtd}</h2>
          <p style={styles.kpiSubtext}>R$ {kpis.pendentesValor.toFixed(2)} a receber</p>
        </div>

        {/* KPI 4 */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiHeader}>
            <span style={styles.kpiTitle}>Crescimento</span>
            <div style={{ ...styles.iconWrapper, backgroundColor: "#f3e5f5", color: "#8e24aa" }}><TrendingUp size={20} /></div>
          </div>
          <h2 style={styles.kpiValue}>{kpis.crescimento > 0 ? "+" : ""}{kpis.crescimento.toFixed(1)}%</h2>
          <p style={styles.kpiSubtext}>em relação ao mês passado</p>
        </div>

      </div>

      {/* SESSÃO INFERIOR (GRÁFICO + TABELA) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px" }}>
        
        {/* GRÁFICO */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "20px", color: "#333", fontSize: "1.1rem" }}>Receita Mensal · Últimos 6 meses</h3>
          <div style={{ marginLeft: "-15px" }}> 
            <Chart options={chartOptions} series={graficoSeries} type="area" height={300} />
          </div>
        </div>

        {/* TABELA DE AGENDAMENTOS RECENTES */}
        <div style={styles.card}>
          <h3 style={{ marginBottom: "20px", color: "#333", fontSize: "1.1rem" }}>Agendamentos Recentes</h3>
          <div style={{ overflowX: "auto" }}>
            <table className="crud-table" style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agendamentosRecentes.length === 0 ? (
                  <tr><td colSpan="3" style={{ textAlign: "center", color: "#888" }}>Nenhum agendamento recente.</td></tr>
                ) : (
                  agendamentosRecentes.map((ag) => {
                  
const nomeCliente = 
  ag.cliente?.usuario?.nome || 
  ag.cliente?.nome || 
  (typeof ag.cliente === 'string' ? ag.cliente : "Cliente");
                    
                    return (
                      <tr key={ag.id}>
                        <td><strong>{nomeCliente}</strong></td>
                        <td>{new Date(ag.data + "T12:00:00").toLocaleDateString('pt-BR')}</td>
                        <td>
                          <span className={`badge-role ${(ag.status || "PENDENTE").toLowerCase()}`} style={styles.badge(ag.status)}>
                            {ag.status || "PENDENTE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}

// ==========================================
// ESTILOS INLINE
// ==========================================
const styles = {
  kpiCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    border: "1px solid #eaeaea",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  kpiHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  kpiTitle: {
    fontSize: "0.95rem",
    color: "#666",
    fontWeight: "600",
  },
  iconWrapper: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  kpiValue: {
    margin: "0 0 5px 0",
    fontSize: "1.8rem",
    color: "#1a1a2e",
    fontWeight: "800",
    lineHeight: "1"
  },
  kpiSubtext: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#888"
  },
  card: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    border: "1px solid #eaeaea",
  },
  badge: (status) => {
    const s = (status || "PENDENTE").toUpperCase();
    switch (s) {
      case "CONFIRMADO": 
      case "FINALIZADO": 
      case "PAGO": return { backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" };
      case "PENDENTE": return { backgroundColor: "#fff3e0", color: "#ed6c02", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" };
      case "CANCELADO": return { backgroundColor: "#ffebee", color: "#d32f2f", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" };
      default: return { backgroundColor: "#f5f5f5", color: "#666", padding: "4px 10px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "bold" };
    }
  }
};