// src/validate-access.js
import { jwtDecode } from "jwt-decode";
import api from "./api";

/**
 * Normaliza uma role pra maiúsculas, sem espaços nas pontas.
 * Evita bugs bobos tipo "admin" vs "ADMIN" vs " ADMIN ".
 */
export function normalizarRole(role) {
  if (!role) return "";
  return String(role).trim().replace(/^ROLE_/i, "").toUpperCase();
}

/**
 * Decodifica o token do localStorage LOCALMENTE (sem chamar o backend).
 * Retorna null se não existir, estiver expirado ou for inválido.
 *
 * Use pra UX rápida: exibir nome, decidir redirecionamento inicial, etc.
 * NÃO é garantia de que o backend ainda aceita esse token.
 */
export function getUsuarioLogado() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (token.startsWith("mock-")) {
    return {
      id: localStorage.getItem("userId"),
      nome: localStorage.getItem("userName"),
      tipo: normalizarRole(localStorage.getItem("userRole")),
      mock: true,
    };
  }

  try {
    const decoded = jwtDecode(token);

    const expirado = decoded.exp && decoded.exp * 1000 < Date.now();
    if (expirado) {
      limparSessao();
      return null;
    }

    return {
      ...decoded,
      tipo: normalizarRole(decoded.tipo || decoded.role),
    };
  } catch (error) {
    limparSessao();
    return null;
  }
}

/**
 * Verifica localmente (sem bater no backend) se o usuário tem uma
 * das roles permitidas.
 */
export function possuiPermissao(rolesPermitidas) {
  const usuario = getUsuarioLogado();
  if (!usuario) return false;

  const roles = rolesPermitidas.map(normalizarRole);
  return roles.includes(usuario.tipo);
}

/**
 * Valida o token de fato, consultando o backend (GET /auth/validate-access).
 * Retorna { valido: boolean, tipo: string | null }.
 *
 * Use isso quando precisar ter certeza de que o token ainda é aceito
 * pelo servidor (ex: ao entrar numa rota protegida).
 */
export async function validarAcessoNoBackend() {
  const token = localStorage.getItem("token");
  if (!token) return { valido: false, tipo: null };

  if (token.startsWith("mock-")) {
    return {
      valido: true,
      tipo: normalizarRole(localStorage.getItem("userRole")),
    };
  }

  try {
    const response = await api.get("/auth/validate-access");
    return {
      valido: !!response.data?.valido,
      tipo: normalizarRole(response.data?.tipo),
    };
  } catch (error) {
    return { valido: false, tipo: null };
  }
}

/**
 * Busca os dados do PRÓPRIO usuário logado no backend (GET /usuarios/me).
 * Não depende de nenhum id vindo do localStorage — o backend descobre
 * quem é através do token.
 *
 * Retorna null em caso de erro (token inválido, endpoint fora do ar, etc),
 * pra quem consumir poder tratar de forma silenciosa sem travar a tela.
 */
export async function buscarMeusDados() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await api.get("/usuarios/me");
    return response.data; // { id, nome, email, telefone }
  } catch (error) {
    console.log("Não foi possível carregar os dados do usuário:", error);
    return null;
  }
}

/**
 * Limpa todos os dados de sessão do localStorage.
 */
export function limparSessao() {
  ["token", "userId", "userName", "userRole"].forEach((key) =>
    localStorage.removeItem(key)
  );
}

/**
 * Faz logout completo: limpa a sessão e redireciona pro login.
 */
export function logout() {
  limparSessao();
  window.location.assign("/login");
}