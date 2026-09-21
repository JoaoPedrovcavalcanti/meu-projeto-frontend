// Troque essa URL pela URL pública do backend depois do deploy no Render,
// ex: "https://seu-backend.onrender.com/cartas"
const API_URL = "http://localhost:3000/cartas";

const formulario = document.querySelector("#form-carta");
const campoId = document.querySelector("#carta-id");
const campoNome = document.querySelector("#nome");
const campoTipo = document.querySelector("#tipo");
const campoRaridade = document.querySelector("#raridade");
const campoCusto = document.querySelector("#custoElixir");
const campoImagemUrl = document.querySelector("#imagemUrl");
const tituloFormulario = document.querySelector("#titulo-formulario");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const listaCartas = document.querySelector("#lista-cartas");
const mensagem = document.querySelector("#mensagem");
const formularioBusca = document.querySelector("#form-busca");
const campoBuscaId = document.querySelector("#busca-id");

async function fazerRequisicao(url, opcoes = {}) {
  const resposta = await fetch(url, opcoes);

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({}));
    throw new Error(erro.mensagem || "Não foi possível concluir a operação");
  }

  if (resposta.status === 204) {
    return null;
  }

  return resposta.json();
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.classList.toggle("erro", erro);
}

function classeRaridade(raridade) {
  const mapa = {
    "Comum": "comum",
    "Rara": "rara",
    "Épica": "epica",
    "Lendária": "lendaria",
    "Campeão": "campeao"
  };
  return mapa[raridade] || "comum";
}

function criarCartaoCarta(carta) {
  const cartao = document.createElement("article");
  cartao.className = "carta";

  if (carta.imagemUrl) {
    const imagem = document.createElement("img");
    imagem.src = carta.imagemUrl;
    imagem.alt = carta.nome;
    imagem.className = "carta-imagem";
    cartao.append(imagem);
  }

  const nome = document.createElement("h3");
  nome.textContent = carta.nome;

  const tipo = document.createElement("p");
  tipo.textContent = `Tipo: ${carta.tipo}`;

  const raridade = document.createElement("span");
  raridade.className = `etiqueta-raridade ${classeRaridade(carta.raridade)}`;
  raridade.textContent = carta.raridade;

  const custo = document.createElement("p");
  custo.textContent = `Custo: ${carta.custoElixir} elixir`;

  const id = document.createElement("p");
  id.className = "carta-id";
  id.textContent = `ID: ${carta._id}`;

  const acoes = document.createElement("div");
  acoes.className = "acoes-carta";

  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.textContent = "Editar";
  botaoEditar.addEventListener("click", () => carregarCartaParaEdicao(carta._id));

  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "perigo";
  botaoExcluir.textContent = "Excluir";
  botaoExcluir.addEventListener("click", () => excluirCarta(carta._id));

  acoes.append(botaoEditar, botaoExcluir);
  cartao.append(nome, raridade, tipo, custo, id, acoes);

  return cartao;
}

function exibirCartas(cartas) {
  listaCartas.innerHTML = "";

  if (cartas.length === 0) {
    mostrarMensagem("Nenhuma carta cadastrada");
    return;
  }

  cartas.forEach((carta) => {
    listaCartas.appendChild(criarCartaoCarta(carta));
  });

  mostrarMensagem(`${cartas.length} carta(s) encontrada(s)`);
}

async function listarCartas() {
  try {
    mostrarMensagem("Carregando cartas...");
    const cartas = await fazerRequisicao(API_URL);
    exibirCartas(cartas);
  } catch (erro) {
    listaCartas.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
}

async function buscarCartaPorId(id) {
  const carta = await fazerRequisicao(`${API_URL}/${id}`);
  exibirCartas([carta]);
  return carta;
}

async function salvarCarta(evento) {
  evento.preventDefault();

  const carta = {
    nome: campoNome.value.trim(),
    tipo: campoTipo.value,
    raridade: campoRaridade.value,
    custoElixir: Number(campoCusto.value)
  };

  if (campoImagemUrl.value.trim() !== "") {
    carta.imagemUrl = campoImagemUrl.value.trim();
  }

  const id = campoId.value;
  const estaEditando = Boolean(id);
  const url = estaEditando ? `${API_URL}/${id}` : API_URL;
  const metodo = estaEditando ? "PUT" : "POST";

  try {
    await fazerRequisicao(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(carta)
    });

    limparFormulario();
    mostrarMensagem(estaEditando ? "Carta atualizada" : "Carta cadastrada");
    await listarCartas();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function carregarCartaParaEdicao(id) {
  try {
    const carta = await fazerRequisicao(`${API_URL}/${id}`);

    campoId.value = carta._id;
    campoNome.value = carta.nome;
    campoTipo.value = carta.tipo;
    campoRaridade.value = carta.raridade;
    campoCusto.value = carta.custoElixir;
    campoImagemUrl.value = carta.imagemUrl ?? "";
    tituloFormulario.textContent = "Editar carta";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.classList.remove("oculto");
    campoNome.focus();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

async function excluirCarta(id) {
  const confirmou = window.confirm("Deseja excluir esta carta?");

  if (!confirmou) {
    return;
  }

  try {
    await fazerRequisicao(`${API_URL}/${id}`, { method: "DELETE" });
    limparFormulario();
    mostrarMensagem("Carta excluída");
    await listarCartas();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

function limparFormulario() {
  formulario.reset();
  campoId.value = "";
  tituloFormulario.textContent = "Nova carta";
  botaoSalvar.textContent = "Cadastrar";
  botaoCancelar.classList.add("oculto");
}

formulario.addEventListener("submit", salvarCarta);
botaoCancelar.addEventListener("click", limparFormulario);
document.querySelector("#botao-atualizar").addEventListener("click", listarCartas);
document.querySelector("#botao-limpar-busca").addEventListener("click", () => {
  campoBuscaId.value = "";
  listarCartas();
});

formularioBusca.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const id = campoBuscaId.value.trim();

  if (!id) {
    mostrarMensagem("Informe um ID para realizar a busca", true);
    return;
  }

  try {
    await buscarCartaPorId(id);
  } catch (erro) {
    listaCartas.innerHTML = "";
    mostrarMensagem(erro.message, true);
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

listarCartas();
