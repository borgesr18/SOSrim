// Main Application Module - Versão Atualizada
class FinancialDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.isInitialized = false;
        this.tables = {};
        this.currentPage = {};
        this.itemsPerPage = 15; // Aumentado para mostrar mais dados
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
            this.updateMetricsWithCompleteData();
            this.populateTablesWithCompleteData();
            
            // Inicializar gráficos com dados reais
            chartsManager.initializeChartsWithRealData();
            
            this.isInitialized = true;
            showNotification('Dashboard carregado com dados completos!', 'success');
            
        } catch (error) {
            console.error('Erro na inicialização:', error);
            showNotification('Erro ao inicializar dashboard', 'error');
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        this.setupNavigation();
        this.setupMobileMenu();
        this.setupFilters();
        this.setupExportButtons();
        this.setupQuickLinks();
    }

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

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.querySelector('.nav');
        
        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    }

    setupFilters() {
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

    setupExportButtons() {
        // Configurar botões de exportação existentes
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-export]')) {
                const button = e.target.closest('[data-export]');
                const exportType = button.getAttribute('data-export');
                this.exportData(exportType);
            }
        });
    }

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

    showSection(sectionId) {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            
            setTimeout(() => {
                chartsManager.resizeCharts();
            }, 100);
        }
    }

    updateActiveNavLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

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

    // Atualizar métricas com dados completos
    updateMetricsWithCompleteData() {
        const metricas = dataManager.getMetricas();
        const resumoDetalhado = dataManager.getResumoDetalhado();
        
        console.log('Métricas atualizadas:', metricas);
        console.log('Resumo detalhado:', resumoDetalhado);
        
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

        // Adicionar informações extras se houver elementos para isso
        this.updateExtraMetrics(metricas);
    }

    updateExtraMetrics(metricas) {
        // Atualizar métricas extras se os elementos existirem
        const extraElements = {
            'totalLinhasComDados': metricas.totalLinhasComDados,
            'totalCelulasPreenchidas': metricas.totalCelulasPreenchidas,
            'totalValoresNumericos': metricas.totalValoresNumericos
        };

        for (const [elementId, value] of Object.entries(extraElements)) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value.toLocaleString('pt-BR');
            }
        }
    }

    // Popular tabelas com dados completos
    populateTablesWithCompleteData() {
        this.populateContasAtrasoTableComplete();
        this.populatePagamentosJulhoTableComplete();
        this.populateAcordosTableComplete();
    }

    populateContasAtrasoTableComplete() {
        const tbody = document.getElementById('tableAtrasoBBody');
        if (!tbody) return;

        const dadosAtraso = dataManager.getContasAtraso();
        const dadosProcessados = dataManager.processarDadosParaTabela(dadosAtraso);
        
        console.log('Dados contas em atraso processados:', dadosProcessados.length);
        
        this.renderTableComplete(tbody, dadosProcessados, 'atraso');
        this.setupPagination('atraso', dadosProcessados.length);
    }

    populatePagamentosJulhoTableComplete() {
        const tbody = document.getElementById('tableJulhoBody');
        if (!tbody) return;

        const dadosJulho = dataManager.getPagamentosJulho();
        const dadosProcessados = dataManager.processarDadosParaTabela(dadosJulho);
        
        console.log('Dados pagamentos julho processados:', dadosProcessados.length);
        
        this.renderTableComplete(tbody, dadosProcessados, 'julho');
        this.updateJulhoSummaryComplete(dadosProcessados);
    }

    populateAcordosTableComplete() {
        const tbody = document.getElementById('tableAcordosBody');
        if (!tbody) return;

        const dadosAcordos = dataManager.getAcordos();
        const dadosAcordosFornecedores = dataManager.getAcordosFornecedores();
        const todosAcordos = [...dadosAcordos, ...dadosAcordosFornecedores];
        const dadosProcessados = dataManager.processarDadosParaTabela(todosAcordos);
        
        console.log('Dados acordos processados:', dadosProcessados.length);
        
        this.renderTableComplete(tbody, dadosProcessados, 'acordos');
    }

    renderTableComplete(tbody, data, tableType) {
        if (!tbody || !data) return;

        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage[tableType] || 0) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = data.slice(startIndex, endIndex);

        pageData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = this.generateTableRowComplete(item, tableType, startIndex + index);
            tbody.appendChild(row);
        });

        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5" class="text-center">Nenhum dado encontrado</td>';
            tbody.appendChild(row);
        }
    }

    generateTableRowComplete(item, tableType, index) {
        const status = this.determineStatusFromData(item);
        
        switch (tableType) {
            case 'atraso':
                return `
                    <td>${item.descricao}</td>
                    <td class="text-right">${formatCurrency(item.valor)}</td>
                    <td>${formatDate(item.data)}</td>
                    <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                    <td>
                        <button class="btn-secondary btn-sm" onclick="dashboard.viewDetailsComplete('atraso', ${index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
            case 'julho':
                const tipo = this.determineTypeFromData(item);
                return `
                    <td>${formatDate(item.data)}</td>
                    <td>${item.descricao}</td>
                    <td><span class="type-badge type-${tipo.class}">${tipo.text}</span></td>
                    <td class="text-right">${formatCurrency(item.valor)}</td>
                    <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                `;
            case 'acordos':
                return `
                    <td>${item.descricao}</td>
                    <td class="text-right">${formatCurrency(item.valor)}</td>
                    <td>${item.observacoes}</td>
                    <td>${formatDate(item.data)}</td>
                    <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                `;
            default:
                return '<td colspan="5">Tipo de tabela não reconhecido</td>';
        }
    }

    determineStatusFromData(item) {
        const desc = item.descricao.toLowerCase();
        const obs = item.observacoes.toLowerCase();
        
        if (desc.includes('pago') || obs.includes('pago')) {
            return { text: 'Pago', class: 'pago' };
        } else if (desc.includes('atraso') || obs.includes('atraso')) {
            return { text: 'Em Atraso', class: 'atraso' };
        } else if (desc.includes('pendente') || obs.includes('pendente')) {
            return { text: 'Pendente', class: 'pendente' };
        }
        return { text: 'Em Dia', class: 'em-dia' };
    }

    determineTypeFromData(item) {
        const desc = item.descricao.toLowerCase();
        const obs = item.observacoes.toLowerCase();
        
        if (desc.includes('entrada') || obs.includes('entrada')) {
            return { text: 'Entrada', class: 'entrada' };
        } else if (desc.includes('saída') || desc.includes('pagamento') || obs.includes('pagamento')) {
            return { text: 'Saída', class: 'saida' };
        }
        return { text: 'Outros', class: 'outros' };
    }

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

        // Números das páginas (mostrar no máximo 10 páginas)
        const startPage = Math.max(0, currentPage - 5);
        const endPage = Math.min(totalPages, startPage + 10);
        
        for (let i = startPage; i < endPage; i++) {
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

    changePage(tableType, page) {
        this.currentPage[tableType] = page;
        
        switch (tableType) {
            case 'atraso':
                this.populateContasAtrasoTableComplete();
                break;
            case 'julho':
                this.populatePagamentosJulhoTableComplete();
                break;
            case 'acordos':
                this.populateAcordosTableComplete();
                break;
        }
    }

    filterContasAtraso(searchTerm, mes) {
        const dadosAtraso = dataManager.getContasAtraso();
        const dadosProcessados = dataManager.processarDadosParaTabela(dadosAtraso);
        
        const filteredData = dataManager.filtrarDados(dadosProcessados, searchTerm, (item) => {
            if (!mes) return true;
            return item.data.toLowerCase().includes(mes.toLowerCase()) ||
                   item.descricao.toLowerCase().includes(mes.toLowerCase());
        });
        
        const tbody = document.getElementById('tableAtrasoBBody');
        this.currentPage.atraso = 0;
        this.renderTableComplete(tbody, filteredData, 'atraso');
        this.setupPagination('atraso', filteredData.length);
    }

    updateJulhoSummaryComplete(dadosProcessados) {
        const entradas = dadosProcessados.filter(item => 
            item.descricao.toLowerCase().includes('entrada') || 
            item.observacoes.toLowerCase().includes('entrada')
        );
        const saidas = dadosProcessados.filter(item => 
            !item.descricao.toLowerCase().includes('entrada') && 
            !item.observacoes.toLowerCase().includes('entrada')
        );

        const totalEntradas = entradas.reduce((sum, item) => sum + item.valor, 0);
        const totalSaidas = saidas.reduce((sum, item) => sum + item.valor, 0);
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

    viewDetailsComplete(type, index, itemData) {
        console.log('Visualizando detalhes:', type, index, itemData);
        
        // Criar modal de detalhes
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Registro</h3>
                    <button onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p><strong>Linha Original:</strong> ${itemData.linha_original}</p>
                    <p><strong>Descrição:</strong> ${itemData.descricao}</p>
                    <p><strong>Valor:</strong> ${formatCurrency(itemData.valor)}</p>
                    <p><strong>Data:</strong> ${formatDate(itemData.data)}</p>
                    <p><strong>Observações:</strong> ${itemData.observacoes}</p>
                    <details>
                        <summary>Dados Completos</summary>
                        <pre>${JSON.stringify(itemData.dados_completos, null, 2)}</pre>
                    </details>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Fechar modal ao clicar fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    exportData(type) {
        let data = [];
        let filename = '';

        switch (type) {
            case 'excel':
            case 'csv':
                data = dataManager.getContasAtraso();
                filename = 'contas_atraso_completas.csv';
                break;
            case 'pdf':
                showNotification('Exportação PDF em desenvolvimento', 'info');
                return;
        }

        if (data.length > 0) {
            dataManager.exportToCSV(data, filename);
            showNotification(`${data.length} registros exportados com sucesso!`, 'success');
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

