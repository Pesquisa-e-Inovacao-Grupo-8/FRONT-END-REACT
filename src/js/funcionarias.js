const LISTAR_FUNCIONARIAS_URL = 'http://127.0.0.1:8080/spring/funcionarias/listar';

export async function getFuncionarias() {
  const res = await fetch(LISTAR_FUNCIONARIAS_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Falha ao listar funcionárias (${res.status})`);
  }

  const data = await res.json();

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.funcionarias)) return data.funcionarias;
  if (Array.isArray(data?.content)) return data.content;

  return [];
}
