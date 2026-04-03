import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { getSales } from '../utils/localStorage';
import { 
  MagnifyingGlass, 
  CalendarBlank,
  FilePdf,
  ClockCounterClockwise,
  Package
} from 'phosphor-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'sonner';

const History = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSales = useCallback(() => {
    const allSales = getSales().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setSales(allSales);
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...sales];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.soldBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(s => new Date(s.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(s => new Date(s.createdAt) <= endDateTime);
    }

    setFilteredSales(filtered);
  }, [sales, searchQuery, startDate, endDate]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const exportToPDF = () => {
    if (filteredSales.length === 0) {
      toast.error('No data to export', {
        description: 'Apply filters or wait for sales data',
      });
      return;
    }

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Sales History Report', 14, 20);
    
    // Date range
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy, HH:mm')}`, 14, 28);
    if (startDate || endDate) {
      doc.text(
        `Period: ${startDate ? format(new Date(startDate), 'dd MMM yyyy') : 'Start'} - ${endDate ? format(new Date(endDate), 'dd MMM yyyy') : 'End'}`,
        14,
        34
      );
    }

    // Table
    const tableData = filteredSales.map(sale => [
      format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm'),
      sale.productName,
      sale.sku,
      sale.quantity,
      `₹${sale.price.toLocaleString('en-IN')}`,
      `₹${sale.totalPrice.toLocaleString('en-IN')}`,
      sale.soldBy,
      sale.soldByRole
    ]);

    doc.autoTable({
      startY: startDate || endDate ? 40 : 34,
      head: [['Date & Time', 'Product', 'SKU', 'Qty', 'Price', 'Total', 'Sold By', 'Role']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [180, 132, 108] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 },
        7: { cellWidth: 20 }
      }
    });

    // Total
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Total Sales: ${filteredSales.length}`, 14, finalY);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`, 14, finalY + 7);

    doc.save(`sales-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    
    toast.success('PDF exported successfully', {
      description: `${filteredSales.length} sales records exported`,
    });
  };

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalPrice, 0);

  return (
    <div className="flex min-h-screen bg-[#0B0E14]">
      <Sidebar />
      <div className="flex-1 ml-64">
        <div className="h-16 border-b border-[#262B35] backdrop-blur-xl bg-[#0B0E14]/70 sticky top-0 z-50 flex items-center justify-between px-8">
          <h1 className="font-['Clash_Display'] text-2xl text-white tracking-tight">Sales History</h1>
          <button
            onClick={exportToPDF}
            data-testid="export-pdf-button"
            className="bg-[#B4846C] text-[#0B0E14] font-semibold px-6 py-2.5 rounded-md hover:bg-[#C8957A] transition-colors flex items-center gap-2 font-['Manrope']"
          >
            <FilePdf size={20} weight="bold" />
            Export PDF
          </button>
        </div>

        <div className="p-8 space-y-6">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Sales</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">{filteredSales.length}</p>
            </div>
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Revenue</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-[#B4846C]">₹{totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-[#151A22] border border-[#262B35] p-6 rounded-md">
              <p className="text-xs font-['Manrope'] uppercase tracking-[0.2em] text-[#9CA3AF] mb-2">Total Units Sold</p>
              <p className="font-['Clash_Display'] text-4xl tracking-tighter text-white">
                {filteredSales.reduce((sum, s) => sum + s.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="search-history-input"
                placeholder="Search by product, SKU, or seller..."
                className="w-full bg-[#151A22] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all placeholder-[#9CA3AF]/50 font-['Manrope']"
              />
            </div>

            <div className="relative">
              <CalendarBlank size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="start-date-input"
                className="w-full bg-[#151A22] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
              />
            </div>

            <div className="relative">
              <CalendarBlank size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="end-date-input"
                className="w-full bg-[#151A22] border border-[#262B35] text-white pl-12 pr-4 py-2.5 rounded-md focus:outline-none focus:border-[#B4846C] focus:ring-1 focus:ring-[#B4846C]/50 transition-all font-['Manrope']"
              />
            </div>
          </div>

          {/* Sales Table */}
          <div className="bg-[#151A22] border border-[#262B35] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262B35]">
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Date & Time</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Product</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">SKU</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Quantity</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Price</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Total</th>
                    <th className="text-xs font-['Manrope'] uppercase tracking-[0.1em] text-[#9CA3AF] py-4 px-6">Sold By</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <ClockCounterClockwise size={48} className="text-[#262B35] mx-auto mb-3" />
                        <p className="text-[#9CA3AF] font-['Manrope']">No sales found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-[#262B35]/50 hover:bg-[#0B0E14] transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-white font-['JetBrains_Mono'] text-sm">
                            {format(new Date(sale.createdAt), 'dd MMM yyyy')}
                          </p>
                          <p className="text-[#9CA3AF] font-['JetBrains_Mono'] text-xs">
                            {format(new Date(sale.createdAt), 'HH:mm:ss')}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white font-['Manrope'] font-medium">{sale.productName}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-[#9CA3AF] font-['JetBrains_Mono'] text-sm">{sale.sku}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white font-['JetBrains_Mono'] font-semibold">{sale.quantity}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white font-['JetBrains_Mono']">₹{sale.price.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-[#B4846C] font-['JetBrains_Mono'] font-semibold">
                            ₹{sale.totalPrice.toLocaleString('en-IN')}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-white font-['Manrope']">{sale.soldBy}</p>
                          <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider border border-[#262B35] text-[#9CA3AF] rounded-md">
                            {sale.soldByRole}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
