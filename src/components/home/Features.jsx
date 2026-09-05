const FEATURES = [
  { icon: '✦', title: 'Expertise Premium', desc: 'Profissionais altamente qualificados e especializados' },
  { icon: '🏅', title: 'Produtos de Luxo', desc: 'Marcas premium para resultados excepcionais' },
  { icon: '🕐', title: 'Horários Flexíveis', desc: 'Atendimento adaptado à sua rotina' },
  { icon: '♥', title: 'Atendimento Personalizado', desc: 'Cada cliente recebe cuidado exclusivo' },
];

export default function Features() {
  return (
    <section className="features">
      <h2 className="section-title">Por que escolher o Tokutomi</h2>
      <p className="section-subtitle">Dedicação, expertise e elegância em cada detalhe</p>
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
