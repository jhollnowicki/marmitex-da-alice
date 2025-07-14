// static/scripts/marmita_multiple.js

let contador = 0;

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById('marmitas-container');
  const botaoAdicionar = document.getElementById('add-marmita');

  const opcoesTamanhos = ['Mini', 'Media', 'Grande', 'Top 3', 'Executivo'];
  const opcoesCarnes = ['Strogonoff de Frango', 'Bife grelhado', 'Filé de peito à milanesa', 'Linguiça'];
  const opcoesAdicionais = ['Strogonoff de Frango', 'Bife grelhado', 'Filé de peito à milanesa', 'Linguiça'];

  botaoAdicionar.addEventListener('click', () => {
    const index = contador++;
    const marmitaDiv = document.createElement('div');
    marmitaDiv.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow', 'relative');

    marmitaDiv.innerHTML = `
      <button type="button" class="absolute top-2 right-2 text-red-600 font-bold text-sm" onclick="this.parentElement.remove()">✖</button>

      <input type="hidden" name="marmitas[${index}][tamanho]" />
      <label class="block text-sm font-semibold mt-2">Tamanho:</label>
      <div class="flex flex-wrap gap-2 mt-1">
        ${opcoesTamanhos.map(t => `<button type="button" class="btn-option" data-group="tamanho" data-index="${index}" data-value="${t}">${t}</button>`).join('')}
      </div>

      <input type="hidden" name="marmitas[${index}][carne]" />
      <label class="block text-sm font-semibold mt-4">Tipo de Carne:</label>
      <div class="flex flex-wrap gap-2 mt-1">
        ${opcoesCarnes.map(c => `<button type="button" class="btn-option" data-group="carne" data-index="${index}" data-value="${c}">${c}</button>`).join('')}
      </div>

      <input type="hidden" name="marmitas[${index}][adicionais]" />
      <label class="block text-sm font-semibold mt-4">Adicionais:</label>
      <div class="flex flex-wrap gap-2 mt-1" data-multi="true">
        ${opcoesAdicionais.map(a => `<button type="button" class="btn-option-multi" data-group="adicionais" data-index="${index}" data-value="${a}">${a}</button>`).join('')}
      </div>

      <label class="block text-sm font-semibold mt-4">Observações:</label>
      <textarea name="marmitas[${index}][obs]" class="w-full border rounded px-3 py-2 mt-1 text-sm" placeholder="Ex: sem salada, com ovo..."></textarea>
    `;

    container.appendChild(marmitaDiv);
  });

  // Lógica para selecionar botões de tamanho/carne (1 escolha)
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-option')) {
      const group = e.target.dataset.group;
      const index = e.target.dataset.index;

      const buttons = document.querySelectorAll(`.btn-option[data-group='${group}'][data-index='${index}']`);
      buttons.forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const hiddenInput = document.querySelector(`input[name='marmitas[${index}][${group}]']`);
      if (hiddenInput) hiddenInput.value = e.target.dataset.value;
    }

    // Adicionais (múltiplas escolhas)
    if (e.target.matches('.btn-option-multi')) {
      const index = e.target.dataset.index;
      e.target.classList.toggle('active');

      const ativos = document.querySelectorAll(`.btn-option-multi[data-group='adicionais'][data-index='${index}'].active`);
      const selecionados = Array.from(ativos).map(btn => btn.dataset.value);

      const hiddenInput = document.querySelector(`input[name='marmitas[${index}][adicionais]']`);
      if (hiddenInput) hiddenInput.value = selecionados.join(', ');
    }
  });
});
