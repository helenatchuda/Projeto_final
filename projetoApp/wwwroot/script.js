// ===========================================
// || CONFIGURAÇÃO DO SISTEMA
// ===========================================
const API_BASE_URL = 'http://localhost:5000'; // URL do backend C#
let usuarioLogado = null;

// Modo de operação (true = usa backend C#, false = usa dados locais)
const USE_BACKEND = false; // Mude para true quando o backend estiver rodando

// ===========================================
// || DADOS LOCAIS (para quando USE_BACKEND = false)
// ===========================================
let categories = [
    { id: 1, name: 'Alimentação', type: 'expense', color: '#ff7f50' },
    { id: 2, name: 'Transporte', type: 'expense', color: '#4169e1' },
    { id: 3, name: 'Moradia', type: 'expense', color: '#00ced1' },
    { id: 9, name: 'Salário', type: 'income', color: '#4caf50' },
    { id: 10, name: 'Freelance', type: 'income', color: '#1e90ff' },
];
let nextCategoryId = categories.length + 1;

let transactions = [
    { id: 1, date: '2025-11-25', description: 'Supermercado Mensal', value: 125.50, type: 'expense', category: 'Alimentação', categoryId: 1 },
    { id: 2, date: '2025-11-26', description: 'Gasóleo', value: 55.00, type: 'expense', category: 'Transporte', categoryId: 2 },
    { id: 5, date: '2025-11-01', description: 'Renda', value: 650.00, type: 'expense', category: 'Moradia', categoryId: 3 },
    { id: 3, date: '2025-11-05', description: 'Salário (Novembro)', value: 1500.00, type: 'income', category: 'Salário', categoryId: 9 },
    { id: 4, date: '2025-11-15', description: 'Projeto X', value: 350.00, type: 'income', category: 'Freelance', categoryId: 10 },
];
let nextTransactionId = transactions.length + 1;

// Usuários (armazenamento local)
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// ===========================================
// || FUNÇÕES DE AUTENTICAÇÃO (C# BACKEND)
// ===========================================
async function fazerLogin(email, senha) {
    if (!USE_BACKEND) {
        // Modo local
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
    
    // Modo backend C#
    try {
        const response = await fetch(`${API_BASE_URL}/utilizadores/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password: senha })
        });

        if (response.ok) {
            const data = await response.json();
            usuarioLogado = data.user;
            
            // Salvar localmente para persistência
            localStorage.setItem('currentUser', JSON.stringify(usuarioLogado));
            
            // Atualizar UI
            atualizarInterfaceUsuario();
            fecharModal('loginpopup');
            mostrarPagina('page-dashboard');
            carregarDashboard();
            
            return true;
        } else {
            mostrarErroLogin('Email ou senha incorretos!');
            return false;
        }
    } catch (error) {
        console.error('Erro no login:', error);
        mostrarErroLogin('Erro de conexão com o servidor');
        return false;
    }
}

async function registrarUsuario(nome, email, senha) {
    if (!USE_BACKEND) {
        // Modo local
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
        alert('Conta criada com sucesso! Faça login.');
        fecharModal('registerpopup');
        abrirModal('loginpopup');
        return true;
    }
    
    // Modo backend C#
    try {
        const response = await fetch(`${API_BASE_URL}/utilizadores/registar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email, password: senha })
        });

        if (response.ok) {
            alert('Conta criada com sucesso! Faça login.');
            fecharModal('registerpopup');
            abrirModal('loginpopup');
            return true;
        } else {
            const error = await response.text();
            mostrarErroRegistro(error);
            return false;
        }
    } catch (error) {
        console.error('Erro no registro:', error);
        mostrarErroRegistro('Erro de conexão com o servidor');
        return false;
    }
}

