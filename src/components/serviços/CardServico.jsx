

export default function CardServico({ title, description, image }) {

    const categorias = [
      {
        name: "Cabelo",
        services: [
          { icon: "✂️", name: "Corte Feminino", price: "R$ 120", duration: "1h", desc: "Corte personalizado com técnicas modernas e acabamento impecável" },
          { icon: "🎨", name: "Coloração Completa", price: "R$ 280", duration: "2h30", desc: "Coloração profissional com produtos premium" },
          { icon: "✨", name: "Hidratação Premium", price: "R$ 150", duration: "1h30", desc: "Tratamento intensivo com ampolas reconstrutoras" },
          { icon: "⭐", name: "Mechas Balayage", price: "R$ 380", duration: "3h", desc: "Técnica de iluminação natural e elegante" },
        ],
      },
      {
        name: "Estética",
        services: [
          { icon: "✨", name: "Limpeza de Pele Profunda", price: "R$ 180", duration: "1h30", desc: "Tratamento completo com extração e máscara" },
          { icon: "🤍", name: "Massagem Relaxante", price: "R$ 160", duration: "1h", desc: "Massagem terapêutica com óleos essenciais" },
        ],
      },
      {
        name: "Maquiagem",
        services: [
          { icon: "🖊️", name: "Maquiagem Social", price: "R$ 150", duration: "1h", desc: "Maquiagem profissional para eventos" },
          { icon: "⭐", name: "Maquiagem Noiva", price: "R$ 350", duration: "2h", desc: "Maquiagem especial com teste incluído" },
        ],
      },
      {
        name: "Unhas",
        services: [
          { icon: "✨", name: "Manicure Completa", price: "R$ 60", duration: "45min", desc: "Cuidados completos com esmaltação tradicional" },
          { icon: "⭐", name: "Alongamento em Gel", price: "R$ 180", duration: "2h", desc: "Unhas alongadas com gel de alta qualidade" },
        ],
      },
    ];

    return (
      <main className="services-content">
        {categorias.map((categoria) => (
          <div className="category-section" key={categoria.name}>
            <h2 className="category-title">{categoria.name}</h2>
            <div className="services-grid">
              {categoria.services.map((svc) => (
                <div className="service-card" key={svc.name}>
                  <div className="card-top">
                    <div className="card-icon">{svc.icon}</div>
                    <div className="card-meta">
                      <div className="card-price">{svc.price}</div>
                      <div className="card-duration">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {svc.duration}
                      </div>
                    </div>
                  </div>
                  <div className="card-name">{svc.name}</div>
                  <div className="card-desc">{svc.desc}</div>
                  <button className="card-btn">Agendar</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    );
    }