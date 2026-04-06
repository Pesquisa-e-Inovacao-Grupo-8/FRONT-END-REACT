export default function Hero() {
  return (
    <div className="hero-wrapper">
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Beleza que <em>transforma</em>
        </h1>
        <p className="hero-text">
          No Tukotomi, elevamos sua beleza natural com técnicas modernas e
          um toque de elegância. Experimente o luxo de cuidados
          personalizados em um ambiente sofisticado.
        </p>
        <div className="hero-actions">
          <a href="#agendamento" className="btn-primary">Agendar Agora</a>
          <a href="#servicos" className="btn-outline">Ver Serviços</a>
        </div>
      </div>

      <div className="hero-image">
        <div className="hero-image-placeholder">
        </div>
      </div>
    </section>
    </div>
  );
}
