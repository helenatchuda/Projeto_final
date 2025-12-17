// ===========================================
// || SISTEMA DE GESTÃO FINANCEIRA - FRONTEND ONLY
// ===========================================
const API_BASE_URL = 'http://localhost:5000'; // Não será usado
let usuarioLogado = null;
const USE_BACKEND = false; // Sempre false - usamos apenas dados locais

// ===========================================
// || DADOS LOCAIS
// ===========================================
let categories = []; // Inicializar vazio para obrigar carregamento da API


let transactions = JSON.parse(localStorage.getItem('transactions')) || [
    { id: 1, date: '2025-11-25', description: 'Supermercado Mensal', value: 125.50, type: 'expense', category: 'Alimentação', categoryId: 1 },
    { id: 2, date: '2025-11-26', description: 'Gasóleo', value: 55.00, type: 'expense', category: 'Transporte', categoryId: 2 },
    { id: 5, date: '2025-11-01', description: 'Renda', value: 650.00, type: 'expense', category: 'Moradia', categoryId: 3 },
    { id: 3, date: '2025-11-05', description: 'Salário (Novembro)', value: 1500.00, type: 'income', category: 'Salário', categoryId: 9 },
    { id: 4, date: '2025-11-15', description: 'Projeto X', value: 350.00, type: 'income', category: 'Freelance', categoryId: 10 },
];

// Usuários (armazenamento local)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ===========================================
// || FUNÇÕES DE AUTENTICAÇÃO (LOCAL)
// ===========================================
// ===========================================
// || FUNÇÕES DE AUTENTICAÇÃO (API)
// ===========================================

async function fazerLogin(email, senha) {
    try {
        const response = await fetch('/utilizadores/login', {
            method: 'POST',
            // O backend espera query string params, mas vamos tentar enviar como query first
            // baseando no Program.cs: app.MapPost("/utilizadores/login", (string email, string password) => ...
            // Minimal APIs often bind from body if it's a complex type or query if simple types are arguments.
            // Para garantir, vamos tentar url encoded query params para estes simple types:
            // Mas POST normalmente espera body. Vamos testar com query params na URL que é o default binding para simple types em Minimal API .NET 6/7 se não tiver [FromBody] explicitamente num DTO.
            // Update: Program.cs signatures: (string email, string password). minimal api defaults to output.
            // Vamos formatar a URL com os parametros.
        });

        // CORREÇÃO: Minimal APIs com parametros simples (string email, string password) esperam Query String por defeito ou JSON body se for um objeto.
        // Como o Program.cs tem (string email, string password), vou construir a URL.
        const url = `/utilizadores/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(senha)}`;

        const apiResponse = await fetch(url, { method: 'POST' });

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            usuarioLogado = data.user;

            // Guardar sessão
            localStorage.setItem('currentUser', JSON.stringify(usuarioLogado));

            atualizarInterfaceUsuario();
            fecharModal('loginpopup');
            mostrarPagina('page-dashboard');

            // Carregar dados reais da API
            carregarDashboard();
            return true;
        } else {
            mostrarErroLogin('Email ou password incorretos!');
            return false;
        }
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarErroLogin('Erro de conexão com o servidor.');
        return false;
    }
}

