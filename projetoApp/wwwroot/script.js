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

// --- Usuários (armazenamento local) ---
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// --- Elementos DOM ---
const transactionModal = document.getElementById('transactionModal');
const transactionForm = document.getElementById('transactionForm');
const transactionCategorySelect = document.getElementById('transactionCategory');
const transactionModalTitle = document.getElementById('transactionModalTitle');
const transactionTypeHidden = document.getElementById('transactionTypeHidden');
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const categoryNameInput = document.getElementById('categoryName');
const categoryTypeInput = document.getElementById('categoryType');
const categoryColorInput = document.getElementById('categoryColor');
const categoryIdInput = document.getElementById('categoryId');

// Elementos do Modal de Transação
const transactionDate = document.getElementById('transactionDate');
const transactionDescription = document.getElementById('transactionDescription');
const transactionValue = document.getElementById('transactionValue');
const transactionId = document.getElementById('transactionId');

// Elementos de Login/Registro
const loginForm = document.querySelector('#loginpopup form');
const registerForm = document.querySelector('#registerpopup form');
const userNameDisplay = document.getElementById('userName');
const userEmailDisplay = document.getElementById('userEmail');
const userAvatar = document.getElementById('userAvatar');

// Variáveis da sidebar
let sidebar, mainContent, openBtn, closeBtn;

// --- Funções de Ajuda ---

/**
 * Função segura para obter elemento por ID
 */
