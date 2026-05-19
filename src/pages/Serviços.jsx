//src/pages/Serviços.jsx
import { useState } from "react";
import "../styles/servico.css";
import CardServico from "../components/serviços/CardServico";

const goldColor = "#b8960c";
const goldLight = "#d4a800";
const goldPale = "#f5edd6";
const dark = "#1a1a2e";




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

      <CardServico/>


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