async function registrarUsuario(nome, email, senha) {
    if (senha.length < 6) {
        mostrarErroRegistro('A senha deve ter pelo menos 6 caracteres');
        return false;
    }

    try {
        const url = `/utilizadores/registar?nome=${encodeURIComponent(nome)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(senha)}`;
        const response = await fetch(url, { method: 'POST' });

        if (response.ok) {
            const data = await response.json();

            // Login automático após registo
            usuarioLogado = data.user;
            localStorage.setItem('currentUser', JSON.stringify(usuarioLogado));

            atualizarInterfaceUsuario();
            alert('Conta criada com sucesso!');
            fecharModal('registerpopup');

            // Atualizar dashboard (estará vazio)
            carregarDashboard();
            return true;
        } else {
            const errorText = await response.text();
            // Tenta extrair mensagem JSON se possível ou usa texto plano
            let msg = errorText;
            try { msg = JSON.parse(errorText).message || errorText; } catch (e) { }

            mostrarErroRegistro(msg.replace(/"/g, '')); // Limpa aspas extras se vier JSON string
            return false;
        }
    } catch (error) {
        console.error('Erro no registo:', error);
        mostrarErroRegistro('Erro ao comunicar com o servidor.');
        return false;
    }
}

async function fazerLogout() {
    if (usuarioLogado) {
        try {
            const url = `/utilizadores/logout?email=${encodeURIComponent(usuarioLogado.email)}`;
            await fetch(url, { method: 'POST' });
        } catch (error) {
            console.error('Erro ao fazer logout no servidor', error);
        }
    }

    usuarioLogado = null;
    localStorage.removeItem('currentUser');
    atualizarInterfaceUsuario();
    mostrarPagina('page-dashboard');
    // Limpar dados da view
    document.getElementById('dashboardSaldo').textContent = '0.00 €';
}

// ===========================================
// || FUNÇÕES DO DASHBOARD
// ===========================================
// ===========================================
// || VARIAVEIS GLOBAIS DE GRAFICOS
// ===========================================


// ===========================================
// || FUNÇÕES DO DASHBOARD (API)
// ===========================================
async function carregarDashboard() {
    if (!usuarioLogado) return;

    try {
        // Carregar Saldo
        const resSaldo = await fetch(`/api/${usuarioLogado.id}/relatorio/saldo`);
        if (resSaldo.ok) {
            const data = await resSaldo.json();
            document.getElementById('dashboardSaldo').textContent = `${data.saldoAtual.toFixed(2)} €`;
        }

        // Carregar Categorias (Importante para ter os IDs corretos - GUIDs)
        await carregarCategorias();

        // Carregar Transações para popular a lista global e usar nos outros ecrãs
        // (Estratégia híbrida: buscar tudo e guardar em memória para a UI existente funcionar)
        await carregarTodasTransacoes();



    } catch (error) {
        console.error('Erro ao carregar dashboard', error);
    }
}








// Destruir gráfico anterior




async function carregarTodasTransacoes() {
    if (!usuarioLogado) return;

    try {
        const [resReceitas, resDespesas] = await Promise.all([
            fetch(`/api/${usuarioLogado.id}/receitas`),
            fetch(`/api/${usuarioLogado.id}/despesas`)
        ]);

        let novasTransacoes = [];

        if (resReceitas.ok) {
            const receitas = await resReceitas.json();
            // Mapear para o formato do frontend
            novasTransacoes = novasTransacoes.concat(receitas.map(r => {
                const catObj = categories.find(c => c.id === r.categoriaId);
                return {
                    id: r.id, // GUID
                    date: r.data.split('T')[0], // Data vem com hora ISO
                    description: r.descricao,
                    value: r.valor,
                    type: 'income',
                    category: catObj ? catObj.name : 'Sem Categoria',
                    categoryId: r.categoriaId
                };
            }));
        }

        if (resDespesas.ok) {
            const despesas = await resDespesas.json();
            // Mapear para o formato do frontend
            novasTransacoes = novasTransacoes.concat(despesas.map(d => {
                const catObj = categories.find(c => c.id === d.categoriaId);
                return {
                    id: d.id, // GUID
                    date: d.data.split('T')[0],
                    description: d.descricao,
                    value: d.valor,
                    type: 'expense',
                    category: catObj ? catObj.name : 'Sem Categoria',
                    categoryId: d.categoriaId
                };
            }));
        }

        // Atualizar lista global
        transactions = novasTransacoes;

        // Atualizar totais no dashboard (baseado na lista carregada)
        const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
        const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);

        document.getElementById('dashboardReceitas').textContent = `${incomeTotal.toFixed(2)} €`;
        document.getElementById('dashboardDespesas').textContent = `${expenseTotal.toFixed(2)} €`;

        carregarUltimasTransacoes();

    } catch (error) {
        console.error('Erro ao carregar transações', error);
    }
}

function carregarUltimasTransacoes() {
    const tbody = document.getElementById('lastTransactionsBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const recentTransactions = transactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentTransactions.forEach(t => {
        const tr = document.createElement('tr');
        const typeColor = t.type === 'income' ? '#4caf50' : '#f44336';
        const typeText = t.type === 'income' ? 'Receita' : 'Despesa';

        tr.innerHTML = `
            <td>${t.date}</td>
            <td style="color: ${typeColor}; font-weight: bold;">${typeText}</td>
            <td>${t.description}</td>
            <td style="font-weight: bold; color: ${typeColor}">${t.value.toFixed(2)} €</td>
        `;
        tbody.appendChild(tr);
    });
}

