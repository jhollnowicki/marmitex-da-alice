import json
from flask import Flask, render_template, request, redirect, url_for
from datetime import datetime

app = Flask(__name__)

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
    return render_template('index.html')

@app.route('/pedido', methods=['POST'])
def pedido():
    tamanho = request.form['tamanho']
    carne = request.form['carne']
    adicionais = request.form.get('adicionais', '')
    obs = request.form.get('obs', '')
    data_hora = datetime.now().strftime('%d/%m/%Y %H:%M')
    pedido_id = gerar_numero_pedido()
    return render_template('recibo.html', tamanho=tamanho, carne=carne, adicionais=adicionais, obs=obs, data_hora=data_hora, pedido_id=pedido_id)

import os

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
