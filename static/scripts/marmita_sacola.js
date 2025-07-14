document.addEventListener("DOMContentLoaded", () => {
  let contador = 0;
  const sacola = document.getElementById("sacola");

  let tamanhoSelecionado = "";
  let carneSelecionada = "";
  let adicionaisSelecionados = new Set();

  // Ativa/desativa botão de escolha única
  function selecionarUnico(containerId, value) {
    const botoes = document.querySelectorAll(`#${containerId} .btn-option`);
    botoes.forEach(btn => {
      btn.classList.remove("active");
      if (btn.dataset.value === value) btn.classList.add("active");
    });
  }

  // Ativa/desativa botão de múltipla escolha
  function alternarMultiplo(containerId, value) {
    const botao = document.querySelector(`#${containerId} .btn-option[data-value="${value}"]`);
    if (adicionaisSelecionados.has(value)) {
      adicionaisSelecionados.delete(value);
      botao.classList.remove("active");
    } else {
      adicionaisSelecionados.add(value);
      botao.classList.add("active");
    }
  }

  // Ações nos botões
  document.querySelectorAll("#tamanhos .btn-option").forEach(btn => {
    btn.addEventListener("click", () => {
      tamanhoSelecionado = btn.dataset.value;
      selecionarUnico("tamanhos", tamanhoSelecionado);
    });
  });

  document.querySelectorAll("#carnes .btn-option").forEach(btn => {
    btn.addEventListener("click", () => {
      carneSelecionada = btn.dataset.value;
      selecionarUnico("carnes", carneSelecionada);
    });
  });

  document.querySelectorAll("#adicionais .btn-option").forEach(btn => {
    btn.addEventListener("click", () => {
      alternarMultiplo("adicionais", btn.dataset.value);
    });
  });

  document.getElementById("add-marmita").addEventListener("click", () => {
    const observacoes = document.getElementById("observacoes").value.trim();

    if (!tamanhoSelecionado || !carneSelecionada) {
      alert("Selecione o tamanho e o tipo de carne!");
      return;
    }

    const adicionaisArray = Array.from(adicionaisSelecionados);
    const itemDiv = document.createElement("div");
    itemDiv.className = "bg-white/80 rounded-lg p-4 shadow relative";

    // HTML de visualização do item na sacola
    itemDiv.innerHTML = `
      <button type="button" class="absolute top-2 right-2 text-red-600 font-bold text-lg" title="Remover item">&times;</button>
      <p><strong>Tamanho:</strong> ${tamanhoSelecionado}</p>
      <p><strong>Carne:</strong> ${carneSelecionada}</p>
      <p><strong>Adicionais:</strong> ${adicionaisArray.join(", ") || "Nenhum"}</p>
      <p><strong>Observações:</strong> ${observacoes || "Nenhuma"}</p>
      <input type="hidden" name="marmitas[${contador}][tamanho]" value="${tamanhoSelecionado}">
      <input type="hidden" name="marmitas[${contador}][carne]" value="${carneSelecionada}">
      <input type="hidden" name="marmitas[${contador}][adicionais]" value="${adicionaisArray.join(", ")}">
      <input type="hidden" name="marmitas[${contador}][obs]" value="${observacoes}">
    `;

    // Botão de remover
    itemDiv.querySelector("button").addEventListener("click", () => {
      itemDiv.remove();
    });

    sacola.appendChild(itemDiv);
    contador++;

    // Resetar seleção
    tamanhoSelecionado = "";
    carneSelecionada = "";
    adicionaisSelecionados.clear();
    document.getElementById("observacoes").value = "";

    // Remover classes .active
    document.querySelectorAll(".btn-option").forEach(btn => btn.classList.remove("active"));
  });
});
