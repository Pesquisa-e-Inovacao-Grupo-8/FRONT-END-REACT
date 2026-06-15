const SERVICES = [
  { title: 'Massagem', desc: 'Massagens terapêuticas e relaxantes', img: new URL('../../assets/massagem.jpeg', import.meta.url).href },
  { title: 'Unha', desc: 'Profissional para todas as ocasiões', img: new URL('../../assets/Unha.jpeg', import.meta.url).href,},
  { title: 'Estética', desc: 'Tratamentos faciais e corporais', img: new URL('../../assets/estetica.webp', import.meta.url).href },
];

export default function Services() {
  return (
    <section className="services" id="servicos">
      <h2 className="section-title">Nossos Serviços</h2>
      <p className="section-subtitle">Excelência em cada tratamento</p>

      <div className="services-grid">
        {SERVICES.map((s, i) => (
          <div className="service-card" key={i}>
            <img
              className="service-card-image"
              src={s.img}
              alt={s.title}
            />

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