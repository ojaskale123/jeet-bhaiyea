import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser } from '../utils/localStorage';
import { 
  House, 
  Package, 
  ShoppingCart, 
  ClockCounterClockwise, 
  Users, 
  SignOut,
  Barcode,
  Wrench
} from 'phosphor-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];
    
    if (currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER') {
      items.push(
        { path: '/dashboard', label: 'Dashboard', icon: House },
        { path: '/products', label: 'Products', icon: Package }
      );
    }
    
    items.push(
      { path: '/sell', label: 'Sell', icon: ShoppingCart },
      { path: '/repairs', label: 'Repairs', icon: Wrench }
    );
    
    if (currentUser?.role === 'OWNER' || currentUser?.role === 'MANAGER') {
      items.push({ path: '/history', label: 'History', icon: ClockCounterClockwise });
    }
    
    if (currentUser?.role === 'OWNER') {
      items.push({ path: '/users', label: 'User Management', icon: Users });
    }
    
    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#0B0E14] border-r border-[#262B35] flex flex-col">
      <div className="p-6 border-b border-[#262B35]">
        <div className="flex items-center gap-3">
          <Barcode size={32} weight="duotone" className="text-[#B4846C]" />
          <div>
            <h1 className="font-['Clash_Display'] text-xl text-white tracking-tight">WholeSale</h1>
            <p className="text-xs text-[#9CA3AF] font-['Manrope']">Management System</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`sidebar-link-${item.label.toLowerCase().replace(' ', '-')}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-[#B4846C] text-[#0B0E14]'
                  : 'text-[#9CA3AF] hover:bg-[#151A22] hover:text-white'
              }`}
            >
              <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
              <span className="font-['Manrope'] font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#262B35]">
        <div className="mb-3 px-4 py-2 bg-[#151A22] rounded-md">
          <p className="text-xs text-[#9CA3AF] font-['Manrope'] uppercase tracking-wider mb-1">Logged in as</p>
          <p className="font-['Clash_Display'] text-white text-sm">{currentUser?.username}</p>
          <p className="text-xs text-[#B4846C] font-['Manrope'] uppercase tracking-wider mt-1">{currentUser?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent border border-[#262B35] text-[#9CA3AF] hover:bg-[#1E2430] hover:text-white hover:border-[#9CA3AF] transition-all rounded-md font-['Manrope'] font-medium text-sm"
        >
          <SignOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
