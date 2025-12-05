import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Eye, Glasses, Printer, CheckCircle, FileCheck } from 'lucide-react';
import { MOCK_CLIENTS, MOCK_PRODUCTS, MOCK_ORDERS, MOCK_TRANSACTIONS } from '../constants';
import { Product, OrderStatus, TransactionType, PaymentMethod } from '../types';

interface NewSaleProps {
  onNavigate: (tab: string) => void;
}

export const NewSale: React.FC<NewSaleProps> = ({ onNavigate }) => {
  // Read Clients and Products from LocalStorage to allow selection of newly created items
  const [availableClients, setAvailableClients] = useState(() => {
    const saved = localStorage.getItem('erp_clients');
    return saved ? JSON.parse(saved) : MOCK_CLIENTS;
  });
  
  const [availableProducts, setAvailableProducts] = useState(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [clientAddress, setClientAddress] = useState('');
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number>(0);
  
  // Optical Recipe State
  const [recipe, setRecipe] = useState({
    od: { sph: -1.25, cyl: -0.50, axis: 180, pd: 32, add: 0 },
    oe: { sph: -1.50, cyl: -0.75, axis: 175, pd: 32, add: 0 },
  });

  useEffect(() => {
    if (selectedClient) {
      const client = availableClients.find((c: any) => c.id === selectedClient);
      if (client) {
        setClientAddress(client.address || '');
      }
    }
  }, [selectedClient, availableClients]);

  const addToCart = (productId: number) => {
    const product = availableProducts.find((p: any) => p.id === productId);
    if (product) {
      setCart([...cart, { product, qty: 1 }]);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price * item.qty), 0);

  const getClientName = () => {
    return availableClients.find((c: any) => c.id === selectedClient)?.name || "Cliente Balcão";
  };

  const handleFinishSale = () => {
    if (!selectedClient && cart.length === 0) {
      const proceed = window.confirm("Nenhum cliente selecionado. Deseja prosseguir como venda balcão?");
      if (!proceed) return;
    }

    // 1. Generate ID
    const newId = Math.floor(Math.random() * 10000) + 1000;
    setLastOrderId(newId);

    // 2. PERSISTENCE LOGIC (Save to LocalStorage so other tabs see it)
    
    // A) Save Order
    const savedOrders = localStorage.getItem('erp_orders');
    const existingOrders = savedOrders ? JSON.parse(savedOrders) : MOCK_ORDERS;
    
    const newOrder = {
        id: newId,
        clientId: selectedClient || 0,
        clientName: getClientName(),
        totalValue: total,
        status: OrderStatus.PENDING,
        createdAt: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 days
        items: cart.map(i => i.product.name)
    };
    
    localStorage.setItem('erp_orders', JSON.stringify([newOrder, ...existingOrders]));

    // B) Save Transaction (Cash Flow)
    const savedTrans = localStorage.getItem('erp_transactions');
    const existingTrans = savedTrans ? JSON.parse(savedTrans) : MOCK_TRANSACTIONS;

    const newTransaction = {
        id: Date.now(),
        description: `Venda O.S. #${newId} - ${getClientName()}`,
        amount: total,
        type: TransactionType.INCOME,
        category: 'Vendas',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: PaymentMethod.CREDIT_CARD, // Defaulting for MVP
        status: 'Pago'
    };

    localStorage.setItem('erp_transactions', JSON.stringify([newTransaction, ...existingTrans]));

    // 3. Show Success UI
    setShowSuccess(true);
    
    // 4. Trigger Print after a slight delay to allow UI to render
    setTimeout(() => {
      window.print();
    }, 1000);
  };

  const resetSale = () => {
    setShowSuccess(false);
    setCart([]);
    setSelectedClient(null);
    setClientAddress('');
    setRecipe({
        od: { sph: 0, cyl: 0, axis: 0, pd: 0, add: 0 },
        oe: { sph: 0, cyl: 0, axis: 0, pd: 0, add: 0 },
    });
  };

  const getFrames = () => cart.filter(i => i.product.type === 'FRAME').map(i => i.product.name).join(', ');
  const getLenses = () => cart.filter(i => i.product.type === 'LENS').map(i => i.product.name).join(', ');

  if (showSuccess) {
    return (
      <>
        {/* Success Screen (Screen Only) */}
        <div className="h-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 print:hidden animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Venda Finalizada com Sucesso!</h2>
          <p className="text-slate-500 mb-8 text-lg">A Ordem de Serviço <span className="font-bold text-slate-800">#{lastOrderId}</span> foi gerada e salva.</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Printer size={20} />
              Imprimir PDF Novamente
            </button>
            <button 
              onClick={resetSale}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Nova Venda
            </button>
          </div>
        </div>

        {/* Hidden Print Layout (Used by window.print) */}
        <div className="hidden print:block p-8 bg-white text-black font-sans">
            <div className="border border-black p-6 rounded-sm">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
                <div>
                <h1 className="text-3xl font-bold uppercase tracking-wide">Léo Ótica</h1>
                <p className="text-sm mt-1">Soluções em Visão e Estilo</p>
                </div>
                <div className="text-right">
                <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
                <p className="text-2xl font-mono mt-1">#{lastOrderId}</p>
                <p className="text-sm mt-1">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                <h3 className="font-bold border-b border-black mb-2 uppercase text-xs">Dados do Cliente</h3>
                <p className="text-lg font-bold">{getClientName()}</p>
                <p className="text-sm">{clientAddress || 'Endereço não informado'}</p>
                <p className="text-sm mt-1">Tel: {availableClients.find((c:any) => c.id === selectedClient)?.phone || 'N/A'}</p>
                </div>
                <div>
                <h3 className="font-bold border-b border-black mb-2 uppercase text-xs">Especificações do Pedido</h3>
                <p className="text-sm"><span className="font-bold">Armação:</span> {getFrames() || 'Cliente Próprio'}</p>
                <p className="text-sm"><span className="font-bold">Lentes:</span> {getLenses() || 'N/A'}</p>
                <p className="text-sm mt-1"><span className="font-bold">Previsão:</span> 7 dias úteis</p>
                </div>
            </div>

            {/* Recipe Grid */}
            <div className="mb-6">
                <h3 className="font-bold border-b border-black mb-3 uppercase text-xs">Receita / Medidas</h3>
                <table className="w-full text-center border-collapse border border-black">
                <thead className="bg-gray-100">
                    <tr>
                    <th className="border border-black py-1">OLHO</th>
                    <th className="border border-black py-1">ESFÉRICO</th>
                    <th className="border border-black py-1">CILÍNDRICO</th>
                    <th className="border border-black py-1">EIXO</th>
                    <th className="border border-black py-1">DNP</th>
                    <th className="border border-black py-1">ADIÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className="border border-black py-2 font-bold">OD</td>
                    <td className="border border-black py-2">{recipe.od.sph}</td>
                    <td className="border border-black py-2">{recipe.od.cyl}</td>
                    <td className="border border-black py-2">{recipe.od.axis}°</td>
                    <td className="border border-black py-2">{recipe.od.pd}</td>
                    <td className="border border-black py-2">{recipe.od.add}</td>
                    </tr>
                    <tr>
                    <td className="border border-black py-2 font-bold">OE</td>
                    <td className="border border-black py-2">{recipe.oe.sph}</td>
                    <td className="border border-black py-2">{recipe.oe.cyl}</td>
                    <td className="border border-black py-2">{recipe.oe.axis}°</td>
                    <td className="border border-black py-2">{recipe.oe.pd}</td>
                    <td className="border border-black py-2">{recipe.oe.add}</td>
                    </tr>
                </tbody>
                </table>
            </div>

            {/* Financials */}
            <div className="flex justify-end mt-8">
                <div className="w-1/2">
                    <div className="flex justify-between border-b border-black py-1">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b border-black py-1">
                    <span>Desconto</span>
                    <span>R$ 0,00</span>
                    </div>
                    <div className="flex justify-between py-2 text-xl font-bold">
                    <span>TOTAL A PAGAR</span>
                    <span>R$ {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-black flex justify-between text-xs">
                <div className="w-1/3 text-center border-t border-gray-400 pt-2">
                Assinatura do Cliente
                </div>
                <div className="w-1/3 text-center border-t border-gray-400 pt-2">
                Visto do Laboratório
                </div>
            </div>
            </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* SCREEN LAYOUT (Hidden when printing) */}
      <div className="grid grid-cols-12 gap-6 h-full print:hidden">
        {/* Left Column: Input Forms */}
        <div className="col-span-8 space-y-6">
          
          {/* 1. Client Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Cliente
            </h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente por nome, CPF ou telefone..." 
                className="w-full pl-10 pr-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-slate-800"
              />
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {availableClients.map((client: any) => (
                <button 
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer ${selectedClient === client.id ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium' : 'border-slate-200 text-slate-600 hover:bg-blue-50'}`}
                >
                  {client.name}
                </button>
              ))}
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Endereço do Cliente</label>
              <input 
                type="text" 
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade"
                className="w-full p-2 bg-white border border-slate-300 rounded text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* 2. Optical Prescription (Receita) */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
                Receita / Exame
              </h3>
              <button className="text-sm text-teal-600 font-medium hover:underline flex items-center cursor-pointer">
                <Eye size={16} className="mr-1"/> Ver Histórico
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* OD - Olho Direito */}
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <span className="text-xl font-bold text-blue-800 mr-2">OD</span>
                  <span className="text-xs uppercase text-blue-600 tracking-wider font-semibold">Olho Direito</span>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ESFÉRICO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.od.sph} 
                      onChange={(e) => setRecipe({...recipe, od: {...recipe.od, sph: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-blue-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">CILÍNDRICO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.od.cyl} 
                      onChange={(e) => setRecipe({...recipe, od: {...recipe.od, cyl: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-blue-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">EIXO</label>
                    <input 
                      type="number" 
                      value={recipe.od.axis} 
                      onChange={(e) => setRecipe({...recipe, od: {...recipe.od, axis: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-blue-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">DNP</label>
                    <input 
                      type="number" 
                      value={recipe.od.pd} 
                      onChange={(e) => setRecipe({...recipe, od: {...recipe.od, pd: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-blue-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ADIÇÃO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.od.add} 
                      onChange={(e) => setRecipe({...recipe, od: {...recipe.od, add: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-blue-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>
              </div>

              {/* OE - Olho Esquerdo */}
              <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-100">
                <div className="flex items-center mb-3">
                  <span className="text-xl font-bold text-teal-800 mr-2">OE</span>
                  <span className="text-xs uppercase text-teal-600 tracking-wider font-semibold">Olho Esquerdo</span>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ESFÉRICO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.oe.sph} 
                      onChange={(e) => setRecipe({...recipe, oe: {...recipe.oe, sph: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-teal-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">CILÍNDRICO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.oe.cyl} 
                      onChange={(e) => setRecipe({...recipe, oe: {...recipe.oe, cyl: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-teal-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">EIXO</label>
                    <input 
                      type="number" 
                      value={recipe.oe.axis} 
                      onChange={(e) => setRecipe({...recipe, oe: {...recipe.oe, axis: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-teal-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">DNP</label>
                    <input 
                      type="number" 
                      value={recipe.oe.pd} 
                      onChange={(e) => setRecipe({...recipe, oe: {...recipe.oe, pd: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-teal-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ADIÇÃO</label>
                    <input 
                      type="number" step="0.25" 
                      value={recipe.oe.add} 
                      onChange={(e) => setRecipe({...recipe, oe: {...recipe.oe, add: Number(e.target.value)}})}
                      className="w-full p-2 bg-white border border-teal-200 rounded font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Products & Total */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* 3. Product Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
              Produtos
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Adicionar Item</label>
              <div className="space-y-2">
                {availableProducts.map((product: any) => (
                  <button 
                    key={product.id}
                    onClick={() => addToCart(product.id)}
                    className="w-full flex justify-between items-center p-3 border border-slate-200 rounded hover:border-teal-500 hover:bg-teal-50 transition-all text-left group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-800">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.brand} • {product.type}</div>
                    </div>
                    <div className="text-sm font-bold text-teal-600 group-hover:text-teal-700">
                      <Plus size={16} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">Resumo do Pedido</h4>
              <div className="space-y-3">
                {cart.length === 0 && <div className="text-sm text-slate-400 italic text-center py-4">Nenhum item selecionado</div>}
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 rounded text-slate-600">
                        <Glasses size={14} />
                      </div>
                      <span className="text-sm text-slate-700 max-w-[150px] truncate">{item.product.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">R$ {item.product.price}</span>
                      <button onClick={() => removeFromCart(idx)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Totals & Actions */}
          <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">Subtotal</span>
              <span className="font-medium">R$ {total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-400 text-sm">Desconto</span>
              <span className="font-medium text-teal-400">- R$ 0,00</span>
            </div>
            <div className="border-t border-slate-700 pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-bold text-teal-400">R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <button 
              onClick={handleFinishSale}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-95"
            >
              <FileCheck size={20} />
              Finalizar Venda & Gerar O.S.
            </button>
          </div>

        </div>
      </div>
    </>
  );
};