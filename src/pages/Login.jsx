import { useState } from "react";
import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Senha:", senha);
  };

  return (
    <div className="container-principal">

      <div className="container-foto">
        <img src="https://img.freepik.com/fotos-premium/retrato-de-mulher-rindo-e-cuidados-com-a-pele-beleza-no-estudio-sensacao-suave-e-cosmeticos-em-fundo-cinza-tratamento-facial-de-pessoa-feminina-e-pele-macia-para-resultados-de-dermatologia-toque-e-orgulho-de-brilho_590464-504208.jpg?semt=ais_hybrid&w=740&q=80" alt="Foto" />
      </div>

      <div className="container-login">
        <div className="titulo">
          <h2>Bem-vinda de volta</h2>
          <p>Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="credenciais">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="credenciais">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            /> 
          </div>

          <div className="confirmar">
            <div className="lembrar">
              <input type="checkbox" />
              <span>Lembrar de mim</span>
            </div>

            <a href="#">Esqueceu a senha?</a>
          </div>

          <button type="submit">Entrar</button>

          <div className="links">
            <p>
              Não tem uma conta? <a href="#">Cadastre-se</a>
            </p>
          </div>

           <hr />
            

          <div className="rodape">
            <p>
              Ao fazer login, você concorda com nossos
              <a href="#">Termos de Uso</a> e
              <a href="#">Política de Privacidade</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
