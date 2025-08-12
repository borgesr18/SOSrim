// Data Management Module - Versão Atualizada com Dados Completos
class DataManager {
    constructor() {
        this.dadosEstruturados = null;
        this.verificacaoCompleta = null;
        this.isLoaded = false;
    }

    async loadData() {
        try {
            this.showLoading(true);
            
            // Carregar dados estruturados completos
            const dadosResponse = await fetch('data/dados_estruturados_para_site.json');
            this.dadosEstruturados = await dadosResponse.json();
            
            // Carregar verificação completa
            const verificacaoResponse = await fetch('data/verificacao_completa_linha_por_linha.json');
            this.verificacaoCompleta = await verificacaoResponse.json();
            
            this.isLoaded = true;
            this.showLoading(false);
            
            console.log('Dados completos carregados:', this.dadosEstruturados);
            console.log('Verificação completa:', this.verificacaoCompleta);
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
        
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Métodos para acessar dados específicos das abas
    getContasAtraso() {
        if (!this.dadosEstruturados) return [];
        return this.dadosEstruturados['PLANILHA ATRAS. JAN. A JUL 2025'] || [];
    }

    getPagamentosJulho() {
        if (!this.dadosEstruturados) return [];
        return this.dadosEstruturados['PLANILHA PAGTOS JULHO 2025'] || [];
    }

    getAcordos() {
        if (!this.dadosEstruturados) return [];
        return this.dadosEstruturados['PLANILHA ACORDO '] || [];
    }

    getAcordosFornecedores() {
        if (!this.dadosEstruturados) return [];
        return this.dadosEstruturados['PLANILHA PAGTOS ACORDOS FORN.'] || [];
    }

    // Método para obter estatísticas gerais
    getEstatisticasGerais() {
        if (!this.verificacaoCompleta) return {};
        return this.verificacaoCompleta.resumo_geral || {};
    }

    // Método para obter estatísticas por aba
    getEstatisticasPorAba() {
        if (!this.verificacaoCompleta) return {};
        return this.verificacaoCompleta.abas || {};
    }

    // Calcular métricas atualizadas
    getMetricas() {
        const estatisticas = this.getEstatisticasGerais();
        const contasAtraso = this.getContasAtraso();
        const pagamentosJulho = this.getPagamentosJulho();
        const acordos = this.getAcordos();
        const acordosFornecedores = this.getAcordosFornecedores();

        // Calcular total geral baseado nos valores numéricos encontrados
        const valoresNumericos = estatisticas.valores_numericos_encontrados || [];
        const totalGeral = valoresNumericos.reduce((sum, item) => sum + (item.valor || 0), 0);

        return {
            totalGeral: totalGeral,
            contasAtraso: contasAtraso.length,
            pagamentosJulho: pagamentosJulho.length,
            acordosAtivos: acordos.length + acordosFornecedores.length,
            totalLinhasComDados: estatisticas.total_linhas_com_dados || 0,
            totalCelulasPreenchidas: estatisticas.total_celulas_preenchidas || 0,
            totalValoresNumericos: valoresNumericos.length
        };
    }

    // Extrair dados estruturados de uma linha
    extrairDadosLinha(registro) {
        const dados = registro.dados || {};
        
        let descricao = '';
        let valor = 0;
        let data = '';
        let observacoes = [];

        // Buscar descrição (primeira string significativa)
        for (const [key, value] of Object.entries(dados)) {
            if (typeof value === 'string' && value.length > 3 && !descricao) {
                descricao = value;
                break;
            }
        }

        // Buscar valor (primeiro número positivo)
        for (const [key, value] of Object.entries(dados)) {
            if (typeof value === 'number' && value > 0 && !valor) {
                valor = value;
                break;
            }
        }

        // Buscar data
        for (const [key, value] of Object.entries(dados)) {
            if (typeof value === 'string' && (value.includes('2024') || value.includes('2025') || value.includes('2026'))) {
                data = value;
                break;
            }
        }

        // Coletar observações adicionais
        for (const [key, value] of Object.entries(dados)) {
            if (typeof value === 'string' && value.length > 2) {
                if (value !== descricao && value !== data) {
                    observacoes.push(value);
                }
            }
        }

        return {
            linha_original: registro.linha_original,
            descricao: descricao || 'Sem descrição',
            valor: valor,
            data: data || '',
            observacoes: observacoes.slice(0, 3).join(' | '), // Máximo 3 observações
            dados_completos: dados
        };
    }

    // Processar dados para tabelas
    processarDadosParaTabela(dadosAba) {
        return dadosAba.map(registro => this.extrairDadosLinha(registro));
    }

    // Filtrar dados
    filtrarDados(dados, termoBusca = '', filtroAdicional = null) {
        return dados.filter(item => {
            const matchBusca = !termoBusca || 
                Object.values(item).some(value => 
                    value && value.toString().toLowerCase().includes(termoBusca.toLowerCase())
                );
            
            const matchFiltro = !filtroAdicional || filtroAdicional(item);
            
            return matchBusca && matchFiltro;
        });
    }

    // Calcular totais por categoria
    calcularTotaisPorCategoria() {
        const categorias = {
            'Contas em Atraso': this.calcularTotalAba(this.getContasAtraso()),
            'Pagamentos Julho': this.calcularTotalAba(this.getPagamentosJulho()),
            'Acordos': this.calcularTotalAba(this.getAcordos()),
            'Acordos Fornecedores': this.calcularTotalAba(this.getAcordosFornecedores())
        };

        return categorias;
    }

    calcularTotalAba(dadosAba) {
        return dadosAba.reduce((total, registro) => {
            const dadosProcessados = this.extrairDadosLinha(registro);
            return total + dadosProcessados.valor;
        }, 0);
    }

    // Agrupar dados por mês
    agruparPorMes(dados) {
        const grupos = {};
        
        dados.forEach(item => {
            const dadosProcessados = this.extrairDadosLinha(item);
            let mes = 'Outros';
            
            if (dadosProcessados.data) {
                const dataStr = dadosProcessados.data.toLowerCase();
                if (dataStr.includes('01/') || dataStr.includes('janeiro')) mes = 'Janeiro';
                else if (dataStr.includes('02/') || dataStr.includes('fevereiro')) mes = 'Fevereiro';
                else if (dataStr.includes('03/') || dataStr.includes('março')) mes = 'Março';
                else if (dataStr.includes('04/') || dataStr.includes('abril')) mes = 'Abril';
                else if (dataStr.includes('05/') || dataStr.includes('maio')) mes = 'Maio';
                else if (dataStr.includes('06/') || dataStr.includes('junho')) mes = 'Junho';
                else if (dataStr.includes('07/') || dataStr.includes('julho')) mes = 'Julho';
                else if (dataStr.includes('08/') || dataStr.includes('agosto')) mes = 'Agosto';
            }
            
            if (!grupos[mes]) grupos[mes] = [];
            grupos[mes].push(dadosProcessados);
        });
        
        return grupos;
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
            // Tentar diferentes formatos de data
            if (dateString.includes('-')) {
                const date = new Date(dateString);
                return date.toLocaleDateString('pt-BR');
            }
            return dateString; // Retornar como está se não conseguir processar
        } catch (error) {
            return dateString;
        }
    }

    // Método para exportar dados
    exportToCSV(data, filename = 'dados_financeiros.csv') {
        if (!data || data.length === 0) return;

        const headers = ['Linha Original', 'Descrição', 'Valor', 'Data', 'Observações'];
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            const dadosProcessados = this.extrairDadosLinha(row);
            return [
                dadosProcessados.linha_original,
                `"${dadosProcessados.descricao.replace(/"/g, '""')}"`,
                dadosProcessados.valor,
                `"${dadosProcessados.data.replace(/"/g, '""')}"`,
                `"${dadosProcessados.observacoes.replace(/"/g, '""')}"`
            ].join(',');
        });

        const csvContent = [csvHeaders, ...csvRows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    }

    // Obter resumo detalhado
    getResumoDetalhado() {
        const metricas = this.getMetricas();
        const totaisPorCategoria = this.calcularTotaisPorCategoria();
        const estatisticasPorAba = this.getEstatisticasPorAba();

        return {
            metricas_gerais: metricas,
            totais_por_categoria: totaisPorCategoria,
            estatisticas_por_aba: estatisticasPorAba,
            data_ultima_atualizacao: new Date().toISOString()
        };
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