// ===========================================
// || FUNÇÕES DE DESPESAS (SIMPLIFICADO)
// ===========================================
// ===========================================
// || FUNÇÕES DE DESPESAS (API)
// ===========================================
function carregarDespesas() {
    // Mesma lógica visual, apenas garante que usa a lista global 'transactions' já atualizada pelo carregarDashboard/carregarTodasTransacoes
    const filteredTransactions = transactions.filter(t => t.type === 'expense');
    const tbody = document.getElementById('despesasTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    let totalValue = 0;
    let maxValue = 0;

    filteredTransactions.forEach(t => {
        totalValue += t.value;
        if (t.value > maxValue) maxValue = t.value;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${t.value.toFixed(2)} €</td>
            <td class="action-btns">
                <button onclick="editarTransacao('${t.id}', 'expense')"><i class="fas fa-edit"></i></button>
                <button onclick="eliminarTransacao('${t.id}', 'expense')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalDespesasMes').textContent = `${totalValue.toFixed(2)} €`;
    document.getElementById('countDespesasMes').textContent = filteredTransactions.length;
    document.getElementById('maiorDespesa').textContent = `${maxValue.toFixed(2)} €`;
}

async function criarDespesa(valor, descricao, categoriaNome) {
    if (!usuarioLogado) return false;

    // Buscar a categoria correta ou criar (O backend requer ID da categoria)
    // Simplificação: vamos tentar achar a categoria na lista local (que deve vir do backend)
    // Se não existir, precisariamos criar no backend primeiro.

    let categoria = categories.find(c => c.name.toLowerCase() === categoriaNome.toLowerCase());

    // CORREÇÃO: Se a categoria existe mas tem ID inválido (numérico/legado), ignorar
    if (categoria && (typeof categoria.id === 'number' || categoria.id.toString().length < 10)) {
        console.warn("Categoria com ID inválido (Despesa). Ignorando...");
        categoria = null;
    }

    // Se não existe, cria a categoria primeiro
    if (!categoria) {
        categoria = await criarCategoria(categoriaNome, 'expense', '#ff6b6b');
        if (!categoria) {
            alert("Erro ao criar categoria automática.");
            return false;
        }
    }

    try {
        const body = {
            valor: parseFloat(valor),
            descricao: descricao,
            categoriaId: categoria.id
        };

        const response = await fetch(`/api/${usuarioLogado.id}/despesas/criar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            // Recarregar dados
            await carregarDashboard();
            carregarDespesas(); // Atualiza a tabela se estiver na pagina de despesas
            return true;
        } else {
            const err = await response.text();
            alert(`Erro ao criar despesa: ${err}`);
            return false;
        }
    } catch (error) {
        console.error("Erro criar despesa api", error);
        return false;
    }
}

// ===========================================
// || FUNÇÕES DE RECEITAS (API)
// ===========================================
function carregarReceitas() {
    const filteredTransactions = transactions.filter(t => t.type === 'income');
    const tbody = document.getElementById('receitasTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    let totalValue = 0;
    let maxValue = 0;

    filteredTransactions.forEach(t => {
        totalValue += t.value;
        if (t.value > maxValue) maxValue = t.value;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${t.value.toFixed(2)} €</td>
            <td class="action-btns">
                <button onclick="editarTransacao('${t.id}', 'income')"><i class="fas fa-edit"></i></button>
                <button onclick="eliminarTransacao('${t.id}', 'income')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('totalReceitasMes').textContent = `${totalValue.toFixed(2)} €`;
    document.getElementById('countReceitasMes').textContent = filteredTransactions.length;
    document.getElementById('maiorReceita').textContent = `${maxValue.toFixed(2)} €`;
}

async function criarReceita(valor, descricao, categoriaNome) {
    if (!usuarioLogado) return false;

    let categoria = categories.find(c => c.name.toLowerCase() === categoriaNome.toLowerCase());

    // CORREÇÃO: Se a categoria existe mas tem ID inválido (numérico/legado), ignorar para recriar ou buscar correta
    if (categoria && (typeof categoria.id === 'number' || categoria.id.toString().length < 10)) {
        console.warn("Categoria com ID inválido encontrada localmente. Tentando obter ou criar no servidor...");
        categoria = null;
    }

    if (!categoria) {
        categoria = await criarCategoria(categoriaNome, 'income', '#4caf50');
        if (!categoria) {
            alert("Erro ao criar categoria automática.");
            return false;
        }
    }

    try {
        const body = {
            valor: parseFloat(valor),
            descricao: descricao,
            categoriaId: categoria.id
        };

        const response = await fetch(`/api/${usuarioLogado.id}/receitas/criar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            await carregarDashboard();
            carregarReceitas();
            return true;
        } else {
            const err = await response.text();
            alert(`Erro ao criar receita: ${err}`);
            return false;
        }
    } catch (error) {
        console.error("Erro criar receita api", error);
        return false;
    }
}

// ===========================================
// || FUNÇÕES DE CATEGORIAS (API)
// ===========================================
async function carregarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        if (response.ok) {
            const data = await response.json();

            categories = data.map(c => ({
                id: c.id,
                name: c.nome,
                type: 'both',
                color: '#888888'
            }));

            document.getElementById('totalCategoriesCount').textContent = categories.length;
            renderizarListaCategorias();
        }
    } catch (error) {
        console.error("Erro ao carregar categorias", error);
    }
    return categories;
}

function renderizarListaCategorias() {
    const listaDespesas = document.getElementById('expenseCategoriesList');
    const listaReceitas = document.getElementById('incomeCategoriesList');

    if (listaDespesas) {
        listaDespesas.innerHTML = '';
        categories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `<span>●</span> ${categoria.name} <button onclick="eliminarCategoria('${categoria.id}')">🗑️</button>`;
            listaDespesas.appendChild(li);
        });
    }
    if (listaReceitas) {
        listaReceitas.innerHTML = '';
        categories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `<span>●</span> ${categoria.name} <button onclick="eliminarCategoria('${categoria.id}')">🗑️</button>`;
            listaReceitas.appendChild(li);
        });
    }
}

