// Charts Module
class ChartsManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#1e40af',
            success: '#059669',
            alert: '#dc2626',
            warning: '#d97706',
            info: '#0891b2',
            neutral: '#6b7280'
        };
    }

    // Configurações padrão para gráficos
    getDefaultConfig() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#1e40af',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = formatCurrency(context.parsed);
                            return `${label}: ${value}`;
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        };
    }

    // Gráfico de distribuição por tipo (Pizza)
    createDistributionChart() {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        const resumo = dataManager.getResumoExecutivo();
        const planilhas = resumo.tipos_planilhas || [];

        const data = {
            labels: planilhas.map(p => p.nome.replace('PLANILHA ', '')),
            datasets: [{
                data: planilhas.map(p => p.linhas),
                backgroundColor: [
                    this.colors.primary,
                    this.colors.success,
                    this.colors.alert,
                    this.colors.warning
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                plugins: {
                    ...this.getDefaultConfig().plugins,
                    legend: {
                        ...this.getDefaultConfig().plugins.legend,
                        position: 'right'
                    }
                }
            }
        };

        this.charts.distribution = new Chart(ctx, config);
    }

    // Gráfico de valores por categoria (Barras)
    createValuesChart() {
        const ctx = document.getElementById('valuesChart');
        if (!ctx) return;

        // Obter dados de todas as abas
        const contasAtraso = dataManager.getContasAtraso();
        const pagamentosJulho = dataManager.getPagamentosJulho();
        const acordos = dataManager.getAcordos();

        // Extrair valores numéricos
        const valoresAtraso = dataManager.extractNumericValues(contasAtraso);
        const valoresPagamentos = dataManager.extractNumericValues(pagamentosJulho);
        const valoresAcordos = dataManager.extractNumericValues(acordos);

        // Calcular totais
        const totalAtraso = valoresAtraso.reduce((sum, val) => sum + val, 0);
        const totalPagamentos = valoresPagamentos.reduce((sum, val) => sum + val, 0);
        const totalAcordos = valoresAcordos.reduce((sum, val) => sum + val, 0);

        const data = {
            labels: ['Contas em Atraso', 'Pagamentos Julho', 'Acordos'],
            datasets: [{
                label: 'Valores (R$)',
                data: [totalAtraso, totalPagamentos, totalAcordos],
                backgroundColor: [
                    this.colors.alert,
                    this.colors.success,
                    this.colors.info
                ],
                borderColor: [
                    this.colors.alert,
                    this.colors.success,
                    this.colors.info
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };

        this.charts.values = new Chart(ctx, config);
    }

    // Gráfico mensal (Linha)
    createMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;

        // Dados simulados para demonstração (em um caso real, extrairíamos dos dados)
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
        const entradas = [850000, 920000, 780000, 1100000, 950000, 1050000, 980000];
        const saidas = [650000, 720000, 580000, 800000, 750000, 850000, 780000];

        const data = {
            labels: meses,
            datasets: [
                {
                    label: 'Entradas',
                    data: entradas,
                    borderColor: this.colors.success,
                    backgroundColor: this.colors.success + '20',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.success,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                },
                {
                    label: 'Saídas',
                    data: saidas,
                    borderColor: this.colors.alert,
                    backgroundColor: this.colors.alert + '20',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.colors.alert,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        this.charts.monthly = new Chart(ctx, config);
    }

    // Gráfico comparativo anual (Barras agrupadas)
    createYearlyChart() {
        const ctx = document.getElementById('yearlyChart');
        if (!ctx) return;

        const data = {
            labels: ['2023', '2024', '2025'],
            datasets: [
                {
                    label: 'Receitas',
                    data: [8500000, 9200000, 10500000],
                    backgroundColor: this.colors.success,
                    borderColor: this.colors.success,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Despesas',
                    data: [7200000, 7800000, 8900000],
                    backgroundColor: this.colors.alert,
                    borderColor: this.colors.alert,
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };

        this.charts.yearly = new Chart(ctx, config);
    }

    // Gráfico de status dos acordos (Pizza)
    createAgreementsChart() {
        const ctx = document.getElementById('agreementsChart');
        if (!ctx) return;

        const data = {
            labels: ['Em Dia', 'Atrasados', 'Vencendo', 'Quitados'],
            datasets: [{
                data: [15, 3, 5, 8],
                backgroundColor: [
                    this.colors.success,
                    this.colors.alert,
                    this.colors.warning,
                    this.colors.neutral
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        };

        const config = {
            type: 'pie',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                plugins: {
                    ...this.getDefaultConfig().plugins,
                    legend: {
                        ...this.getDefaultConfig().plugins.legend,
                        position: 'bottom'
                    }
                }
            }
        };

        this.charts.agreements = new Chart(ctx, config);
    }

    // Gráfico de fluxo de caixa (Área)
    createCashflowChart() {
        const ctx = document.getElementById('cashflowChart');
        if (!ctx) return;

        const dias = Array.from({length: 30}, (_, i) => i + 1);
        const saldoDiario = dias.map(dia => {
            // Simulação de saldo diário
            const base = 500000;
            const variacao = Math.sin(dia * 0.2) * 100000;
            return base + variacao + (dia * 5000);
        });

        const data = {
            labels: dias.map(d => `${d}/07`),
            datasets: [{
                label: 'Saldo Diário',
                data: saldoDiario,
                borderColor: this.colors.primary,
                backgroundColor: this.colors.primary + '30',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBackgroundColor: this.colors.primary,
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                ...this.getDefaultConfig(),
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            },
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            color: '#e5e7eb'
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 10,
                            font: {
                                family: 'Inter',
                                size: 11
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        this.charts.cashflow = new Chart(ctx, config);
    }

    // Inicializar todos os gráficos
    initializeCharts() {
        // Aguardar um pouco para garantir que os dados estejam carregados
        setTimeout(() => {
            this.createDistributionChart();
            this.createValuesChart();
            this.createMonthlyChart();
            this.createYearlyChart();
            this.createAgreementsChart();
            this.createCashflowChart();
        }, 500);
    }

    // Destruir gráfico específico
    destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    // Destruir todos os gráficos
    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    // Redimensionar gráficos
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    // Atualizar dados de um gráfico
    updateChart(chartName, newData) {
        if (this.charts[chartName]) {
            this.charts[chartName].data = newData;
            this.charts[chartName].update();
        }
    }
}

// Instância global do gerenciador de gráficos
const chartsManager = new ChartsManager();

// Event listener para redimensionamento
window.addEventListener('resize', () => {
    chartsManager.resizeCharts();
});

// Exportar para uso global
window.chartsManager = chartsManager;

