// Data Management Module
class DataManager {
    constructor() {
        this.data = null;
        this.resumo = null;
        this.isLoaded = false;
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Carregar dados organizados
            const dataResponse = await fetch('data/dados_organizados.json');
            this.data = await dataResponse.json();
            
            // Carregar resumo executivo
            const resumoResponse = await fetch('data/resumo_executivo.json');
            this.resumo = await resumoResponse.json();
            
            this.isLoaded = true;
            this.showLoading(false);
            
            console.log('Dados carregados com sucesso:', this.data);
            return true;
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.showLoading(false);
            this.showError('Erro ao carregar dados financeiros');
            return false;
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    showError(message) {
        // Criar notificação de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Remover após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Métodos para acessar dados específicos
    getResumoExecutivo() {
        return this.resumo || {};
    }

    getContasAtraso() {
        if (!this.data || !this.data.abas) return [];
        const aba = this.data.abas['PLANILHA ATRAS. JAN. A JUL 2025'];
        return aba ? aba.raw_data || [] : [];
    }

    getPagamentosJulho() {
        if (!this.data || !this.data.abas) return [];
        const aba = this.data.abas['PLANILHA PAGTOS JULHO 2025'];
        return aba ? aba.raw_data || [] : [];
    }

    getAcordos() {
        if (!this.data || !this.data.abas) return [];
        const aba = this.data.abas['PLANILHA ACORDO '];
        return aba ? aba.raw_data || [] : [];
    }

    getAcordosFornecedores() {
        if (!this.data || !this.data.abas) return [];
        const aba = this.data.abas['PLANILHA PAGTOS ACORDOS FORN.'];
        return aba ? aba.raw_data || [] : [];
    }

    // Métodos para análise de dados
    getTotalGeral() {
        if (!this.resumo || !this.resumo.resumo_financeiro) return 0;
        return this.resumo.resumo_financeiro.total_geral || 0;
    }

    getMetricas() {
        const resumo = this.getResumoExecutivo();
        const contasAtraso = this.getContasAtraso();
        const pagamentosJulho = this.getPagamentosJulho();
        const acordos = this.getAcordos();

        return {
            totalGeral: this.getTotalGeral(),
            contasAtraso: contasAtraso.length,
            pagamentosJulho: pagamentosJulho.length,
            acordosAtivos: acordos.length
        };
    }

    // Métodos para filtrar dados
    filterContasAtraso(searchTerm = '', mes = '') {
        const contas = this.getContasAtraso();
        return contas.filter(conta => {
            const matchSearch = !searchTerm || 
                Object.values(conta).some(value => 
                    value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
            
            const matchMes = !mes || 
                Object.values(conta).some(value => 
                    value && value.toString().toLowerCase().includes(mes.toLowerCase())
                );
            
            return matchSearch && matchMes;
        });
    }

    // Métodos para extrair valores numéricos
    extractNumericValues(data) {
        const values = [];
        data.forEach(row => {
            Object.values(row).forEach(value => {
                if (typeof value === 'number' && !isNaN(value) && value !== 0) {
                    values.push(value);
                }
            });
        });
        return values;
    }

    // Método para formatar valores monetários
    formatCurrency(value) {
        if (typeof value !== 'number') return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    // Método para formatar datas
    formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            return dateString;
        }
    }

    // Método para calcular estatísticas
    calculateStats(values) {
        if (!values || values.length === 0) {
            return {
                total: 0,
                media: 0,
                maximo: 0,
                minimo: 0,
                count: 0
            };
        }

        const total = values.reduce((sum, val) => sum + val, 0);
        const media = total / values.length;
        const maximo = Math.max(...values);
        const minimo = Math.min(...values);

        return {
            total,
            media,
            maximo,
            minimo,
            count: values.length
        };
    }

    // Método para agrupar dados por categoria
    groupByCategory(data) {
        const groups = {};
        data.forEach(item => {
            // Tentar identificar categoria baseada nos dados
            let category = 'Outros';
            
            // Verificar se há informações sobre tipo/categoria
            Object.entries(item).forEach(([key, value]) => {
                if (value && typeof value === 'string') {
                    if (value.toLowerCase().includes('sus')) {
                        category = 'SUS';
                    } else if (value.toLowerCase().includes('acordo')) {
                        category = 'Acordos';
                    } else if (value.toLowerCase().includes('pagamento')) {
                        category = 'Pagamentos';
                    } else if (value.toLowerCase().includes('entrada')) {
                        category = 'Entradas';
                    }
                }
            });
            
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
        });
        
        return groups;
    }

    // Método para exportar dados
    exportToCSV(data, filename = 'dados_financeiros.csv') {
        if (!data || data.length === 0) return;

        // Obter todas as chaves únicas
        const headers = new Set();
        data.forEach(row => {
            Object.keys(row).forEach(key => headers.add(key));
        });

        const csvHeaders = Array.from(headers).join(',');
        const csvRows = data.map(row => {
            return Array.from(headers).map(header => {
                const value = row[header] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',');
        });

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        // Criar e baixar arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }
}

// Instância global do gerenciador de dados
const dataManager = new DataManager();

// Funções utilitárias globais
function formatCurrency(value) {
    return dataManager.formatCurrency(value);
}

function formatDate(dateString) {
    return dataManager.formatDate(dateString);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Exportar para uso global
window.dataManager = dataManager;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showNotification = showNotification;