async function fazerLogout() {
    if (!usuarioLogado) return;
    
    if (USE_BACKEND) {
        try {
            await fetch(`${API_BASE_URL}/utilizadores/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: usuarioLogado.Email })
            });
        } catch (error) {
            console.error('Erro no logout:', error);
        }
    }
    
    // Limpar estado local
    usuarioLogado = null;
    localStorage.removeItem('currentUser');
    atualizarInterfaceUsuario();
    
    mostrarPagina('page-dashboard');
    if (!USE_BACKEND) {
        // Recarregar dados locais
        carregarDashboard();
    }
}

// ===========================================
// || FUNÇÕES DE DASHBOARD
// ===========================================
async function carregarDashboard() {
    if (!USE_BACKEND) {
        // Modo local
        const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
        const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
        const saldo = incomeTotal - expenseTotal;

        document.getElementById('dashboardSaldo').textContent = `${saldo.toFixed(2)} €`;
        document.getElementById('dashboardReceitas').textContent = `${incomeTotal.toFixed(2)} €`;
        document.getElementById('dashboardDespesas').textContent = `${expenseTotal.toFixed(2)} €`;

        // Renderizar últimas transações
        await carregarUltimasTransacoes();
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return;
    
    try {
        // Carregar saldo atual
        const saldoResponse = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/relatorio/saldo`);
        if (saldoResponse.ok) {
            const saldoData = await saldoResponse.json();
            document.getElementById('dashboardSaldo').textContent = `${saldoData.SaldoAtual.toFixed(2)} €`;
        }
        
        // Carregar totais do mês atual
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const totaisResponse = await fetch(
            `${API_BASE_URL}/api/${usuarioLogado.Id}/relatorio/totais-por-periodo?inicio=${primeiroDiaMes.toISOString()}&fim=${ultimoDiaMes.toISOString()}`
        );
        
        if (totaisResponse.ok) {
            const totaisData = await totaisResponse.json();
            document.getElementById('dashboardReceitas').textContent = `${totaisData.TotalReceitas.toFixed(2)} €`;
            document.getElementById('dashboardDespesas').textContent = `${totaisData.TotalDespesas.toFixed(2)} €`;
        }
        
        // Carregar últimas transações
        await carregarUltimasTransacoes();
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
}

async function carregarUltimasTransacoes() {
    if (!USE_BACKEND) {
        // Modo local
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
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return;
    
    try {
        // Carregar receitas
        const receitasResponse = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/receitas`);
        const despesasResponse = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/despesas`);
        
        let transacoes = [];
        
        if (receitasResponse.ok) {
            const receitas = await receitasResponse.json();
            transacoes = transacoes.concat(receitas.map(r => ({ ...r, Tipo: 'Receita' })));
        }
        
        if (despesasResponse.ok) {
            const despesas = await despesasResponse.json();
            transacoes = transacoes.concat(despesas.map(d => ({ ...d, Tipo: 'Despesa' })));
        }
        
        // Ordenar por data (mais recente primeiro) e pegar 5 primeiras
        transacoes.sort((a, b) => new Date(b.Data) - new Date(a.Data));
        const ultimas5 = transacoes.slice(0, 5);
        
        // Preencher tabela
        const tbody = document.getElementById('lastTransactionsBody');
        tbody.innerHTML = '';
        
        ultimas5.forEach(transacao => {
            const tr = document.createElement('tr');
            const typeColor = transacao.Tipo === 'Receita' ? '#4caf50' : '#f44336';
            
            tr.innerHTML = `
                <td>${new Date(transacao.Data).toLocaleDateString('pt-PT')}</td>
                <td style="color: ${typeColor}; font-weight: bold;">${transacao.Tipo}</td>
                <td>${transacao.Descricao}</td>
                <td style="font-weight: bold; color: ${typeColor}">${transacao.Valor.toFixed(2)} €</td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Erro ao carregar últimas transações:', error);
    }
}

// ===========================================
// || FUNÇÕES DE DESPESAS
// ===========================================
async function carregarDespesas() {
    if (!USE_BACKEND) {
        // Modo local
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
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/despesas`);
        if (!response.ok) throw new Error('Erro ao carregar despesas');
        
        const despesas = await response.json();
        
        // Atualizar estatísticas
        const totalDespesas = despesas.reduce((sum, d) => sum + d.Valor, 0);
        const maiorDespesa = despesas.length > 0 ? Math.max(...despesas.map(d => d.Valor)) : 0;
        
        document.getElementById('totalDespesasMes').textContent = `${totalDespesas.toFixed(2)} €`;
        document.getElementById('countDespesasMes').textContent = despesas.length;
        document.getElementById('maiorDespesa').textContent = `${maiorDespesa.toFixed(2)} €`;
        
        // Preencher tabela
        const tbody = document.getElementById('despesasTableBody');
        tbody.innerHTML = '';
        
        // Carregar categorias para mostrar nome
        const categorias = await carregarCategorias();
        
        despesas.forEach(despesa => {
            const categoria = categorias.find(c => c.Id === despesa.CategoriaId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(despesa.Data).toLocaleDateString('pt-PT')}</td>
                <td>${despesa.Descricao}</td>
                <td>${categoria ? categoria.Nome : 'Sem categoria'}</td>
                <td>${despesa.Valor.toFixed(2)} €</td>
                <td class="action-btns">
                    <button onclick="editarDespesa('${despesa.Id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarDespesa('${despesa.Id}')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Erro ao carregar despesas:', error);
    }
}

async function criarDespesa(valor, descricao, categoriaId) {
    if (!USE_BACKEND) {
        // Modo local
        const categoria = categories.find(c => c.id === parseInt(categoriaId));
        const novaDespesa = {
            id: nextTransactionId++,
            date: document.getElementById('transactionDate').value,
            description: descricao,
            value: parseFloat(valor),
            type: 'expense',
            category: categoria ? categoria.name : 'Sem Categoria',
            categoryId: parseInt(categoriaId)
        };
        
        transactions.push(novaDespesa);
        carregarDespesas();
        carregarDashboard();
        return true;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/despesas/criar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Valor: parseFloat(valor),
                Descricao: descricao,
                CategoriaId: categoriaId
            })
        });
        
        if (response.ok) {
            await carregarDespesas();
            await carregarDashboard();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao criar despesa:', error);
        return false;
    }
}

async function eliminarDespesa(despesaId) {
    if (!USE_BACKEND) {
        // Modo local
        const index = transactions.findIndex(t => t.id === parseInt(despesaId));
        if (index > -1 && confirm('Tem certeza que deseja eliminar esta despesa?')) {
            transactions.splice(index, 1);
            carregarDespesas();
            carregarDashboard();
        }
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado || !confirm('Tem certeza que deseja eliminar esta despesa?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/despesas/${despesaId}/eliminar`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await carregarDespesas();
            await carregarDashboard();
        }
    } catch (error) {
        console.error('Erro ao eliminar despesa:', error);
    }
}

// ===========================================
// || FUNÇÕES DE RECEITAS
// ===========================================
async function carregarReceitas() {
    if (!USE_BACKEND) {
        // Modo local
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
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/receitas`);
        if (!response.ok) throw new Error('Erro ao carregar receitas');
        
        const receitas = await response.json();
        
        // Atualizar estatísticas
        const totalReceitas = receitas.reduce((sum, r) => sum + r.Valor, 0);
        const maiorReceita = receitas.length > 0 ? Math.max(...receitas.map(r => r.Valor)) : 0;
        
        document.getElementById('totalReceitasMes').textContent = `${totalReceitas.toFixed(2)} €`;
        document.getElementById('countReceitasMes').textContent = receitas.length;
        document.getElementById('maiorReceita').textContent = `${maiorReceita.toFixed(2)} €`;
        
        // Preencher tabela
        const tbody = document.getElementById('receitasTableBody');
        tbody.innerHTML = '';
        
        // Carregar categorias para mostrar nome
        const categorias = await carregarCategorias();
        
        receitas.forEach(receita => {
            const categoria = categorias.find(c => c.Id === receita.CategoriaId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(receita.Data).toLocaleDateString('pt-PT')}</td>
                <td>${receita.Descricao}</td>
                <td>${categoria ? categoria.Nome : 'Sem categoria'}</td>
                <td>${receita.Valor.toFixed(2)} €</td>
                <td class="action-btns">
                    <button onclick="editarReceita('${receita.Id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarReceita('${receita.Id}')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
    } catch (error) {
        console.error('Erro ao carregar receitas:', error);
    }
}

async function criarReceita(valor, descricao, categoriaId) {
    if (!USE_BACKEND) {
        // Modo local
        const categoria = categories.find(c => c.id === parseInt(categoriaId));
        const novaReceita = {
            id: nextTransactionId++,
            date: document.getElementById('transactionDate').value,
            description: descricao,
            value: parseFloat(valor),
            type: 'income',
            category: categoria ? categoria.name : 'Sem Categoria',
            categoryId: parseInt(categoriaId)
        };
        
        transactions.push(novaReceita);
        carregarReceitas();
        carregarDashboard();
        return true;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/receitas/criar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Valor: parseFloat(valor),
                Descricao: descricao,
                CategoriaId: categoriaId
            })
        });
        
        if (response.ok) {
            await carregarReceitas();
            await carregarDashboard();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao criar receita:', error);
        return false;
    }
}

async function eliminarReceita(receitaId) {
    if (!USE_BACKEND) {
        // Modo local
        const index = transactions.findIndex(t => t.id === parseInt(receitaId));
        if (index > -1 && confirm('Tem certeza que deseja eliminar esta receita?')) {
            transactions.splice(index, 1);
            carregarReceitas();
            carregarDashboard();
        }
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado || !confirm('Tem certeza que deseja eliminar esta receita?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/${usuarioLogado.Id}/receitas/${receitaId}/eliminar`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await carregarReceitas();
            await carregarDashboard();
        }
    } catch (error) {
        console.error('Erro ao eliminar receita:', error);
    }
}

// ===========================================
// || FUNÇÕES DE CATEGORIAS
// ===========================================
async function carregarCategorias() {
    if (!USE_BACKEND) {
        // Modo local
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
        
        return categories;
    }
    
    // Modo backend C#
    try {
        const response = await fetch(`${API_BASE_URL}/api/categorias`);
        if (!response.ok) return [];
        
        const categorias = await response.json();
        
        // Atualizar estatísticas
        const categoriasDespesas = categorias.filter(c => c.Tipo === 'Despesa');
        const categoriasReceitas = categorias.filter(c => c.Tipo === 'Receita');
        
        document.getElementById('totalCategoriesCount').textContent = categorias.length;
        document.getElementById('expenseCategoriesCount').textContent = categoriasDespesas.length;
        document.getElementById('incomeCategoriesCount').textContent = categoriasReceitas.length;
        
        // Preencher listas
        const listaDespesas = document.getElementById('expenseCategoriesList');
        const listaReceitas = document.getElementById('incomeCategoriesList');
        
        if (listaDespesas) {
            listaDespesas.innerHTML = '';
            categoriasDespesas.forEach(categoria => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span style="color: ${categoria.Cor || '#6a1b9a'}">●</span>
                    ${categoria.Nome}
                    <button class="btn-eliminar-categoria" onclick="eliminarCategoria('${categoria.Id}')">🗑️</button>
                `;
                listaDespesas.appendChild(li);
            });
        }
        
        if (listaReceitas) {
            listaReceitas.innerHTML = '';
            categoriasReceitas.forEach(categoria => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span style="color: ${categoria.Cor || '#6a1b9a'}">●</span>
                    ${categoria.Nome}
                    <button class="btn-eliminar-categoria" onclick="eliminarCategoria('${categoria.Id}')">🗑️</button>
                `;
                listaReceitas.appendChild(li);
            });
        }
        
        return categorias;
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
        return [];
    }
}

