import { useState } from "react";
import "../styles/servico.css";

const goldColor = "#b8960c";
const goldLight = "#d4a800";
const goldPale = "#f5edd6";
const dark = "#1a1a2e";


const categories = [
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

const galleryImages = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=80",
];

export default function Serviços() {
  const [activeNav, setActiveNav] = useState("Serviços");

  return (
    <>
      <section className="services-hero">
        <h1>
          Nossos <em>Serviços</em>
        </h1>
        <p>
          Cada serviço é cuidadosamente executado por profissionais especializados,
          garantindo excelência e resultados que superam expectativas
        </p>
      </section>

      <main className="services-content">
        {categories.map((cat) => (
          <div className="category-section" key={cat.name}>
            <h2 className="category-title">{cat.name}</h2>
            <div className="services-grid">
              {cat.services.map((svc) => (
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


      <section className="gallery-section">
        <h2>Galeria de Resultados</h2>
        <p>Veja a transformação que nossos serviços proporcionam</p>
        <div className="gallery-grid">
          {galleryImages.map((src, i) => (
            <div className="gallery-img" key={i}>
              <img src={src} alt={`Resultado ${i + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2>Pronta para experimentar?</h2>
        <p>Agende agora e garanta seu horário preferido</p>
        <button className="cta-btn">Fazer Agendamento</button>
      </section>

      <footer className="footer">
        <div>
          <div className="footer-logo">Tukotomi</div>
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
            Email: <a href="mailto:contato@tukotomi.com.br">contato@tukotomi.com.br</a><br />
            Endereço: Av. Elegância, 1000
          </address>
        </div>
      </footer>
    </>
  );
}
