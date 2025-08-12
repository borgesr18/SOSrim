// Main Application Module
class FinancialDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.tables = {};
        this.currentPage = {};
        this.itemsPerPage = 10;
    }

    // Inicializar aplicação
    async init() {
        try {
            // Carregar dados
            const dataLoaded = await dataManager.loadData();
            if (!dataLoaded) {
                throw new Error('Falha ao carregar dados');
            }

            // Configurar interface
            this.setupEventListeners();
            this.updateCurrentDate();
            this.updateMetrics();
            this.populateTables();
            
            // Inicializar gráficos
            chartsManager.initializeCharts();
            
            this.isInitialized = true;
            showNotification('Dashboard carregado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao inicializar dashboard', 'error');
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegação
        this.setupNavigation();
        
        // Menu mobile
        this.setupMobileMenu();
        
        // Filtros e busca
        this.setupFilters();
        
        // Botões de exportação
        this.setupExportButtons();
        
        // Links rápidos
        this.setupQuickLinks();
    }

    // Configurar navegação
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(link);
            });
        });
    }

    // Configurar menu mobile
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }

    // Configurar filtros
    setupFilters() {
        // Busca em contas em atraso
        const searchAtraso = document.getElementById('searchAtraso');
        const filterMes = document.getElementById('filterMes');
        
        if (searchAtraso) {
            searchAtraso.addEventListener('input', (e) => {
                this.filterContasAtraso(e.target.value, filterMes?.value || '');
            });
        }
        
        if (filterMes) {
            filterMes.addEventListener('change', (e) => {
                this.filterContasAtraso(searchAtraso?.value || '', e.target.value);
            });
        }
    }

    // Configurar botões de exportação
    setupExportButtons() {
        const exportButtons = document.querySelectorAll('[data-export]');
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const exportType = button.getAttribute('data-export');
                this.exportData(exportType);
            });
        });
    }

    // Configurar links rápidos
    setupQuickLinks() {
        const quickLinks = document.querySelectorAll('.quick-link');
        quickLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = link.getAttribute('href').substring(1);
                this.showSection(targetSection);
                this.updateActiveNavLink(document.querySelector(`[href="#${targetSection}"]`));
            });
        });
    }

    // Mostrar seção específica
    showSection(sectionId) {
        // Ocultar todas as seções
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar seção alvo
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            // Redimensionar gráficos se necessário
            setTimeout(() => {
                chartsManager.resizeCharts();
            }, 100);
        }
    }

    // Atualizar link ativo na navegação
    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Atualizar data atual
    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            dateElement.textContent = now.toLocaleDateString('pt-BR', options);
        }
    }

    // Atualizar métricas do dashboard
    updateMetrics() {
        const metricas = dataManager.getMetricas();
        
        // Total Geral
        const totalGeralElement = document.getElementById('totalGeral');
        if (totalGeralElement) {
            totalGeralElement.textContent = formatCurrency(metricas.totalGeral);
        }

        // Contas em Atraso
        const contasAtrasoElement = document.getElementById('contasAtraso');
        if (contasAtrasoElement) {
            contasAtrasoElement.textContent = metricas.contasAtraso.toLocaleString('pt-BR');
        }

        // Pagamentos Julho
        const pagamentosJulhoElement = document.getElementById('pagamentosJulho');
        if (pagamentosJulhoElement) {
            pagamentosJulhoElement.textContent = metricas.pagamentosJulho.toLocaleString('pt-BR');
        }

        // Acordos Ativos
        const acordosAtivosElement = document.getElementById('acordosAtivos');
        if (acordosAtivosElement) {
            acordosAtivosElement.textContent = metricas.acordosAtivos.toLocaleString('pt-BR');
        }
    }

    // Popular tabelas
    populateTables() {
        this.populateContasAtrasoTable();
        this.populatePagamentosJulhoTable();
        this.populateAcordosTable();
    }

    // Popular tabela de contas em atraso
    populateContasAtrasoTable() {
        const tbody = document.getElementById('tableAtrasoBBody');
        if (!tbody) return;

        const contas = dataManager.getContasAtraso();
        this.renderTable(tbody, contas, 'atraso');
        this.setupPagination('atraso', contas.length);
    }

    // Popular tabela de pagamentos de julho
    populatePagamentosJulhoTable() {
        const tbody = document.getElementById('tableJulhoBody');
        if (!tbody) return;

        const pagamentos = dataManager.getPagamentosJulho();
        this.renderTable(tbody, pagamentos, 'julho');
        
        // Atualizar resumo de julho
        this.updateJulhoSummary(pagamentos);
    }

    // Popular tabela de acordos
    populateAcordosTable() {
        const tbody = document.getElementById('tableAcordosBody');
        if (!tbody) return;

        const acordos = dataManager.getAcordosFornecedores();
        this.renderTable(tbody, acordos, 'acordos');
    }

    // Renderizar tabela genérica
    renderTable(tbody, data, tableType) {
        if (!tbody || !data) return;

        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage[tableType] || 0) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = this.generateTableRow(item, tableType, startIndex + index);
            tbody.appendChild(row);
        });

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">Nenhum dado encontrado</td>';
            tbody.appendChild(row);
        }
    }

    // Gerar linha da tabela
    generateTableRow(item, tableType, index) {
        switch (tableType) {
            case 'atraso':
                return this.generateContasAtrasoRow(item, index);
            case 'julho':
                return this.generatePagamentosJulhoRow(item, index);
            case 'acordos':
                return this.generateAcordosRow(item, index);
            default:
                return '<td colspan="5">Tipo de tabela não reconhecido</td>';
        }
    }

    // Gerar linha para contas em atraso
    generateContasAtrasoRow(item, index) {
        const descricao = this.extractDescription(item);
        const valor = this.extractValue(item);
        const vencimento = this.extractDate(item);
        const status = this.determineStatus(item);

        return `
            <td>${descricao}</td>
            <td class="text-right">${formatCurrency(valor)}</td>
            <td>${formatDate(vencimento)}</td>
            <td><span class="status-badge status-${status.class}">${status.text}</span></td>
            <td>
                <button class="btn-secondary btn-sm" onclick="dashboard.viewDetails('atraso', ${index})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
    }

    // Gerar linha para pagamentos de julho
    generatePagamentosJulhoRow(item, index) {
        const data = this.extractDate(item);
        const descricao = this.extractDescription(item);
        const tipo = this.extractType(item);
        const valor = this.extractValue(item);
        const status = this.determineStatus(item);

        return `
            <td>${formatDate(data)}</td>
            <td>${descricao}</td>
            <td><span class="type-badge type-${tipo.class}">${tipo.text}</span></td>
            <td class="text-right">${formatCurrency(valor)}</td>
            <td><span class="status-badge status-${status.class}">${status.text}</span></td>
        `;
    }

    // Gerar linha para acordos
    generateAcordosRow(item, index) {
        const fornecedor = this.extractSupplier(item);
        const valorTotal = this.extractValue(item);
        const parcelas = this.extractInstallments(item);
        const proximoVencimento = this.extractNextDue(item);
        const status = this.determineStatus(item);

        return `
            <td>${fornecedor}</td>
            <td class="text-right">${formatCurrency(valorTotal)}</td>
            <td>${parcelas}</td>
            <td>${formatDate(proximoVencimento)}</td>
            <td><span class="status-badge status-${status.class}">${status.text}</span></td>
        `;
    }

    // Métodos auxiliares para extrair dados
    extractDescription(item) {
        // Procurar por campos que possam conter descrição
        for (const [key, value] of Object.entries(item)) {
            if (value && typeof value === 'string' && value.length > 5 && !key.includes('col_0')) {
                return value;
            }
        }
        return 'Descrição não disponível';
    }

    extractValue(item) {
        // Procurar por valores numéricos
        for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'number' && value > 0) {
                return value;
            }
        }
        return 0;
    }

    extractDate(item) {
        // Procurar por datas
        for (const [key, value] of Object.entries(item)) {
            if (value && typeof value === 'string' && value.includes('2025')) {
                return value;
            }
        }
        return null;
    }

    extractType(item) {
        const desc = this.extractDescription(item).toLowerCase();
        if (desc.includes('entrada')) {
            return { text: 'Entrada', class: 'entrada' };
        } else if (desc.includes('saída') || desc.includes('pagamento')) {
            return { text: 'Saída', class: 'saida' };
        }
        return { text: 'Outros', class: 'outros' };
    }

    extractSupplier(item) {
        // Procurar por nome do fornecedor
        for (const [key, value] of Object.entries(item)) {
            if (value && typeof value === 'string' && value.length > 3 && !value.includes('2025')) {
                return value;
            }
        }
        return 'Fornecedor não identificado';
    }

    extractInstallments(item) {
        // Procurar por informações de parcelas
        for (const [key, value] of Object.entries(item)) {
            if (value && typeof value === 'string' && value.toLowerCase().includes('parc')) {
                return value;
            }
        }
        return 'N/A';
    }

    extractNextDue(item) {
        return this.extractDate(item);
    }

    determineStatus(item) {
        const desc = this.extractDescription(item).toLowerCase();
        if (desc.includes('pago') || desc.includes('quitado')) {
            return { text: 'Pago', class: 'pago' };
        } else if (desc.includes('atraso') || desc.includes('vencido')) {
            return { text: 'Em Atraso', class: 'atraso' };
        } else if (desc.includes('pendente')) {
            return { text: 'Pendente', class: 'pendente' };
        }
        return { text: 'Em Dia', class: 'em-dia' };
    }

    // Configurar paginação
    setupPagination(tableType, totalItems) {
        const paginationContainer = document.getElementById(`pagination${tableType.charAt(0).toUpperCase() + tableType.slice(1)}`);
        if (!paginationContainer) return;

        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const currentPage = this.currentPage[tableType] || 0;

        let paginationHTML = '';
        
        // Botão anterior
        paginationHTML += `
            <button ${currentPage === 0 ? 'disabled' : ''} onclick="dashboard.changePage('${tableType}', ${currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        // Números das páginas
        for (let i = 0; i < totalPages; i++) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="dashboard.changePage('${tableType}', ${i})">
                    ${i + 1}
                </button>
            `;
        }

        // Botão próximo
        paginationHTML += `
            <button ${currentPage === totalPages - 1 ? 'disabled' : ''} onclick="dashboard.changePage('${tableType}', ${currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    // Mudar página
    changePage(tableType, page) {
        this.currentPage[tableType] = page;
        
        switch (tableType) {
            case 'atraso':
                this.populateContasAtrasoTable();
                break;
            case 'julho':
                this.populatePagamentosJulhoTable();
                break;
            case 'acordos':
                this.populateAcordosTable();
                break;
        }
    }

    // Filtrar contas em atraso
    filterContasAtraso(searchTerm, mes) {
        const filteredData = dataManager.filterContasAtraso(searchTerm, mes);
        const tbody = document.getElementById('tableAtrasoBBody');
        this.currentPage.atraso = 0; // Reset para primeira página
        this.renderTable(tbody, filteredData, 'atraso');
        this.setupPagination('atraso', filteredData.length);
    }

    // Atualizar resumo de julho
    updateJulhoSummary(pagamentos) {
        const valores = dataManager.extractNumericValues(pagamentos);
        const entradas = valores.filter(v => v > 0);
        const saidas = valores.filter(v => v < 0);

        const totalEntradas = entradas.reduce((sum, val) => sum + val, 0);
        const totalSaidas = Math.abs(saidas.reduce((sum, val) => sum + val, 0));
        const saldo = totalEntradas - totalSaidas;

        const entradasElement = document.getElementById('entradasJulho');
        const saidasElement = document.getElementById('saidasJulho');
        const saldoElement = document.getElementById('saldoJulho');

        if (entradasElement) entradasElement.textContent = formatCurrency(totalEntradas);
        if (saidasElement) saidasElement.textContent = formatCurrency(totalSaidas);
        if (saldoElement) {
            saldoElement.textContent = formatCurrency(saldo);
            saldoElement.className = `summary-value ${saldo >= 0 ? 'positive' : 'negative'}`;
        }
    }

    // Ver detalhes
    viewDetails(type, index) {
        showNotification(`Visualizando detalhes do item ${index + 1}`, 'info');
        // Aqui você pode implementar um modal ou página de detalhes
    }

    // Exportar dados
    exportData(type) {
        let data = [];
        let filename = '';

        switch (type) {
            case 'excel':
                data = dataManager.getContasAtraso();
                filename = 'contas_atraso.csv';
                break;
            case 'pdf':
                showNotification('Exportação PDF em desenvolvimento', 'info');
                return;
            case 'csv':
                data = dataManager.getPagamentosJulho();
                filename = 'pagamentos_julho.csv';
                break;
        }

        if (data.length > 0) {
            dataManager.exportToCSV(data, filename);
            showNotification('Dados exportados com sucesso!', 'success');
        } else {
            showNotification('Nenhum dado para exportar', 'warning');
        }
    }
}

// Instância global do dashboard
const dashboard = new FinancialDashboard();

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    dashboard.init();
});

// Exportar para uso global
window.dashboard = dashboard;

