export function textoObrigatorio(valor) {
  return typeof valor === 'string' && valor.trim().length > 0;
}

export function numeroFinito(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor);
  if (typeof valor !== 'string' || valor.trim() === '') return false;

  const normalizado = valor.trim().replace(',', '.');
  return Number.isFinite(Number(normalizado));
}

export function moeda(valor, { minimo = 0, incluirMinimo = true } = {}) {
  if (!numeroFinito(valor)) return false;

  const numero = Number(String(valor).trim().replace(',', '.'));
  return incluirMinimo ? numero >= minimo : numero > minimo;
}

export function duracaoPositiva(valor) {
  if (!numeroFinito(valor)) return false;

  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0;
}

export function apenasDigitos(valor) {
  return typeof valor === 'string' ? valor.replace(/\D/g, '') : '';
}

export function cpfValido(valor) {
  const cpf = apenasDigitos(valor);
  if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let indice = 0; indice < 9; indice += 1) {
    soma += Number(cpf[indice]) * (10 - indice);
  }

  let resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  if (resto !== Number(cpf[9])) return false;

  soma = 0;
  for (let indice = 0; indice < 10; indice += 1) {
    soma += Number(cpf[indice]) * (11 - indice);
  }

  resto = (soma * 10) % 11;
  if (resto === 10) resto = 0;
  return resto === Number(cpf[10]);
}

export function telefoneValido(valor) {
  const telefone = apenasDigitos(valor);
  return telefone.length >= 10 && telefone.length <= 11;
}

export function senhaValida(valor, minimo = 6) {
  return typeof valor === 'string' && valor.length >= minimo;
}

export function decimalNormalizado(valor) {
  return Number(String(valor).trim().replace(',', '.'));
}