async function criarCategoria(nome, tipo, cor) {
    try {
        const body = { nome: nome };
        const response = await fetch('/api/categorias/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const novaCat = await response.json();
            const catLocal = {
                id: novaCat.id,
                name: novaCat.nome,
                type: tipo,
                color: cor
            };
            categories.push(catLocal);
            renderizarListaCategorias();
            return catLocal;
        } else {
            console.error("Erro API criar categoria");
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function eliminarCategoria(categoriaId) {
    if (!confirm('Eliminar categoria?')) return;
    try {
        const response = await fetch(`/api/categorias/${categoriaId}/eliminar`, { method: 'DELETE' });
        if (response.ok) {
            categories = categories.filter(c => c.id !== categoriaId);
            renderizarListaCategorias();
        } else {
            alert("Erro ao eliminar (pode estar em uso).");
        }
    } catch (e) {
        console.error(e);
    }
}

function renderizarListaCategorias() {
    const listaDespesas = document.getElementById('expenseCategoriesList');
    const listaReceitas = document.getElementById('incomeCategoriesList');

    if (listaDespesas) {
        listaDespesas.innerHTML = '';
        categories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `<span>●</span> ${categoria.name} <button class="btn-eliminar-categoria" onclick="eliminarCategoria('${categoria.id}')">🗑️</button>`;
            listaDespesas.appendChild(li);
        });
    }

    if (listaReceitas) {
        listaReceitas.innerHTML = '';
        categories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `<span>●</span> ${categoria.name} <button class="btn-eliminar-categoria" onclick="eliminarCategoria('${categoria.id}')">🗑️</button>`;
            listaReceitas.appendChild(li);
        });
    }
}

async function criarCategoria(nome, tipo, cor) {
    try {
        const body = { nome: nome };
        const response = await fetch('/api/categorias/criar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const novaCat = await response.json();
            const catLocal = {
                id: novaCat.id,
                name: novaCat.nome,
                type: tipo,
                color: cor
            };
            categories.push(catLocal);
            renderizarListaCategorias();
            return catLocal;
        } else {
            console.error("Erro API criar categoria");
            return null;
        }
    } catch (e) {
        console.error(e);
        return null;
    }
}

async function eliminarCategoria(categoriaId) {
    if (!confirm('Eliminar categoria?')) return;
    try {
        const response = await fetch(`/api/categorias/${categoriaId}/eliminar`, { method: 'DELETE' });
        if (response.ok) {
            categories = categories.filter(c => c.id !== categoriaId);
            renderizarListaCategorias();
        } else {
            alert("Erro ao eliminar (pode estar em uso).");
        }
    } catch (e) {
        console.error(e);
    }
}

// ===========================================
// || FUNÇÕES AUXILIARES
// ===========================================
function salvarDados() {
    // Deprecated in API mode, but kept for safe-keeping if needed locally
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('users', JSON.stringify(users));
}

function editarTransacao(id, type) {
    // No API mode, id é string (GUID). LocalStorage usava int.
    // transactions é a lista global atualizada via API.
    const t = transactions.find(t => t.id == id); // == allow string/int compare
    if (!t) return;

    document.getElementById('transactionModalTitle').textContent =
        type === 'expense' ? 'Editar Despesa' : 'Editar Receita';
    document.getElementById('transactionTypeHidden').value = type;
    document.getElementById('transactionId').value = t.id;
    document.getElementById('transactionDate').value = t.date;
    document.getElementById('transactionDescription').value = t.description;
    document.getElementById('transactionValue').value = t.value;
    document.getElementById('transactionCategoryInput').value = t.category;

    abrirModal('transactionModal');
}

async function eliminarTransacao(id, type) {
    if (!confirm('Tem certeza que deseja eliminar esta transação?')) return;
    if (!usuarioLogado) return;

    const endpointType = type === 'expense' ? 'despesas' : 'receitas';

    try {
        const response = await fetch(`/api/${usuarioLogado.id}/${endpointType}/${id}/eliminar`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await carregarDashboard();
            if (type === 'expense') carregarDespesas();
            else carregarReceitas();
        } else {
            alert("Erro ao eliminar transação.");
        }
    } catch (error) {
        console.error(error);
    }
}

function editarCategoria(id) {
    const c = categories.find(c => c.id === id);
    if (!c) return;

    document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
    document.getElementById('categoryId').value = c.id;
    document.getElementById('categoryName').value = c.name;
    document.getElementById('categoryType').value = c.type;
    document.getElementById('categoryColor').value = c.color;

    abrirModal('categoryModal');
}

