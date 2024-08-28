import matplotlib
matplotlib.use('Agg')

import matplotlib.pyplot as plt
import io
import base64

def create_produtos_chart(produtos_data):
    fig, ax = plt.subplots()
    tipos = [produto['tipo'] for produto in produtos_data]
    quantidades = [produto['quantidade'] for produto in produtos_data]
    ax.bar(tipos, quantidades)
    ax.set_xlabel('Produtos')
    ax.set_ylabel('Quantidade')
    ax.set_title('Quantidade de Produtos em Estoque')
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close(fig)
    return base64.b64encode(img.getvalue()).decode('utf-8')

def create_doacoes_chart(doacoes_data):
    fig, ax = plt.subplots()
    datas = [doacao['data'] for doacao in doacoes_data]
    quantidades = [doacao['quantidade'] for doacao in doacoes_data]
    ax.plot(datas, quantidades, marker='o')
    ax.set_xlabel('Data')
    ax.set_ylabel('Quantidade')
    ax.set_title('Quantidade de Doações ao Longo do Tempo')
    img = io.BytesIO()
    plt.savefig(img, format='png')
    img.seek(0)
    plt.close(fig)
    return base64.b64encode(img.getvalue()).decode('utf-8')