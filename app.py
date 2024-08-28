from flask import Flask, render_template, request, jsonify
from generate_graphs import create_produtos_chart, create_doacoes_chart

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/cadastro')
def cadastro():
    return render_template('cadastro.html')

@app.route('/produtos')
def produtos():
    return render_template('produtos.html')

@app.route('/estoque')
def estoque():
    return render_template('estoque.html')

@app.route('/doacoes')
def doacoes():
    return render_template('doacoes.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/graficos/produtos', methods=['POST'])
def graficos_produtos():
    produtos_data = request.json
    produtos_chart = create_produtos_chart(produtos_data)
    return jsonify({'produtos_chart': produtos_chart})

@app.route('/api/graficos/doacoes', methods=['POST'])
def graficos_doacoes():
    doacoes_data = request.json
    doacoes_chart = create_doacoes_chart(doacoes_data)
    return jsonify({'doacoes_chart': doacoes_chart})

if __name__ == '__main__':
    app.run(debug=True)