// ===========================================
// || FUNÇÕES DE UI
// ===========================================
function mostrarPagina(idPagina) {
    // Esconder todas as páginas
    document.querySelectorAll('.page-content').forEach(pagina => {
        pagina.classList.remove('active-page');
    });

    // Mostrar a página solicitada
    const pagina = document.getElementById(idPagina);
    if (pagina) {
        pagina.classList.add('active-page');
    }

    // Atualizar menu ativo
    document.querySelectorAll('#sidebar nav li').forEach(item => {
        item.classList.remove('active');
    });

    // Adicionar classe ativa ao item correspondente
    let linkId = '';
    switch (idPagina) {
        case 'page-dashboard':
            linkId = 'dashboardLink';
            break;
        case 'page-despesas':
            linkId = 'despesasLink';
            break;
        case 'page-receitas':
            linkId = 'receitasLink';
            break;
        case 'page-categorias':
            linkId = 'categoryLink';
            break;
        case 'page-relatorios':
            linkId = 'relatorioLink';
            break;
    }

    const linkElement = document.querySelector(`#${linkId}`);
    if (linkElement && linkElement.closest('li')) {
        linkElement.closest('li').classList.add('active');
    }

    // Carregar dados da página
    switch (idPagina) {
        case 'page-dashboard':
            carregarDashboard();
            break;
        case 'page-despesas':
            carregarDespesas();
            break;
        case 'page-receitas':
            carregarReceitas();
            break;
        case 'page-categorias':
            carregarCategorias();
            break;
        case 'page-relatorios':
            carregarRelatorios();
            break;
    }
}

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');

        if (idModal === 'categoryModal') {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        }

        if (idModal === 'transactionModal') {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('transactionDate').value = today;
            document.getElementById('transactionCategoryInput').value = '';

            // Definir placeholder baseado no tipo
            const tipo = document.getElementById('transactionTypeHidden').value;
            const placeholder = tipo === 'expense' ? 'Ex: Alimentação, Transporte...' : 'Ex: Salário, Freelance...';
            document.getElementById('transactionCategoryInput').placeholder = placeholder;
        }
    }
}

function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function mostrarErroLogin(mensagem) {
    const erroElement = document.getElementById('loginEmail-error') ||
        document.getElementById('loginPassword-error');
    if (erroElement) {
        erroElement.textContent = mensagem;
        erroElement.style.display = 'block';

        setTimeout(() => {
            erroElement.style.display = 'none';
        }, 5000);
    }
}

function mostrarErroRegistro(mensagem) {
    const erroElement = document.getElementById('registerEmail-error') ||
        document.getElementById('registerPassword-error');
    if (erroElement) {
        erroElement.textContent = mensagem;
        erroElement.style.display = 'block';

        setTimeout(() => {
            erroElement.style.display = 'none';
        }, 5000);
    }
}

function atualizarInterfaceUsuario() {
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userAvatarElement = document.getElementById('userAvatar');

    if (usuarioLogado) {
        const nome = usuarioLogado.name;
        const email = usuarioLogado.email;

        if (userNameElement) userNameElement.textContent = nome || 'Usuário';
        if (userEmailElement) userEmailElement.textContent = email || '';

        if (userAvatarElement && nome) {
            const initials = nome
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatarElement.textContent = initials;
        }

        const userSubmenu = document.getElementById('userSubmenu');
        if (userSubmenu) {
            userSubmenu.innerHTML = `
                <a id="logoutLink">Logout</a>
                <a id="profileLink">Perfil</a>
            `;
        }
    } else {
        if (userNameElement) userNameElement.textContent = 'Admin';
        if (userEmailElement) userEmailElement.textContent = '';
        if (userAvatarElement) userAvatarElement.textContent = 'Ad';

        const userSubmenu = document.getElementById('userSubmenu');
        if (userSubmenu) {
            userSubmenu.innerHTML = `
                <a id="loginLink">Login</a>
                <a id="registerLink">Criar Conta</a>
            `;
        }
    }
}

