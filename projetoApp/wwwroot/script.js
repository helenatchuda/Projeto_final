// ===========================================
// || SISTEMA DE GESTÃO FINANCEIRA - FRONTEND ONLY
// ===========================================
const API_BASE_URL = 'http://localhost:5000'; // Não será usado
let usuarioLogado = null;
const USE_BACKEND = false; // Sempre false - usamos apenas dados locais

// ===========================================
// || DADOS LOCAIS
// ===========================================
let categories = JSON.parse(localStorage.getItem('categories')) || [
    { id: 1, name: 'Alimentação', type: 'expense', color: '#ff7f50' },
    { id: 2, name: 'Transporte', type: 'expense', color: '#4169e1' },
    { id: 3, name: 'Moradia', type: 'expense', color: '#00ced1' },
    { id: 9, name: 'Salário', type: 'income', color: '#4caf50' },
    { id: 10, name: 'Freelance', type: 'income', color: '#1e90ff' },
];

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
function fazerLogin(email, senha) {
    const user = users.find(u => u.email === email && u.password === senha);
    if (user) {
        usuarioLogado = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        atualizarInterfaceUsuario();
        fecharModal('loginpopup');
        mostrarPagina('page-dashboard');
        carregarDashboard();
        return true;
    } else {
        mostrarErroLogin('Email ou senha incorretos!');
        return false;
    }
}

function registrarUsuario(nome, email, senha) {
    if (senha.length < 6) {
        mostrarErroRegistro('A senha deve ter pelo menos 6 caracteres');
        return false;
    }
    
    if (users.some(u => u.email === email)) {
        mostrarErroRegistro('Este email já está registado');
        return false;
    }
    
    const newUser = {
        id: Date.now(),
        name: nome,
        email: email,
        password: senha,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    usuarioLogado = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    atualizarInterfaceUsuario();
    alert('Conta criada com sucesso!');
    fecharModal('registerpopup');
    abrirModal('loginpopup');
    return true;
}

function fazerLogout() {
    usuarioLogado = null;
    localStorage.removeItem('currentUser');
    atualizarInterfaceUsuario();
    mostrarPagina('page-dashboard');
    carregarDashboard();
}

// ===========================================
// || FUNÇÕES DO DASHBOARD
// ===========================================
function carregarDashboard() {
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const saldo = incomeTotal - expenseTotal;

    document.getElementById('dashboardSaldo').textContent = `${saldo.toFixed(2)} €`;
    document.getElementById('dashboardReceitas').textContent = `${incomeTotal.toFixed(2)} €`;
    document.getElementById('dashboardDespesas').textContent = `${expenseTotal.toFixed(2)} €`;

    carregarUltimasTransacoes();
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
// || FUNÇÕES DE DESPESAS
// ===========================================
function carregarDespesas() {
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
                <button onclick="editarTransacao(${t.id}, 'expense')"><i class="fas fa-edit"></i></button>
                <button onclick="eliminarTransacao(${t.id}, 'expense')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('totalDespesasMes').textContent = `${totalValue.toFixed(2)} €`;
    document.getElementById('countDespesasMes').textContent = filteredTransactions.length;
    document.getElementById('maiorDespesa').textContent = `${maxValue.toFixed(2)} €`;
}

function criarDespesa(valor, descricao, categoriaId) {
    const categoria = categories.find(c => c.id === parseInt(categoriaId));
    if (!categoria) return false;
    
    const novaDespesa = {
        id: Date.now(),
        date: document.getElementById('transactionDate').value,
        description: descricao,
        value: parseFloat(valor),
        type: 'expense',
        category: categoria.name,
        categoryId: parseInt(categoriaId)
    };
    
    transactions.push(novaDespesa);
    salvarDados();
    carregarDespesas();
    carregarDashboard();
    return true;
}

// ===========================================
// || FUNÇÕES DE RECEITAS
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
                <button onclick="editarTransacao(${t.id}, 'income')"><i class="fas fa-edit"></i></button>
                <button onclick="eliminarTransacao(${t.id}, 'income')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.getElementById('totalReceitasMes').textContent = `${totalValue.toFixed(2)} €`;
    document.getElementById('countReceitasMes').textContent = filteredTransactions.length;
    document.getElementById('maiorReceita').textContent = `${maxValue.toFixed(2)} €`;
}

function criarReceita(valor, descricao, categoriaId) {
    const categoria = categories.find(c => c.id === parseInt(categoriaId));
    if (!categoria) return false;
    
    const novaReceita = {
        id: Date.now(),
        date: document.getElementById('transactionDate').value,
        description: descricao,
        value: parseFloat(valor),
        type: 'income',
        category: categoria.name,
        categoryId: parseInt(categoriaId)
    };
    
    transactions.push(novaReceita);
    salvarDados();
    carregarReceitas();
    carregarDashboard();
    return true;
}

// ===========================================
// || FUNÇÕES DE CATEGORIAS
// ===========================================
function carregarCategorias() {
    const expenseCategories = categories.filter(c => c.type === 'expense');
    const incomeCategories = categories.filter(c => c.type === 'income');
    
    document.getElementById('totalCategoriesCount').textContent = categories.length;
    document.getElementById('expenseCategoriesCount').textContent = expenseCategories.length;
    document.getElementById('incomeCategoriesCount').textContent = incomeCategories.length;
    
    // Preencher listas
    const listaDespesas = document.getElementById('expenseCategoriesList');
    const listaReceitas = document.getElementById('incomeCategoriesList');
    
    if (listaDespesas) {
        listaDespesas.innerHTML = '';
        expenseCategories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span style="color: ${categoria.color}">●</span>
                ${categoria.name}
                <button class="btn-eliminar-categoria" onclick="eliminarCategoria(${categoria.id})">🗑️</button>
            `;
            listaDespesas.appendChild(li);
        });
    }
    
    if (listaReceitas) {
        listaReceitas.innerHTML = '';
        incomeCategories.forEach(categoria => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span style="color: ${categoria.color}">●</span>
                ${categoria.name}
                <button class="btn-eliminar-categoria" onclick="eliminarCategoria(${categoria.id})">🗑️</button>
            `;
            listaReceitas.appendChild(li);
        });
    }
    
    // Carregar categorias no dropdown
    carregarCategoriasParaDropdown();
    
    return categories;
}

