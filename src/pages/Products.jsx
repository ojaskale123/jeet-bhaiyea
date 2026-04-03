import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { 
  getProducts, 
  addProduct, 
  updateProduct, 
  deleteProduct,
  getCategories,
  addCategory,
  getCurrentUser,
  addStockToProduct
} from '../utils/localStorage';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  X,
  Check,
  WarningCircle,
  XCircle,
  Package
} from 'phosphor-react';

const Products = () => {
  const location = useLocation();
  const currentUser = getCurrentUser();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStock, setFilterStock] = useState(location.state?.filter || 'all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    buyPrice: '',
    sellPrice: '',
    quantity: '',
    category: '',
    minStock: '5'
  });

  const loadProducts = useCallback(() => {
    setProducts(getProducts());
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Stock filter
    if (filterStock === 'low') {
      filtered = filtered.filter(p => p.quantity > 0 && p.quantity < (p.minStock || 5));
    } else if (filterStock === 'out') {
      filtered = filtered.filter(p => p.quantity === 0);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, filterCategory, filterStock]);

  useEffect(() => {
    loadProducts();
    setCategories(getCategories());
  }, [loadProducts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      buyPrice: parseFloat(formData.buyPrice),
      sellPrice: parseFloat(formData.sellPrice),
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock)
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
      if (!categories.includes(formData.category)) {
        addCategory(formData.category);
        setCategories(getCategories());
      }
    }

    loadProducts();
    resetForm();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      buyPrice: product.buyPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      quantity: product.quantity.toString(),
      category: product.category,
      minStock: (product.minStock || 5).toString()
    });
    setShowAddModal(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(productId);
      loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      buyPrice: '',
      sellPrice: '',
      quantity: '',
      category: '',
      minStock: '5'
    });
    setEditingProduct(null);
    setShowAddModal(false);
  };

  const getStockStatus = (product) => {
    if (product.quantity === 0) {
      return { label: 'OUT', color: '#E11D48', bg: 'rgba(225, 29, 72, 0.1)', icon: XCircle };
    } else if (product.quantity < (product.minStock || 5)) {
      return { label: 'LOW', color: '#D97757', bg: 'rgba(217, 119, 87, 0.1)', icon: WarningCircle };
    } else {
      return { label: 'IN STOCK', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', icon: Check };
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center justify-between px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Products</h1>
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-product-button"
            className="bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-2.5 rounded-md hover:bg-[#C8957A] transition-colors flex items-center gap-2 font-['Manrope']"
          >
            <Plus size={20} weight="bold" />
            Add Product
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-product-input"
                placeholder="Search products..."
                className="w-full bg-[#151A22] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              data-testid="filter-category-select"
              className="w-full bg-[#151A22] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value)}
              data-testid="filter-stock-select"
              className="w-full bg-[#151A22] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Products Table */}
          <div className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262B35]">
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Product</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">SKU</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Category</th>
                    {currentUser?.role !== 'WORKER' && (
                      <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Buy Price</th>
                    )}
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Sell Price</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Quantity</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Status</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <Package size={48} className="text-[#262B35] mx-auto mb-3" />
                        <p className="text-[#9CA3AF] font-['Manrope']">No products found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product);
                      const StatusIcon = status.icon;
                      return (
                        <tr key={product.id} className="border-b border-[#262B35]/50 hover:bg-[#0B0E14] transition-colors">
                          <td className="py-4 px-6">
                            <p className="text-white font-['Manrope'] font-medium">{product.name}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-[#9CA3AF] font-['JetBrains_Mono'] text-sm">{product.sku}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider border border-[#262B35] text-[#9CA3AF] rounded-md">
                              {product.category}
                            </span>
                          </td>
                          {currentUser?.role !== 'WORKER' && (
                            <td className="py-4 px-6">
                              <p className="text-[#9CA3AF] font-['JetBrains_Mono']">₹{product.buyPrice?.toLocaleString('en-IN') || '0'}</p>
                            </td>
                          )}
                          <td className="py-4 px-6">
                            <p className="text-white font-['JetBrains_Mono'] font-medium">₹{product.sellPrice?.toLocaleString('en-IN') || product.price?.toLocaleString('en-IN') || '0'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-white font-['JetBrains_Mono'] font-semibold">{product.quantity}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span 
                              className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border rounded-md flex items-center gap-1 w-fit"
                              style={{ color: status.color, backgroundColor: status.bg, borderColor: status.color }}
                            >
                              <StatusIcon size={14} weight="fill" />
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(product)}
                                data-testid={`edit-product-${product.id}`}
                                className="p-2 text-[#B4846C] hover:bg-[#B4846C]/10 rounded-md transition-colors"
                              >
                                <PencilSimple size={18} weight="bold" />
                              </button>
                              {currentUser?.role === 'OWNER' && (
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  data-testid={`delete-product-${product.id}`}
                                  className="p-2 text-[#E11D48] hover:bg-[#E11D48]/10 rounded-md transition-colors"
                                >
                                  <Trash size={18} weight="bold" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A22] border border-[#262B35] rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#262B35] flex items-center justify-between sticky top-0 bg-[#151A22] z-10">
              <h2 className="font-['Clash_Display'] text-2xl text-white tracking-tight">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={resetForm}
                data-testid="close-modal-button"
                className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#0B0E14] rounded-md transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="product-name-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    data-testid="product-sku-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    list="categories"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    data-testid="product-category-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                    required
                  />
                  <datalist id="categories">
                    {categories.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Buy Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: e.target.value })}
                    data-testid="product-buy-price-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Sell Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                    data-testid="product-sell-price-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    data-testid="product-quantity-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Min Stock Level *
                  </label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    data-testid="product-minstock-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="submit-product-button"
                  className="flex-1 bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-3 rounded-md hover:bg-[#C8957A] transition-colors flex items-center justify-center gap-2 font-['Manrope']"
                >
                  <Check size={20} weight="bold" />
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-transparent border border-[#262B35] text-[#9CA3AF] hover:bg-[#1E2430] hover:text-white hover:border-[#9CA3AF] transition-all rounded-md font-['Manrope'] font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
