const somenteNumeros = (valor) => valor.replace(/\D/g, "");

function cpfValido(cpf) {
  const numeros = somenteNumeros(cpf);
  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) return false;

  const calcularDigito = (base, pesoInicial) => {
    const soma = base.split("").reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const primeiroDigito = calcularDigito(numeros.slice(0, 9), 10);
  const segundoDigito = calcularDigito(numeros.slice(0, 10), 11);

  return Number(numeros[9]) === primeiroDigito && Number(numeros[10]) === segundoDigito;
}

export function validarCadastro(form) {
  if (form.nome.trim().length < 3) return "Informe seu nome completo.";
  if (!cpfValido(form.cpf)) return "Informe um CPF válido.";

  const telefone = somenteNumeros(form.telefone);
  if (telefone.length < 10 || telefone.length > 11) return "Informe um telefone válido com DDD.";

  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Informe um e-mail válido.";
  if (form.senha.length < 8) return "A senha deve ter pelo menos 8 caracteres.";
  if (!/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) {
    return "A senha deve conter letras e números.";
  }
  if (form.senha !== form.confirmarSenha) return "As senhas não coincidem.";

  return "";
}

export function validarLogin({ email, senha }) {
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Informe um e-mail válido.";
  if (!senha) return "Informe sua senha.";
  return "";
}
