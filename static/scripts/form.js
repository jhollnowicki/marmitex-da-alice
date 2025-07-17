document.addEventListener("DOMContentLoaded", () => {
  carregarCardapio();
  configurarBotoes();
  configurarCamposCliente();
});

async function carregarCardapio() {
  try {
    const res = await fetch("/cardapio");
    const data = await res.json();
    const { marmita } = data;

    preencherTamanhos("tamanhos", marmita.tamanhos);
    preencherCarnes("carnes", marmita.carnes);
    preencherAdicionais("adicionais", marmita.adicionais);
  } catch (err) {
    console.error("Erro ao carregar cardápio:", err);
  }
}

function preencherTamanhos(containerId, tamanhos) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  Object.keys(tamanhos).forEach(tamanho => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-option";
    btn.dataset.value = tamanho;
    btn.textContent = capitalizar(tamanho);
    container.appendChild(btn);
  });
}

function preencherCarnes(containerId, carnes) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  carnes.forEach(carne => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-option";
    btn.dataset.value = carne;
    btn.textContent = carne;
    container.appendChild(btn);
  });
}

function preencherAdicionais(containerId, adicionais) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  Object.keys(adicionais).forEach(adicional => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-option";
    btn.dataset.value = adicional;
    btn.textContent = adicional;
    container.appendChild(btn);
  });
}

function configurarBotoes() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("btn-option")) {
      const grupo = event.target.parentElement.id;
      const tipo = grupo === "adicionais" ? "multiplo" : "unico";

      if (tipo === "unico") {
        document.querySelectorAll(`#${grupo} .btn-option`).forEach(btn => btn.classList.remove("active"));
        event.target.classList.add("active");
      } else {
        event.target.classList.toggle("active");
      }
    }
  });
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Mostrar/esconder campos com base no tipo de pedido
function configurarCamposCliente() {
  const tipoPedido = document.getElementById("tipo_pedido");
  const camposCliente = document.getElementById("campos-cliente");
  const camposEntrega = document.getElementById("campos-entrega");

  tipoPedido.addEventListener("change", () => {
    const valor = tipoPedido.value;
    camposCliente.style.display = valor ? "block" : "none";
    camposEntrega.style.display = valor === "Entrega" ? "block" : "none";
  });
}
