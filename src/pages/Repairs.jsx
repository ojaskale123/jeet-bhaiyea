import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  getRepairs, 
  addRepair, 
  updateRepair,
  deleteRepair,
  addCustomer,
  getCustomerByPhone,
  getCurrentUser,
  getUsers
} from '../utils/localStorage';
import { 
  sendRepairReceivedMessage,
  sendWorkerAssignedMessage,
  sendDeviceReadyMessage,
  sendDeviceDeliveredMessage
} from '../utils/whatsapp';
import { 
  Plus, 
  MagnifyingGlass, 
  Wrench,
  X,
  Check,
  Clock,
  CheckCircle,
  Package as PackageIcon,
  Trash,
  WhatsappLogo,
  User,
  DeviceMobile
} from 'phosphor-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Repairs = () => {
  const currentUser = getCurrentUser();
  const [repairs, setRepairs] = useState([]);
  const [filteredRepairs, setFilteredRepairs] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    deviceDetails: '',
    devicePassword: '',
    issueDescription: '',
    estimatedCost: ''
  });

  const loadRepairs = useCallback(() => {
    const allRepairs = getRepairs().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRepairs(allRepairs);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...repairs];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerPhone.includes(searchQuery) ||
        r.deviceDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    setFilteredRepairs(filtered);
  }, [repairs, searchQuery, filterStatus]);

  useEffect(() => {
    loadRepairs();
    setWorkers(getUsers().filter(u => u.role === 'WORKER' || u.role === 'MANAGER'));
  }, [loadRepairs]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add or get customer
    let customer = getCustomerByPhone(formData.customerPhone);
    if (!customer) {
      customer = addCustomer({
        name: formData.customerName,
        phone: formData.customerPhone
      });
    }

    // Create repair
    const repair = addRepair({
      customerId: customer.id,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      deviceDetails: formData.deviceDetails,
      devicePassword: formData.devicePassword,
      issueDescription: formData.issueDescription,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      receivedBy: currentUser.username
    });

    // Send WhatsApp message
    sendRepairReceivedMessage(customer, repair);
    
    toast.success('Repair job created', {
      description: `Repair ID: ${repair.id} - WhatsApp message sent`,
    });

    loadRepairs();
    resetForm();
  };

  const handleStatusChange = (repair, newStatus) => {
    const updatedRepair = updateRepair(repair.id, { status: newStatus });
    const customer = { name: repair.customerName, phone: repair.customerPhone };

    // Send appropriate WhatsApp message
    if (newStatus === 'Ready') {
      sendDeviceReadyMessage(customer, updatedRepair);
      toast.success('Status updated to Ready', {
        description: 'WhatsApp message sent to customer',
      });
    } else if (newStatus === 'Delivered') {
      sendDeviceDeliveredMessage(customer);
      toast.success('Device delivered', {
        description: 'Thank you message sent',
      });
    } else {
      toast.success('Status updated', {
        description: `Repair status changed to ${newStatus}`,
      });
    }

    loadRepairs();
  };

  const handleAssignWorker = (repair, workerUsername) => {
    updateRepair(repair.id, { 
      assignedTo: workerUsername,
      status: 'In Progress'
    });
    
    const customer = { name: repair.customerName, phone: repair.customerPhone };
    sendWorkerAssignedMessage(customer, repair, workerUsername);
    
    toast.success('Worker assigned', {
      description: `${workerUsername} assigned - WhatsApp message sent`,
    });

    loadRepairs();
  };

  const handleDelete = (repairId) => {
    if (window.confirm('Are you sure you want to delete this repair record?')) {
      deleteRepair(repairId);
      toast.success('Repair deleted');
      loadRepairs();
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      deviceDetails: '',
      devicePassword: '',
      issueDescription: '',
      estimatedCost: ''
    });
    setShowAddModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received':
        return { color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)', icon: Clock };
      case 'In Progress':
        return { color: '#D97757', bg: 'rgba(217, 119, 87, 0.1)', icon: Wrench };
      case 'Ready':
        return { color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', icon: CheckCircle };
      case 'Delivered':
        return { color: '#B4846C', bg: 'rgba(180, 132, 108, 0.1)', icon: PackageIcon };
      default:
        return { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)', icon: Clock };
    }
  };

  const statuses = ['Received', 'In Progress', 'Ready', 'Delivered'];

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center justify-between px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Repairs</h1>
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-repair-button"
            className="bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-2.5 rounded-md hover:bg-[#C8957A] transition-colors flex items-center gap-2 font-['Manrope']"
          >
            <Plus size={20} weight="bold" />
            New Repair
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {statuses.map((status) => {
              const count = repairs.filter(r => r.status === status).length;
              const statusStyle = getStatusColor(status);
              const Icon = statusStyle.icon;
              return (
                <div
                  key={status}
                  className="bg-[#151A22] border border-[#262B35] p-6 rounded-md cursor-pointer hover:-translate-y-1 hover:border-[#B4846C]/40 transition-all"
                  onClick={() => setFilterStatus(status)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: statusStyle.bg }}>
                      <Icon size={20} weight="duotone" style={{ color: statusStyle.color }} />
                    </div>
                    <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF]">{status}</p>
                  </div>
                  <p className="font-['Clash_Display'] text-3xl tracking-tighter text-white">{count}</p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-repair-input"
                placeholder="Search by customer, phone, device, or ID..."
                className="w-full bg-[#151A22] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              data-testid="filter-status-select"
              className="w-full bg-[#151A22] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
            >
              <option value="all">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Repairs List */}
          <div className="space-y-4">
            {filteredRepairs.length === 0 ? (
              <div className="bg-[#151A22] border border-[#262B35] rounded-md p-12 text-center">
                <Wrench size={48} className="text-[#262B35] mx-auto mb-3" />
                <p className="text-[#9CA3AF] font-['Manrope']">No repairs found</p>
              </div>
            ) : (
              filteredRepairs.map((repair) => {
                const statusStyle = getStatusColor(repair.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <div
                    key={repair.id}
                    className="bg-[#151A22] border border-[#262B35] rounded-md p-6 hover:border-[#B4846C]/40 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-['JetBrains_Mono'] text-[#B4846C] font-semibold">{repair.id}</span>
                          <span 
                            className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border rounded-md flex items-center gap-1"
                            style={{ color: statusStyle.color, backgroundColor: statusStyle.bg, borderColor: statusStyle.color }}
                          >
                            <StatusIcon size={12} weight="fill" />
                            {repair.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">Customer</p>
                            <p className="text-white font-['Manrope'] font-medium flex items-center gap-2">
                              <User size={16} />
                              {repair.customerName}
                            </p>
                            <p className="text-[#9CA3AF] font-['JetBrains_Mono'] text-sm">{repair.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-1">Device</p>
                            <p className="text-white font-['Manrope'] font-medium flex items-center gap-2">
                              <DeviceMobile size={16} />
                              {repair.deviceDetails}
                            </p>
                            <p className="text-[#9CA3AF] text-sm">{repair.issueDescription}</p>
                          </div>
                        </div>
                        {repair.devicePassword && (
                          <div className="mt-3 p-2 bg-[#0B0E14] rounded border border-[#262B35]">
                            <p className="text-xs text-[#9CA3AF]">Device Password: <span className="text-white font-['JetBrains_Mono']">{repair.devicePassword}</span></p>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-4 text-xs text-[#9CA3AF]">
                          <span>Received: {format(new Date(repair.createdAt), 'dd MMM yyyy, HH:mm')}</span>
                          {repair.assignedTo && <span>Assigned to: <span className="text-[#B4846C]">{repair.assignedTo}</span></span>}
                          {repair.estimatedCost > 0 && <span>Cost: <span className="text-white">₹{repair.estimatedCost}</span></span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const customer = { name: repair.customerName, phone: repair.customerPhone };
                            const message = `Hello ${repair.customerName},\n\nYour repair status:\n\nRepair ID: ${repair.id}\nDevice: ${repair.deviceDetails}\nStatus: ${repair.status}\n\nThank you!`;
                            window.open(`https://wa.me/${repair.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          data-testid={`whatsapp-${repair.id}`}
                          className="p-2 text-[#059669] hover:bg-[#059669]/10 rounded-md transition-colors"
                          title="Send WhatsApp"
                        >
                          <WhatsappLogo size={20} weight="bold" />
                        </button>
                        {currentUser?.role === 'OWNER' && (
                          <button
                            onClick={() => handleDelete(repair.id)}
                            data-testid={`delete-repair-${repair.id}`}
                            className="p-2 text-[#E11D48] hover:bg-[#E11D48]/10 rounded-md transition-colors"
                          >
                            <Trash size={18} weight="bold" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#262B35]">
                      {repair.status === 'Received' && !repair.assignedTo && (
                        <select
                          onChange={(e) => handleAssignWorker(repair, e.target.value)}
                          data-testid={`assign-worker-${repair.id}`}
                          className="bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2 rounded-md focus:outline-none focus:border-[#B4846C] font-['Manrope'] text-sm"
                        >
                          <option value="">Assign Worker</option>
                          {workers.map(w => (
                            <option key={w.id} value={w.username}>{w.username}</option>
                          ))}
                        </select>
                      )}
                      
                      {repair.status !== 'Delivered' && (
                        <div className="flex gap-2">
                          {repair.status === 'Received' && repair.assignedTo && (
                            <button
                              onClick={() => handleStatusChange(repair, 'In Progress')}
                              data-testid={`status-progress-${repair.id}`}
                              className="px-4 py-2 bg-[#D97757] text-[#0B0E14] font-semibold rounded-md hover:bg-[#E88868] transition-colors text-sm font-['Manrope']"
                            >
                              Start Work
                            </button>
                          )}
                          {repair.status === 'In Progress' && (
                            <button
                              onClick={() => handleStatusChange(repair, 'Ready')}
                              data-testid={`status-ready-${repair.id}`}
                              className="px-4 py-2 bg-[#059669] text-white font-semibold rounded-md hover:bg-[#047857] transition-colors text-sm font-['Manrope'] flex items-center gap-2"
                            >
                              <Check size={16} weight="bold" />
                              Mark Ready
                            </button>
                          )}
                          {repair.status === 'Ready' && (
                            <button
                              onClick={() => handleStatusChange(repair, 'Delivered')}
                              data-testid={`status-delivered-${repair.id}`}
                              className="px-4 py-2 bg-[#B4846C] text-[#0B0E14] font-semibold rounded-md hover:bg-[#C8957A] transition-colors text-sm font-['Manrope'] flex items-center gap-2"
                            >
                              <PackageIcon size={16} weight="bold" />
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Repair Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151A22] border border-[#262B35] rounded-md w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#262B35] flex items-center justify-between sticky top-0 bg-[#151A22] z-10">
              <h2 className="font-['Clash_Display'] text-2xl text-white tracking-tight">New Repair Job</h2>
              <button
                onClick={resetForm}
                data-testid="close-repair-modal"
                className="p-2 text-[#9CA3AF] hover:text-white hover:bg-[#0B0E14] rounded-md transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    data-testid="customer-name-input"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    data-testid="customer-phone-input"
                    placeholder="+91XXXXXXXXXX"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Device Details *
                  </label>
                  <input
                    type="text"
                    value={formData.deviceDetails}
                    onChange={(e) => setFormData({ ...formData, deviceDetails: e.target.value })}
                    data-testid="device-details-input"
                    placeholder="e.g., iPhone 13, Samsung Galaxy S21"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                    Device Password
                  </label>
                  <input
                    type="text"
                    value={formData.devicePassword}
                    onChange={(e) => setFormData({ ...formData, devicePassword: e.target.value })}
                    data-testid="device-password-input"
                    placeholder="Optional"
                    className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                  Issue Description *
                </label>
                <textarea
                  value={formData.issueDescription}
                  onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                  data-testid="issue-description-input"
                  rows="3"
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
                  placeholder="Describe the issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">
                  Estimated Cost (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  data-testid="estimated-cost-input"
                  className="w-full bg-[#0B0E14] border border-[#262B35] text-white px-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['JetBrains_Mono']"
                  placeholder="Optional"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="submit-repair-button"
                  className="flex-1 bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-3 rounded-md hover:bg-[#C8957A] transition-colors flex items-center justify-center gap-2 font-['Manrope']"
                >
                  <Check size={20} weight="bold" />
                  Create Repair
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

export default Repairs;
