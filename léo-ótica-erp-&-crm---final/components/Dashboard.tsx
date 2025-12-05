import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { DollarSign, Clock, Calendar, CreditCard, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { MOCK_ORDERS } from '../constants';
import { OrderStatus } from '../types';

const dataCashFlow = [
  { name: 'Seg', receita: 4000, despesa: 2400 },
  { name: 'Ter', receita: 3000, despesa: 1398 },
  { name: 'Qua', receita: 2000, despesa: 9800 },
  { name: 'Qui', receita: 2780, despesa: 3908 },
  { name: 'Sex', receita: 1890, despesa: 4800 },
  { name: 'Sáb', receita: 2390, despesa: 3800 },
];

const dataFunnel = [
  { name: 'Orçamentos', value: 45 },
  { name: 'Vendas', value: 32 },
  { name: 'Laboratório', value: 28 },
  { name: 'Entregas', value: 25 },
];

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Executivo</h2>
        <span className="text-sm text-slate-500">Última atualização: Hoje, 14:30</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Faturamento Hoje</span>
            <div className="p-2 bg-teal-50 rounded-full text-teal-600">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">R$ 4.250,00</div>
          <span className="text-xs text-green-600 font-medium">+12% vs ontem</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">O.S. em Atraso</span>
            <div className="p-2 bg-red-50 rounded-full text-red-600">
              <Clock size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">3</div>
          <span className="text-xs text-red-500 font-medium">Laboratório Externo</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Exames Agendados</span>
            <div className="p-2 bg-blue-50 rounded-full text-blue-600">
              <Calendar size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">8</div>
          <span className="text-xs text-slate-500">Próximo às 15:00</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">Recebíveis (Cartão)</span>
            <div className="p-2 bg-purple-50 rounded-full text-purple-600">
              <CreditCard size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">R$ 12.400</div>
          <span className="text-xs text-slate-500">Próx. 7 dias</span>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo de Caixa */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Fluxo de Caixa Semanal</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataCashFlow}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="receita" stroke="#0d9488" fillOpacity={1} fill="url(#colorReceita)" name="Receitas" />
                <Area type="monotone" dataKey="despesa" stroke="#ef4444" fillOpacity={1} fill="url(#colorDespesa)" name="Despesas" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Vendas */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Funil de Vendas</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={dataFunnel}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Ordens de Serviço Recentes</h3>
          <button 
            onClick={() => onNavigate('orders')}
            className="text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14}/>
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-blue-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-3">O.S. #</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Previsão</th>
              <th className="px-6 py-3 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ORDERS.slice(0, 4).map((order) => (
              <tr 
                key={order.id} 
                onClick={() => onNavigate('orders')}
                className="hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 text-sm font-bold text-slate-900">#{order.id}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{order.clientName}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === OrderStatus.READY ? 'bg-green-100 text-green-800' : 
                      order.status === OrderStatus.LAB_SENT ? 'bg-yellow-100 text-yellow-800' :
                      order.status === OrderStatus.ASSEMBLY ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'}`}>
                    {order.status === OrderStatus.READY && <CheckCircle2 size={12} className="mr-1"/>}
                    {order.status === OrderStatus.LAB_SENT && <AlertTriangle size={12} className="mr-1"/>}
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{order.deliveryDate}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">
                  R$ {order.totalValue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};