document.addEventListener('DOMContentLoaded', () => {
    // Funções auxiliares
    function saveUser(user) {
        localStorage.setItem(user.email, JSON.stringify(user));
    }

    function getUser(email) {
        const user = localStorage.getItem(email);
        return user ? JSON.parse(user) : null;
    }

    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }

    function setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    function logout() {
        sessionStorage.removeItem('currentUser');
        window.location.href = '/login';
    }

    function showMessage(element, message, isError = false) {
        if (element) {
            element.textContent = message;
            element.style.color = isError ? 'red' : 'green';
        }
    }

    // Cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const messageElement = document.getElementById('cadastroMessage');

            if (getUser(email)) {
                showMessage(messageElement, 'Email já cadastrado!', true);
            } else {
                const newUser = { email, password, estoque: {}, doacoes: [] };
                saveUser(newUser);
                showMessage(messageElement, 'Cadastro realizado com sucesso!');
                cadastroForm.reset();
                setTimeout(() => window.location.href = '/login', 2000);
            }
        });
    }

    // Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageElement = document.getElementById('loginMessage');

            const user = getUser(email);
            if (user && user.password === password) {
                setCurrentUser(user);
                showMessage(messageElement, 'Login realizado com sucesso!');
                setTimeout(() => window.location.href = '/', 2000);
            } else {
                showMessage(messageElement, 'Email ou senha incorretos!', true);
            }
        });
    }

    // Página Inicial
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            window.location.href = '/login';
        } else {
            welcomeMessage.textContent = `Olá, ${currentUser.email}!`;
        }

        document.getElementById('logout').addEventListener('click', function() {
            logout();
        });
    }

    // Página de Registro de Produtos
    const entradaForm = document.getElementById('entradaForm');
    if (entradaForm) {
        entradaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const tipoProduto = document.getElementById('tipoProduto').value.trim();
            const quantidade = document.getElementById('quantidade').value;
            const messageElement = document.getElementById('entradaMessage');

            if (!tipoProduto) {
                showMessage(messageElement, 'Tipo de produto é obrigatório!', true);
                return;
            }

            const currentUser = getCurrentUser();
            if (currentUser) {
                currentUser.estoque[tipoProduto] = (currentUser.estoque[tipoProduto] || 0) + parseInt(quantidade);
                saveUser(currentUser);
                setCurrentUser(currentUser);
                showMessage(messageElement, 'Produto adicionado com sucesso!');
                atualizarEstoque();
                entradaForm.reset();
                enviarDadosEstoqueParaGrafico();
            } else {
                window.location.href = '/login'; 
            }
        });
    }

    // Página de Controle de Estoque
    const estoqueTableBody = document.getElementById('estoqueTableBody');
    if (estoqueTableBody) {
        atualizarEstoque();
    }

    function atualizarEstoque() {
        const currentUser = getCurrentUser();
        if (!currentUser || !estoqueTableBody) return;

        estoqueTableBody.innerHTML = '';
        for (const tipo in currentUser.estoque) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tipo}</td>
                <td>${currentUser.estoque[tipo]}</td>
                <td>
                    <button class="edit" data-tipo="${tipo}">Editar</button>
                    <button class="delete" data-tipo="${tipo}">Excluir</button>
                </td>
            `;
            estoqueTableBody.appendChild(row);
        }

        // Adicionar eventos aos botões de edição e exclusão
        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', function() {
                const tipo = this.getAttribute('data-tipo');
                editarProduto(tipo);
            });
        });

        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function() {
                const tipo = this.getAttribute('data-tipo');
                excluirProduto(tipo);
            });
        });
    }

    // Função para editar um produto
    function editarProduto(tipo) {
        const quantidade = prompt("Insira a nova quantidade para " + tipo + ":");
        if (quantidade !== null && !isNaN(quantidade) && quantidade > 0) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                currentUser.estoque[tipo] = parseInt(quantidade);
                saveUser(currentUser);
                setCurrentUser(currentUser);
                atualizarEstoque();
                alert('Quantidade atualizada com sucesso!');
                enviarDadosEstoqueParaGrafico();
            }
        } else {
            alert('Quantidade inválida!');
        }
    }

    // Função para excluir um produto
    function excluirProduto(tipo) {
        if (confirm("Tem certeza que deseja excluir " + tipo + "?")) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                delete currentUser.estoque[tipo];
                saveUser(currentUser);
                setCurrentUser(currentUser);
                atualizarEstoque();
                alert('Produto excluído com sucesso!');
                enviarDadosEstoqueParaGrafico();
            }
        }
    }

    // Página de Rastreamento de Doações
    const doacaoForm = document.getElementById('doacaoForm');
    if (doacaoForm) {
        doacaoForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const tipoProduto = document.getElementById('tipoProdutoDoacao').value.trim();
            const quantidade = document.getElementById('quantidadeDoacao').value;
            const doador = document.getElementById('doador').value;
            const messageElement = document.getElementById('doacaoMessage');

            if (!tipoProduto || !doador) {
                showMessage(messageElement, 'Todos os campos são obrigatórios!', true);
                return;
            }

            const currentUser = getCurrentUser();
            if (currentUser) {
                const doacao = { tipoProduto, quantidade, doador };
                currentUser.doacoes.push(doacao);
                saveUser(currentUser);
                setCurrentUser(currentUser);
                showMessage(messageElement, 'Doação registrada com sucesso!');
                registrarDoacao(doacao);
                doacaoForm.reset();
                enviarDadosDoacoesParaGrafico();
            } else {
                window.location.href = '/login';
            }
        });
    }

    const listaDoacoes = document.getElementById('listaDoacoes');
    function registrarDoacao(doacao) {
        if (!listaDoacoes) return;

        const doacaoItem = document.createElement('li');
        doacaoItem.innerHTML = `
            ${doacao.doador} doou ${doacao.quantidade} ${doacao.tipoProduto}
            <button class="edit-doacao" data-tipo="${doacao.tipoProduto}" data-quantidade="${doacao.quantidade}" data-doador="${doacao.doador}">Editar</button>
            <button class="delete-doacao" data-tipo="${doacao.tipoProduto}" data-quantidade="${doacao.quantidade}" data-doador="${doacao.doador}">Excluir</button>
        `;
        listaDoacoes.appendChild(doacaoItem);
    }

    // Adiciona eventos de edição e exclusão às doações
    function adicionarEventosDoacoes() {
        document.querySelectorAll('.edit-doacao').forEach(button => {
            button.addEventListener('click', function() {
                const tipoProduto = this.getAttribute('data-tipo');
                const quantidade = this.getAttribute('data-quantidade');
                const doador = this.getAttribute('data-doador');
                editarDoacao(tipoProduto, quantidade, doador);
            });
        });

        document.querySelectorAll('.delete-doacao').forEach(button => {
            button.addEventListener('click', function() {
                const tipoProduto = this.getAttribute('data-tipo');
                const quantidade = this.getAttribute('data-quantidade');
                const doador = this.getAttribute('data-doador');
                excluirDoacao(tipoProduto, quantidade, doador);
            });
        });
    }

    function editarDoacao(tipoProduto, quantidade, doador) {
        const novaQuantidade = prompt("Insira a nova quantidade para " + tipoProduto + " (doado por " + doador + "):", quantidade);
        if (novaQuantidade !== null && !isNaN(novaQuantidade) && novaQuantidade > 0) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                const doacaoIndex = currentUser.doacoes.findIndex(d => d.tipoProduto === tipoProduto && d.doador === doador && d.quantidade === quantidade);
                if (doacaoIndex !== -1) {
                    currentUser.doacoes[doacaoIndex].quantidade = parseInt(novaQuantidade);
                    saveUser(currentUser);
                    setCurrentUser(currentUser);
                    listaDoacoes.innerHTML = '';
                    currentUser.doacoes.forEach(doacao => registrarDoacao(doacao));
                    adicionarEventosDoacoes();
                    alert('Quantidade da doação atualizada com sucesso!');
                    enviarDadosDoacoesParaGrafico();
                }
            }
        } else {
            alert('Quantidade inválida!');
        }
    }

    function excluirDoacao(tipoProduto, quantidade, doador) {
        if (confirm("Tem certeza que deseja excluir a doação de " + tipoProduto + " feita por " + doador + "?")) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                currentUser.doacoes = currentUser.doacoes.filter(d => !(d.tipoProduto === tipoProduto && d.doador === doador && d.quantidade === quantidade));
                saveUser(currentUser);
                setCurrentUser(currentUser);
                listaDoacoes.innerHTML = '';
                currentUser.doacoes.forEach(doacao => registrarDoacao(doacao));
                adicionarEventosDoacoes();
                alert('Doação excluída com sucesso!');
                enviarDadosDoacoesParaGrafico(); 
            }
        }
    }

    // Inicializa a lista de doações
    const currentUser = getCurrentUser();
    if (currentUser && listaDoacoes) {
        currentUser.doacoes.forEach(doacao => registrarDoacao(doacao));
        adicionarEventosDoacoes();
    }

    // Funções para enviar dados para gráficos
    function enviarDadosEstoqueParaGrafico() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const produtosData = Object.entries(currentUser.estoque).map(([tipo, quantidade]) => ({ tipo, quantidade }));
            const produtosChartContainer = document.getElementById('produtosChart');
            if (produtosChartContainer) {
                fetch('/api/graficos/produtos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(produtosData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta da API: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const img = document.createElement('img');
                    img.src = `data:image/png;base64,${data.produtos_chart}`;
                    produtosChartContainer.innerHTML = '';
                    produtosChartContainer.appendChild(img);
                })
                .catch(error => {
                    console.error('Erro ao enviar dados para o gráfico de produtos:', error);
                    showMessage(produtosChartContainer, 'Erro ao atualizar gráfico de produtos. Tente novamente.', true);
                });
            }
        }
    }

    function enviarDadosDoacoesParaGrafico() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const doacoesData = currentUser.doacoes.map(doacao => ({
                data: new Date().toISOString().split('T')[0],
                quantidade: doacao.quantidade
            }));
            const doacoesChartContainer = document.getElementById('doacoesChart');
            if (doacoesChartContainer) {
                fetch('/api/graficos/doacoes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(doacoesData)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro na resposta da API: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const img = document.createElement('img');
                    img.src = `data:image/png;base64,${data.doacoes_chart}`;
                    doacoesChartContainer.innerHTML = '';
                    doacoesChartContainer.appendChild(img);
                })
                .catch(error => {
                    console.error('Erro ao enviar dados para o gráfico de doações:', error);
                    showMessage(doacoesChartContainer, 'Erro ao atualizar gráfico de doações. Tente novamente.', true);
                });
            }
        }
    }

    // Atualiza gráficos ao carregar a página inicial
    if (document.getElementById('produtosChart')) {
        enviarDadosEstoqueParaGrafico();
    }

    if (document.getElementById('doacoesChart')) {
        enviarDadosDoacoesParaGrafico();
    }
});