async function criarCategoria(nome, tipo, cor) {
    if (!USE_BACKEND) {
        // Modo local
        const novaCategoria = {
            id: nextCategoryId++,
            name: nome,
            type: tipo,
            color: cor
        };
        
        categories.push(novaCategoria);
        carregarCategorias();
        return true;
    }
    
    // Modo backend C#
    try {
        const response = await fetch(`${API_BASE_URL}/api/categorias/criar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Nome: nome, Tipo: tipo, Cor: cor })
        });
        
        if (response.ok) {
            await carregarCategorias();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        return false;
    }
}

async function eliminarCategoria(categoriaId) {
    if (!USE_BACKEND) {
        // Modo local
        if (transactions.some(t => t.categoryId === parseInt(categoriaId))) {
            alert('Não é possível eliminar esta categoria porque existem transações associadas.');
            return;
        }
        
        if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
            const index = categories.findIndex(c => c.id === parseInt(categoriaId));
            if (index > -1) {
                categories.splice(index, 1);
                carregarCategorias();
            }
        }
        return;
    }
    
    // Modo backend C#
    if (!confirm('Tem certeza que deseja eliminar esta categoria? Isso pode afetar transações associadas.')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/categorias/${categoriaId}/eliminar`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await carregarCategorias();
            alert('Categoria eliminada com sucesso!');
        }
    } catch (error) {
        console.error('Erro ao eliminar categoria:', error);
        alert('Erro ao eliminar categoria.');
    }
}

