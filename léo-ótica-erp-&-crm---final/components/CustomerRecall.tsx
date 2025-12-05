import React, { useState, useEffect } from 'react';
import { Users, Plus, Star, X, MessageCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Client {
  id: number;
  name: string;
  phone: string;
  address: string | null;
  last_visit: string | null;
  nps_score: number | null;
}

export const CustomerRecall: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();

    const subscription = supabase
      .channel('clients_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        loadClients();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadClients = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async () => {
    const name = prompt('Nome do cliente:');
    if (!name) return;

    const phone = prompt('Telefone:');
    if (!phone) return;

    const address = prompt('Endereço (opcional):');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('clients')
        .insert([{
          name,
          phone,
          address,
          user_id: user.id
        }]);

      if (error) throw error;

      alert('✅ Cliente cadastrado!');
      loadClients();
    } catch (error) {
      console.error('Error adding client:', error);
      alert('❌ Erro ao cadastrar cliente');
    }
  };

  const handleEditClient = async (client: Client) => {
    const newPhone = prompt('Editar Telefone:', client.phone);
    if (newPhone === null) return;

    const newAddress = prompt('Editar Endereço:', client.address || '');

    try {
      const { error } = await supabase
        .from('clients')
        .update({
          phone: newPhone,
          address: newAddress || null
        })
        .eq('id', client.id);

      if (error) throw error;

      loadClients();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDeleteClient = async (id: number, name: string) => {
    if (!window.confirm(`Excluir "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Erro ao excluir cliente');
    }
  };

  const handleWhatsApp = (phone: string, name: string) => {
    const message = `Olá ${name}! Tudo bem? Aqui é da Léo Ótica.`;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Clientes (CRM)</h2>
          <p className="text-slate-500">Gestão de relacionamento com clientes</p>
        </div>
        <button
          onClick={handleAddClient}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg cursor-pointer"
        >
          <Plus size={20} />
          Novo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-blue-50 text-slate-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Cliente</th>
              <th className="px-6 py-4 text-left">Telefone</th>
              <th className="px-6 py-4 text-left">Endereço</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                  <Users className="mx-auto mb-3 text-slate-300" size={48} />
                  <p className="text-lg font-medium">Nenhum cliente encontrado</p>
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{client.name}</td>
                  <td className="px-6 py-4 text-slate-600">{client.phone}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{client.address || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClient(client)}
                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClient(client.id, client.name)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => handleWhatsApp(client.phone, client.name)}
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm cursor-pointer"
                      >
                        <MessageCircle size={16} />
                        WhatsApp
                      </button>
                    </div>
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