function getElementSafe(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento com ID "${id}" não encontrado`);
    }
    return element;
}

/**
 * Função segura para definir textContent
 */
function setTextSafe(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Fecha um modal específico.
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
    
    // Reset forms
    if (modalId === 'transactionModal' && transactionForm) transactionForm.reset();
    if (modalId === 'categoryModal' && categoryForm) categoryForm.reset();
    if (modalId === 'loginpopup' && loginForm) loginForm.reset();
    if (modalId === 'registerpopup' && registerForm) registerForm.reset();
}

/**
 * Abre um modal específico.
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

// Fecha popups (Login/Register)
document.querySelectorAll('.popup-overlay').forEach(popup => {
    popup.addEventListener('click', function(e) {
        if (e.target.classList.contains('popup-overlay')) {
            closeModal(popup.id);
        }
    });
});

// Fecha modals (Transaction/Category)
document.querySelectorAll('.closeModal').forEach(button => {
    button.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-modal');
        closeModal(modalId);
    });
});

// --- Lógica de Navegação ---

/**
 * Exibe a página de conteúdo e atualiza o estado da navegação.
 */
function showPage(pageId, navId) {
    // Oculta todas as páginas
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active-page');
    });

    // Mostra a página ativa
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.classList.add('active-page');

    // Remove a classe 'active' de todos os itens da nav
    document.querySelectorAll('.sidebar nav ul li').forEach(item => {
        item.classList.remove('active');
    });

    // Adiciona a classe 'active' ao item de navegação correto
    const activeNav = document.getElementById(navId);
    if (activeNav && activeNav.closest('li')) {
        activeNav.closest('li').classList.add('active');
    }

    // Renderiza o conteúdo da página
    if (pageId === 'page-dashboard') {
        renderDashboard();
    } else if (pageId === 'page-despesas') {
        renderTransactions('expense', 'despesasTableBody', 'totalDespesasMes', 'countDespesasMes', 'maiorDespesa');
    } else if (pageId === 'page-receitas') {
        renderTransactions('income', 'receitasTableBody', 'totalReceitasMes', 'countReceitasMes', 'maiorReceita');
    } else if (pageId === 'page-categorias') {
        renderCategories();
    }
    
    // Fecha o menu lateral em telas menores
    if (window.innerWidth <= 768 && sidebar) { 
        sidebar.style.width = '0';
        if (mainContent) mainContent.style.marginLeft = '0';
        if (openBtn) openBtn.style.display = 'block';
        if (closeBtn) closeBtn.style.display = 'none';
    }
}

// Configura os ouvintes de evento de navegação
document.getElementById('dashboardLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-dashboard', 'dashboardLink');
});
document.getElementById('despesasLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-despesas', 'despesasLink');
});
document.getElementById('receitasLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-receitas', 'receitasLink');
});
document.getElementById('categoryLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('page-categorias', 'categoryLink');
});

// --- Renderização de Dados ---

/**
 * Renderiza o Dashboard.
 */
function renderDashboard() {
    const expenseTotal = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.value, 0);
    const incomeTotal = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.value, 0);
    const saldo = incomeTotal - expenseTotal;

    setTextSafe('dashboardSaldo', saldo.toFixed(2) + ' €');
    setTextSafe('dashboardReceitas', incomeTotal.toFixed(2) + ' €');
    setTextSafe('dashboardDespesas', expenseTotal.toFixed(2) + ' €');

    // Renderiza as últimas transações
    const lastTransactionsBody = document.getElementById('lastTransactionsBody');
    if (lastTransactionsBody) {
        lastTransactionsBody.innerHTML = '';

        const recentTransactions = transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

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
            lastTransactionsBody.appendChild(tr);
        });
    }
}

function renderTransactions(type, tableBodyId, totalId, countId, maxId) {
    const filteredTransactions = transactions.filter(t => t.type === type);
    const tableBody = document.getElementById(tableBodyId);

    if (!tableBody) return;

    tableBody.innerHTML = '';

    let totalValue = 0;
    let maxValue = 0;

    filteredTransactions.forEach(t => {
        totalValue += t.value;
        if (t.value > maxValue) {
            maxValue = t.value;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.date}</td>
            <td>${t.description}</td>
            <td>${t.category}</td>
            <td>${t.value.toFixed(2)} €</td>
            <td class="action-btns">
                <button onclick="editTransaction(${t.id}, '${type}')"><i class="fas fa-edit"></i></button>
                <button onclick="deleteTransaction(${t.id}, '${type}')" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    setTextSafe(totalId, totalValue.toFixed(2) + ' €');
    setTextSafe(countId, filteredTransactions.length.toString());
    setTextSafe(maxId, maxValue.toFixed(2) + ' €');

    renderDashboard(); 
}

function renderCategories() {
    const expenseCategoriesList = document.getElementById('expenseCategoriesList');
    const incomeCategoriesList = document.getElementById('incomeCategoriesList');
    
    if (expenseCategoriesList) expenseCategoriesList.innerHTML = '';
    if (incomeCategoriesList) incomeCategoriesList.innerHTML = '';

    const expenseCategories = categories.filter(c => c.type === 'expense');
    const incomeCategories = categories.filter(c => c.type === 'income');
    const allCategoriesCount = categories.length;

    setTextSafe('totalCategoriesCount', allCategoriesCount.toString());
    setTextSafe('expenseCategoriesCount', expenseCategories.length.toString());
    setTextSafe('incomeCategoriesCount', incomeCategories.length.toString());

    function createCategoryListItem(category) {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px dotted #eee';
        li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${category.color};"></span>
                ${category.name}
            </div>
            <div class="action-btns">
                <button onclick="editCategory(${category.id})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteCategory(${category.id})" style="color: #f44336;"><i class="fas fa-trash"></i></button>
            </div>
        `;
        return li;
    }

    if (expenseCategoriesList) {
        expenseCategories.forEach(c => expenseCategoriesList.appendChild(createCategoryListItem(c)));
    }
    
    if (incomeCategoriesList) {
        incomeCategories.forEach(c => incomeCategoriesList.appendChild(createCategoryListItem(c)));
    }
}

// --- Lógica de Transações (CRUD) ---

function populateCategorySelect(type) {
    if (!transactionCategorySelect) return;
    
    transactionCategorySelect.innerHTML = '';
    const filteredCategories = categories.filter(c => c.type === type);

    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        option.style.color = category.color; 
        transactionCategorySelect.appendChild(option);
    });
}

window.addTransaction = function(type) {
    if (!currentUser) {
        alert('Por favor, faça login primeiro!');
        openModal('loginpopup');
        return;
    }
    
    if (transactionModalTitle) {
        transactionModalTitle.textContent = type === 'expense' ? 'Nova Despesa' : 'Nova Receita';
    }
    
    if (transactionTypeHidden) transactionTypeHidden.value = type;
    if (transactionId) transactionId.value = '';
    if (transactionForm) transactionForm.reset();
    populateCategorySelect(type);
    openModal('transactionModal');
}

