import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, AlertTriangle, PackageCheck, TrendingUp, MoreHorizontal, Edit2, Trash2, Check, X } from 'lucide-react';
import { MOCK_PRODUCTS } from '../constants';
import { Product } from '../types';

export const Inventory: React.FC = () => {
  // INITIALIZE FROM LOCAL STORAGE OR MOCK
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('erp_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // New Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState<Partial<Product>>({
    name: '',
    type: 'FRAME',
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 5,
    brand: ''
  });

  // SAVE TO LOCAL STORAGE
  useEffect(() => {
    localStorage.setItem('erp_products', JSON.stringify(products));
  }, [products]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProductData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'minStock' ? parseFloat(value) : value
    }));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate new ID based on timestamp to avoid conflicts
    const newProduct: Product = {
      id: Date.now(),
      name: newProductData.name || 'Novo Produto',
      sku: `SKU-${Math.floor(Math.random() * 1000)}`,
      type: newProductData.type as any || 'ACCESSORY',
      brand: newProductData.brand || 'Genérica',
      price: newProductData.price || 0,
      costPrice: (newProductData.price || 0) * 0.4, 
      stock: newProductData.stock || 0,
      minStock: newProductData.minStock || 5
    };

    setProducts(prev => [newProduct, ...prev]);
    setIsModalOpen(false);
    
    // Reset form
    setNewProductData({ name: '', type: 'FRAME', price: 0, stock: 0, minStock: 5, brand: '' });
    alert("Produto salvo com sucesso!");
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (window.confirm("Tem certeza que deseja remover este produto do estoque? Esta ação não pode ser desfeita.")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const product = products.find(p => p.id === id);
    if (!product) return;

    const newStock = prompt(`Editar Estoque - ${product.name}\nDigite a nova quantidade:`, product.stock.toString());
    if (newStock !== null) {
        const stockInt = parseInt(newStock);
        if (!isNaN(stockInt)) {
            setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: stockInt } : p));
        }
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || product.type === filterType;
    const matchesLowStock = !showLowStockOnly || product.stock <= product.minStock;
    return matchesSearch && matchesType && matchesLowStock;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Gestão de Estoque</h2>
           <p className="text-slate-500">Controle de armações, lentes e insumos</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          Novo Produto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-2">
             <div className="text-sm font-medium text-slate-500">Valor em Estoque (Custo)</div>
             <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
               <TrendingUp size={18} />
             </div>
           </div>
           <div className="text-2xl font-bold text-slate-900">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
           <div className="flex justify-between items-start mb-2">
             <div className="text-sm font-medium text-slate-500">Total de Itens</div>
             <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
               <PackageCheck size={18} />
             </div>
           </div>
           <div className="text-2xl font-bold text-slate-900">{products.length} <span className="text-sm font-normal text-slate-500">SKUs</span></div>
        </div>

        <div className={`bg-white p-5 rounded-lg shadow-sm border ${lowStockCount > 0 ? 'border-red-200' : 'border-slate-200'}`}>
           <div className="flex justify-between items-start mb-2">
             <div className="text-sm font-medium text-slate-500">Estoque Baixo</div>
             <div className={`p-2 rounded-lg ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
               <AlertTriangle size={18} />
             </div>
           </div>
           <div className="text-2xl font-bold text-slate-900">{lowStockCount} <span className="text-sm font-normal text-slate-500">itens</span></div>
           {lowStockCount > 0 && <span className="text-xs text-red-500 font-medium">Requer reposição imediata</span>}
        </div>
      </div>

      {/* Filters Table */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nome, marca ou SKU..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm text-slate-800 shadow-sm"
                />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                <select 
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-teal-500 outline-none bg-white cursor-pointer shadow-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="ALL">Todas Categorias</option>
                    <option value="FRAME">Armações</option>
                    <option value="LENS">Lentes</option>
                    <option value="CONTACT_LENS">Lentes de Contato</option>
                    <option value="ACCESSORY">Acessórios</option>
                </select>

                <button 
                  onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border cursor-pointer shadow-sm ${showLowStockOnly ? 'bg-red-50 border-red-300 text-red-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50 bg-white'}`}
                >
                    <AlertTriangle size={16} />
                    <span className="whitespace-nowrap">Baixo Estoque</span>
                </button>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-blue-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="px-6 py-3">Produto / SKU</th>
                    <th className="px-6 py-3">Categoria / Marca</th>
                    <th className="px-6 py-3 text-right">Preço Venda</th>
                    <th className="px-6 py-3 text-center">Nível Estoque</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                    const stockPercentage = Math.min(100, (product.stock / (product.minStock * 3)) * 100);
                    const isLowStock = product.stock <= product.minStock;

                    return (
                        <tr key={product.id} className={`group hover:bg-blue-50 transition-colors ${isLowStock ? 'bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{product.name}</div>
                                <div className="text-xs text-slate-500 font-mono bg-blue-100 inline-block px-1 rounded mt-1">{product.sku}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-slate-800">{product.type === 'FRAME' ? 'Armação' : product.type === 'LENS' ? 'Lente' : 'Outros'}</div>
                                <div className="text-xs text-slate-500">{product.brand}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="font-medium text-slate-900">R$ {product.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="w-full max-w-[120px] mx-auto">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-slate-700">{product.stock} un</span>
                                        <span className="text-slate-400">Min: {product.minStock}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full ${isLowStock ? 'bg-red-500' : stockPercentage < 50 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${stockPercentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {isLowStock ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">
                                        Repor
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                        OK
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button type="button" onClick={(e) => handleEdit(product.id, e)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors cursor-pointer z-10 bg-white shadow-sm border border-slate-200" title="Editar Estoque">
                                      <Edit2 size={18} />
                                  </button>
                                  <button type="button" onClick={(e) => handleDelete(product.id, e)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors cursor-pointer z-10 bg-white shadow-sm border border-slate-200" title="Remover">
                                      <Trash2 size={18} />
                                  </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4">Novo Produto</h3>
            
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Produto</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                  value={newProductData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                   <select 
                     name="type"
                     className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                     value={newProductData.type}
                     onChange={handleInputChange}
                   >
                     <option value="FRAME">Armação</option>
                     <option value="LENS">Lente</option>
                     <option value="CONTACT_LENS">Lente Contato</option>
                     <option value="ACCESSORY">Acessório</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Marca</label>
                  <input 
                    name="brand"
                    type="text" 
                    className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                    value={newProductData.brand}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Preço Venda</label>
                   <div className="relative">
                     <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                     <input 
                       name="price"
                       type="number" 
                       step="0.01"
                       className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                       value={newProductData.price}
                       onChange={handleInputChange}
                     />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Inicial</label>
                   <input 
                     name="stock"
                     type="number" 
                     className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                     value={newProductData.stock}
                     onChange={handleInputChange}
                   />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                <input 
                  name="minStock"
                  type="number" 
                  className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-900 rounded-md focus:ring-teal-500 focus:border-teal-500 outline-none"
                  value={newProductData.minStock}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-md transition-colors shadow-sm"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};