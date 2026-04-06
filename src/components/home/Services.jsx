const SERVICES = [
  { title: 'Cabelo', desc: 'Cortes, coloração e tratamentos' },
  { title: 'Maquiagem', desc: 'Profissional para todas as ocasiões' },
  { title: 'Estética', desc: 'Tratamentos faciais e corporais' },
];

export default function Services() {
  return (
    <section className="services" id="servicos">
      <h2 className="section-title">Nossos Serviços</h2>
      <p className="section-subtitle">Excelência em cada tratamento</p>
      <div className="services-grid">
        {SERVICES.map((s, i) => (
          <div className="service-card" key={i}>
            <div className="service-card-placeholder" />
            <div className="service-overlay">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