window.editTransaction = function(id, type) {
    const t = transactions.find(t => t.id === id);
    if (!t) return;

    if (transactionModalTitle) {
        transactionModalTitle.textContent = type === 'expense' ? 'Editar Despesa' : 'Editar Receita';
    }
    
    if (transactionTypeHidden) transactionTypeHidden.value = type;
    if (transactionId) transactionId.value = t.id;

    // Preencher o formulário
    if (transactionDate) transactionDate.value = t.date;
    if (transactionDescription) transactionDescription.value = t.description;
    if (transactionValue) transactionValue.value = t.value;
    populateCategorySelect(type);
    // Seleciona a categoria correta
    if (transactionCategorySelect) transactionCategorySelect.value = t.categoryId;

    openModal('transactionModal');
}

window.deleteTransaction = function(id, type) {
    if (confirm('Tem certeza que deseja eliminar esta transação?')) {
        const index = transactions.findIndex(t => t.id === id);
        if (index > -1) {
            transactions.splice(index, 1);
            // Re-renderiza a página correta
            showPage(type === 'expense' ? 'page-despesas' : 'page-receitas', type === 'expense' ? 'despesasLink' : 'receitasLink');
        }
    }
}

// Ouvinte para o formulário de Transação
if (transactionForm) {
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = transactionId && transactionId.value ? parseInt(transactionId.value) : null;
        const type = transactionTypeHidden ? transactionTypeHidden.value : '';
        const categoryId = transactionCategorySelect ? parseInt(transactionCategorySelect.value) : 0;
        const category = categories.find(c => c.id === categoryId)?.name || 'Sem Categoria';

        const newTransaction = {
            id: id || nextTransactionId,
            date: transactionDate ? transactionDate.value : '',
            description: transactionDescription ? transactionDescription.value : '',
            value: transactionValue ? parseFloat(transactionValue.value) : 0,
            type: type,
            category: category,
            categoryId: categoryId 
        };

        if (id) {
            // Edição
            const index = transactions.findIndex(t => t.id === id);
            if (index > -1) {
                transactions[index] = newTransaction;
            }
        } else {
            // Nova Transação
            transactions.push(newTransaction);
            nextTransactionId++;
        }

        closeModal('transactionModal');
        // Re-renderiza a página correta
        showPage(type === 'expense' ? 'page-despesas' : 'page-receitas', type === 'expense' ? 'despesasLink' : 'receitasLink');
    });
}

// Event Listeners para botões "Nova Despesa" e "Nova Receita"
document.getElementById('addDespesaBtn')?.addEventListener('click', () => addTransaction('expense'));
document.getElementById('addReceitaBtn')?.addEventListener('click', () => addTransaction('income'));

// --- Lógica de Categorias (CRUD) ---

/**
 * Abre o modal de categoria para adicionar uma nova.
 */
document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
    if (!currentUser) {
        alert('Por favor, faça login primeiro!');
        openModal('loginpopup');
        return;
    }
    
    setTextSafe('categoryModalTitle', 'Nova Categoria');
    if (categoryIdInput) categoryIdInput.value = '';
    if (categoryForm) categoryForm.reset();
    openModal('categoryModal');
});

window.editCategory = function(id) {
    const c = categories.find(c => c.id === id);
    if (!c) return;

    setTextSafe('categoryModalTitle', 'Editar Categoria');
    if (categoryIdInput) categoryIdInput.value = c.id;
    if (categoryNameInput) categoryNameInput.value = c.name;
    if (categoryTypeInput) categoryTypeInput.value = c.type;
    if (categoryColorInput) categoryColorInput.value = c.color;

    openModal('categoryModal');
}

window.deleteCategory = function(id) {
    if (transactions.some(t => t.categoryId === id)) {
        alert('Não é possível eliminar esta categoria porque existem transações associadas.');
        return;
    }

    if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
        const index = categories.findIndex(c => c.id === id);
        if (index > -1) {
            categories.splice(index, 1);
            // Re-renderiza a página de categorias
            renderCategories();
        }
    }
}

