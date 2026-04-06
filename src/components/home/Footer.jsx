const FOOTER_DATA = {
  hours: [
    "Segunda a Sexta: 9h às 20h",
    "Sábado: 9h às 18h",
    "Domingo: Fechado"
  ],
  contact: [
    "Tel: (11) 9999-9999",
    "Email: contato@tukotomi.com.br",
    "Endereço: Av. Elegância, 1000"
  ]
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <a href="#" className="navbar-logo">Tukotomi</a>
          <p>Elegância e sofisticação em cada detalhe</p>
        </div>

        <div className="footer-col">
          <h4>Horário de Funcionamento</h4>
          {FOOTER_DATA.hours.map((h, i) => <p key={i}>{h}</p>)}
        </div>

        <div className="footer-col">
          <h4>Contato</h4>
          {FOOTER_DATA.contact.map((c, i) => (
            c.includes('Email') ? 
              <a key={i} href={`mailto:${c.split(': ')[1]}`}>{c}</a> :
              <p key={i}>{c}</p>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Tukotomi. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
