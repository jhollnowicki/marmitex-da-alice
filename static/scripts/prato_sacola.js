document.addEventListener('DOMContentLoaded', () => {
  const btnAdd = document.getElementById('add-prato');
  const sacola = document.getElementById('sacola');
  let pratos = [];
  let index = 0;

  carregarCardapio();
  configurarPagamento();

  async function carregarCardapio() {
    try {
      const res = await fetch("/cardapio");
      const data = await res.json();

      const carnes = data.prato.carnes || [];
      const adicionais = Object.keys(data.prato.adicionais || {});

      const divCarnes = document.getElementById("carne");
      const divAdicionais = document.getElementById("adicionais");

      // Preenche carnes
      divCarnes.innerHTML = "";
      carnes.forEach(carne => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-option";
        btn.dataset.value = carne;
        btn.textContent = carne;
        btn.addEventListener("click", () => {
          document.querySelectorAll("#carne .btn-option").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
        divCarnes.appendChild(btn);
      });

      // Preenche adicionais
      divAdicionais.innerHTML = "";
      adicionais.forEach(adc => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-option";
        btn.dataset.value = adc;
        btn.textContent = adc;
        btn.addEventListener("click", () => {
          btn.classList.toggle("active");
        });
        divAdicionais.appendChild(btn);
      });

    } catch (err) {
      console.error("Erro ao carregar cardápio:", err);
    }
  }

  function getSelectedAdicionais() {
    const buttons = document.querySelectorAll('#adicionais .btn-option.active');
    return Array.from(buttons).map(btn => btn.dataset.value);
  }

  function getSelectedCarne() {
    const btn = document.querySelector('#carne .btn-option.active');
    return btn ? btn.dataset.value : null;
  }

  function clearAdicionais() {
    document.querySelectorAll('#adicionais .btn-option').forEach(btn => btn.classList.remove('active'));
  }

  function clearCarne() {
    document.querySelectorAll('#carne .btn-option').forEach(btn => btn.classList.remove('active'));
  }

  function criarItem(prato, idx) {
    const div = document.createElement('div');
    div.className = "bg-white/80 rounded-lg p-4 shadow relative";

    div.innerHTML = `
      <button type="button" class="absolute top-2 right-2 text-red-600 font-bold text-lg" title="Remover item">&times;</button>
      <p><strong>Base:</strong> ${prato.base}</p>
      ${prato.adicionais.length > 0 ? `<p><strong>Adicionais:</strong> ${prato.adicionais.join(', ')}</p>` : ""}
      <p><strong>Observações:</strong> ${prato.observacoes || "Nenhuma"}</p>
      <input type="hidden" name="pratos[${idx}][base]" value="${prato.base}">
      <input type="hidden" name="pratos[${idx}][adicionais]" value="${prato.adicionais.join(", ")}">
      <input type="hidden" name="pratos[${idx}][observacoes]" value="${prato.observacoes}">
    `;

    div.querySelector('button').addEventListener('click', () => {
      pratos.splice(idx, 1);
      renderSacola();
    });

    return div;
  }

  function renderSacola() {
    sacola.innerHTML = "";
    pratos.forEach((prato, idx) => {
      const item = criarItem(prato, idx);
      sacola.appendChild(item);
    });
  }

  btnAdd.addEventListener('click', () => {
    const baseSelecionada = getSelectedCarne();
    if (!baseSelecionada) {
      alert("Por favor, selecione a carne do prato.");
      return;
    }

    const adicionais = getSelectedAdicionais();
    const observacoes = document.getElementById("observacoes").value.trim();

    pratos.push({
      base: baseSelecionada,
      adicionais,
      observacoes
    });

    index++;
    renderSacola();
    clearAdicionais();
    clearCarne();
    document.getElementById("observacoes").value = "";
  });

  function configurarPagamento() {
    const botoesPagamento = document.querySelectorAll("#pagamento-opcoes .btn-option");
    const inputForma = document.getElementById("forma_pagamento");
    const campoTroco = document.getElementById("campo-troco");

    botoesPagamento.forEach(botao => {
      botao.addEventListener("click", () => {
        botoesPagamento.forEach(b => b.classList.remove("active"));
        botao.classList.add("active");

        const valor = botao.dataset.value;
        inputForma.value = valor;

        campoTroco.style.display = valor === "Dinheiro" ? "block" : "none";
      });
    });
  }
});