// ===========================================
// || FUNÇÕES DE RELATÓRIOS (CORRIGIDO)
// ===========================================
function carregarRelatorios() {
    const periodo = document.getElementById('periodoRelatorio')?.value || 'mes';
    const tipoTransacao = document.getElementById('tipoTransacao')?.value || 'todas';

    let dataInicio, dataFim;
    const hoje = new Date();

    // Converter valores para corresponder ao HTML
    switch (periodo) {
        case 'semana':
            dataInicio = new Date(hoje.setDate(hoje.getDate() - 7));
            dataFim = new Date();
            break;
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            dataFim = new Date(hoje.getFullYear(), 11, 31);
            break;
        case 'personalizado':
            const inicioInput = document.getElementById('dataInicio')?.value;
            const fimInput = document.getElementById('dataFim')?.value;
            dataInicio = inicioInput ? new Date(inicioInput) : null;
            dataFim = fimInput ? new Date(fimInput) : null;
            break;
        default:
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    }

    // Filtrar transações por data
    let transacoesFiltradas = transactions.filter(t => {
        const dataTransacao = new Date(t.date);

        // Verificar data
        const dentroDoPeriodo = (!dataInicio || dataTransacao >= dataInicio) &&
            (!dataFim || dataTransacao <= dataFim);

        if (!dentroDoPeriodo) return false;

        // Verificar tipo de transação
        if (tipoTransacao === 'receitas') {
            return t.type === 'income';
        } else if (tipoTransacao === 'despesas') {
            return t.type === 'expense';
        }

        return true; // 'todas'
    });

    // Calcular estatísticas
    const expenseTotal = transacoesFiltradas
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);

    const incomeTotal = transacoesFiltradas
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);

    const saldo = incomeTotal - expenseTotal;
    const totalMovimentado = expenseTotal + incomeTotal;

    // Atualizar estatísticas na tela
    document.getElementById('totalMovimentado').textContent = `${totalMovimentado.toFixed(2)} €`;
    document.getElementById('totalReceitasRelatorio').textContent = `${incomeTotal.toFixed(2)} €`;
    document.getElementById('totalDespesasRelatorio').textContent = `${expenseTotal.toFixed(2)} €`;
    document.getElementById('saldoFinalRelatorio').textContent = `${saldo.toFixed(2)} €`;

    // Preencher tabela de transações
    const tbody = document.getElementById('transacoesRelatorioBody');
    if (tbody) {
        tbody.innerHTML = '';

        transacoesFiltradas.forEach(t => {
            const tr = document.createElement('tr');
            const typeColor = t.type === 'income' ? '#4caf50' : '#f44336';
            const typeText = t.type === 'income' ? 'Receita' : 'Despesa';

            tr.innerHTML = `
                <td>${t.date}</td>
                <td style="color: ${typeColor}; font-weight: bold;">${typeText}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td style="font-weight: bold; color: ${typeColor}">${t.value.toFixed(2)} €</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Preencher resumo por categoria
    const resumoCategoriasDiv = document.getElementById('resumoCategorias');
    if (resumoCategoriasDiv) {
        resumoCategoriasDiv.innerHTML = '';

        // Agrupar por categoria
        const categoriasMap = {};

        transacoesFiltradas.forEach(t => {
            if (!categoriasMap[t.category]) {
                categoriasMap[t.category] = {
                    total: 0,
                    type: t.type,
                    count: 0
                };
            }
            categoriasMap[t.category].total += t.value;
            categoriasMap[t.category].count += 1;
        });

        // Criar cards para cada categoria
        Object.entries(categoriasMap).forEach(([categoria, dados]) => {
            const card = document.createElement('div');
            card.className = 'categoria-card';
            card.style.backgroundColor = dados.type === 'income' ? '#e8f5e9' : '#ffebee';
            card.style.borderLeft = `4px solid ${dados.type === 'income' ? '#4caf50' : '#f44336'}`;

            card.innerHTML = `
                <h4>${categoria}</h4>
                <p class="categoria-valor">${dados.total.toFixed(2)} €</p>
                <small>${dados.count} transações</small>
                <div class="categoria-tipo">${dados.type === 'income' ? 'Receita' : 'Despesa'}</div>
            `;

            resumoCategoriasDiv.appendChild(card);
        });
    }

    // Renderizar Gráficos do Relatório - REMOVIDO
}

// ===========================================
// || EVENT LISTENERS E INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', function () {
    // Carregar dados salvos
    usuarioLogado = JSON.parse(localStorage.getItem('currentUser'));

    // Validação de segurança: se o ID não for um GUID válido (ex: 36 caracteres), fazer logout forçado
    if (usuarioLogado && (typeof usuarioLogado.id !== 'string' || usuarioLogado.id.length < 30)) {
        console.warn("ID de usuário inválido detectado (formato antigo). Forçando logout para renovação.");
        usuarioLogado = null;
        localStorage.removeItem('currentUser');
    }

    atualizarInterfaceUsuario();

    // Navegação
    const navLinks = {
        'dashboardLink': 'page-dashboard',
        'despesasLink': 'page-despesas',
        'receitasLink': 'page-receitas',
        'categoryLink': 'page-categorias',
        'relatorioLink': 'page-relatorios'
    };

    Object.entries(navLinks).forEach(([linkId, pageId]) => {
        const link = document.getElementById(linkId);
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mostrarPagina(pageId);
            });
        }
    });

    // Login/Registro
    document.getElementById('loginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = document.getElementById('userSubmenu');
        if (submenu) submenu.style.display = 'none';
        abrirModal('loginpopup');
    });

    document.getElementById('registerLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = document.getElementById('userSubmenu');
        if (submenu) submenu.style.display = 'none';
        abrirModal('registerpopup');
    });

    // Logout
    document.addEventListener('click', (e) => {
        if (e.target.id === 'logoutLink') {
            e.preventDefault();
            fazerLogout();
        }
    });

    // Alternar entre login e registro
    document.getElementById('goToRegister')?.addEventListener('click', (e) => {
        e.preventDefault();
        fecharModal('loginpopup');
        abrirModal('registerpopup');
    });

    document.getElementById('goToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        fecharModal('registerpopup');
        abrirModal('loginpopup');
    });

    // Formulário Login
    document.querySelector('#loginpopup form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            mostrarErroLogin('Preencha todos os campos');
            return;
        }

        fazerLogin(email, password);
    });

    // Formulário Registro
    document.querySelector('#registerpopup form')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (!nome || !email || !password || !confirmPassword) {
            mostrarErroRegistro('Preencha todos os campos');
            return;
        }

        if (password !== confirmPassword) {
            mostrarErroRegistro('As passwords não coincidem');
            return;
        }

        if (password.length < 6) {
            mostrarErroRegistro('A password deve ter pelo menos 6 caracteres');
            return;
        }

        registrarUsuario(nome, email, password);
    });

    // Formulário Categoria
    // Formulário Categoria
    document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('categoryName').value;
        const tipo = document.getElementById('categoryType').value;
        const cor = document.getElementById('categoryColor').value;
        const categoriaId = document.getElementById('categoryId').value;

        if (!nome || !tipo) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        if (categoriaId) {
            // Editar categoria existente - API Endpoint para PUT
            try {
                const response = await fetch(`/api/categorias/${categoriaId}/editar`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome: nome })
                });

                if (response.ok) {
                    await carregarCategorias();
                    alert('Categoria editada com sucesso!');
                } else {
                    alert('Erro ao editar categoria');
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            // Criar nova categoria
            const nova = await criarCategoria(nome, tipo, cor);
            if (nova) alert('Categoria criada com sucesso!');
        }

        fecharModal('categoryModal');
    });

    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        abrirModal('categoryModal');
    });

    // Formulário Transação
    document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const data = document.getElementById('transactionDate').value;
        const descricao = document.getElementById('transactionDescription').value;
        const valor = document.getElementById('transactionValue').value;
        const categoriaNome = document.getElementById('transactionCategoryInput').value;
        const tipo = document.getElementById('transactionTypeHidden').value;
        const transacaoId = document.getElementById('transactionId').value;

        if (!data || !descricao || !valor || !categoriaNome) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        let sucesso = false;

        if (transacaoId) {
            // Editar transação existente (API)
            // Precisamos do ID da categoria para o backend
            let categoria = categories.find(c => c.name.toLowerCase() === categoriaNome.toLowerCase());
            if (!categoria) {
                categoria = await criarCategoria(categoriaNome, tipo, '#888888');
            }

            if (categoria) {
                const endpointType = tipo === 'expense' ? 'despesas' : 'receitas';
                const body = {
                    valor: parseFloat(valor),
                    descricao: descricao,
                    categoriaId: categoria.id
                };

                try {
                    const response = await fetch(`/api/${usuarioLogado.id}/${endpointType}/${transacaoId}/editar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body)
                    });

                    if (response.ok) {
                        sucesso = true;
                        await carregarDashboard();
                        if (tipo === 'expense') carregarDespesas(); else carregarReceitas();
                    }
                } catch (e) { console.error(e); }
            }
        } else {
            // Criar nova transação
            if (tipo === 'expense') {
                sucesso = await criarDespesa(valor, descricao, categoriaNome);
            } else if (tipo === 'income') {
                sucesso = await criarReceita(valor, descricao, categoriaNome);
            }
        }

        if (sucesso) {
            fecharModal('transactionModal');
            alert('Transação salva com sucesso!');
        } else {
            // O alerta de erro já é mostrado nas funções criar ou no catch
        }
    });

    // Botões para adicionar
    document.getElementById('addDespesaBtn')?.addEventListener('click', () => {
        addTransaction('expense');
    });

    document.getElementById('addReceitaBtn')?.addEventListener('click', () => {
        addTransaction('income');
    });

    // Função global para adicionar transação
    window.addTransaction = function (type) {
        if (!usuarioLogado) {
            alert('Por favor, faça login primeiro!');
            abrirModal('loginpopup');
            return;
        }

        document.getElementById('transactionModalTitle').textContent =
            type === 'expense' ? 'Nova Despesa' : 'Nova Receita';
        document.getElementById('transactionTypeHidden').value = type;
        document.getElementById('transactionId').value = '';
        document.getElementById('transactionForm').reset();

        const today = new Date().toISOString().split('T')[0];
        document.getElementById('transactionDate').value = today;
        document.getElementById('transactionCategoryInput').value = '';
        document.getElementById('transactionCategoryInput').placeholder = type === 'expense' ? 'Ex: Alimentação, Transporte...' : 'Ex: Salário, Freelance...';

        abrirModal('transactionModal');
    };

    // Botões fechar modal
    document.querySelectorAll('.closeModal').forEach(botao => {
        botao.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            fecharModal(modalId);
        });
    });

    // Fechar modais ao clicar fora
    document.querySelectorAll('.popup-overlay, .modal-overlay').forEach(modal => {
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                fecharModal(this.id);
            }
        });
    });

    // Menu responsivo
    document.getElementById('openBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').style.left = '0';
    });

    document.getElementById('closeBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').style.left = '-250px';
    });

    // Toggle submenu
    document.getElementById('toggleUserMenu')?.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = document.getElementById('userSubmenu');
        if (submenu) {
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        }
    });

    // Relatórios
    document.getElementById('periodoRelatorio')?.addEventListener('change', function () {
        const filtroPersonalizado = document.getElementById('filtroDataPersonalizada');
        if (filtroPersonalizado) {
            filtroPersonalizado.style.display = this.value === 'personalizado' ? 'block' : 'none';
        }
    });

    document.getElementById('aplicarFiltros')?.addEventListener('click', () => {
        carregarRelatorios();
    });

    document.getElementById('gerarRelatorioBtn')?.addEventListener('click', () => {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Adicionar Título
            doc.setFontSize(18);
            doc.setTextColor(106, 27, 154); // Cor principal #6a1b9a
            doc.text("Relatório Financeiro", 14, 22);

            // Adicionar Data de Emissão
            doc.setFontSize(10);
            doc.setTextColor(100);
            const dataEmissao = new Date().toLocaleDateString('pt-PT');
            doc.text(`Gerado em: ${dataEmissao}`, 14, 30);

            // Obter dados do resumo
            const receita = document.getElementById('totalReceitasRelatorio')?.textContent || "0.00 €";
            const despesa = document.getElementById('totalDespesasRelatorio')?.textContent || "0.00 €";
            const saldo = document.getElementById('saldoFinalRelatorio')?.textContent || "0.00 €";

            // Seção de Resumo
            doc.setFillColor(248, 249, 250);
            doc.rect(14, 35, 182, 25, 'F');

            doc.setFontSize(12);
            doc.setTextColor(50);
            doc.text("Resumo do Período:", 18, 45);

            doc.setFontSize(10);
            doc.setTextColor(76, 175, 80); // Verde
            doc.text(`Receitas: ${receita}`, 18, 53);

            doc.setTextColor(244, 67, 54); // Vermelho
            doc.text(`Despesas: ${despesa}`, 70, 53);

            doc.setTextColor(50); // Preto suave
            doc.text(`Saldo Líquido: ${saldo}`, 130, 53);

            // Preparar dados para a tabela
            const rows = [];
            const tbody = document.getElementById("transacoesRelatorioBody");
            if (tbody) {
                const trs = tbody.querySelectorAll("tr");
                trs.forEach(tr => {
                    const cols = tr.querySelectorAll("td");
                    if (cols.length > 0) {
                        rows.push([
                            cols[0].textContent, // Data
                            cols[1].textContent, // Tipo
                            cols[2].textContent, // Descrição
                            cols[3].textContent, // Categoria
                            cols[4].textContent  // Valor
                        ]);
                    }
                });
            }

            // Gerar Tabela
            doc.autoTable({
                startY: 65,
                head: [['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor']],
                body: rows,
                theme: 'grid',
                headStyles: { fillColor: [106, 27, 154] },
                styles: { fontSize: 9 },
                columnStyles: {
                    4: { halign: 'right' } // Valor alinhado à direita
                }
            });

            // Salvar PDF
            doc.save(`Relatorio_Financeiro_${new Date().toISOString().slice(0, 10)}.pdf`);

        } catch (error) {
            console.error("Erro ao gerar PDF:", error);
            alert("Erro ao gerar o PDF. Verifique se há dados disponíveis.");
        }
    });

    // Mostrar dashboard inicial
    mostrarPagina('page-dashboard');

    // Inicializar datas dos filtros
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    if (document.getElementById('dataInicio')) {
        document.getElementById('dataInicio').value = primeiroDiaMes.toISOString().split('T')[0];
        document.getElementById('dataInicio').max = hoje.toISOString().split('T')[0];
    }

    if (document.getElementById('dataFim')) {
        document.getElementById('dataFim').value = ultimoDiaMes.toISOString().split('T')[0];
        document.getElementById('dataFim').max = hoje.toISOString().split('T')[0];
    }
});