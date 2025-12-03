
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
    const saveCategoryBtn = document.getElementById('saveCategoryBtn');
    
    // Elementos do Modal de Transação
    const transactionDate = document.getElementById('transactionDate');
    const transactionDescription = document.getElementById('transactionDescription');
    const transactionValue = document.getElementById('transactionValue');
    const transactionId = document.getElementById('transactionId');

    // --- Funções de Ajuda ---

    /**
     * Fecha um modal específico.
     * @param {string} modalId - O ID do elemento modal.
     */
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.classList.remove('modal-open');
        // Reset forms
        if (modalId === 'transactionModal') transactionForm.reset();
        if (modalId === 'categoryModal') categoryForm.reset();
        document.getElementById('loginpopup').style.display = 'none';
        document.getElementById('registerpopup').style.display = 'none';
    }

    /**
     * Abre um modal específico.
     * @param {string} modalId - O ID do elemento modal.
     */
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
        document.body.classList.add('modal-open');
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
        if (activeNav) {
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
        
        // Fecha o menu lateral em telas menores após a navegação (se estiver aberto)
        if (window.innerWidth <= 768) { 
             sidebar.style.width = '0';
             mainContent.style.marginLeft = '0';
             document.getElementById('openBtn').style.display = 'block';
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

        document.getElementById('dashboardSaldo').textContent = saldo.toFixed(2) + ' €';
        document.getElementById('dashboardReceitas').textContent = incomeTotal.toFixed(2) + ' €';
        document.getElementById('dashboardDespesas').textContent = expenseTotal.toFixed(2) + ' €';

        // Renderiza as últimas transações
        const lastTransactionsBody = document.getElementById('lastTransactionsBody');
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

        document.getElementById(totalId).textContent = totalValue.toFixed(2) + ' €';
        document.getElementById(countId).textContent = filteredTransactions.length.toString();
        document.getElementById(maxId).textContent = maxValue.toFixed(2) + ' €';

        renderDashboard(); 
    }

   
    function renderCategories() {
        const expenseCategoriesList = document.getElementById('expenseCategoriesList');
        const incomeCategoriesList = document.getElementById('incomeCategoriesList');
        
        expenseCategoriesList.innerHTML = '';
        incomeCategoriesList.innerHTML = '';

        const expenseCategories = categories.filter(c => c.type === 'expense');
        const incomeCategories = categories.filter(c => c.type === 'income');
        const allCategoriesCount = categories.length;

        document.getElementById('totalCategoriesCount').textContent = allCategoriesCount.toString();
        document.getElementById('expenseCategoriesCount').textContent = expenseCategories.length.toString();
        document.getElementById('incomeCategoriesCount').textContent = incomeCategories.length.toString();

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

        expenseCategories.forEach(c => expenseCategoriesList.appendChild(createCategoryListItem(c)));
        incomeCategories.forEach(c => incomeCategoriesList.appendChild(createCategoryListItem(c)));
    }

    // --- Lógica de Transações (CRUD) ---

    
    function populateCategorySelect(type) {
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
        transactionModalTitle.textContent = type === 'expense' ? 'Nova Despesa' : 'Nova Receita';
        transactionTypeHidden.value = type;
        transactionId.value = ''; // Novo
        transactionForm.reset();
        populateCategorySelect(type);
        openModal('transactionModal');
    }

   
    window.editTransaction = function(id, type) {
        const t = transactions.find(t => t.id === id);
        if (!t) return;

        transactionModalTitle.textContent = type === 'expense' ? 'Editar Despesa' : 'Editar Receita';
        transactionTypeHidden.value = type;
        transactionId.value = t.id;

        // Preencher o formulário
        transactionDate.value = t.date;
        transactionDescription.value = t.description;
        transactionValue.value = t.value;
        populateCategorySelect(type);
        // Seleciona a categoria correta
        transactionCategorySelect.value = t.categoryId;

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
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = transactionId.value ? parseInt(transactionId.value) : null;
        const type = transactionTypeHidden.value;
        const categoryId = parseInt(transactionCategorySelect.value);
        const category = categories.find(c => c.id === categoryId)?.name || 'Sem Categoria';

        const newTransaction = {
            id: id || nextTransactionId,
            date: transactionDate.value,
            description: transactionDescription.value,
            value: parseFloat(transactionValue.value),
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

    // Event Listeners para botões "Nova Despesa" e "Nova Receita"
    document.getElementById('addDespesaBtn')?.addEventListener('click', () => addTransaction('expense'));
    document.getElementById('addReceitaBtn')?.addEventListener('click', () => addTransaction('income'));

    // --- Lógica de Categorias (CRUD) ---

    /**
     * Abre o modal de categoria para adicionar uma nova.
     */
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
        document.getElementById('categoryModalTitle').textContent = 'Nova Categoria';
        categoryIdInput.value = '';
        categoryForm.reset();
        openModal('categoryModal');
    });

    
    window.editCategory = function(id) {
        const c = categories.find(c => c.id === id);
        if (!c) return;

        document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
        categoryIdInput.value = c.id;
        categoryNameInput.value = c.name;
        categoryTypeInput.value = c.type;
        categoryColorInput.value = c.color;

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
    categoryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = categoryIdInput.value ? parseInt(categoryIdInput.value) : null;
        const newCategory = {
            id: id || nextCategoryId,
            name: categoryNameInput.value,
            type: categoryTypeInput.value,
            color: categoryColorInput.value
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

    // --- Lógica de UI/Sidebar (Adaptada) ---

    // Inicializa o dashboard e a navegação
    document.addEventListener('DOMContentLoaded', () => {
        showPage('page-dashboard', 'dashboardLink');
        
        // Oculta/Mostra o submenu do Utilizador
        const userSubmenu = document.getElementById('userSubmenu');
        document.getElementById('toggleUserMenu')?.addEventListener('click', (e) => {
            e.preventDefault();
            userSubmenu.style.display = userSubmenu.style.display === 'block' ? 'none' : 'block';
        });

        // Eventos para popups Login/Register
        document.getElementById('loginLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            userSubmenu.style.display = 'none';
            openModal('loginpopup');
        });
        document.getElementById('registerLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            userSubmenu.style.display = 'none';
            openModal('registerpopup');
        });

        // Lógica de toggle da sidebar para telas pequenas (se for o caso)
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('main-content');
        const openBtn = document.getElementById('openBtn');
        const closeBtn = document.getElementById('closeBtn');

        // Função de toggle da sidebar
        function toggleSidebar() {
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

        // Listener para o botão de abrir/fechar
        openBtn?.addEventListener('click', toggleSidebar);
        closeBtn?.addEventListener('click', toggleSidebar);

        // Adaptação da Sidebar ao redimensionamento da janela (simulação básica de media query em JS)
        function handleResize() {
            if (window.innerWidth > 768) {
                sidebar.style.width = '250px';
                mainContent.style.marginLeft = '250px';
                openBtn.style.display = 'none';
                closeBtn.style.display = 'none';
            } else {
                if (sidebar.style.width === '250px') {
                   // Se a sidebar estiver aberta em tela pequena, mantém-na aberta
                   openBtn.style.display = 'none';
                   closeBtn.style.display = 'block';
                } else {
                   // Se estiver fechada ou no carregamento, mostra o botão de abrir
                   sidebar.style.width = '0';
                   mainContent.style.marginLeft = '0';
                   openBtn.style.display = 'block';
                   closeBtn.style.display = 'none';
                }
            }
        }
        window.addEventListener('resize', handleResize);
        handleResize(); // Executa na inicialização
    });