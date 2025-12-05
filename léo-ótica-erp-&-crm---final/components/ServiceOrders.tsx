import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, CheckCircle2, AlertTriangle, Clock, ArrowRight, Download, ClipboardList, Trash2, Edit2, Play, CheckSquare, Square } from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { OrderStatus, ServiceOrder } from '../types';

export const ServiceOrders: React.FC = () => {
  // INITIALIZE FROM LOCAL STORAGE OR MOCK
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const saved = localStorage.getItem('erp_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('erp_orders', JSON.stringify(orders));
  }, [orders]);

  // Toggle Selection
  const toggleSelectOrder = (id: number) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(oid => oid !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  // Logic to advance status
  const advanceStatus = (id: number, currentStatus: OrderStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusFlow = [
      OrderStatus.PENDING,
      OrderStatus.LAB_SENT,
      OrderStatus.ASSEMBLY,
      OrderStatus.QA,
      OrderStatus.READY,
      OrderStatus.DELIVERED
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIndex + 1];
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus } : o));
    }
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Tem certeza que deseja excluir a O.S. #${id}?`)) {
      setOrders(prev => prev.filter(o => o.id !== id));
      // Remove from selected if deleted
      setSelectedOrderIds(prev => prev.filter(oid => oid !== id));
    }
  };

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const order = orders.find(o => o.id === id);
    const newName = prompt("Editar nome do cliente:", order?.clientName);
    if (newName && order) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, clientName: newName } : o));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleExportPDF = () => {
    if (selectedOrderIds.length === 0) {
      alert("Selecione pelo menos uma ordem de serviço para exportar.");
      return;
    }
    
    // Trigger print which uses the hidden printable-report div
    const printContent = document.getElementById('printable-report');
    if (printContent) {
        window.print();
    } else {
        alert("Erro ao gerar relatório.");
    }
  };

  const handleReports = () => {
     alert("Relatório Geral de Produção sendo baixado (CSV)...");
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.READY: return 'bg-green-100 text-green-800 border-green-200';
      case OrderStatus.DELIVERED: return 'bg-slate-100 text-slate-800 border-slate-200';
      case OrderStatus.LAB_SENT: return 'bg-purple-100 text-purple-800 border-purple-200';
      case OrderStatus.ASSEMBLY: return 'bg-blue-100 text-blue-800 border-blue-200';
      case OrderStatus.QA: return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Ordens de Serviço</h2>
          <p className="text-slate-500">Gerencie o fluxo de produção e entregas</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleExportPDF}
             className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white border border-slate-800 rounded-lg text-sm font-medium hover:bg-slate-700 cursor-pointer"
            >
             <Download size={16} />
             Exportar Selecionados (PDF)
           </button>
           <button 
             onClick={handleReports}
             className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-lg text-sm font-medium text-white hover:bg-teal-700 shadow-sm cursor-pointer"
            >
             <Filter size={16} />
             Relatórios
           </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 print:hidden">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou nº O.S..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-slate-800 shadow-sm"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button 
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filterStatus === 'ALL' ? 'bg-slate-800 text-white' : 'bg-blue-50 text-slate-600 hover:bg-blue-100'}`}
            >
              Todos
            </button>
            <button 
               onClick={() => setFilterStatus(OrderStatus.PENDING)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filterStatus === OrderStatus.PENDING ? 'bg-yellow-500 text-white' : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'}`}
            >
              Aguardando
            </button>
            <button 
               onClick={() => setFilterStatus(OrderStatus.LAB_SENT)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filterStatus === OrderStatus.LAB_SENT ? 'bg-purple-500 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
            >
              Laboratório
            </button>
            <button 
               onClick={() => setFilterStatus(OrderStatus.READY)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${filterStatus === OrderStatus.READY ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
            >
              Prontos
            </button>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`ml-2 p-2 rounded-lg border cursor-pointer ${showAdvancedFilters ? 'bg-teal-50 border-teal-500 text-teal-700' : 'border-slate-300 text-slate-500 hover:bg-blue-50'}`}
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Inicial</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 text-slate-800 z-10" size={14} />
                <input 
                  type="date" 
                  className="w-full pl-8 pr-2 py-2 text-sm border border-slate-300 rounded focus:border-teal-500 outline-none bg-white text-slate-800 shadow-sm" 
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Data Final</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 text-slate-800 z-10" size={14} />
                <input 
                  type="date" 
                  className="w-full pl-8 pr-2 py-2 text-sm border border-slate-300 rounded focus:border-teal-500 outline-none bg-white text-slate-800 shadow-sm" 
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
             <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Serviço</label>
              <select className="w-full px-2 py-2 text-sm border border-slate-300 rounded focus:border-teal-500 outline-none bg-white text-slate-800 shadow-sm cursor-pointer">
                <option>Todos</option>
                <option>Óculos Completo</option>
                <option>Apenas Lentes</option>
                <option>Conserto</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Laboratório</label>
              <select className="w-full px-2 py-2 text-sm border border-slate-300 rounded focus:border-teal-500 outline-none bg-white text-slate-800 shadow-sm cursor-pointer">
                <option>Todos</option>
                <option>Hoya</option>
                <option>Essilor</option>
                <option>Zeiss</option>
                <option>Montagem Própria</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden print:hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-blue-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-4 py-4 w-10">
                 {/* Header Checkbox could select all, but keeping simple for now */}
              </th>
              <th className="px-6 py-4">O.S. / Data</th>
              <th className="px-6 py-4">Cliente / Itens</th>
              <th className="px-6 py-4">Status Atual</th>
              <th className="px-6 py-4">Previsão</th>
              <th className="px-6 py-4 text-right">Valor Total</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const isSelected = selectedOrderIds.includes(order.id);
                return (
                  <tr key={order.id} className={`hover:bg-blue-50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-4 align-top">
                        <button onClick={() => toggleSelectOrder(order.id)} className="text-slate-400 hover:text-teal-600 cursor-pointer">
                            {isSelected ? <CheckSquare size={20} className="text-teal-600" /> : <Square size={20} />}
                        </button>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-lg">#{order.id}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {order.createdAt}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-slate-800">{order.clientName}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {order.items?.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status === OrderStatus.READY && <CheckCircle2 size={12} className="mr-1.5"/>}
                        {order.status === OrderStatus.LAB_SENT && <Clock size={12} className="mr-1.5"/>}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">{order.deliveryDate}</span>
                        {/* Simple logic for urgency indicator */}
                        {order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.READY && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">2 dias</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="font-bold text-slate-900">R$ {order.totalValue.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 align-top text-center">
                      <div className="flex items-center justify-center gap-1">
                        {order.status !== OrderStatus.DELIVERED && (
                          <button 
                            type="button"
                            onClick={(e) => advanceStatus(order.id, order.status, e)}
                            className="p-2 text-teal-600 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all cursor-pointer mr-2 z-10 bg-white shadow-sm border-slate-200" 
                            title="Avançar Fase"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                        )}
                        
                        <button 
                          type="button"
                          onClick={(e) => handleEdit(order.id, e)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer z-10 bg-white shadow-sm border border-slate-200" 
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDelete(order.id, e)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all cursor-pointer z-10 bg-white shadow-sm border border-slate-200" 
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <ClipboardList size={48} className="mb-4 text-slate-200" />
                    <p className="text-lg font-medium">Nenhuma ordem de serviço encontrada</p>
                    <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Hidden Print Section for PDF Export */}
      <div id="printable-report" className="hidden print:block p-8 bg-white text-black font-sans">
        <h1 className="text-2xl font-bold mb-2">Relatório de Ordens de Serviço</h1>
        <p className="text-sm mb-6">Data de Emissão: {new Date().toLocaleDateString()}</p>
        
        <table className="w-full text-left border-collapse border border-black text-sm">
            <thead>
                <tr className="bg-gray-100">
                    <th className="border border-black p-2">ID</th>
                    <th className="border border-black p-2">Cliente</th>
                    <th className="border border-black p-2">Status</th>
                    <th className="border border-black p-2">Previsão</th>
                    <th className="border border-black p-2 text-right">Valor</th>
                </tr>
            </thead>
            <tbody>
                {orders.filter(o => selectedOrderIds.includes(o.id)).map(order => (
                    <tr key={order.id}>
                        <td className="border border-black p-2">{order.id}</td>
                        <td className="border border-black p-2">{order.clientName}</td>
                        <td className="border border-black p-2">{order.status}</td>
                        <td className="border border-black p-2">{order.deliveryDate}</td>
                        <td className="border border-black p-2 text-right">R$ {order.totalValue.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

    </div>
  );
};