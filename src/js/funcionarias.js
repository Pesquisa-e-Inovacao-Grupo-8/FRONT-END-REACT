import api, { normalizeArray } from '../api';

const LISTAR_FUNCIONARIAS_URL = '/profissionais';

export async function getFuncionarias() {
 try {
    const response = await api.get(LISTAR_FUNCIONARIAS_URL);
    const dadosBrutos = normalizeArray(response.data);
    const funcionariasFormatadas = dadosBrutos.map(prof => ({
      id: prof.id,
      nome: prof.usuario ? prof.usuario.nome : 'Profissional Sem Nome',
      servicos: prof.servicos ? prof.servicos : []
    }));  
    return funcionariasFormatadas;
    
  } catch (error) {
    console.error("Falha ao listar funcionárias do backend:", error);
    return []; 
  }
}