function criarCategoria(nome, tipo, cor) {
    const novaCategoria = {
        id: Date.now(),
        name: nome,
        type: tipo,
        color: cor
    };
    
    categories.push(novaCategoria);
    salvarDados();
    carregarCategorias();
    return true;
}

function eliminarCategoria(categoriaId) {
    if (transactions.some(t => t.categoryId === parseInt(categoriaId))) {
        alert('Não é possível eliminar esta categoria porque existem transações associadas.');
        return;
    }
    
    if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
        const index = categories.findIndex(c => c.id === parseInt(categoriaId));
        if (index > -1) {
            categories.splice(index, 1);
            salvarDados();
            carregarCategorias();
        }
    }
}

// ===========================================
// || FUNÇÕES AUXILIARES
// ===========================================
function carregarCategoriasParaDropdown() {
    const dropdown = document.getElementById('transactionCategory');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    const tipoTransacao = document.getElementById('transactionTypeHidden')?.value || 'expense';
    const filteredCategories = categories.filter(c => c.type === tipoTransacao);
    
    filteredCategories.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.name;
        option.style.color = categoria.color;
        dropdown.appendChild(option);
    });
}

function salvarDados() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categories', JSON.stringify(categories));
    localStorage.setItem('users', JSON.stringify(users));
}

function editarTransacao(id, type) {
    const t = transactions.find(t => t.id === id);
    if (!t) return;
    
    document.getElementById('transactionModalTitle').textContent = 
        type === 'expense' ? 'Editar Despesa' : 'Editar Receita';
    document.getElementById('transactionTypeHidden').value = type;
    document.getElementById('transactionId').value = t.id;
    document.getElementById('transactionDate').value = t.date;
    document.getElementById('transactionDescription').value = t.description;
    document.getElementById('transactionValue').value = t.value;
    
    carregarCategoriasParaDropdown();
    setTimeout(() => {
        document.getElementById('transactionCategory').value = t.categoryId;
    }, 100);
    
    abrirModal('transactionModal');
}

