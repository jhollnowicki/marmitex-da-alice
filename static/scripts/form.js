document.addEventListener("DOMContentLoaded", () => {
  carregarCardapio();
  configurarBotoes();
  configurarCamposCliente();
  configurarPagamento();
});

async function carregarCardapio() {
  try {
    const res = await fetch("/cardapio");
    const data = await res.json();

    const { marmita, bebidas, outros } = data;

    preencherTamanhos("tamanhos", marmita.tamanhos);
    preencherCarnes("carnes", marmita.carnes);
    preencherAdicionais("adicionais", marmita.adicionais);
    
    // Adicione isso:
    preencherAdicionais("bebidas", bebidas);
    preencherAdicionais("outros", outros);
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
      const tipo = ["adicionais", "bebidas", "outros"].includes(grupo) ? "multiplo" : "unico";

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

function configurarPagamento() {
  const pagamentoBtns = document.querySelectorAll('#pagamento-opcoes .btn-option');
  const formaPagamentoInput = document.getElementById('forma_pagamento');
  const campoTroco = document.getElementById('campo-troco');
  const trocoParaInput = document.querySelector('input[name="troco_para"]');

  pagamentoBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      pagamentoBtns.forEach(b => b.classList.remove('active', 'bg-red-600', 'text-white'));
      this.classList.add('active', 'bg-red-600', 'text-white');

      const valor = this.getAttribute('data-value');
      formaPagamentoInput.value = valor;

      if (valor === 'Dinheiro') {
        campoTroco.style.display = 'block';
      } else {
        campoTroco.style.display = 'none';
        trocoParaInput.value = 'R$ 0,00';
      }
    });
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    if (!formaPagamentoInput.value) {
      e.preventDefault();
      alert("Selecione uma forma de pagamento.");
    }
  });

  // Formatação do campo de troco
  if (trocoParaInput) {
    const formatarMoeda = (valor) => {
      let num = valor.replace(/\D/g, "");
      if (num === "") num = "0";
      num = (parseInt(num, 10) / 100).toFixed(2);
      return "R$ " + num.replace(".", ",");
    };

    trocoParaInput.addEventListener("input", () => {
      const cursorPos = trocoParaInput.selectionStart;
      trocoParaInput.value = formatarMoeda(trocoParaInput.value);
      trocoParaInput.setSelectionRange(trocoParaInput.value.length, trocoParaInput.value.length);
    });

    trocoParaInput.addEventListener("focus", () => {
      if (trocoParaInput.value.trim() === "") {
        trocoParaInput.value = "R$ 0,00";
      }
    });

    trocoParaInput.addEventListener("blur", () => {
      if (trocoParaInput.value.trim() === "") {
        trocoParaInput.value = "R$ 0,00";
      }
    });

    trocoParaInput.value = "R$ 0,00";
  }
}
