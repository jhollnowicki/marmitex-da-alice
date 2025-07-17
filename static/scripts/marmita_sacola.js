document.addEventListener("DOMContentLoaded", () => {
  configurarFormulario();
});

let sacola = [];
const sacolaDiv = document.getElementById("sacola");

function configurarFormulario() {
  const tipoPedido = document.getElementById("tipo_pedido");
  const camposCliente = document.getElementById("campos-cliente");
  const camposEntrega = document.getElementById("campos-entrega");

  tipoPedido.addEventListener("change", () => {
    const tipo = tipoPedido.value;
    camposCliente.style.display = "block";
    camposEntrega.style.display = tipo === "Entrega" ? "block" : "none";
  });

  document.getElementById("add-marmita").addEventListener("click", () => {
    const tamanho = pegarSelecionado("tamanhos");
    const carne = pegarSelecionado("carnes");
    const adicionais = pegarSelecionados("adicionais");
    const obs = document.getElementById("observacoes").value.trim();

    if (!tamanho || !carne) {
      alert("Selecione o tamanho e a carne da marmita.");
      return;
    }

    const item = { tamanho, carne, adicionais, observacoes: obs };
    sacola.push(item);
    renderizarSacola();
    limparSelecoes();
  });
}

function pegarSelecionado(id) {
  const btn = document.querySelector(`#${id} .btn-option.active`);
  return btn ? btn.dataset.value : null;
}

function pegarSelecionados(id) {
  const btns = document.querySelectorAll(`#${id} .btn-option.active`);
  return [...btns].map((b) => b.dataset.value);
}

function renderizarSacola() {
  sacolaDiv.innerHTML = "";
  sacola.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "bg-white p-3 rounded-md shadow border";

    div.innerHTML = `
      <p><strong>Marmita ${index + 1}</strong></p>
      <p><strong>Tamanho:</strong> ${item.tamanho}</p>
      <p><strong>Carne:</strong> ${item.carne}</p>
      <p><strong>Adicionais:</strong> ${item.adicionais.join(", ") || "Nenhum"}</p>
      <p><strong>Obs:</strong> ${item.observacoes || "Nenhuma"}</p>
      <input type="hidden" name="marmitas[${index}][tamanho]" value="${item.tamanho}">
      <input type="hidden" name="marmitas[${index}][carne]" value="${item.carne}">
      <input type="hidden" name="marmitas[${index}][adicionais]" value="${item.adicionais.join(',')}">
      <input type="hidden" name="marmitas[${index}][observacoes]" value="${item.observacoes}">
      <button class="text-red-600 font-bold mt-1" onclick="removerMarmita(${index})">Remover</button>
    `;
    sacolaDiv.appendChild(div);
  });
}

function removerMarmita(index) {
  sacola.splice(index, 1);
  renderizarSacola();
}

function limparSelecoes() {
  document.querySelectorAll(".btn-option").forEach((b) => b.classList.remove("active"));
  document.getElementById("observacoes").value = "";
}
