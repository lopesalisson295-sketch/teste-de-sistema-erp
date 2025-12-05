import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, Tag, FileText, Save, ArrowUpCircle, ArrowDownCircle, Search, Filter, Trash2 } from 'lucide-react';
import { MOCK_TRANSACTIONS } from '../constants';
import { Transaction, TransactionType } from '../types';

export const CashFlowEntry: React.FC = () => {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
  });

  // INITIALIZE STATE FROM LOCAL STORAGE OR MOCK DATA
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('erp_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'day' | 'month'>('month');

  // SAVE TO LOCAL STORAGE WHENEVER TRANSACTIONS CHANGE
  useEffect(() => {
    localStorage.setItem('erp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevents page reload
    if (!formData.description || !formData.amount) {
      alert("Preencha a descrição e o valor");
      return;
    }
    
    const newTransaction: Transaction = {
      id: Date.now(), // Use timestamp for unique ID
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: type === 'income' ? TransactionType.INCOME : TransactionType.EXPENSE,
      category: formData.category || 'Outros',
      date: formData.date,
      paymentMethod: 'Dinheiro' as any,
      status: 'Pago'
    };

    setTransactions(prev => [newTransaction, ...prev]);
    alert(`Lançamento salvo com sucesso!`);
    
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Deseja excluir este lançamento?")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    // 1. Date Filter
    let dateMatch = true;
    if (viewMode === 'day') {
      dateMatch = t.date === filterDate;
    } else {
      // Month match (YYYY-MM)
      const tMonth = t.date.substring(0, 7);
      const fMonth = filterDate.substring(0, 7);
      dateMatch = tMonth === fMonth;
    }

    // 2. Type Filter
    let typeMatch = true;
    if (filterType !== 'all') {
      typeMatch = filterType === 'income' ? t.type === TransactionType.INCOME : t.type === TransactionType.EXPENSE;
    }

    // 3. Category Filter
    let catMatch = true;
    if (filterCategory !== 'all') {
      catMatch = t.category.toLowerCase() === filterCategory.toLowerCase();
    }

    return dateMatch && typeMatch && catMatch;
  });

  const totalIn = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => acc + t.amount, 0);
  const totalOut = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      
      {/* SECTION 1: NEW ENTRY FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-800">Novo Lançamento</h2>
            <p className="text-slate-500">Registre entradas e saídas</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex gap-2 mb-6">
              <button 
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'income' 
                    ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' 
                    : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                }`}
              >
                <ArrowUpCircle size={20} className={type === 'income' ? 'text-teal-500' : 'text-slate-300'} />
                <span className="font-bold">Entrada</span>
              </button>
              <button 
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'expense' 
                    ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' 
                    : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                }`}
              >
                <ArrowDownCircle size={20} className={type === 'expense' ? 'text-red-500' : 'text-slate-300'} />
                <span className="font-bold">Saída</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DATA</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 text-slate-800 z-10" size={16} />
                    <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 shadow-sm"
                    style={{ colorScheme: 'light' }}
                    />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">VALOR (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 text-slate-800 z-10" size={16} />
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none font-bold text-slate-800 shadow-sm"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DESCRIÇÃO</label>
                <input 
                  type="text" 
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 shadow-sm"
                  placeholder="Ex: Venda Balcão..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">CATEGORIA</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 cursor-pointer shadow-sm"
                >
                  <option value="">Selecione...</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Servicos">Serviços</option>
                  <option value="Fornecedores">Fornecedores</option>
                  <option value="Custos Fixos">Custos Fixos</option>
                  <option value="Funcionarios">Funcionários</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button 
                type="submit"
                className={`w-full py-3 mt-2 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer ${
                  type === 'income' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Save size={18} />
                Salvar Lançamento
              </button>
            </form>
          </div>
        </div>

        {/* SECTION 2: HISTORY & FILTERS */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Extrato de Lançamentos</h2>
                <p className="text-slate-500">Histórico de movimentações</p>
              </div>
              
              {/* Main Date Filter */}
              <div className="flex bg-white p-1 rounded-lg border border-slate-300 shadow-sm">
                 <button 
                   onClick={() => setViewMode('month')}
                   className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                   Mensal
                 </button>
                 <button 
                   onClick={() => setViewMode('day')}
                   className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'day' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                 >
                   Diário
                 </button>
              </div>
           </div>

           {/* Filter Bar */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-end">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">
                    {viewMode === 'month' ? 'Mês de Referência' : 'Dia de Referência'}
                 </label>
                 <div className="relative">
                   <Calendar className="absolute left-2.5 top-2.5 text-slate-800 z-10" size={16} />
                   <input 
                     type={viewMode === 'month' ? 'month' : 'date'}
                     value={viewMode === 'month' ? filterDate.substring(0, 7) : filterDate}
                     onChange={(e) => setFilterDate(e.target.value)}
                     className="pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 outline-none focus:border-teal-500 cursor-pointer shadow-sm"
                     style={{ colorScheme: 'light' }}
                   />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Tipo</label>
                 <select 
                   value={filterType}
                   onChange={(e) => setFilterType(e.target.value)}
                   className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-teal-500 cursor-pointer min-w-[120px] shadow-sm"
                 >
                   <option value="all">Todos</option>
                   <option value="income">Entradas</option>
                   <option value="expense">Saídas</option>
                 </select>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Categoria</label>
                 <select 
                   value={filterCategory}
                   onChange={(e) => setFilterCategory(e.target.value)}
                   className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 outline-none focus:border-teal-500 cursor-pointer min-w-[140px] shadow-sm"
                 >
                   <option value="all">Todas</option>
                   <option value="Vendas">Vendas</option>
                   <option value="Servicos">Serviços</option>
                   <option value="Fornecedores">Fornecedores</option>
                   <option value="Custos Fixos">Custos Fixos</option>
                 </select>
              </div>
           </div>

           {/* Totals Summary */}
           <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <span className="text-xs font-bold text-green-600 uppercase">Total Entradas</span>
                 <div className="text-xl font-bold text-green-700">R$ {totalIn.toFixed(2)}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <span className="text-xs font-bold text-red-600 uppercase">Total Saídas</span>
                 <div className="text-xl font-bold text-red-700">R$ {totalOut.toFixed(2)}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 shadow-sm">
                 <span className="text-xs font-bold text-slate-400 uppercase">Saldo do Período</span>
                 <div className={`text-xl font-bold ${(totalIn - totalOut) >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                    R$ {(totalIn - totalOut).toFixed(2)}
                 </div>
              </div>
           </div>

           {/* List */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Descrição</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cat.</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Valor</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-6 py-3 text-sm text-slate-600 whitespace-nowrap">{t.date}</td>
                          <td className="px-6 py-3 text-sm font-medium text-slate-800">{t.description}</td>
                          <td className="px-6 py-3">
                             <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600 border border-slate-200">
                               {t.category}
                             </span>
                          </td>
                          <td className={`px-6 py-3 text-sm font-bold text-right ${t.type === TransactionType.INCOME ? 'text-teal-600' : 'text-red-500'}`}>
                             {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-center">
                              <button 
                                onClick={() => handleDelete(t.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Lançamento"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                          Nenhum lançamento encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};