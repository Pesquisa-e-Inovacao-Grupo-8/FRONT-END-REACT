import "../styles/cadastro.css";

export default function Cadastro() {
  return (
    <div className="container-principal-cadastro">

      <div className="container-foto-cadastro">
      </div>

      <div className="container-cadastro">
        <h1>Crie sua conta</h1>
        <p>Junte-se a nós e descubra uma nova experiência em beleza</p>

        <form>
          <label>Nome Completo</label>
          <div>
            <input type="text" placeholder="Seu nome" />
          </div>

          <div className="input-wrapper">

            <div>
              <label>CPF</label>
              <div>
                <input type="text" placeholder="000.000.000-00" />
              </div>
            </div>

            <div>

              <label>Telefone</label>
              <div>
                <input type="number" placeholder="(11) 9999-9999" />
              </div>

            </div>

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
              <input style={{ width: "fit-content" , marginRight: "2px"}} type="checkbox" /> 
              Concordo com os <span><a href="#">Termos de Uso</a></span> e <span><a href="#">Política de Privacidade</a></span>
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