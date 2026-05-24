import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

const SellerDashboardOverview = ({ setActiveTab, setSelectedOrderId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const dashboardCanvasRef = useRef(null);
  const dashboardChartInstance = useRef(null);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      // 1. Fetch 7 days analytics data
      const analyticsRes = await axios.get('http://localhost:5000/api/seller/analytics?range=last7days', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Fetch recent orders
      const ordersRes = await axios.get('http://localhost:5000/api/seller/orders?page=1&limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Fetch products to count out of stock
      const productsRes = await axios.get('http://localhost:5000/api/seller/products?page=1&limit=100', {
        headers: { Authorization: `Bearer ${token}` }
      });

      let outOfStockCount = 0;
      if (productsRes.data.success) {
        outOfStockCount = productsRes.data.data.filter(p => p.currentStatus === 'Out of Stock' || p.totalStock === 0).length;
      }

      if (analyticsRes.data.success && ordersRes.data.success) {
        setDashboardData({
          ...analyticsRes.data.data,
          recentOrders: ordersRes.data.data,
          summary: ordersRes.data.summary,
          outOfStockCount
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (dashboardLoading || !dashboardData || !dashboardCanvasRef.current) return;

    if (dashboardChartInstance.current) {
      dashboardChartInstance.current.destroy();
    }

    const ctx = dashboardCanvasRef.current.getContext('2d');

    // Create a gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(0, 74, 198, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 74, 198, 0)');

    dashboardChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dashboardData.charts?.performance?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue',
          data: dashboardData.charts?.performance?.current || [1200000, 1900000, 1500000, 2200000, 1800000, 2500000, 2100000],
          borderColor: '#004ac6',
          backgroundColor: gradient,
          borderWidth: 3,
          tension: 0.4,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#004ac6',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e293b',
            padding: 12,
            titleFont: { size: 13, family: 'Manrope' },
            bodyFont: { size: 14, family: 'Manrope', weight: 'bold' },
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.parsed.y.toLocaleString('vi-VN') + ' ₫';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9', drawBorder: false },
            ticks: {
              font: { family: 'Manrope', size: 11 },
              color: '#94a3b8',
              callback: function(value) {
                if (value === 0) return '0 ₫';
                return (value / 1000000).toFixed(1) + 'M ₫';
              }
            }
          },
          x: {
            grid: { display: false, drawBorder: false },
            ticks: {
              font: { family: 'Manrope', size: 11, weight: 'bold' },
              color: '#64748b'
            }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });

    return () => {
      if (dashboardChartInstance.current) {
        dashboardChartInstance.current.destroy();
      }
    };
  }, [dashboardLoading, dashboardData]);

  if (dashboardLoading || !dashboardData) {
    return (
      <div className="p-10 max-w-[1280px] mx-auto w-full space-y-8 animate-pulse">
        {/* Bento Grid Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-36">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                <div className="w-14 h-5 bg-slate-100 rounded-full"></div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-6 bg-slate-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm h-[400px] flex flex-col gap-6">
          <div className="space-y-2">
            <div className="h-6 bg-slate-100 rounded w-1/4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/3"></div>
          </div>
          <div className="flex-1 bg-slate-50/50 rounded-xl"></div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-[320px] flex flex-col gap-4">
            <div className="h-5 bg-slate-100 rounded w-1/5"></div>
            <div className="flex-1 bg-slate-50/50 rounded-xl"></div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-[320px] flex flex-col gap-4">
            <div className="h-5 bg-slate-100 rounded w-1/3"></div>
            <div className="flex-1 bg-slate-50/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-[1280px] mx-auto w-full space-y-8">
      {/* Bento Grid Stats (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Revenue (7 Days) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#004ac6] transition-all">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#004ac6]">payments</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${dashboardData.kpis?.revenue?.growth >= 0
                ? 'text-[#2e7d32] bg-[#2e7d32]/10'
                : 'text-[#b3261e] bg-[#b3261e]/10'
                }`}>
                {dashboardData.kpis?.revenue?.growth >= 0 ? '+' : ''}{dashboardData.kpis?.revenue?.growth}%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Revenue (7 Days)</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData.kpis?.revenue?.value?.toLocaleString('vi-VN')} <span className="text-sm font-normal text-slate-500">₫</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Pending Orders */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#004ac6] transition-all">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-slate-600">local_shipping</span>
              <span className="text-xs font-bold text-[#004ac6] bg-blue-50 px-2 py-1 rounded-full">Pending</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Pending Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData.summary?.Pending || 0} <span className="text-sm font-normal text-slate-500">Orders</span>
            </h3>
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col justify-between transition-all ${dashboardData.outOfStockCount > 0
          ? 'border-red-100 hover:border-[#b3261e]'
          : 'border-slate-200 hover:border-[#2e7d32]'
          }`}>
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className={`material-symbols-outlined ${dashboardData.outOfStockCount > 0 ? 'text-[#b3261e]' : 'text-slate-600'}`}>inventory</span>
              {dashboardData.outOfStockCount > 0 ? (
                <span className="text-xs font-bold text-[#b3261e] bg-[#b3261e]/10 px-2 py-1 rounded-full animate-pulse">Restock Needed</span>
              ) : (
                <span className="text-xs font-bold text-[#2e7d32] bg-[#2e7d32]/10 px-2 py-1 rounded-full">In Stock</span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">Out of Stock</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData.outOfStockCount || 0} <span className="text-sm font-normal text-slate-500">Products</span>
            </h3>
          </div>
        </div>

        {/* Card 4: Store Conversion Rate */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:border-[#2e7d32] transition-all">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-[#2e7d32]">analytics</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${dashboardData.kpis?.conversion?.growth >= 0
                ? 'text-[#2e7d32] bg-[#2e7d32]/10'
                : 'text-[#b3261e] bg-[#b3261e]/10'
                }`}>
                {dashboardData.kpis?.conversion?.growth >= 0 ? '+' : ''}{dashboardData.kpis?.conversion?.growth}%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Store Conversion Rate</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData.kpis?.conversion?.value}% <span className="text-sm font-normal text-slate-500">Rate</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Revenue Trends</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Performance comparison across different time periods</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button onClick={() => setActiveTab('analytics')} className="px-5 py-1.5 text-sm font-bold bg-white text-[#004ac6] rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-all">
              Detailed Analytics
            </button>
          </div>
        </div>
        <div className="p-8 flex-1 flex flex-col justify-end">
          <div className="relative h-[280px] w-full">
            <canvas ref={dashboardCanvasRef}></canvas>
          </div>
        </div>
      </section>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs">Recent Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-[#004ac6] text-xs font-bold hover:underline cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                      <td
                        onClick={() => {
                          setSelectedOrderId && setSelectedOrderId(order._id);
                          setActiveTab('order-detail');
                        }}
                        className="px-6 py-4 text-xs font-mono font-bold text-[#004ac6] hover:underline cursor-pointer"
                      >
                        {order.order_code}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {order.customer_id?.full_name || 'Anonymous Customer'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">
                        {order.total_final?.toLocaleString('vi-VN')}₫
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'delivered' ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-50 text-[#2e7d32] text-[10px] font-bold border border-green-100">Completed</span>
                        ) : order.status === 'canceled' ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-50 text-[#b3261e] text-[10px] font-bold border border-red-100">Cancelled</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#004ac6] text-[10px] font-bold border border-blue-100">Processing</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 text-xs font-medium">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-auto p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[11px] text-slate-500 font-medium">
              Showing recent orders of the shop
            </span>
            <button
              onClick={() => setActiveTab('orders')}
              className="text-[11px] text-[#004ac6] font-bold hover:underline cursor-pointer"
            >
              Go to Order Management →
            </button>
          </div>
        </div>

        {/* Store Performance & Top Selling */}
        <div className="space-y-8 flex flex-col justify-between">
          {/* Store Performance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-6">Store Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-500 font-medium">Fulfillment Rate</span>
                <span className="text-sm font-bold text-[#004ac6]">98%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#004ac6]" style={{ width: '98%' }}></div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xs text-slate-500 font-medium">Response Time</span>
                <span className="text-sm font-bold text-[#2e7d32]">&lt; 5 mins</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#2e7d32]" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          {/* Top Selling */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col justify-between">
            <h3 className="font-bold text-slate-900 uppercase tracking-widest text-xs mb-4">Top Selling</h3>
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {dashboardData.products && dashboardData.products.length > 0 ? (
                dashboardData.products.map((prod, idx) => (
                  <div key={prod.id || idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 shrink-0">
                      <img src={prod.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{prod.orders} units sold</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${idx === 0
                      ? 'text-[#004ac6] bg-blue-50 border-blue-100'
                      : 'text-slate-600 bg-slate-100 border-slate-200'
                      }`}>
                      #{idx + 1}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4 font-medium">No top selling data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Insights & Marketing Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-blue-100">
              <span className="material-symbols-outlined text-[#004ac6]">auto_graph</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Growth Insight</h4>
              <p className="text-xs text-slate-600 leading-tight mt-0.5 font-medium">
                Your store's revenue over the last 7 days has shown strong growth. Keep optimizing your products!
              </p>
            </div>
          </div>
          <button onClick={() => setActiveTab('analytics')} className="px-5 py-2.5 bg-[#004ac6] text-white text-xs font-bold rounded-xl shadow-md shadow-[#004ac6]/20 hover:brightness-110 transition-all shrink-0 cursor-pointer">
            View Report
          </button>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0 border border-slate-200/60">
              <span className="material-symbols-outlined text-slate-600">campaign</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Marketing Tip</h4>
              <p className="text-xs text-slate-600 leading-tight mt-0.5 font-medium">Create flash sale campaigns to generate a sudden surge in traffic.</p>
            </div>
          </div>
          <button onClick={() => setActiveTab('products')} className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-sm">
            Manage Products
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboardOverview;
