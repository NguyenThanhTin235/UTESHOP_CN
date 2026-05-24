import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNotifications } from '../../hooks/useNotifications';
import Chart from 'chart.js/auto';

const SellerAnalytics = ({ setActiveTab }) => {
    const [range, setRange] = useState('last7days');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState(null);

    // AI Chat State
    const [showAI, setShowAI] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState([
        { sender: 'ai', text: "Hello! I'm your UTEShop AI Assistant. I can help you analyze your store's sales performance. This week, your revenue has shown a very strong growth trend!" }
    ]);
    const [aiTyping, setAiTyping] = useState(false);

    const { user } = useSelector(state => state.auth);
    const { unreadCount } = useNotifications();

    // Refs for Chart Canvas
    const revenueCanvasRef = useRef(null);
    const categoryCanvasRef = useRef(null);
    const trafficCanvasRef = useRef(null);

    // Refs to store Chart Instances (to destroy them before recreating)
    const revenueChartInstance = useRef(null);
    const categoryChartInstance = useRef(null);
    const trafficChartInstance = useRef(null);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const params = { range };
            if (range === 'custom') {
                if (!startDate || !endDate) {
                    toast.error('Please select both start and end dates');
                    setLoading(false);
                    return;
                }
                params.startDate = startDate;
                params.endDate = endDate;
            }

            const res = await axios.get('http://localhost:5000/api/seller/analytics', {
                params,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                setAnalyticsData(res.data.data);
            }
        } catch (error) {
            console.error('Fetch analytics error:', error);
            toast.error(error.response?.data?.message || 'Unable to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (range !== 'custom') {
            fetchAnalytics();
        }
    }, [range]);

    const handleCustomFilterSubmit = (e) => {
        e.preventDefault();
        fetchAnalytics();
    };

    // Render/Update Charts
    useEffect(() => {
        if (!analyticsData || loading) return;

        // --- 1. REVENUE LINE CHART ---
        if (revenueCanvasRef.current) {
            // Destroy existing chart to prevent canvas reuse error
            if (revenueChartInstance.current) {
                revenueChartInstance.current.destroy();
            }

            const ctx = revenueCanvasRef.current.getContext('2d');

            // Create gradient backgrounds
            const currentGradient = ctx.createLinearGradient(0, 0, 0, 300);
            currentGradient.addColorStop(0, 'rgba(0, 74, 198, 0.25)');
            currentGradient.addColorStop(1, 'rgba(0, 74, 198, 0.0)');

            revenueChartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: analyticsData.charts.performance.labels,
                    datasets: [
                        {
                            label: 'Current Period',
                            data: analyticsData.charts.performance.current,
                            borderColor: '#004ac6',
                            backgroundColor: currentGradient,
                            fill: true,
                            tension: 0.4,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: '#ffffff',
                            pointBorderColor: '#004ac6',
                            pointBorderWidth: 2,
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#004ac6',
                            pointHoverBorderColor: '#ffffff',
                            pointHoverBorderWidth: 2
                        },
                        {
                            label: 'Previous Period',
                            data: analyticsData.charts.performance.previous,
                            borderColor: '#cbd5e1',
                            backgroundColor: 'transparent',
                            fill: false,
                            tension: 0.4,
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 0,
                            pointHoverRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            padding: 12,
                            backgroundColor: '#131b2e',
                            titleFont: { size: 12, family: 'Manrope', weight: 'bold' },
                            bodyFont: { size: 12, family: 'Manrope' },
                            callbacks: {
                                label: function (context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            display: true,
                            grid: {
                                color: '#f1f5f9',
                                drawTicks: false
                            },
                            ticks: {
                                font: { family: 'Manrope', size: 10, weight: 'bold' },
                                color: '#64748b',
                                callback: function (value) {
                                    if (value >= 1e6) {
                                        return (value / 1e6).toFixed(1) + 'M ₫';
                                    }
                                    return value.toLocaleString('vi-VN') + ' ₫';
                                }
                            },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { family: 'Manrope', size: 10, weight: 'bold' },
                                color: '#64748b'
                            }
                        }
                    }
                }
            });
        }

        // --- 2. CATEGORY DOUGHNUT CHART ---
        if (categoryCanvasRef.current) {
            if (categoryChartInstance.current) {
                categoryChartInstance.current.destroy();
            }

            const ctx = categoryCanvasRef.current.getContext('2d');
            const labels = analyticsData.charts.categories.map(c => c.label);
            const revenues = analyticsData.charts.categories.map(c => c.revenue);
            const colors = ['#004ac6', '#fb923c', '#8b5cf6', '#10b981', '#64748b'];

            categoryChartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: revenues,
                        backgroundColor: colors.slice(0, labels.length),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            padding: 12,
                            backgroundColor: '#131b2e',
                            titleFont: { size: 12, family: 'Manrope', weight: 'bold' },
                            bodyFont: { size: 12, family: 'Manrope' },
                            callbacks: {
                                label: function (context) {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const value = context.parsed;
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
                                    return `${context.label}: ${money} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // --- 3. TRAFFIC BAR CHART ---
        if (trafficCanvasRef.current) {
            if (trafficChartInstance.current) {
                trafficChartInstance.current.destroy();
            }

            const ctx = trafficCanvasRef.current.getContext('2d');

            trafficChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: analyticsData.charts.traffic.labels,
                    datasets: [{
                        label: 'Visitors',
                        data: analyticsData.charts.traffic.data,
                        backgroundColor: '#004ac6',
                        hoverBackgroundColor: '#2563eb',
                        borderRadius: 8,
                        borderSkipped: false,
                        barThickness: 28
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            padding: 12,
                            backgroundColor: '#131b2e',
                            titleFont: { size: 12, family: 'Manrope', weight: 'bold' },
                            bodyFont: { size: 12, family: 'Manrope' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#f1f5f9',
                                drawTicks: false
                            },
                            ticks: {
                                font: { family: 'Manrope', size: 10, weight: 'bold' },
                                color: '#64748b'
                            },
                            border: { display: false }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { family: 'Manrope', size: 10, weight: 'bold' },
                                color: '#64748b'
                            }
                        }
                    }
                }
            });
        }

        // Cleanup chart instances on unmount/re-render
        return () => {
            if (revenueChartInstance.current) revenueChartInstance.current.destroy();
            if (categoryChartInstance.current) categoryChartInstance.current.destroy();
            if (trafficChartInstance.current) trafficChartInstance.current.destroy();
        };
    }, [analyticsData, loading]);

    // Export Excel Handler
    const handleExportReport = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/seller/analytics/export', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `seller_revenue_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Excel report exported successfully!');
        } catch (error) {
            console.error('Export report error:', error);
            toast.error('Failed to export Excel report');
        }
    };

    // AI Chat Submission
    const handleAiSubmit = (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;

        const userMsg = aiInput.trim();
        setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setAiInput('');
        setAiTyping(true);

        // Advanced local rule-based AI processing using active store metrics
        setTimeout(() => {
            let responseText = '';
            const lowerMsg = userMsg.toLowerCase();

            if (!analyticsData) {
                responseText = "I am loading your store's analytics data. Please wait a moment!";
            } else {
                const kpis = analyticsData.kpis;
                const topProducts = analyticsData.products;

                const formattedRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(kpis.revenue.value);
                const revenueGrowthText = kpis.revenue.growth >= 0 ? `grown by ${kpis.revenue.growth}%` : `decreased by ${Math.abs(kpis.revenue.growth)}%`;

                if (lowerMsg.includes('revenue') || lowerMsg.includes('sales') || lowerMsg.includes('earn') || lowerMsg.includes('money')) {
                    responseText = `Your store's revenue during this period reached ${formattedRevenue}. Compared to the previous period, it has ${revenueGrowthText}.`;
                    if (kpis.revenue.growth > 0) {
                        responseText += " This is a very positive sign! Keep up the current promotion campaigns.";
                    } else {
                        responseText += " You should consider running more discount codes or optimizing product images to improve revenue.";
                    }
                } else if (lowerMsg.includes('product') || lowerMsg.includes('best seller') || lowerMsg.includes('top') || lowerMsg.includes('selling')) {
                    if (topProducts && topProducts.length > 0) {
                        responseText = `Your current best-selling product is "${topProducts[0].name}" with ${topProducts[0].orders} orders, bringing in a total revenue of ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(topProducts[0].revenue)}.`;
                        if (topProducts.length > 1) {
                            responseText += ` Followed by other products such as: "${topProducts[1].name}".`;
                        }
                    } else {
                        responseText = "Currently, there is no sales data for specific products during this period.";
                    }
                } else if (lowerMsg.includes('visitor') || lowerMsg.includes('traffic') || lowerMsg.includes('view') || lowerMsg.includes('click')) {
                    responseText = `Your shop had a total of ${kpis.visitors.value} visitors in this cycle, which is a ${kpis.visitors.growth >= 0 ? 'increase' : 'decrease'} of ${Math.abs(kpis.visitors.growth)}% compared to the previous cycle.`;
                    if (kpis.conversion.value > 0) {
                        responseText += ` The conversion rate reached ${kpis.conversion.value}% (a ${kpis.conversion.growth >= 0 ? 'increase' : 'decrease'} of ${Math.abs(kpis.conversion.growth)}%).`;
                    }
                } else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('optimize') || lowerMsg.includes('strategy') || lowerMsg.includes('advice')) {
                    responseText = `Based on the current data, I suggest the following actions:\n1. The product "${topProducts[0]?.name || 'highlighted'}" is attracting customers very well, you should optimize stock for this product.\n2. Your conversion rate is currently ${kpis.conversion.value}%. To improve, try offering more vouchers for new customers!\n3. Boost marketing via social channels to attract more new visitors.`;
                } else {
                    responseText = `Hello! I can help you with metrics such as Revenue (${formattedRevenue}), Conversion Rate (${kpis.conversion.value}%), Visitors (${kpis.visitors.value} views), or suggest the best-selling products. Do you need to ask about any specific metric?`;
                }
            }

            setAiMessages(prev => [...prev, { sender: 'ai', text: responseText }]);
            setAiTyping(false);
        }, 1200);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8FAFC]">
            

            {/* Main Container */}
            <div className="p-10 max-w-[1400px] mx-auto w-full space-y-8 flex-1">
                {/* Analytics Filter Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                    <div>
                        <h2 className="text-2xl font-black text-on-surface tracking-tight">Performance Overview</h2>
                        <p className="text-secondary text-sm font-medium">Track your store metrics and growth trends</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => { setRange('today'); setShowCustomDatePicker(false); }}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${range === 'today' ? 'bg-primary text-white rounded-xl shadow-md shadow-primary/20' : 'text-secondary hover:text-primary'}`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => { setRange('last7days'); setShowCustomDatePicker(false); }}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${range === 'last7days' ? 'bg-primary text-white rounded-xl shadow-md shadow-primary/20' : 'text-secondary hover:text-primary'}`}
                        >
                            Last 7 Days
                        </button>
                        <button
                            onClick={() => { setRange('last30days'); setShowCustomDatePicker(false); }}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${range === 'last30days' ? 'bg-primary text-white rounded-xl shadow-md shadow-primary/20' : 'text-secondary hover:text-primary'}`}
                        >
                            Last 30 Days
                        </button>

                        <div className="h-4 w-px bg-slate-200 mx-2"></div>

                        <button
                            onClick={() => { setRange('custom'); setShowCustomDatePicker(!showCustomDatePicker); }}
                            className={`px-4 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer ${range === 'custom' ? 'bg-primary text-white rounded-xl shadow-md shadow-primary/20' : 'text-secondary hover:text-primary'}`}
                        >
                            <span className="material-symbols-outlined text-base">calendar_today</span>
                            Custom
                        </button>
                    </div>
                </div>

                {/* Custom Date Picker Form */}
                {range === 'custom' && showCustomDatePicker && (
                    <form onSubmit={handleCustomFilterSubmit} className="p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm flex flex-wrap gap-4 items-end animate-in fade-in slide-in-from-top-3 duration-250">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest">From Date</label>
                            <input
                                type="date"
                                className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-on-surface"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-secondary uppercase tracking-widest">To Date</label>
                            <input
                                type="date"
                                className="px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-on-surface"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-primary/20 cursor-pointer"
                        >
                            Apply Filter
                        </button>
                    </form>
                )}

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex flex-col items-center gap-4">
                            <div className="size-12 border-4 border-slate-200 border-t-[#004ac6] rounded-full animate-spin"></div>
                            <span className="text-sm font-bold text-slate-500">Analyzing store data...</span>
                        </div>
                    </div>
                ) : analyticsData ? (
                    <>
                        {/* KPI Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Revenue Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">trending_up</span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${analyticsData.kpis.revenue.growth >= 0
                                            ? 'text-success bg-success/10'
                                            : 'text-error bg-error/10'
                                        }`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {analyticsData.kpis.revenue.growth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                        {Math.abs(analyticsData.kpis.revenue.growth)}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/60 mb-1">Total Sales Revenue</p>
                                    <h3 className="text-2xl font-black text-on-surface">
                                        {analyticsData.kpis.revenue.value.toLocaleString('vi-VN')} <span className="text-sm font-medium text-secondary">₫</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-secondary mt-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Based on selected period
                                    </p>
                                </div>
                            </div>

                            {/* Conversion Rate Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">ads_click</span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${analyticsData.kpis.conversion.growth >= 0
                                            ? 'text-success bg-success/10'
                                            : 'text-error bg-error/10'
                                        }`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {analyticsData.kpis.conversion.growth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                        {Math.abs(analyticsData.kpis.conversion.growth)}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/60 mb-1">Conversion Rate</p>
                                    <h3 className="text-2xl font-black text-on-surface">
                                        {analyticsData.kpis.conversion.value} <span className="text-sm font-medium text-secondary">%</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-secondary mt-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Orders per visitor
                                    </p>
                                </div>
                            </div>

                            {/* Visitors Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">group</span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${analyticsData.kpis.visitors.growth >= 0
                                            ? 'text-success bg-success/10'
                                            : 'text-error bg-error/10'
                                        }`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {analyticsData.kpis.visitors.growth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                        {Math.abs(analyticsData.kpis.visitors.growth)}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/60 mb-1">Store Visitors</p>
                                    <h3 className="text-2xl font-black text-on-surface">
                                        {analyticsData.kpis.visitors.value.toLocaleString()} <span className="text-sm font-medium text-secondary">Users</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-secondary mt-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Unique sessions
                                    </p>
                                </div>
                            </div>

                            {/* Avg Order Value Card */}
                            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group hover:border-primary/30 transition-all flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="size-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                                    </div>
                                    <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${analyticsData.kpis.aov.growth >= 0
                                            ? 'text-success bg-success/10'
                                            : 'text-error bg-error/10'
                                        }`}>
                                        <span className="material-symbols-outlined text-xs">
                                            {analyticsData.kpis.aov.growth >= 0 ? 'arrow_upward' : 'arrow_downward'}
                                        </span>
                                        {Math.abs(analyticsData.kpis.aov.growth)}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary/60 mb-1">Avg. Order Value</p>
                                    <h3 className="text-2xl font-black text-on-surface">
                                        {analyticsData.kpis.aov.value.toLocaleString('vi-VN')} <span className="text-sm font-medium text-secondary">₫</span>
                                    </h3>
                                    <p className="text-[10px] font-bold text-secondary mt-4 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">info</span>
                                        Revenue per order
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Revenue & Orders Chart */}
                            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-on-surface">Sales Performance</h3>
                                        <p className="text-xs text-secondary font-medium">Daily revenue vs. previous period</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 bg-primary rounded-full"></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Current</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 bg-slate-200 rounded-full"></span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Previous</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-80 w-full relative">
                                    <canvas ref={revenueCanvasRef}></canvas>
                                </div>
                            </div>

                            {/* Sales by Category Doughnut */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col">
                                <div className="mb-8">
                                    <h3 className="text-lg font-black text-on-surface">Sales by Category</h3>
                                    <p className="text-xs text-secondary font-medium">Revenue distribution</p>
                                </div>
                                <div className="flex-1 flex items-center justify-center h-64 relative">
                                    <canvas ref={categoryCanvasRef}></canvas>
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    {analyticsData.charts.categories.slice(0, 4).map((cat, i) => {
                                        const colors = ['#004ac6', '#fb923c', '#8b5cf6', '#10b981', '#64748b'];
                                        return (
                                            <div key={cat.label} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                                                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }}></span>
                                                <span className="text-[10px] font-black text-secondary uppercase truncate max-w-[80px]">{cat.label}</span>
                                                <span className="ml-auto text-[10px] font-black text-primary">{cat.percentage}%</span>
                                            </div>
                                        );
                                    })}
                                    {analyticsData.charts.categories.length === 0 && (
                                        <p className="text-center col-span-2 text-xs text-secondary font-bold py-4">No distribution data</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lower Grid: Traffic & Products */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Traffic Sources Bar Chart */}
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h3 className="text-lg font-black text-on-surface">Traffic Sources</h3>
                                        <p className="text-xs text-secondary font-medium">Where your customers come from</p>
                                    </div>
                                    <button className="p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
                                        <span className="material-symbols-outlined text-secondary">more_horiz</span>
                                    </button>
                                </div>
                                <div className="h-64 w-full relative">
                                    <canvas ref={trafficCanvasRef}></canvas>
                                </div>
                            </div>

                            {/* Top Products detailed */}
                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="p-8 pb-4">
                                    <h3 className="text-lg font-black text-on-surface">Product Performance</h3>
                                    <p className="text-xs text-secondary font-medium">Top selling items by value</p>
                                </div>
                                <div className="flex-1 overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 border-y border-slate-100">
                                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Product</th>
                                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Orders</th>
                                                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-secondary">Conversion</th>
                                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-secondary text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {analyticsData.products.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-10 text-xs text-secondary font-bold">
                                                        No products sold in this period
                                                    </td>
                                                </tr>
                                            ) : (
                                                analyticsData.products.map(prod => (
                                                    <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-8 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <img src={prod.image} className="size-10 rounded-lg object-cover" alt="" />
                                                                <span className="text-xs font-black text-on-surface truncate max-w-[120px]" title={prod.name}>
                                                                    {prod.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-4 text-xs font-bold text-on-surface">{prod.orders}</td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, prod.conversion * 10)}%` }}></div>
                                                                </div>
                                                                <span className="text-[10px] font-black text-emerald-600">{prod.conversion}%</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-4 text-xs font-black text-primary text-right">
                                                            {prod.revenue.toLocaleString('vi-VN')}₫
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <p className="text-slate-500 font-bold text-sm">Unable to connect to the analytics database.</p>
                    </div>
                )}
            </div>

            {/* AI Assistant Chat Component */}
            <div className="fixed bottom-8 right-8 z-[110] flex flex-col gap-4">
                <button
                    onClick={() => setShowAI(!showAI)}
                    className="size-16 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all group relative border border-primary/10 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                            <div className="absolute -top-1 -right-1 size-7 bg-white text-error font-black flex items-center justify-center rounded-full border-2 border-error shadow-lg text-[12px]">1</div>
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-on-surface text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        AI Assistant
                    </span>
                </button>
            </div>

            {showAI && (
                <div className="fixed bottom-28 right-8 w-96 h-[550px] bg-surface-container-lowest rounded-[2rem] shadow-2xl border border-outline-variant/30 flex flex-col z-[120] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* AI Chat Header */}
                    <div className="p-6 bg-primary text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                <span className="material-symbols-outlined">smart_toy</span>
                            </div>
                            <div>
                                <h3 className="font-black text-sm tracking-tight">AI Assistant</h3>
                                <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">Always Online</p>
                            </div>
                        </div>
                        <button onClick={() => setShowAI(false)} className="size-8 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-surface-container-low/30 flex flex-col">
                        {aiMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                {msg.sender === 'ai' && (
                                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    </div>
                                )}
                                <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-sm border ${msg.sender === 'user'
                                        ? 'bg-primary text-white rounded-tr-none border-primary'
                                        : 'bg-white text-on-surface rounded-tl-none border-outline-variant/20'
                                    }`}>
                                    {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                                </div>
                            </div>
                        ))}
                        {aiTyping && (
                            <div className="flex gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/20 flex items-center gap-1">
                                    <div className="size-2 bg-slate-300 rounded-full animate-bounce"></div>
                                    <div className="size-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="size-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-outline-variant/30 shrink-0">
                        <form onSubmit={handleAiSubmit} className="flex gap-2 p-2 bg-surface-container-low rounded-2xl border border-outline-variant/20">
                            <input
                                type="text"
                                placeholder="Ask AI anything..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold px-2 outline-none"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="size-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 transition-all cursor-pointer"
                                disabled={!aiInput.trim()}
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerAnalytics;
