import api, { normalizeArray } from '../api';

const LISTAR_FUNCIONARIAS_URL = '/profissionais';

export async function getFuncionarias() {
 try {
    const response = await api.get(LISTAR_FUNCIONARIAS_URL);
    const dadosBrutos = normalizeArray(response.data);
    const funcionariasFormatadas = await Promise.all(dadosBrutos.map(async prof => {
      let horarios = [];
      let servicos = [];
      try {
        const horariosResponse = await api.get(`/profissionais/${prof.id}/horarios`);
        horarios = normalizeArray(horariosResponse.data);
      } catch (error) {
        console.warn(`Horários não configurados para o profissional ${prof.id}`);
      }

      try {
        const servicosResponse = await api.get(`/profissionais/${prof.id}/servicos`);
        servicos = normalizeArray(servicosResponse.data);
      } catch (error) {
        console.warn(`Serviços não configurados para o profissional ${prof.id}`);
      }

      return {
        id: prof.id,
        nome: prof.usuario ? prof.usuario.nome : 'Profissional Sem Nome',
        servicos,
        horarios,
      };
    }));
    return funcionariasFormatadas;
    
  } catch (error) {
    console.error("Falha ao listar funcionárias do backend:", error);
    return []; 
  }
}