// Ouvinte para o formulário de Categoria
if (categoryForm) {
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = categoryIdInput && categoryIdInput.value ? parseInt(categoryIdInput.value) : null;
        const newCategory = {
            id: id || nextCategoryId,
            name: categoryNameInput ? categoryNameInput.value : '',
            type: categoryTypeInput ? categoryTypeInput.value : 'expense',
            color: categoryColorInput ? categoryColorInput.value : '#6a1b9a'
        };

        if (id) {
            // Edição
            const index = categories.findIndex(c => c.id === id);
            if (index > -1) {
                categories[index] = newCategory;
            }
        } else {
            // Nova Categoria
            categories.push(newCategory);
            nextCategoryId++;
        }

        closeModal('categoryModal');
        renderCategories();
    });
}

// --- Lógica de Login/Registro ---

/**
 * Atualiza a interface com as informações do usuário logado
 */
function updateUserInterface() {
    if (currentUser) {
        // Mostrar nome e email do usuário
        setTextSafe('userName', currentUser.name);
        setTextSafe('userEmail', currentUser.email);
        
        // Iniciais para o avatar
        const initials = currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        if (userAvatar) userAvatar.textContent = initials;
        
        // Atualizar o submenu
        const userSubmenu = document.getElementById('userSubmenu');
        if (userSubmenu) {
            userSubmenu.innerHTML = `
                <a id="logoutLink">Logout</a>
                <a id="profileLink">Perfil</a>
            `;
            
            // Adicionar evento de logout
            document.getElementById('logoutLink')?.addEventListener('click', logout);
        }
        
    } else {
        // Usuário não logado
        setTextSafe('userName', 'Convidado');
        setTextSafe('userEmail', '');
        if (userAvatar) userAvatar.textContent = '?';
        
        const userSubmenu = document.getElementById('userSubmenu');
        if (userSubmenu) {
            userSubmenu.innerHTML = `
                <a id="loginLink">Login</a>
                <a id="registerLink">Criar Conta</a>
            `;
        }
    }
}

/**
 * Login do usuário
 */
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserInterface();
        closeModal('loginpopup');
        alert(`Bem-vindo de volta, ${user.name}!`);
        showPage('page-dashboard', 'dashboardLink');
    } else {
        // Tenta encontrar o elemento de erro correto
        const errorElement = document.getElementById('loginName-error') || 
                             document.getElementById('loginEmail-error') ||
                             document.getElementById('loginPassword-error');
        if (errorElement) {
            errorElement.textContent = 'Email ou senha incorretos!';
        }
    }
}

/**
 * Registro de novo usuário
 */
function register(name, email, password, confirmPassword) {
    // Validações
    if (password !== confirmPassword) {
        setTextSafe('registerConfirmPassword-error', 'As senhas não coincidem!');
        return;
    }
    
    if (password.length < 6) {
        setTextSafe('registerPassword-error', 'A senha deve ter pelo menos 6 caracteres!');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        setTextSafe('registerEmail-error', 'Este email já está registado!');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    updateUserInterface();
    closeModal('registerpopup');
    alert(`Conta criada com sucesso, ${name}!`);
    showPage('page-dashboard', 'dashboardLink');
}

/**
 * Logout do usuário
 */
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUserInterface();
        alert('Até breve!');
        showPage('page-dashboard', 'dashboardLink');
    }
}

