import json
from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'chave_super_secreta'

PRECOS = {
    'marmita': {
        'tamanhos': {
            'Mini': 16.00,
            'Media': 18.00,
            'Grande': 20.00,
            'Top 3': 25.00,
            'Executivo': 28.00
        },
        'adicionais': {
            'Strogonoff de Frango': 7.00,
            'Bife grelhado': 7.00,
            'Filé de peito à milanesa': 7.00,
            'Linguiça': 0.00
        }
    },
    'prato': {
        'base': 17.90,
        'adicionais': {
            'Strogonoff de Frango': 7.00,
            'Bife grelhado': 7.00,
            'Filé de peito à milanesa': 7.00,
            'Linguiça': 7.00
        }
    }
}


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


@app.route('/')
def index():
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    erro = None
    if request.method == 'POST':
        usuario = request.form.get('usuario')
        senha = request.form.get('senha')
        if usuario == 'admin' and senha == '1234':
            session['usuario'] = usuario
            return redirect(url_for('escolha_tipo'))
        else:
            erro = "Usuário ou senha inválidos"
    return render_template('login.html', erro=erro)


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))


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


@app.route("/pedido", methods=["POST"])
def pedido():
    if 'usuario' not in session:
        return redirect(url_for('login'))

    tipo_formulario = request.form.get("tipo_formulario")
    pedido_id = gerar_numero_pedido()

    dados = {
        "pedido_id": pedido_id,
        "tipo_pedido": request.form.get("tipo_pedido"),
        "nome": request.form.get("nome"),
        "telefone": request.form.get("telefone"),
        "endereco": request.form.get("endereco"),
        "data_hora": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "valor_total": 0.0
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
        return render_template("recibo_marmita.html", **dados, PRECOS=PRECOS)

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
        return render_template("recibo_prato.html", **dados, PRECOS=PRECOS)

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



if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
