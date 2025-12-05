import React, { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle2, AlertTriangle, Clock, ArrowRight, Download, Trash2, Edit2, CheckSquare, Square, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ORDER_STATUSES = {
  PENDING: 'Pendente',
  LAB_SENT: 'Enviado Lab',
  ASSEMBLY: 'Montagem',
  QA: 'Controle Qualidade',
  READY: 'Pronto',
  DELIVERED: 'Entregue'
};

interface ServiceOrder {
  id: number;
  client_id: number | null;
  client_name: string;
  total_value: number;
  status: string;
  created_at: string;
  delivery_date: string | null;
  items: string[];
}

export const ServiceOrders: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  const [formData, setFormData] = useState({
    client_name: '',
    total_value: '',
    status: 'PENDING',
    delivery_date: '',
    items: ''
  });

  useEffect(() => {
    loadOrders();

    const subscription = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, () => {
        loadOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (order?: ServiceOrder) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        client_name: order.client_name,
        total_value: order.total_value.toString(),
        status: order.status,
        delivery_date: order.delivery_date || '',
        items: Array.isArray(order.items) ? order.items.join(', ') : ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrder(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const orderData = {
        client_name: formData.client_name,
        total_value: parseFloat(formData.total_value) || 0,
        status: formData.status,
        delivery_date: formData.delivery_date || null,
        items: formData.items.split(',').map(i => i.trim()).filter(i => i),
        user_id: user.id
      };

      if (editingOrder) {
        const { error } = await supabase
          .from('service_orders')
          .update(orderData)
          .eq('id', editingOrder.id);

        if (error) throw error;
        alert('✅ Ordem atualizada com sucesso!');
      }

      handleCloseModal();
      loadOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('❌ Erro ao salvar ordem');
    }
  };

  const advanceStatus = async (id: number, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const statusFlow = ['PENDING', 'LAB_SENT', 'ASSEMBLY', 'QA', 'READY', 'DELIVERED'];
    const currentIndex = statusFlow.indexOf(currentStatus);

    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];

      try {
        const { error } = await supabase
          .from('service_orders')
          .update({ status: nextStatus })
          .eq('id', id);

        if (error) throw error;
        loadOrders();
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Erro ao avançar status');
      }
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!window.confirm(`Tem certeza que deseja excluir a O.S. #${id}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== id));
      setSelectedOrderIds(prev => prev.filter(oid => oid !== id));
      alert('Ordem excluída.');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Erro ao excluir ordem');
    }
  };

  const toggleSelectOrder = (id: number) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(oid => oid !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const handleExportPDF = () => {
    if (selectedOrderIds.length === 0) {
      alert("⚠️ Selecione pelo menos uma ordem para exportar.");
      return;
    }

    alert(`✅ Preparando ${selectedOrderIds.length} ordem(ns).\n\nNa janela de impressão:\n• Salvar como PDF`);
    setTimeout(() => window.print(), 300);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = order.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      PENDING: 'bg-gray-100 text-gray-700',
      LAB_SENT: 'bg-blue-100 text-blue-700',
      ASSEMBLY: 'bg-yellow-100 text-yellow-700',
      QA: 'bg-purple-100 text-purple-700',
      READY: 'bg-green-100 text-green-700',
      DELIVERED: 'bg-teal-100 text-teal-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">Carregando ordens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h2>
          <p className="text-slate-500">Gestão completa de O.S.</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 cursor-pointer"
        >
          <Download size={16} />
          Exportar Selecionadas
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente ou #ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDING">Pendente</option>
            <option value="LAB_SENT">Enviado Lab</option>
            <option value="ASSEMBLY">Montagem</option>
            <option value="QA">Controle Qualidade</option>
            <option value="READY">Pronto</option>
            <option value="DELIVERED">Entregue</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-50 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-4 text-center">Sel</th>
              <th className="px-6 py-4 text-left">#ID</th>
              <th className="px-6 py-4 text-left">Cliente</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-left">Entrega</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <p className="text-lg font-medium">Nenhuma ordem encontrada</p>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">#{order.id}</td>
                  <td className="px-6 py-4 text-slate-700">{order.client_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-green-600">
                    R$ {order.total_value.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {order.delivery_date || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {order.status !== 'DELIVERED' && (
                        <button
                          type="button"
                          onClick={(e) => advanceStatus(order.id, order.status, e)}
                          className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-100 rounded-lg cursor-pointer"
                          title="Avançar Status"
                        >
                          <ArrowRight size={18} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleOpenModal(order)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(order.id, e)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Editar Ordem #{editingOrder.id}</h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente *</label>
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Valor Total (R$) *</label>
                  <input
                    type="number"
                    name="total_value"
                    value={formData.total_value}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="PENDING">Pendente</option>
                    <option value="LAB_SENT">Enviado Lab</option>
                    <option value="ASSEMBLY">Montagem</option>
                    <option value="QA">Controle Qualidade</option>
                    <option value="READY">Pronto</option>
                    <option value="DELIVERED">Entregue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Data de Entrega</label>
                  <input
                    type="date"
                    name="delivery_date"
                    value={formData.delivery_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Itens (separados por vírgula)</label>
                  <textarea
                    name="items"
                    value={formData.items}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Armação Ray-Ban, Lente Varilux"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden printable report */}
      <div id="printable-report" className="hidden print:block">
        <h1>Relatório de Ordens de Serviço</h1>
        {orders.filter(o => selectedOrderIds.includes(o.id)).map(order => (
          <div key={order.id}>
            <p>O.S. #{order.id} - {order.client_name} - R$ {order.total_value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};