// ===========================================
// || FUNÇÕES DE RELATÓRIOS
// ===========================================
async function carregarRelatorios() {
    if (!USE_BACKEND) {
        // Modo local - usar função existente
        aplicarFiltrosRelatorio();
        return;
    }
    
    // Modo backend C#
    if (!usuarioLogado) return;
    
    try {
        // Carregar estatísticas básicas
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        
        const response = await fetch(
            `${API_BASE_URL}/api/${usuarioLogado.Id}/relatorio/totais-por-periodo?inicio=${primeiroDiaMes.toISOString()}&fim=${ultimoDiaMes.toISOString()}`
        );
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('totalMovimentado').textContent = `${(data.TotalReceitas + data.TotalDespesas).toFixed(2)} €`;
            document.getElementById('totalReceitasRelatorio').textContent = `${data.TotalReceitas.toFixed(2)} €`;
            document.getElementById('totalDespesasRelatorio').textContent = `${data.TotalDespesas.toFixed(2)} €`;
            document.getElementById('saldoFinalRelatorio').textContent = `${data.SaldoNoPeriodo.toFixed(2)} €`;
        }
        
        // Carregar relatório por categoria
        await carregarRelatorioPorCategoria();
        
    } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
    }
}

// ===========================================
// || FUNÇÕES DE NAVEGAÇÃO E UI
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
        
        // Se for modal de transação, carregar categorias no dropdown
        if (idModal === 'transactionModal') {
            carregarCategoriasParaDropdown();
        }
        
        // Se for modal de categoria, resetar formulário
        if (idModal === 'categoryModal') {
            document.getElementById('categoryForm').reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        }
        
        // Definir data atual no formulário de transação
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
        
        // Auto-esconder após 5 segundos
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
        
        // Auto-esconder após 5 segundos
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
        // Modo backend C# vs modo local
        const nome = usuarioLogado.Nome || usuarioLogado.name;
        const email = usuarioLogado.Email || usuarioLogado.email;
        
        if (userNameElement) userNameElement.textContent = nome || 'Usuário';
        if (userEmailElement) userEmailElement.textContent = email || '';
        
        // Iniciais para avatar
        if (userAvatarElement && nome) {
            const initials = nome
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatarElement.textContent = initials;
        }
        
        // Atualizar submenu
        const userSubmenu = document.getElementById('userSubmenu');
        if (userSubmenu) {
            userSubmenu.innerHTML = `
                <a id="logoutLink">Logout</a>
                <a id="profileLink">Perfil</a>
            `;
        }
    } else {
        // Usuário não logado
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
// || FUNÇÕES AUXILIARES
// ===========================================
async function carregarCategoriasParaDropdown() {
    const dropdown = document.getElementById('transactionCategory');
    if (!dropdown) return;
    
    dropdown.innerHTML = '<option value="">Selecione uma categoria</option>';
    
    if (!USE_BACKEND) {
        // Modo local
        const tipoTransacao = document.getElementById('transactionTypeHidden')?.value || 'expense';
        const filteredCategories = categories.filter(c => c.type === tipoTransacao);
        
        filteredCategories.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.name;
            option.style.color = categoria.color;
            dropdown.appendChild(option);
        });
    } else {
        // Modo backend C#
        try {
            const categorias = await carregarCategorias();
            const tipoTransacao = document.getElementById('transactionTypeHidden')?.value || 'expense';
            const tipoFiltrado = tipoTransacao === 'expense' ? 'Despesa' : 'Receita';
            const categoriasFiltradas = categorias.filter(c => c.Tipo === tipoFiltrado);
            
            categoriasFiltradas.forEach(categoria => {
                const option = document.createElement('option');
                option.value = categoria.Id;
                option.textContent = categoria.Nome;
                option.style.color = categoria.Cor || '#6a1b9a';
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias para dropdown:', error);
        }
    }
}

// ===========================================
// || FUNÇÕES PARA COMPATIBILIDADE COM CÓDIGO ANTERIOR
// ===========================================
// Funções de compatibilidade para código anterior
window.addTransaction = function(type) {
    if (!usuarioLogado && USE_BACKEND) {
        alert('Por favor, faça login primeiro!');
        abrirModal('loginpopup');
        return;
    }
    
    document.getElementById('transactionModalTitle').textContent = 
        type === 'expense' ? 'Nova Despesa' : 'Nova Receita';
    document.getElementById('transactionTypeHidden').value = type;
    document.getElementById('transactionId').value = '';
    document.getElementById('transactionForm').reset();
    
    // Definir data atual
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
    
    carregarCategoriasParaDropdown();
    abrirModal('transactionModal');
};

window.editTransaction = function(id, type) {
    if (!USE_BACKEND) {
        // Modo local
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
        // Aguardar um pouco para o dropdown carregar
        setTimeout(() => {
            document.getElementById('transactionCategory').value = t.categoryId;
        }, 100);
        
        abrirModal('transactionModal');
    } else {
        // Modo backend - implementar se necessário
        alert('Edição no modo backend ainda não implementada');
    }
};

window.deleteTransaction = function(id, type) {
    if (!USE_BACKEND) {
        // Modo local
        if (confirm('Tem certeza que deseja eliminar esta transação?')) {
            const index = transactions.findIndex(t => t.id === id);
            if (index > -1) {
                transactions.splice(index, 1);
                if (type === 'expense') {
                    carregarDespesas();
                } else {
                    carregarReceitas();
                }
                carregarDashboard();
            }
        }
    } else {
        // Modo backend
        if (type === 'expense') {
            eliminarDespesa(id);
        } else {
            eliminarReceita(id);
        }
    }
};

window.editCategory = function(id) {
    if (!USE_BACKEND) {
        // Modo local
        const c = categories.find(c => c.id === id);
        if (!c) return;
        
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = c.id;
        document.getElementById('categoryName').value = c.name;
        document.getElementById('categoryType').value = c.type;
        document.getElementById('categoryColor').value = c.color;
        
        abrirModal('categoryModal');
    } else {
        // Modo backend - implementar se necessário
        alert('Edição de categoria no modo backend ainda não implementada');
    }
};

window.deleteCategory = function(id) {
    eliminarCategoria(id);
};

// ===========================================
// || EVENT LISTENERS E INICIALIZAÇÃO
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // ========== INICIALIZAÇÃO ==========
    // Carregar usuário do localStorage
    const usuarioSalvo = localStorage.getItem('currentUser');
    if (usuarioSalvo) {
        usuarioLogado = JSON.parse(usuarioSalvo);
    }
    
    atualizarInterfaceUsuario();
    
    // ========== NAVEGAÇÃO ==========
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
    
    // ========== LOGIN/REGISTRO ==========
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
    
    // ========== FORMULÁRIO LOGIN ==========
    document.querySelector('#loginpopup form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            mostrarErroLogin('Preencha todos os campos');
            return;
        }
        
        await fazerLogin(email, password);
    });
    
    // ========== FORMULÁRIO REGISTRO ==========
    document.querySelector('#registerpopup form')?.addEventListener('submit', async (e) => {
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
        
        await registrarUsuario(nome, email, password);
    });
    
    // ========== FORMULÁRIO CATEGORIA ==========
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
        
        // Converter tipo para formato backend se necessário
        const tipoBackend = tipo === 'expense' ? 'Despesa' : 'Receita';
        
        if (categoriaId) {
            // Editar categoria existente
            // Implementar edição se necessário
            alert('Edição de categoria ainda não implementada');
        } else {
            // Criar nova categoria
            const sucesso = await criarCategoria(nome, tipoBackend, cor);
            if (sucesso) {
                fecharModal('categoryModal');
                alert('Categoria criada com sucesso!');
            } else {
                alert('Erro ao criar categoria');
            }
        }
    });
    
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        abrirModal('categoryModal');
    });
    
    // ========== FORMULÁRIO TRANSAÇÃO ==========
    document.getElementById('transactionForm')?.addEventListener('submit', async (e) => {
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
        
        if (tipo === 'expense') {
            sucesso = await criarDespesa(valor, descricao, categoriaId);
        } else if (tipo === 'income') {
            sucesso = await criarReceita(valor, descricao, categoriaId);
        }
        
        if (sucesso) {
            fecharModal('transactionModal');
        } else {
            alert('Erro ao salvar transação');
        }
    });
    
    document.getElementById('addDespesaBtn')?.addEventListener('click', () => {
        addTransaction('expense');
    });
    
    document.getElementById('addReceitaBtn')?.addEventListener('click', () => {
        addTransaction('income');
    });
    
    // ========== BOTÕES FECHAR MODAL ==========
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
    
    // ========== MENU RESPONSIVO ==========
    document.getElementById('openBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').style.left = '0';
    });
    
    document.getElementById('closeBtn')?.addEventListener('click', () => {
        document.getElementById('sidebar').style.left = '-250px';
    });
    
    // ========== TOGGLE SUBMENU ==========
    document.getElementById('toggleUserMenu')?.addEventListener('click', (e) => {
        e.preventDefault();
        const submenu = document.getElementById('userSubmenu');
        if (submenu) {
            submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
        }
    });
    
    // ========== RELATÓRIOS ==========
    document.getElementById('periodoRelatorio')?.addEventListener('change', function() {
        const filtroPersonalizado = document.getElementById('filtroDataPersonalizada');
        if (filtroPersonalizado) {
            filtroPersonalizado.style.display = this.value === 'personalizado' ? 'block' : 'none';
        }
    });
    
    document.getElementById('aplicarFiltros')?.addEventListener('click', async () => {
        // Usar função de relatórios do código anterior para compatibilidade
        if (typeof aplicarFiltrosRelatorio === 'function') {
            aplicarFiltrosRelatorio();
        } else {
            await carregarRelatorios();
        }
    });
    
    document.getElementById('gerarRelatorioBtn')?.addEventListener('click', () => {
        if (typeof exportarRelatorioPDF === 'function') {
            exportarRelatorioPDF();
        } else {
            alert('Funcionalidade de exportação PDF será implementada em breve!');
        }
    });
    
    // ========== MOSTRAR DASHBOARD INICIAL ==========
    mostrarPagina('page-dashboard');
    
    // ========== INICIALIZAR DATAS ==========
    const hoje = new Date().toISOString().split('T')[0];
    if (document.getElementById('transactionDate')) {
        document.getElementById('transactionDate').value = hoje;
    }
    
    // Configurar datas mínimas/máximas para relatórios
    if (document.getElementById('dataInicio')) {
        document.getElementById('dataInicio').max = hoje;
        document.getElementById('dataFim').max = hoje;
        document.getElementById('dataFim').min = document.getElementById('dataInicio').value;
    }
});

// ===========================================
// || FUNÇÕES DE RELATÓRIOS (do código anterior)
// ===========================================
// Estas funções são mantidas para compatibilidade
function aplicarFiltrosRelatorio() {
    // Implementação do código anterior
    if (typeof window.aplicarFiltrosRelatorioOriginal === 'function') {
        window.aplicarFiltrosRelatorioOriginal();
    }
}

function exportarRelatorioPDF() {
    // Implementação do código anterior
    if (typeof window.exportarRelatorioPDFOriginal === 'function') {
        window.exportarRelatorioPDFOriginal();
    } else {
        alert('Exportação PDF em desenvolvimento');
    }
}

// Salvar referências às funções originais se existirem
if (typeof aplicarFiltrosRelatorio === 'function') {
    window.aplicarFiltrosRelatorioOriginal = aplicarFiltrosRelatorio;
}

if (typeof exportarRelatorioPDF === 'function') {
    window.exportarRelatorioPDFOriginal = exportarRelatorioPDF;
}