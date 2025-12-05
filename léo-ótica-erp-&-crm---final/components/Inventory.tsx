import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, AlertTriangle, PackageCheck, TrendingUp, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  sku: string;
  type: string;
  brand: string;
  price: number;
  cost_price: number;
  stock: number;
  min_stock: number;
}

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    type: 'FRAME',
    brand: '',
    price: '',
    cost_price: '',
    stock: '',
    min_stock: '5'
  });

  // Load products from Supabase
  useEffect(() => {
    loadProducts();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      // Edit mode
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        type: product.type,
        brand: product.brand,
        price: product.price.toString(),
        cost_price: product.cost_price.toString(),
        stock: product.stock.toString(),
        min_stock: product.min_stock.toString()
      });
    } else {
      // New product mode
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(Math.random() * 100000)}`,
        type: 'FRAME',
        brand: '',
        price: '',
        cost_price: '',
        stock: '',
        min_stock: '5'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Usuário não autenticado');
        return;
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        type: formData.type,
        brand: formData.brand,
        price: parseFloat(formData.price) || 0,
        cost_price: parseFloat(formData.cost_price) || 0,
        stock: parseInt(formData.stock) || 0,
        min_stock: parseInt(formData.min_stock) || 5,
        user_id: user.id
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        alert('✅ Produto atualizado com sucesso!');
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        alert('✅ Produto cadastrado com sucesso!');
      }

      handleCloseModal();
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      if (error.code === '23505') {
        alert('❌ Erro: SKU já existe. Use um SKU único.');
      } else {
        alert('❌ Erro ao salvar produto');
      }
    }
  };

  const handleDelete = async (id: number, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Tem certeza que deseja excluir "${name}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      alert(`Produto "${name}" removido.`);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || product.type === filterType;
    const matchesLowStock = !showLowStockOnly || product.stock <= product.min_stock;
    return matchesSearch && matchesType && matchesLowStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Estoque</h2>
          <p className="text-slate-500">Controle completo de produtos e inventário</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Produtos</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{products.length}</h3>
            </div>
            <PackageCheck className="text-teal-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">{lowStockCount}</h3>
            </div>
            <AlertTriangle className="text-orange-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Valor Total</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <TrendingUp className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="FRAME">Armações</option>
            <option value="LENS">Lentes</option>
            <option value="CONTACT_LENS">Lentes de Contato</option>
            <option value="ACCESSORY">Acessórios</option>
          </select>

          <label className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700">Apenas Estoque Baixo</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 text-left">Produto</th>
                <th className="px-6 py-4 text-left">SKU</th>
                <th className="px-6 py-4 text-left">Tipo</th>
                <th className="px-6 py-4 text-left">Marca</th>
                <th className="px-6 py-4 text-right">Preço Venda</th>
                <th className="px-6 py-4 text-right">Preço Custo</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <PackageCheck className="mx-auto mb-3 text-slate-300" size={48} />
                    <p className="text-lg font-medium">Nenhum produto encontrado</p>
                    <p className="text-sm">Clique em "Novo Produto" para começar</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-slate-100 px-2 py-1 rounded">{product.sku}</code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{product.brand}</td>
                    <td className="px-6 py-4 text-right font-semibold text-green-600">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-600">
                      R$ {product.cost_price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${product.stock <= product.min_stock
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                        }`}>
                        {product.stock} un
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all cursor-pointer bg-white shadow-sm border border-slate-200"
                          title="Editar Produto"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(product.id, product.name, e)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all cursor-pointer bg-white shadow-sm border border-slate-200"
                          title="Excluir Produto"
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
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome do Produto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Ray-Ban Aviator"
                  />
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    SKU (Código) *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ex: RB3025"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none cursor-pointer"
                  >
                    <option value="FRAME">Armação</option>
                    <option value="LENS">Lente</option>
                    <option value="CONTACT_LENS">Lente de Contato</option>
                    <option value="ACCESSORY">Acessório</option>
                  </select>
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Ray-Ban"
                  />
                </div>

                {/* Preço de Venda */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                {/* Preço de Custo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Preço de Custo (R$) *
                  </label>
                  <input
                    type="number"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                {/* Estoque Atual */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="0"
                  />
                </div>

                {/* Estoque Mínimo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    name="min_stock"
                    value={formData.min_stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};