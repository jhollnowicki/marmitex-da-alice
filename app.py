import json
from flask import Flask, render_template, request, redirect, url_for, session, jsonify

from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'chave_super_secreta'

def carregar_precos():
    try:
        with open("precos.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return PRECOS

    
def salvar_precos(novos_precos):
    with open("precos.json", "w", encoding="utf-8") as f:
        json.dump(novos_precos, f, indent=2, ensure_ascii=False)

PRECOS = carregar_precos() 

@app.route('/')
def index():
    return redirect(url_for('login'))



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        usuario = request.form['usuario']
        senha = request.form['senha']
        if usuario == 'Bruno' and senha == "Bruno1234":
            session['usuario'] = 'dono'
            return redirect(url_for('escolha_tipo'))
        
        elif usuario == 'funcionario' and senha == "1234":
            session['usuario'] = 'funcionario'
            return redirect(url_for('escolha_tipo'))  # <- sem a barra aqui também
        else:
            return render_template("login.html", erro="Usuario ou senha Inválido")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/editar_cardapio', methods=['GET', 'POST'])
def editar_cardapio():
    if 'usuario' not in session or session['usuario'] != 'dono':
        return redirect(url_for('login'))

    precos = carregar_precos()

    if request.method == 'POST':
        # Marmita - Tamanhos
        tamanhos = {}
        for key, value in request.form.items():
            if key.startswith("marmita_tamanho_nome_"):
                idx = key.split("_")[-1]
                nome = value.strip()
                preco = float(request.form.get(f"marmita_tamanho_preco_{idx}", 0))
                if nome:
                    tamanhos[nome] = preco
        precos["marmita"]["tamanhos"] = tamanhos

        # Marmita - Adicionais
        marmita_adicionais = {}
        for key, value in request.form.items():
            if key.startswith("marmita_adicional_nome_"):
                idx = key.split("_")[-1]
                nome = value.strip()
                preco = float(request.form.get(f"marmita_adicional_preco_{idx}", 0))
                if nome:
                    marmita_adicionais[nome] = preco
        precos["marmita"]["adicionais"] = marmita_adicionais

        # Marmita - Carnes
        carnes_marmita = request.form.getlist("carnes_marmita[]")
        precos["marmita"]["carnes"] = carnes_marmita

        # Prato Feito - Base
        base_prato = float(request.form.get("prato_feito", 0))
        precos["prato"]["base"] = base_prato

        # Prato Feito - Adicionais
        prato_adicionais = {}
        for key, value in request.form.items():
            if key.startswith("prato_adicional_nome_"):
                idx = key.split("_")[-1]
                nome = value.strip()
                preco = float(request.form.get(f"prato_adicinal_preco_{idx}", 0))
                if nome:
                    prato_adicionais[nome] = preco
        precos["prato"]["adicionais"] = prato_adicionais

        # Prato Feito - Carnes
        carnes_prato = request.form.getlist("carnes_prato[]")
        precos["prato"]["carnes"] = carnes_prato

        # Salvar alterações
        salvar_precos(precos)
        global PRECOS
        PRECOS = precos
        return redirect(url_for("escolha_tipo"))

    return render_template("editar_cardapio.html", precos=precos)


@app.route('/escolha')
def escolha_tipo():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    return render_template('escolha.html')


@app.route('/pedido/marmita')
def formulario_marmita():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    return render_template('form_marmita.html')

@app.route('/pedido/prato-feito')
def formulario_prato_feito():
    if 'usuario' not in session:
        return redirect(url_for('login'))
    return render_template('form_prato.html')
def gerar_numero_pedido():
    try:
        with open('contador.json', 'r') as file:
            dados = json.load(file)
    except FileNotFoundError:
        dados = {"data": "", "numero": 0}

    hoje = datetime.now().strftime('%Y-%m-%d')

    if dados["data"] != hoje:
        dados["data"] = hoje
        dados["numero"] = 1
    else:
        dados["numero"] += 1

    with open('contador.json', 'w') as file:
        json.dump(dados, file)

    return dados["numero"]

@app.route("/pedido", methods=["POST"])
def pedido():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    tipo_formulario = request.form.get("tipo_formulario")
    pedido_id = gerar_numero_pedido()
    forma_pagamento = request.form.get("forma_pagamento", "")
    troco_para = request.form.get("troco_para", "")


    dados = {
        "pedido_id": pedido_id,
        "tipo_pedido": request.form.get("tipo_pedido"),
        "nome": request.form.get("nome"),
        "telefone": request.form.get("telefone"),
        "endereco": request.form.get("endereco"),
        "data_hora": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "valor_total": 0.0,
        "forma_pagamento": forma_pagamento,
        "troco_para": troco_para

    }

    total = 0.0

    if tipo_formulario == "marmita":
        marmitas = []
        for key in request.form:
            if key.startswith("marmitas["):
                index = key.split("[")[1].split("]")[0]
                field = key.split("[")[2].split("]")[0]
                while len(marmitas) <= int(index):
                    marmitas.append({})
                marmitas[int(index)][field] = request.form[key]
        for marmita in marmitas:
            preco = calcular_preco_marmita(marmita)
            marmita["preco"] = preco
            total += preco
        dados["marmitas"] = marmitas
        dados["valor_total"] = round(total, 2)
        os.makedirs("pedidos", exist_ok=True)
        with open(f"pedidos/pedidos_{pedido_id}.json", "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=2, ensure_ascii=False)
        return redirect(url_for("recibo_marmita", pedido_id=pedido_id))

    elif tipo_formulario == "prato":
        pratos = []
        for key in request.form:
            if key.startswith("pratos["):
                index = key.split("[")[1].split("]")[0]
                field = key.split("[")[2].split("]")[0]
                while len(pratos) <= int(index):
                    pratos.append({})
                pratos[int(index)][field] = request.form[key]
        for prato in pratos:
            preco = calcular_valor_total(prato)
            prato["preco"] = preco
            total += preco
        dados["pratos"] = pratos
        dados["valor_total"] = round(total, 2)
        os.makedirs("pedidos", exist_ok=True)
        with open(f"pedidos/pedidos_{pedido_id}.json", "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=2, ensure_ascii=False)
        return redirect(url_for("recibo_prato", pedido_id=pedido_id))

    # fallback em caso de erro
    return redirect(url_for('escolha_tipo'))

def calcular_preco_marmita(marmita):
    tamanho = marmita.get('tamanho', '')
    adicionais_str = marmita.get('adicionais', '')
    adicionais = [a.strip() for a in adicionais_str.split(',') if a.strip()]

    valor = PRECOS['marmita']['tamanhos'].get(tamanho, 0)
    for adicional in adicionais:
        valor += PRECOS['marmita']['adicionais'].get(adicional, 0)

    return round(valor, 2)


def calcular_valor_total_multiplo(marmitas):
    total = 0.0
    for marmita in marmitas:
        tamanho = marmita.get('tamanho', '')
        adicionais_str = marmita.get('adicionais', '')
        adicionais = [a.strip() for a in adicionais_str.split(',') if a.strip()]
        
        valor = PRECOS['marmita']['tamanhos'].get(tamanho, 0)
        for adicional in adicionais:
            valor += PRECOS['marmita']['adicionais'].get(adicional, 0)
        
        total += valor
    return round(total, 2)

def calcular_valor_total(prato):
    adicionais_str = prato.get('adicionais', '')
    adicionais = [a.strip() for a in adicionais_str.split(',') if a.strip()]

    valor = PRECOS['prato']['base']
    for adicional in adicionais:
        valor += PRECOS['prato']['adicionais'].get(adicional, 0)
    return round(valor, 2)

@app.route('/cardapio')
def get_cardapio():
    return jsonify({
        "marmita": {
            "tamanhos": PRECOS['marmita']['tamanhos'],
            "carnes": PRECOS['marmita'].get("carnes", []),
            "adicionais": PRECOS['marmita']['adicionais']
        },
        "prato": {
            "base": PRECOS['prato']['base'],
            "carnes": PRECOS['prato'].get("carnes", []),
            "adicionais": PRECOS['prato']['adicionais']
        }
    })



@app.route('/salvar_cardapio', methods=['POST'])
def salvar_cardapio():
    data = request.get_json()

    # Atualiza os valores de marmita
    PRECOS['marmita']['tamanhos'] = data['marmita']['tamanhos']
    PRECOS['marmita']['adicionais'] = data['marmita']['adicionais']
    PRECOS['marmita']['carnes'] = data['marmita'].get('carnes', [])

    # Atualiza os valores de prato
    PRECOS['prato']['base'] = data['prato']['base']
    PRECOS['prato']['adicionais'] = data['prato']['adicionais']
    PRECOS['prato']['carnes'] = data['prato'].get('carnes', [])

    salvar_precos(PRECOS)
    return jsonify({"status": "sucesso"})

@app.route("/recibo_marmita/<int:pedido_id>")
def recibo_marmita(pedido_id):
    try:
        with open(f"pedidos/pedidos_{pedido_id}.json", "r", encoding="utf-8") as f:
            dados = json.load(f)
    except FileNotFoundError:
        return "Pedido não encontrado", 404
    return render_template("recibo_marmita.html", **dados, PRECOS=PRECOS)

@app.route("/recibo_prato/<int:pedido_id>")
def recibo_prato(pedido_id):
    try:
        with open(f"pedidos/pedidos_{pedido_id}.json", "r", encoding="utf-8") as f:
            dados = json.load(f)
    except FileNotFoundError:
        return "Pedido não encontrado", 404
    return render_template("recibo_prato.html", **dados, PRECOS=PRECOS)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