function eliminarTransacao(id, type) {
    if (!confirm('Tem certeza que deseja eliminar esta transação?')) return;
    
    const index = transactions.findIndex(t => t.id === id);
    if (index > -1) {
        transactions.splice(index, 1);
        salvarDados();
        if (type === 'expense') {
            carregarDespesas();
        } else {
            carregarReceitas();
        }
        carregarDashboard();
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
    switch(idPagina) {
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
    switch(idPagina) {
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
        
        if (idModal === 'transactionModal') {
            carregarCategoriasParaDropdown();
        }
        
        if (idModal === 'categoryModal') {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        }
        
        if (idModal === 'transactionModal') {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('transactionDate').value = today;
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
// || FUNÇÕES DE RELATÓRIOS (SIMPLES)
// ===========================================
function carregarRelatorios() {
    const periodo = document.getElementById('periodoRelatorio')?.value || 'mes';
    let dataInicio, dataFim;
    const hoje = new Date();
    
    switch(periodo) {
        case 'semana':
            dataInicio = new Date(hoje.setDate(hoje.getDate() - 7));
            break;
        case 'mes':
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            break;
        case 'ano':
            dataInicio = new Date(hoje.getFullYear(), 0, 1);
            dataFim = new Date(hoje.getFullYear(), 11, 31);
            break;
        default:
            dataInicio = new Date(2025, 0, 1);
            dataFim = hoje;
    }
    
    const transacoesFiltradas = transactions.filter(t => {
        const dataTransacao = new Date(t.date);
        return (!dataInicio || dataTransacao >= dataInicio) && 
               (!dataFim || dataTransacao <= dataFim);
    });
    
    const expenseTotal = transacoesFiltradas
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.value, 0);
        
    const incomeTotal = transacoesFiltradas
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.value, 0);
    
    const saldo = incomeTotal - expenseTotal;
    const totalMovimentado = expenseTotal + incomeTotal;
    
    document.getElementById('totalMovimentado').textContent = `${totalMovimentado.toFixed(2)} €`;
    document.getElementById('totalReceitasRelatorio').textContent = `${incomeTotal.toFixed(2)} €`;
    document.getElementById('totalDespesasRelatorio').textContent = `${expenseTotal.toFixed(2)} €`;
    document.getElementById('saldoFinalRelatorio').textContent = `${saldo.toFixed(2)} €`;
}

// ===========================================
// || EVENT LISTENERS E INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos
    usuarioLogado = JSON.parse(localStorage.getItem('currentUser'));
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
    document.getElementById('categoryForm')?.addEventListener('submit', (e) => {
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
            // Editar categoria existente
            const index = categories.findIndex(c => c.id === parseInt(categoriaId));
            if (index > -1) {
                categories[index].name = nome;
                categories[index].type = tipo;
                categories[index].color = cor;
                salvarDados();
                carregarCategorias();
                alert('Categoria editada com sucesso!');
            }
        } else {
            // Criar nova categoria
            criarCategoria(nome, tipo, cor);
            alert('Categoria criada com sucesso!');
        }
        
        fecharModal('categoryModal');
    });
    
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        abrirModal('categoryModal');
    });
    
    // Formulário Transação
    document.getElementById('transactionForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const data = document.getElementById('transactionDate').value;
        const descricao = document.getElementById('transactionDescription').value;
        const valor = document.getElementById('transactionValue').value;
        const categoriaId = document.getElementById('transactionCategory').value;
        const tipo = document.getElementById('transactionTypeHidden').value;
        const transacaoId = document.getElementById('transactionId').value;
        
        if (!data || !descricao || !valor || !categoriaId) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }
        
        let sucesso = false;
        
        if (transacaoId) {
            // Editar transação existente
            const index = transactions.findIndex(t => t.id === parseInt(transacaoId));
            if (index > -1) {
                transactions[index].date = data;
                transactions[index].description = descricao;
                transactions[index].value = parseFloat(valor);
                transactions[index].categoryId = parseInt(categoriaId);
                const categoria = categories.find(c => c.id === parseInt(categoriaId));
                transactions[index].category = categoria ? categoria.name : '';
                salvarDados();
                sucesso = true;
            }
        } else {
            // Criar nova transação
            if (tipo === 'expense') {
                sucesso = criarDespesa(valor, descricao, categoriaId);
            } else if (tipo === 'income') {
                sucesso = criarReceita(valor, descricao, categoriaId);
            }
        }
        
        if (sucesso) {
            fecharModal('transactionModal');
        } else {
            alert('Erro ao salvar transação');
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
    window.addTransaction = function(type) {
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
        
        carregarCategoriasParaDropdown();
        abrirModal('transactionModal');
    };
    
    // Botões fechar modal
    document.querySelectorAll('.closeModal').forEach(botao => {
        botao.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            fecharModal(modalId);
        });
    });
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.popup-overlay, .modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(e) {
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
    document.getElementById('periodoRelatorio')?.addEventListener('change', function() {
        const filtroPersonalizado = document.getElementById('filtroDataPersonalizada');
        if (filtroPersonalizado) {
            filtroPersonalizado.style.display = this.value === 'personalizado' ? 'block' : 'none';
        }
    });
    
    document.getElementById('aplicarFiltros')?.addEventListener('click', () => {
        carregarRelatorios();
    });
    
    document.getElementById('gerarRelatorioBtn')?.addEventListener('click', () => {
        alert('Relatório gerado! (Funcionalidade de exportação em desenvolvimento)');
    });
    
    // Mostrar dashboard inicial
    mostrarPagina('page-dashboard');
});