// Event Listeners para formulários de login/registro (CORRIGIDO)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Buscar email do campo correto
        let emailInput = document.getElementById('loginEmail');
        if (!emailInput) {
            // Fallback para o campo antigo
            emailInput = document.getElementById('loginName');
        }
        
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            alert('Erro no formulário. Por favor, recarregue a página.');
            return;
        }
        
        const email = emailInput.value;
        const password = passwordInput.value;
        
        // Limpar erros anteriores
        const errorIds = ['loginEmail-error', 'loginName-error', 'loginPassword-error'];
        errorIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });
        
        if (!email || !password) {
            setTextSafe('loginPassword-error', 'Preencha todos os campos!');
            return;
        }
        
        login(email, password);
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obter valores de forma segura
        const getValue = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };
        
        const name = getValue('registerName');
        const email = getValue('registerEmail');
        const password = getValue('registerPassword');
        const confirmPassword = getValue('registerConfirmPassword');
        
        // Limpar todos os erros
        const errorIds = [
            'registerName-error',
            'registerEmail-error',
            'registerPassword-error',
            'registerConfirmPassword-error'
        ];
        
        errorIds.forEach(id => {
            const errorEl = document.getElementById(id);
            if (errorEl) errorEl.textContent = '';
        });
        
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            setTextSafe('registerConfirmPassword-error', 'Preencha todos os campos!');
            return;
        }
        
        if (password !== confirmPassword) {
            setTextSafe('registerConfirmPassword-error', 'As senhas não coincidem!');
            return;
        }
        
        if (password.length < 6) {
            setTextSafe('registerPassword-error', 'A senha deve ter pelo menos 6 caracteres!');
            return;
        }
        
        register(name, email, password, confirmPassword);
    });
}

// --- Lógica de UI/Sidebar ---

// Inicializa o dashboard e a navegação
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar variáveis da sidebar
    sidebar = document.getElementById('sidebar');
    mainContent = document.getElementById('main-content');
    openBtn = document.getElementById('openBtn');
    closeBtn = document.getElementById('closeBtn');
    
    // Atualiza interface do usuário
    updateUserInterface();
    
    // Mostra dashboard inicial
    showPage('page-dashboard', 'dashboardLink');
    
    // Oculta/Mostra o submenu do Utilizador
    const toggleUserMenu = document.getElementById('toggleUserMenu');
    const userSubmenu = document.getElementById('userSubmenu');
    
    if (toggleUserMenu && userSubmenu) {
        toggleUserMenu.addEventListener('click', (e) => {
            e.preventDefault();
            userSubmenu.style.display = userSubmenu.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Eventos para popups Login/Register
    document.addEventListener('click', (e) => {
        if (e.target.id === 'loginLink' && !currentUser) {
            e.preventDefault();
            if (userSubmenu) userSubmenu.style.display = 'none';
            openModal('loginpopup');
        }
        
        if (e.target.id === 'registerLink' && !currentUser) {
            e.preventDefault();
            if (userSubmenu) userSubmenu.style.display = 'none';
            openModal('registerpopup');
        }
        
        // Alternar entre login e registro
        if (e.target.id === 'goToLogin') {
            e.preventDefault();
            closeModal('registerpopup');
            openModal('loginpopup');
        }
        
        if (e.target.id === 'goToRegister') {
            e.preventDefault();
            closeModal('loginpopup');
            openModal('registerpopup');
        }
    });

    // Função de toggle da sidebar
    function toggleSidebar() {
        if (sidebar && mainContent && openBtn && closeBtn) {
            if (sidebar.style.width === '250px') {
                sidebar.style.width = '0';
                mainContent.style.marginLeft = '0';
                openBtn.style.display = 'block';
                closeBtn.style.display = 'none';
            } else {
                sidebar.style.width = '250px';
                mainContent.style.marginLeft = '250px';
                openBtn.style.display = 'none';
                closeBtn.style.display = 'block';
            }
        }
    }

    // Listener para o botão de abrir/fechar
    if (openBtn) openBtn.addEventListener('click', toggleSidebar);
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

    // Adaptação da Sidebar ao redimensionamento da janela
    function handleResize() {
        if (!sidebar || !mainContent || !openBtn || !closeBtn) return;
        
        if (window.innerWidth > 768) {
            sidebar.style.width = '250px';
            mainContent.style.marginLeft = '250px';
            openBtn.style.display = 'none';
            closeBtn.style.display = 'none';
        } else {
            if (sidebar.style.width === '250px') {
                openBtn.style.display = 'none';
                closeBtn.style.display = 'block';
            } else {
                sidebar.style.width = '0';
                mainContent.style.marginLeft = '0';
                openBtn.style.display = 'block';
                closeBtn.style.display = 'none';
            }
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Executa na inicialização
    
    // Definir data atual no formulário de transações
    const today = new Date().toISOString().split('T')[0];
    if (transactionDate) {
        transactionDate.value = today;
        transactionDate.min = '2000-01-01';
        transactionDate.max = today;
    }
});