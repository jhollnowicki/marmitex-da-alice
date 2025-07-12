// form.js - script para seleções e controle dinâmico de campos
console.log("form.js carregado com sucesso!");

document.addEventListener("DOMContentLoaded", function () {
    const tipoPedido = document.getElementById("tipo_pedido");
    const camposEntrega = document.getElementById("campos-entrega");
    const camposCliente = document.getElementById("campos-cliente");

    // Mostra os campos corretos com base na escolha (somente se os elementos existirem na página)
    if (tipoPedido && camposCliente && camposEntrega) {
        tipoPedido.addEventListener("change", function () {
            if (this.value === "Entrega" || this.value === "Retirada") {
                camposCliente.style.display = "block";
            } else {
                camposCliente.style.display = "none";
            }

            if (this.value === "Entrega") {
                camposEntrega.style.display = "block";
            } else {
                camposEntrega.style.display = "none";
            }
        });
    }


    // Ativa botões de seleção única (como tamanho e carne)
    document.querySelectorAll('.btn-option').forEach(button => {
        button.addEventListener('click', () => {
            const group = button.dataset.group;
            document.querySelectorAll(`.btn-option[data-group="${group}"]`)
                .forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(`input-${group}`).value = button.dataset.value;
        });
    });

    // Controle de múltipla seleção (adicionais)
    const adicionais = [];
    document.querySelectorAll('.btn-option-multi').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;

            button.classList.toggle('active');

            if (adicionais.includes(value)) {
                adicionais.splice(adicionais.indexOf(value), 1);
            } else {
                adicionais.push(value);
            }

            document.getElementById('input-adicionais').value = adicionais.join(', ');
        });
    });
});
