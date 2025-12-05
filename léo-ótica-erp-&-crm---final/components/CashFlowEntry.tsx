import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PAYMENT_METHODS = ['PIX', 'Dinheiro', 'Cartão Débito', 'Cartão Crédito', 'Boleto'];
const CATEGORIES_INCOME = ['Vendas', 'Serviços', 'Outros'];
const CATEGORIES_EXPENSE = ['Fornecedores', 'Custos Fixos', 'Despesas Operacionais', 'Outros'];

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  date: string;
  payment_method: string;
  status: string;
}

export const CashFlowEntry: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    type: 'INCOME' as 'INCOME' | 'EXPENSE',
    description: '',
    amount: '',
    category: '',
    paymentMethod: 'PIX',
    status: 'Pago'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();

    const subscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        loadTransactions();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('transactions')
        .insert([{
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          category: formData.category,
          date: new Date().toISOString().split('T')[0],
          payment_method: formData.paymentMethod,
          status: formData.status,
          user_id: user.id
        }]);

      if (error) throw error;

      alert('✅ Lançamento registrado!');
      setFormData({
        type: 'INCOME',
        description: '',
        amount: '',
        category: '',
        paymentMethod: 'PIX',
        status: 'Pago'
      });
      loadTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('❌ Erro ao registrar lançamento');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir esta transação?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação');
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Lançar Caixa</h2>
        <p className="text-slate-500">Registre entradas e saídas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Entradas</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">
                R$ {totalIncome.toFixed(2)}
              </h3>
            </div>
            <TrendingUp size={40} className="text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Saídas</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">
                R$ {totalExpense.toFixed(2)}
              </h3>
            </div>
            <TrendingDown size={40} className="text-red-500" />
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Saldo</p>
              <h3 className={`text-3xl font-bold mt-1 ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {balance.toFixed(2)}
              </h3>
            </div>
            <DollarSign size={40} className="text-teal-400" />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Lançamento</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE', category: '' })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                required
              >
                <option value="INCOME">Entrada</option>
                <option value="EXPENSE">Saída</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoria *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                required
              >
                <option value="">Selecione...</option>
                {(formData.type === 'INCOME' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Descrição *</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
                placeholder="Ex: Venda de óculos Ray-Ban"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Valor (R$) *</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Método *</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                required
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold cursor-pointer"
          >
            Registrar Lançamento
          </button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-800">Últimos Lançamentos</h3>
        </div>
        <table className="w-full">
          <thead className="bg-blue-50 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Descrição</th>
              <th className="px-6 py-4 text-left">Categoria</th>
              <th className="px-6 py-4 text-left">Método</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  Nenhum lançamento registrado
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-800">{t.description}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{t.payment_method}</td>
                  <td className={`px-6 py-4 text-right font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};