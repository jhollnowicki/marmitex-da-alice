import json
from flask import Flask, render_template, request, redirect, url_for, session
from datetime import datetime
import os
app = Flask(__name__)
app.secret_key = 'chave_super_secreta'


def gerar_numero_pedido():
    try:
        with open('contador.json', 'r') as file:
            dados = json.load(file)
    except FileNotFoundError:
        dados = {"data": "", "numero": 0}

    hoje = datetime.now().strftime('%Y-%m-%d')

    if dados["data"] != hoje:
        # Novo dia, reinicia contador
        dados["data"] = hoje
        dados["numero"] = 1
    else:
        # Mesmo dia, incrementa
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
        "tipo_pedido": "Prato Feito" if tipo_formulario == "prato" else request.form.get("tipo_pedido"),
        "nome": request.form.get("nome"),
        "telefone": request.form.get("telefone"),
        "endereco": request.form.get("endereco"),
        "carne": request.form.get("carne"),
        "adicionais": request.form.get("adicionais"),
        "obs": request.form.get("obs"),
        "data_hora": datetime.now().strftime("%d/%m/%Y %H:%M")
    }
    if tipo_formulario == "marmita":
        dados["tamanho"] = request.form.get("tamanho")

    if tipo_formulario == "marmita":
        return render_template("recibo_marmita.html", **dados)
    elif tipo_formulario == "prato":
        return render_template("recibo_prato.html", **dados)
    else:
        return "Tipo de formulário inválido", 400

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
