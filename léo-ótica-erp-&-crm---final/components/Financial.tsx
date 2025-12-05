import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Filter, Download, ExternalLink, SlidersHorizontal } from 'lucide-react';
import { MOCK_FINANCIAL_MONTHLY, MOCK_FINANCIAL_DAILY } from '../constants';
import { TransactionType } from '../types';
import { supabase } from '../lib/supabase';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const Financial: React.FC = () => {
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'day'>('year');
  const [selectedMonth, setSelectedMonth] = useState(2); // March by default (index 2)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Load transactions from Supabase
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    };
    loadTransactions();
  }, []);

  // Filters State
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    status: 'all'
  });

  // Dynamic Data Logic
  const getCurrentData = () => {
    if (viewMode === 'year') {
      return MOCK_FINANCIAL_MONTHLY;
    }
    const multiplier = (selectedMonth + 1) * 0.1 + 0.8;
    return MOCK_FINANCIAL_DAILY.map(d => ({
      ...d,
      entrada: d.entrada * multiplier,
      saida: d.saida * multiplier
    }));
  };

  const chartData = getCurrentData();

  const calculateTotals = () => {
    if (viewMode === 'year') {
      const rec = MOCK_FINANCIAL_MONTHLY.reduce((acc, curr) => acc + curr.receitas, 0);
      const desp = MOCK_FINANCIAL_MONTHLY.reduce((acc, curr) => acc + curr.despesas, 0);
      return { rec, desp, luc: rec - desp };
    } else if (viewMode === 'month') {
      const dailyData = chartData as typeof MOCK_FINANCIAL_DAILY;
      const rec = dailyData.reduce((acc, curr) => acc + curr.entrada, 0);
      const desp = dailyData.reduce((acc, curr) => acc + curr.saida, 0);
      return { rec, desp, luc: rec - desp };
    } else {
      const dayHash = selectedDate.split('-')[2] || '01';
      const dayIndex = parseInt(dayHash) % MOCK_FINANCIAL_DAILY.length;
      const dayData = MOCK_FINANCIAL_DAILY[dayIndex] || MOCK_FINANCIAL_DAILY[0];
      return { rec: dayData.entrada, desp: dayData.saida, luc: dayData.entrada - dayData.saida };
    }
  };

  const { rec: totalReceitas, desp: totalDespesas, luc: totalLucro } = calculateTotals();

  const getFilteredTransactions = () => {
    let txs = MOCK_TRANSACTIONS;

    // Apply Advanced Filters
    if (filters.type !== 'all') {
      txs = txs.filter(t =>
        filters.type === 'income' ? t.type === TransactionType.INCOME : t.type === TransactionType.EXPENSE
      );
    }
    if (filters.status !== 'all') {
      txs = txs.filter(t => t.status.toLowerCase() === filters.status);
    }

    if (viewMode === 'day') {
      return txs.slice(0, 3);
    }
    return txs;
  };

  const displayTransactions = showAllTransactions
    ? [...MOCK_TRANSACTIONS, ...MOCK_TRANSACTIONS]
    : getFilteredTransactions();

  const handleExport = () => {
    // Get all transactions to export
    const transactionsToExport = getFilteredTransactions();

    if (transactionsToExport.length === 0) {
      alert("⚠️ Não há transações para exportar com os filtros atuais.");
      return;
    }

    // CSV Headers
    const headers = ['Data', 'Descrição', 'Categoria', 'Método de Pagamento', 'Status', 'Tipo', 'Valor'];

    // Convert transactions to CSV rows
    const rows = transactionsToExport.map(t => [
      t.date,
      `"${t.description.replace(/"/g, '""')}"`, // Escape double quotes
      `"${t.category}"`,
      `"${t.paymentMethod}"`,
      t.status,
      t.type === TransactionType.INCOME ? 'Entrada' : 'Saída',
      t.type === TransactionType.INCOME ? t.amount.toFixed(2) : `-${t.amount.toFixed(2)}`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Add UTF-8 BOM for Excel to properly display special characters
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvContent;

    // Create blob and download
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `relatorio-financeiro-${dateStr}-${timeStr}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`✅ Relatório exportado com sucesso!\n\n${transactionsToExport.length} transação(ões) exportada(s).\nArquivo: ${filename}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão Financeira</h2>
          <p className="text-slate-500">Fluxo de caixa, DRE e Conciliação</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Visão:</span>
            <select
              className="bg-transparent text-slate-700 text-sm focus:ring-0 border-none outline-none font-medium cursor-pointer"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as any)}
            >
              <option value="year">Anual (12 Meses)</option>
              <option value="month">Mensal</option>
              <option value="day">Diário</option>
            </select>

            <div className="w-px h-4 bg-slate-300 mx-1"></div>

            {/* Month Selector */}
            {viewMode === 'month' && (
              <select
                className="bg-transparent text-slate-700 text-sm focus:ring-0 border-none outline-none font-medium cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {MONTHS.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            )}

            {/* Enhanced Daily Selector */}
            {viewMode === 'day' && (
              <div className="relative group">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white text-slate-800 text-sm font-bold border border-slate-300 rounded px-2 py-1 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 cursor-pointer shadow-sm"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-sm text-sm font-medium cursor-pointer"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} className="text-green-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Receita Total ({viewMode === 'year' ? 'Ano' : viewMode === 'month' ? MONTHS[selectedMonth] : selectedDate})
          </p>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">R$ {totalReceitas.toLocaleString('pt-BR')}</h3>
          <div className="flex items-center text-sm text-green-600 font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+12.5% vs anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown size={64} className="text-red-500" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">
            Despesas ({viewMode === 'year' ? 'Ano' : viewMode === 'month' ? MONTHS[selectedMonth] : selectedDate})
          </p>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">R$ {totalDespesas.toLocaleString('pt-BR')}</h3>
          <div className="flex items-center text-sm text-red-500 font-medium">
            <ArrowUpRight size={16} className="mr-1" />
            <span>+5.2% vs anterior</span>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={64} className="text-white" />
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Lucro Líquido</p>
          <h3 className="text-3xl font-bold mb-2">R$ {totalLucro.toLocaleString('pt-BR')}</h3>
          <div className="flex items-center text-sm text-teal-400 font-medium">
            <div className="px-2 py-0.5 bg-teal-500/20 rounded border border-teal-500/30">Margem: {((totalLucro / totalReceitas) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'year' ? (
              <BarChart data={chartData} barGap={0} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$${value / 1000}k`} />
                <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString()}`, '']} />
                <Bar dataKey="receitas" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="despesas" fill="#f87171" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            ) : (
              <AreaChart data={viewMode === 'day' ? [
                { day: '00:00', entrada: 0, saida: 0 },
                { day: '08:00', entrada: totalReceitas * 0.3, saida: totalDespesas * 0.2 },
                { day: '12:00', entrada: totalReceitas * 0.5, saida: totalDespesas * 0.6 },
                { day: '18:00', entrada: totalReceitas * 1.0, saida: totalDespesas * 1.0 },
              ] : chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="entrada" stroke="#0d9488" strokeWidth={2} fillOpacity={0.2} strokeOpacity={0.8} />
                <Area type="monotone" dataKey="saida" stroke="#f87171" strokeWidth={2} fillOpacity={0.2} strokeOpacity={0.8} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions List with Advanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800">
              {showAllTransactions ? 'Todos os Lançamentos' : 'Últimos Lançamentos'}
            </h3>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${showAdvancedFilters ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal size={16} />
              Filtros Avançados
            </button>
          </div>

          {/* Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg animate-in slide-in-from-top-2">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md focus:ring-teal-500 cursor-pointer p-2 bg-white shadow-sm"
                >
                  <option value="all">Todos</option>
                  <option value="income">Entradas</option>
                  <option value="expense">Saídas</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md focus:ring-teal-500 cursor-pointer p-2 bg-white shadow-sm"
                >
                  <option value="all">Todos</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Categoria</label>
                <select className="w-full text-sm border-slate-300 rounded-md focus:ring-teal-500 cursor-pointer p-2 bg-white shadow-sm">
                  <option value="all">Todas</option>
                  <option value="vendas">Vendas</option>
                  <option value="fornecedores">Fornecedores</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <table className="w-full text-left">
          <thead className="bg-blue-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayTransactions.map((t, idx) => (
              <tr key={`${t.id}-${idx}`} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-600">{t.date}</td>
                <td className="px-6 py-4">
                  <span className="font-medium text-slate-900">{t.description}</span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-blue-50 rounded text-slate-600 font-medium text-xs">{t.category}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{t.paymentMethod}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${t.status === 'Pago' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {t.status}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-teal-600' : 'text-red-500'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};