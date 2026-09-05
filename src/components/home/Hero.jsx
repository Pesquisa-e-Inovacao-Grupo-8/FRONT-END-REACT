const handleHeroAction = (event) => {
  event.preventDefault();

  const link = event.currentTarget;
  const targetSelector = link.getAttribute("href");
  link.classList.add("button-pressing");

  window.setTimeout(() => {
    link.classList.remove("button-pressing");
    document.querySelector(targetSelector)?.scrollIntoView({ behavior: "smooth" });
  }, 220);
};

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
          <a href="#agendamento" className="btn-primary" onClick={handleHeroAction}>Agendar Agora</a>
          <a href="#servicos" className="btn-outline" onClick={handleHeroAction}>Ver Serviços</a>
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
