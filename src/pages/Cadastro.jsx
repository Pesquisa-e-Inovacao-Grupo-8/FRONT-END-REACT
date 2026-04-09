import "../styles/cadastro.css";

export default function Cadastro() {
  return (
    <div className="container-principal-cadastro">
      <div className="container-foto-cadastro">
        <img
          src="https://img.freepik.com/fotos-premium/retrato-de-mulher-rindo-e-cuidados-com-a-pele-beleza-no-estudio-sensacao-suave-e-cosmeticos-em-fundo-cinza-tratamento-facial-de-pessoa-feminina-e-pele-macia-para-resultados-de-dermatologia-toque-e-orgulho-de-brilho_590464-504208.jpg?semt=ais_hybrid&w=740&q=80"
          alt="Foto"
        />
      </div>

      <div className="container-cadastro">
        <h1>Crie sua conta</h1>
        <p>Junte-se a nós e descubra uma nova experiência em beleza</p>

        <form>
          <label>Nome Completo</label>
          <div>
          <input type="text" placeholder="Seu nome" />
          </div>
          
          <label>CPF</label>
          <div>
            <input type="text" placeholder="000.000.000-00" />
          </div>
        
          <label>Telefone</label>
          <div>
            <input type="number" placeholder="(11) 9999-9999" />
          </div>        

            <label>Senha</label>
          <div className="input-senha">
            <input type="password" placeholder="********" />
          </div>

            <label>Confirmar Senha</label>
          <div className="input-senha">
            <input type="password" placeholder="********" />
          </div>



          <div className="opcoes">
            <label>
              <input type="checkbox" /> Concordo com os <span><a href="#">Termos de Uso</a></span> e <span><a href="#">Política de Privacidade</a></span>
            </label>
          </div>

          <button type="submit">Entrar</button>

          <p className="cadastro">
            Já tem uma conta? <span><a href="#">Faça login</a></span>
          </p>
        </form>

      </div>
    </div>
  );
}