import { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  getProducts, 
  updateProduct, 
  addSale,
  getCurrentUser,
  getProductBySku,
  addCustomer,
  getCustomerByPhone,
  updateCustomer
} from '../utils/localStorage';
import { sendPurchaseThankYouMessage } from '../utils/whatsapp';
import { 
  MagnifyingGlass, 
  ShoppingCart, 
  Barcode,
  Plus,
  Minus,
  Trash,
  CheckCircle,
  WarningCircle,
  User,
  Phone,
  WhatsappLogo
} from 'phosphor-react';
import { toast } from 'sonner';

const Sell = () => {
  const currentUser = getCurrentUser();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const barcodeRef = useRef(null);

  const loadProducts = useCallback(() => {
    setProducts(getProducts());
  }, []);

  useEffect(() => {
    loadProducts();
    // Auto-focus barcode input
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [loadProducts]);

  // Handle barcode scan (rapid input simulation)
  const handleBarcodeInput = (e) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      const product = getProductBySku(barcodeInput.trim());
      if (product) {
        addToCart(product);
        toast.success(`Added ${product.name} to cart`, {
          description: `SKU: ${product.sku}`,
        });
      } else {
        toast.error('Product not found', {
          description: `No product with SKU: ${barcodeInput}`,
        });
      }
      setBarcodeInput('');
    }
  };

  const addToCart = (product) => {
    if (product.quantity === 0) {
      toast.error('Out of stock', {
        description: `${product.name} is currently out of stock`,
      });
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (existingItem.sellQuantity < product.quantity) {
        setCart(cart.map(item => 
          item.id === product.id 
            ? { ...item, sellQuantity: item.sellQuantity + 1 }
            : item
        ));
      } else {
        toast.error('Insufficient stock', {
          description: `Only ${product.quantity} units available`,
        });
      }
    } else {
      setCart([...cart, { ...product, sellQuantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.sellQuantity + delta;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.quantity) {
          toast.error('Insufficient stock', {
            description: `Only ${item.quantity} units available`,
          });
          return item;
        }
        return { ...item, sellQuantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.sellPrice * item.sellQuantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty', {
        description: 'Add products to cart before checkout',
      });
      return;
    }

    // Show customer form if not filled
    if (!customerName || !customerPhone) {
      setShowCustomerForm(true);
      toast.error('Customer information required', {
        description: 'Please fill customer details',
      });
      return;
    }

    // Add or get customer
    let customer = getCustomerByPhone(customerPhone);
    if (!customer) {
      customer = addCustomer({
        name: customerName,
        phone: customerPhone
      });
    }

    const totalAmount = calculateTotal();
    const itemCount = cart.reduce((sum, item) => sum + item.sellQuantity, 0);

    // Update stock and create sales
    cart.forEach(item => {
      const newQuantity = item.quantity - item.sellQuantity;
      updateProduct(item.id, { quantity: newQuantity });
      
      addSale({
        productId: item.id,
        productName: item.name,
        sku: item.sku,
        quantity: item.sellQuantity,
        price: item.sellPrice,
        totalPrice: item.sellPrice * item.sellQuantity,
        soldBy: currentUser.username,
        soldByRole: currentUser.role,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone
      });
    });

    // Update customer stats
    updateCustomer(customer.id, {
      totalPurchases: (customer.totalPurchases || 0) + 1,
      totalSpent: (customer.totalSpent || 0) + totalAmount,
      lastPurchase: new Date().toISOString()
    });

    // Send WhatsApp message
    sendPurchaseThankYouMessage(customer, totalAmount, itemCount);

    toast.success('Sale completed successfully', {
      description: `Total: ₹${totalAmount.toLocaleString('en-IN')} - WhatsApp message sent`,
    });

    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setShowCustomerForm(false);
    setProducts(getProducts());
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Sell Products</h1>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products List - Left Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Barcode Scanner */}
              <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-[rgba(180,132,108,0.1)]">
                    <Barcode size={24} weight="duotone" className="text-[#B4846C]" />
                  </div>
                  <div>
                    <h3 className="font-['Clash_Display'] text-lg text-white tracking-tight">Barcode Scanner</h3>
                    <p className="text-xs text-[#9CA3AF] font-['Manrope']">Scan or enter product SKU</p>
                  </div>
                </div>
                <input
                  ref={barcodeRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeInput}
                  data-testid="barcode-input"
                  placeholder="Scan barcode or type SKU and press Enter..."
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-3 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                />
              </div>

              {/* Search Products */}
              <div className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden">
                <div className="p-6 border-b border-[#262B35]">
                  <div className="relative">
                    <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="search-sell-product-input"
                      placeholder="Search products to sell..."
                      className="w-full bg-[#0B0E14] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                    />
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id}
                      className="p-4 border-b border-[#262B35]/50 hover:bg-[#0B0E14] transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-['Manrope'] text-white font-medium">{product.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="font-['JetBrains_Mono'] text-xs text-[#9CA3AF]">{product.sku}</p>
                          <span className="text-[#9CA3AF]">•</span>
                          <p className="font-['JetBrains_Mono'] text-sm text-[#B4846C] font-semibold">₹{product.sellPrice.toLocaleString('en-IN')}</p>
                        </div>
                        <p className={`font-['JetBrains_Mono'] text-xs mt-1 ${
                          product.quantity === 0 ? 'text-[#E11D48]' : 
                          product.quantity < 5 ? 'text-[#D97757]' : 'text-[#059669]'
                        }`}>
                          {product.quantity === 0 ? 'OUT OF STOCK' : `${product.quantity} in stock`}
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        data-testid={`add-to-cart-${product.id}`}
                        disabled={product.quantity === 0}
                        className="bg-[#B4846C] text-[#0B0E14] p-2.5 rounded-md hover:bg-[#C8957A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={20} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-[#151A22] border border-[#262B35] rounded-md sticky top-24">
                <div className="p-6 border-b border-[#262B35] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[rgba(180,132,108,0.1)]">
                    <ShoppingCart size={24} weight="duotone" className="text-[#B4846C]" />
                  </div>
                  <div>
                    <h3 className="font-['Clash_Display'] text-xl text-white tracking-tight">Cart</h3>
                    <p className="text-xs text-[#9CA3AF] font-['Manrope']">{cart.length} items</p>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto p-6 space-y-3">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className="text-[#262B35] mx-auto mb-3" />
                      <p className="text-[#9CA3AF] font-['Manrope'] text-sm">Cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="bg-[#0B0E14] border border-[#262B35] p-4 rounded-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-['Manrope'] text-white font-medium text-sm">{item.name}</p>
                            <p className="font-['JetBrains_Mono'] text-xs text-[#9CA3AF] mt-1">{item.sku}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            data-testid={`remove-from-cart-${item.id}`}
                            className="text-[#E11D48] hover:bg-[#E11D48]/10 p-1.5 rounded transition-colors"
                          >
                            <Trash size={16} weight="bold" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 bg-[#151A22] border border-[#262B35] rounded-md">
                            <button
                              onClick={() => updateCartQuantity(item.id, -1)}
                              data-testid={`decrease-quantity-${item.id}`}
                              className="p-2 text-[#9CA3AF] hover:text-white transition-colors"
                            >
                              <Minus size={16} weight="bold" />
                            </button>
                            <span className="font-['JetBrains_Mono'] text-white font-semibold min-w-[30px] text-center">
                              {item.sellQuantity}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item.id, 1)}
                              data-testid={`increase-quantity-${item.id}`}
                              className="p-2 text-[#9CA3AF] hover:text-white transition-colors"
                            >
                              <Plus size={16} weight="bold" />
                            </button>
                          </div>
                          <p className="font-['JetBrains_Mono'] text-[#B4846C] font-semibold">
                            ₹{(item.sellPrice * item.sellQuantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-6 border-t border-[#262B35] space-y-4">
                  {/* Customer Information */}
                  {cart.length > 0 && (
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowCustomerForm(!showCustomerForm)}
                        className="w-full flex items-center justify-between p-3 bg-[#0B0E14] border border-[#262B35] rounded-md hover:border-[#B4846C]/40 transition-all"
                      >
                        <span className="font-['Manrope'] text-white text-sm flex items-center gap-2">
                          <User size={16} />
                          Customer Information
                        </span>
                        <span className="text-xs text-[#9CA3AF]">
                          {customerName && customerPhone ? '✓ Added' : 'Click to add'}
                        </span>
                      </button>
                      
                      {showCustomerForm && (
                        <div className="space-y-3 p-3 bg-[#0B0E14] border border-[#262B35] rounded-md">
                          <div>
                            <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              data-testid="checkout-customer-name"
                              className="w-full bg-[#151A22] border border-[#262B35] text-white px-3 py-2 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope'] text-sm"
                              placeholder="Customer name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">
                              Phone
                            </label>
                            <input
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              data-testid="checkout-customer-phone"
                              className="w-full bg-[#151A22] border border-[#262B35] text-white px-3 py-2 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono'] text-sm"
                              placeholder="+91XXXXXXXXXX"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF]">Total</p>
                    <p className="font-['Clash_Display'] text-3xl tracking-tighter text-[#B4846C]">
                      ₹{calculateTotal().toLocaleString('en-IN')}
                    </p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    data-testid="checkout-button"
                    disabled={cart.length === 0}
                    className="w-full bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-3 rounded-md hover:bg-[#C8957A] transition-colors flex items-center justify-center gap-2 font-['Manrope'] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle size={20} weight="bold" />
                    Complete Sale
                  </button>
                  {customerName && customerPhone && (
                    <button
                      onClick={() => {
                        window.open(`https://wa.me/${customerPhone.replace(/\D/g, '')}`, '_blank');
                      }}
                      className="w-full bg-[#059669] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#047857] transition-colors flex items-center justify-center gap-2 font-['Manrope'] text-sm"
                    >
                      <WhatsappLogo size={18} weight="bold" />
                      Open WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
