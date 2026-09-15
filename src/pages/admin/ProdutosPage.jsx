import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../../api";
import "../../styles/produtos.css"; 

const emptyForm = {
  id: "",
  nome: "",
  unidadeMedida: "",
  custoUnitario: "",
};

function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("TODAS");

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState(null);

  const [confirmandoExclusao, setConfirmandoExclusao] = useState(null);

  const carregarProdutos = useCallback(async () => {
    setLoading(true);
    setErro(null);

    try {
      const { data } = await api.get("/produtos");
      setProdutos(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível carregar os produtos."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [carregarProdutos]);

  const unidadesDisponiveis = useMemo(() => {
    const set = new Set(
      produtos
        .map((p) => p.unidadeMedida)
        .filter((u) => u && u.trim().length > 0)
    );
    return Array.from(set).sort();
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((p) => {
      const bateBusca = !termo || (p.nome || "").toLowerCase().includes(termo);
      const bateFiltro =
        filtroUnidade === "TODAS" || p.unidadeMedida === filtroUnidade;
      return bateBusca && bateFiltro;
    });
  }, [produtos, busca, filtroUnidade]);

  function abrirModalCriacao() {
    setForm(emptyForm);
    setModoEdicao(false);
    setErroForm(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(produto) {
    setForm({
      id: produto.id,
      nome: produto.nome || "",
      unidadeMedida: produto.unidadeMedida || "",
      custoUnitario:
        produto.custoUnitario === null || produto.custoUnitario === undefined
          ? ""
          : String(produto.custoUnitario),
    });
    setModoEdicao(true);
    setErroForm(null);
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setForm(emptyForm);
    setErroForm(null);
  }

  function handleChangeForm(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function validarForm() {
    if (!form.nome.trim()) return "Informe o nome do produto.";
    if (form.custoUnitario === "" || Number.isNaN(Number(form.custoUnitario)))
      return "Informe um custo unitário válido.";
    if (Number(form.custoUnitario) < 0)
      return "O custo unitário não pode ser negativo.";
    return null;
  }

  async function salvarProduto(e) {
    e.preventDefault();

    const mensagemValidacao = validarForm();
    if (mensagemValidacao) {
      setErroForm(mensagemValidacao);
      return;
    }

    setSalvando(true);
    setErroForm(null);

    const payload = {
      nome: form.nome.trim(),
      unidadeMedida: form.unidadeMedida.trim() || null,
      custoUnitario: Number(form.custoUnitario),
    };

    try {
      if (modoEdicao) {
        await api.put(`/produtos/${form.id}`, payload);
      } else {
        await api.post("/produtos", payload);
      }

      await carregarProdutos();
      setModalAberto(false);
      setForm(emptyForm);
    } catch (e) {
      setErroForm(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível salvar o produto."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(id) {
    try {
      await api.delete(`/produtos/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      setErro(
        e?.response?.data?.message ||
          e?.message ||
          "Não foi possível excluir o produto."
      );
    } finally {
      setConfirmandoExclusao(null);
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">Estoque</p>
          <h1 className="titulo">Produtos</h1>
        </div>
        <button className="botaoPrimario" onClick={abrirModalCriacao}>
          Novo produto
        </button>
      </header>

      <section className="barraFerramentas">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome..."
          className="inputBusca"
          aria-label="Buscar produtos por nome"
        />

        <select
          value={filtroUnidade}
          onChange={(e) => setFiltroUnidade(e.target.value)}
          className="select"
          aria-label="Filtrar por unidade de medida"
        >
          <option value="TODAS">Todas as unidades</option>
          {unidadesDisponiveis.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </section>

      {erro && (
        <div className="faixaErro">
          {erro}
          <button className="linkErro" onClick={carregarProdutos}>
            Tentar novamente
          </button>
        </div>
      )}

      <section className="listaWrap">
        <div className="linhaCabecalho">
          <span className="colNome">Nome</span>
          <span className="colUnidade">Unidade</span>
          <span className="colCusto">Custo unitário</span>
          <span className="colAcoes">Ações</span>
        </div>

        {loading && <div className="estadoVazio">Carregando produtos...</div>}

        {!loading && produtosFiltrados.length === 0 && (
          <div className="estadoVazio">
            {produtos.length === 0
              ? "Nenhum produto cadastrado ainda. Clique em “Novo produto” para começar."
              : "Nenhum produto encontrado para essa busca ou filtro."}
          </div>
        )}

        {!loading &&
          produtosFiltrados.map((p) => (
            <div key={p.id} className="linha">
              <span className="colNome">{p.nome}</span>
              <span className="colUnidade">
                {p.unidadeMedida ? (
                  <span className="tagUnidade">{p.unidadeMedida}</span>
                ) : (
                  <span className="semValor">—</span>
                )}
              </span>
              <span className="colCusto mono">
                {formatMoney(p.custoUnitario)}
              </span>
              <span className="colAcoes">
                <button className="botaoSecundario" onClick={() => abrirModalEdicao(p)}>
                  Editar
                </button>
                <button
                  className="botaoPerigo"
                  onClick={() => setConfirmandoExclusao(p)}
                >
                  Excluir
                </button>
              </span>
            </div>
          ))}
      </section>

      {modalAberto && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modalCabecalho">
              <h2 className="modalTitulo">
                {modoEdicao ? "Editar produto" : "Novo produto"}
              </h2>
              <button
                className="botaoFechar"
                onClick={fecharModal}
                aria-label="Fechar"
                disabled={salvando}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarProduto} className="formulario">
              <label className="label">
                Nome
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleChangeForm("nome", e.target.value)}
                  className="input"
                  placeholder="Ex: Farinha de trigo"
                  maxLength={100}
                  required
                />
              </label>

              <label className="label">
                Unidade de medida
                <input
                  type="text"
                  value={form.unidadeMedida}
                  onChange={(e) => handleChangeForm("unidadeMedida", e.target.value)}
                  className="input"
                  placeholder="Ex: kg, un, litro"
                  maxLength={20}
                />
              </label>

              <label className="label">
                Custo unitário
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.custoUnitario}
                  onChange={(e) => handleChangeForm("custoUnitario", e.target.value)}
                  className="input"
                  placeholder="0,00"
                  required
                />
              </label>

              {erroForm && <div className="erroForm">{erroForm}</div>}

              <div className="modalRodape">
                <button
                  type="button"
                  className="botaoSecundario"
                  onClick={fecharModal}
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button type="submit" className="botaoPrimario" disabled={salvando}>
                  {salvando ? "Salvando..." : modoEdicao ? "Salvar alterações" : "Criar produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmandoExclusao && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modalPequeno">
            <h2 className="modalTitulo">Excluir produto</h2>
            <p className="textoConfirmacao">
              Tem certeza que deseja excluir <strong>{confirmandoExclusao.nome}</strong>? Essa ação não pode ser desfeita.
            </p>
            <div className="modalRodape">
              <button
                className="botaoSecundario"
                onClick={() => setConfirmandoExclusao(null)}
              >
                Cancelar
              </button>
              <button
                className="botaoPerigo"
                onClick={() => excluirProduto(confirmandoExclusao.id)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
