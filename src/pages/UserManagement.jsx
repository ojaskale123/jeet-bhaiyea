import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { getUsers, addUser, deleteUser, getCurrentUser } from '../utils/localStorage';
import { 
  Users as UsersIcon,
  Plus,
  Trash,
  X,
  UserCircle,
  ShieldCheck,
  Check
} from 'phosphor-react';
import { toast } from 'sonner';

const UserManagement = () => {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'WORKER'
  });

  const loadUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if username already exists
    const existingUser = users.find(u => u.username.toLowerCase() === formData.username.toLowerCase());
    if (existingUser) {
      toast.error('Username already exists', {
        description: 'Please choose a different username',
      });
      return;
    }

    addUser(formData);
    toast.success('User added successfully', {
      description: `${formData.username} has been added as ${formData.role}`,
    });
    
    loadUsers();
    resetForm();
  };

  const handleDelete = (userId) => {
    const user = users.find(u => u.id === userId);
    
    if (user.id === currentUser.id) {
      toast.error('Cannot delete yourself', {
        description: 'You cannot delete your own account',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      deleteUser(userId);
      toast.success('User deleted successfully', {
        description: `${user.username} has been removed`,
      });
      loadUsers();
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      role: 'WORKER'
    });
    setShowAddModal(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'OWNER':
        return { color: '#B4846C', bg: 'rgba(180, 132, 108, 0.1)' };
      case 'MANAGER':
        return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' };
      case 'WORKER':
        return { color: '#059669', bg: 'rgba(5, 150, 105, 0.1)' };
      default:
        return { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)' };
    }
  };

  const getRolePermissions = (role) => {
    switch (role) {
      case 'OWNER':
        return ['Full Access', 'Manage Users', 'Delete Products', 'View All Reports'];
      case 'MANAGER':
        return ['Dashboard', 'Products', 'Sell', 'History', 'Cannot Delete Products'];
      case 'WORKER':
        return ['Sell Only', 'Limited Access'];
      default:
        return [];
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center justify-between px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-user-button"
            className="bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-2.5 rounded-md hover:bg-[#C8957A] transition-colors flex items-center gap-2 font-['Manrope']"
          >
            <Plus size={20} weight="bold" />
            Add User
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Users</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">{users.length}</p>
            </div>
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Owners</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-[#B4846C]">
                {users.filter(u => u.role === 'OWNER').length}
              </p>
            </div>
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Managers</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">
                {users.filter(u => u.role === 'MANAGER').length}
              </p>
            </div>
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Workers</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">
                {users.filter(u => u.role === 'WORKER').length}
              </p>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => {
              const roleStyle = getRoleColor(user.role);
              const permissions = getRolePermissions(user.role);
              const isCurrentUser = user.id === currentUser.id;

              return (
                <div
                  key={user.id}
                  className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden hover:-translate-y-1 hover:border-[#B4846C]/40 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: roleStyle.bg }}
                        >
                          <UserCircle size={32} weight="duotone" style={{ color: roleStyle.color }} />
                        </div>
                        <div>
                          <p className="font-['Clash_Display'] text-lg text-white">{user.username}</p>
                          <span 
                            className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border rounded-md inline-flex items-center gap-1 mt-1"
                            style={{ color: roleStyle.color, backgroundColor: roleStyle.bg, borderColor: roleStyle.color }}
                          >
                            <ShieldCheck size={12} weight="fill" />
                            {user.role}
                          </span>
                        </div>
                      </div>
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          data-testid={`delete-user-${user.id}`}
                          className="p-2 text-[#E11D48] hover:bg-[#E11D48]/10 rounded-md transition-colors"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Permissions</p>
                      {permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2">
                          <Check size={14} className="text-[#059669]" weight="bold" />
                          <p className="text-sm text-[#9CA3AF] font-['Manrope']">{perm}</p>
                        </div>
                      ))}
                    </div>

                    {isCurrentUser && (
                      <div className="mt-4 p-2 bg-[#B4846C]/10 border border-[#B4846C]/30 rounded-md">
                        <p className="text-xs text-[#B4846C] font-['Manrope'] text-center">Current User</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A22] border border-[#262B35] rounded-md w-full max-w-md">
            <div className="p-6 border-b border-[#262B35] flex items-center justify-between">
              <h2 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Add New User</h2>
              <button
                onClick={resetForm}
                data-testid="close-user-modal-button"
                className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#0B0E14] rounded-md transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  data-testid="new-username-input"
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  data-testid="new-password-input"
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                  required
                  minLength="4"
                />
              </div>

              <div>
                <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  data-testid="new-role-select"
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
                >
                  <option value="WORKER">Worker</option>
                  <option value="MANAGER">Manager</option>
                  <option value="OWNER">Owner</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="submit-user-button"
                  className="flex-1 bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-3 rounded-md hover:bg-[#C8957A] transition-colors flex items-center justify-center gap-2 font-['Manrope']"
                >
                  <Check size={20} weight="bold" />
                  Add User
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

export default UserManagement;
