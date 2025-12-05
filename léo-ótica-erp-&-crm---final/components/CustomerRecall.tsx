import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, Plus, X, User, MapPin, Phone, Settings, Send } from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
import { Client } from '../types';

export const CustomerRecall: React.FC = () => {
  // INITIALIZE FROM LOCAL STORAGE OR MOCK
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('erp_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  // Registration Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    address: ''
  });

  // Config Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  // Bulk Send Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Filter clients for recall demo
  const recallList = clients.filter(c => c.id !== 2); 

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('erp_clients', JSON.stringify(clients));
  }, [clients]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.phone) {
      alert("Nome e Telefone são obrigatórios.");
      return;
    }

    const client: Client = {
      id: Math.floor(Math.random() * 10000),
      name: newClient.name,
      phone: newClient.phone,
      address: newClient.address,
      lastVisit: new Date().toISOString().split('T')[0],
      npsScore: undefined
    };

    setClients(prev => [client, ...prev]);
    alert(`✅ Cliente ${client.name} cadastrado com sucesso!`);
    setNewClient({ name: '', phone: '', address: '' });
    setIsModalOpen(false);
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const formattedPhone = phone.replace(/\D/g, ''); 
    const message = `Olá ${name}, somos da Léo Ótica! Percebemos que faz um tempo desde sua última visita. Vamos agendar um check-up?`;
    const url = `https://wa.me/55${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">CRM & Recall Inteligente</h2>
           <p className="text-slate-500">Gerencie sua base de clientes</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 rounded-md text-white text-sm font-medium hover:bg-teal-700 cursor-pointer shadow-sm transition-colors"
            >
              <Plus size={16} />
              Novo Cliente
            </button>
            <button 
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 text-sm font-medium hover:bg-blue-50 cursor-pointer transition-colors"
            >
              Configurar Mensagens
            </button>
            <button 
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2 bg-blue-600 rounded-md text-white text-sm font-medium hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Disparar em Massa
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-blue-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Endereço</th>
              <th className="px-6 py-3">Última Visita</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{client.name}</div>
                  <div className="text-xs text-slate-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">
                  {client.address || 'Endereço não informado'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400"/>
                        {client.lastVisit}
                    </div>
                </td>
                <td className="px-6 py-4">
                    {client.npsScore ? (
                        <span className={`font-bold ${client.npsScore >= 9 ? 'text-green-600' : 'text-yellow-600'}`}>
                            NPS: {client.npsScore}
                        </span>
                    ) : <span className="text-slate-400 text-xs">Sem Avaliação</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleWhatsApp(client.phone, client.name)}
                    className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors cursor-pointer shadow-sm"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Register Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                <User size={20} />
              </div>
              Novo Cliente
            </h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 shadow-sm"
                    placeholder="Ex: João da Silva"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="tel" 
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 shadow-sm"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                  <textarea 
                    rows={3}
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800 resize-none shadow-sm"
                    placeholder="Rua, Número, Bairro, Cidade..."
                  />
                </div>
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Configure Messages */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
             <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
             >
                <X size={20} />
             </button>
             <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Settings size={20} /> Configuração de Mensagens
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Mensagem Padrão de Recall</label>
                   <textarea className="w-full border border-slate-300 bg-white shadow-sm rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-blue-500 outline-none" defaultValue="Olá [Nome], tudo bem? Já faz um tempo que você fez seus óculos na Léo Ótica. Que tal agendar uma revisão gratuita?"></textarea>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">Frequência de Envio</label>
                   <select className="w-full border border-slate-300 bg-white shadow-sm rounded-lg p-2 text-sm">
                      <option>A cada 12 meses (Recomendado)</option>
                      <option>A cada 6 meses</option>
                      <option>A cada 18 meses</option>
                   </select>
                </div>
                <button onClick={() => {alert('Configurações salvas!'); setIsConfigModalOpen(false);}} className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold">Salvar Configurações</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Bulk Send */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
             <button 
                onClick={() => setIsBulkModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
             >
                <X size={20} />
             </button>
             <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Send size={20} /> Disparo em Massa
             </h3>
             <p className="text-sm text-slate-600 mb-6">Você está prestes a enviar mensagens para <strong>{recallList.length} clientes</strong> que estão no período de recall. Deseja continuar?</p>
             
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
                <p className="text-xs text-yellow-800 font-medium">⚠️ Nota: O WhatsApp Web será aberto para cada contato sequencialmente.</p>
             </div>

             <div className="flex gap-3">
                <button onClick={() => setIsBulkModalOpen(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-bold">Cancelar</button>
                <button onClick={() => {alert('Disparando mensagens...'); setIsBulkModalOpen(false);}} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold">Confirmar Envio</button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};