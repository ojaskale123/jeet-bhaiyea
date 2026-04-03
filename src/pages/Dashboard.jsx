import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { getStats, getProducts } from '../utils/localStorage';
import { Package, Archive, WarningCircle, XCircle } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState([]);
  const navigate = useNavigate();

  const loadStats = useCallback(() => {
    const statsData = getStats();
    setStats(statsData);
    
    const products = getProducts();
    setLowStockProducts(products.filter(p => p.quantity > 0 && p.quantity < (p.minStock || 5)));
    setOutOfStockProducts(products.filter(p => p.quantity === 0));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCardClick = (filter) => {
    navigate('/products', { state: { filter } });
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: '#B4846C',
      bgColor: 'rgba(180, 132, 108, 0.1)',
      filter: 'all'
    },
    {
      title: 'Total Stock',
      value: stats?.totalStock || 0,
      icon: Archive,
      color: '#3B82F6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      filter: 'all'
    },
    {
      title: 'Low Stock',
      value: stats?.lowStock || 0,
      icon: WarningCircle,
      color: '#D97757',
      bgColor: 'rgba(217, 119, 87, 0.1)',
      filter: 'low'
    },
    {
      title: 'Out of Stock',
      value: stats?.outOfStock || 0,
      icon: XCircle,
      color: '#E11D48',
      bgColor: 'rgba(225, 29, 72, 0.1)',
      filter: 'out'
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Dashboard</h1>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  onClick={() => handleCardClick(card.filter)}
                  data-testid={`stat-card-${card.title.toLowerCase().replace(/ /g, '-')}`}
                  className="bg-[#151A22] border border-[#262B35] p-6 rounded-md hover:-translate-y-1 hover:border-[#B4846C]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: card.bgColor }}>
                      <Icon size={24} weight="duotone" style={{ color: card.color }} />
                    </div>
                    <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF]">{card.title}</p>
                  </div>
                  <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Alerts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            {lowStockProducts.length > 0 && (
              <div className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden">
                <div className="p-6 border-b border-[#262B35] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[rgba(217,119,87,0.1)]">
                    <WarningCircle size={20} weight="fill" className="text-[#D97757]" />
                  </div>
                  <h3 className="font-['Clash_Display'] text-xl text-white tracking-tight">Low Stock Alert</h3>
                </div>
                <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-[#0B0E14] rounded-md border border-[#262B35]">
                      <div>
                        <p className="font-['Manrope'] text-white font-medium">{product.name}</p>
                        <p className="font-['JetBrains_Mono'] text-xs text-[#9CA3AF]">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-['JetBrains_Mono'] text-[#D97757] font-semibold">{product.quantity} left</p>
                        <p className="text-xs text-[#9CA3AF]">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of Stock Alert */}
            {outOfStockProducts.length > 0 && (
              <div className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden">
                <div className="p-6 border-b border-[#262B35] flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[rgba(225,29,72,0.1)]">
                    <XCircle size={20} weight="fill" className="text-[#E11D48]" />
                  </div>
                  <h3 className="font-['Clash_Display'] text-xl text-white tracking-tight">Out of Stock</h3>
                </div>
                <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
                  {outOfStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-[#0B0E14] rounded-md border border-[#262B35]">
                      <div>
                        <p className="font-['Manrope'] text-white font-medium">{product.name}</p>
                        <p className="font-['JetBrains_Mono'] text-xs text-[#9CA3AF]">{product.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-['JetBrains_Mono'] text-[#E11D48] font-semibold text-xs uppercase tracking-wider">OUT</p>
                        <p className="text-xs text-[#9CA3AF]">{product.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Revenue Card */}
          <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Revenue</p>
                <p className="font-['Clash_Display'] text-4xl tracking-tighter text-[#B4846C]">₹{stats?.totalRevenue.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Sales</p>
                <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">{stats?.totalSales || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
