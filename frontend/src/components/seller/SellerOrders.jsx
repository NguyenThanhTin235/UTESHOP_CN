import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';

const SellerOrders = ({ onViewDetails }) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'
    const { user } = useSelector((state) => state.auth);
    const { unreadCount } = useNotifications();
    const [orders, setOrders] = useState([]);
    const [summary, setSummary] = useState({
        'All Orders': 0,
        'Pending': 0,
        'To Process': 0,
        'Shipping': 0,
        'Completed': 0,
        'Return/Refund': 0
    });
    const [meta, setMeta] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Orders');
    const [isLoading, setIsLoading] = useState(false);

    // Sorting and Filtering states
    const [sortBy, setSortBy] = useState('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Date Range states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tempDateFrom, setTempDateFrom] = useState('');
    const [tempDateTo, setTempDateTo] = useState('');

    const tabs = ['All Orders', 'Pending', 'To Process', 'Shipping', 'Completed', 'Return/Refund'];

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/orders`, {
                params: {
                    page: meta.page,
                    limit: meta.limit,
                    search,
                    status: statusFilter,
                    sortBy,
                    ...(dateFrom && { dateFrom }),
                    ...(dateTo && { dateTo }),
                },
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setOrders(res.data.data);
                setMeta(res.data.meta);
                setSummary(res.data.summary);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchOrders();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [meta.page, search, statusFilter, sortBy, dateFrom, dateTo]);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        orderId: null,
        newStatus: ''
    });

    const handleStatusUpdate = (id, newStatus) => {
        setConfirmModal({ isOpen: true, orderId: id, newStatus });
    };

    const executeStatusUpdate = async () => {
        const { orderId, newStatus } = confirmModal;
        setConfirmModal({ isOpen: false, orderId: null, newStatus: '' });
        try {
            const res = await axios.put(`http://localhost:5000/api/seller/orders/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                toast.success('Order status updated successfully');
                fetchOrders();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/seller/orders/export', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'orders.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            toast.success('Orders exported successfully');
        } catch (error) {
            toast.error('Failed to export orders');
        }
    };

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + ' ₫';
    };

    const renderActionButtons = (order) => {
        if (order.status === 'pending') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleStatusUpdate(order._id, 'canceled')} className="p-2.5 border border-error/20 text-error rounded-xl hover:bg-error/5 transition-all group relative" title="Cancel Order">
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                    </button>
                    <button onClick={() => handleStatusUpdate(order._id, 'confirmed')} className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all group relative" title="Confirm Order">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    </button>
                </div>
            );
        }
        if (order.status === 'confirmed') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleStatusUpdate(order._id, 'canceled')} className="p-2.5 border border-error/20 text-error rounded-xl hover:bg-error/5 transition-all group relative" title="Cancel Order">
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                    </button>
                    <button onClick={() => handleStatusUpdate(order._id, 'shipped')} className="p-2.5 bg-surface-container-high text-secondary rounded-xl border border-outline-variant/30 hover:bg-primary hover:text-white transition-all group relative" title="Prepare Goods & Ship">
                        <span className="material-symbols-outlined text-[20px]">package_2</span>
                    </button>
                    <button className="p-2.5 border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-all group relative" title="Print Waybill">
                        <span className="material-symbols-outlined text-[20px]">print</span>
                    </button>
                </div>
            );
        }
        if (order.status === 'shipped') {
            return (
                <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleStatusUpdate(order._id, 'delivered')} className="p-2.5 border border-primary/20 text-primary rounded-xl hover:bg-primary/5 transition-all group relative" title="Mark Delivered">
                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                    </button>
                </div>
            );
        }
        return null;
    };

    const renderLogisticsStatus = (order) => {
        if (order.status === 'pending') {
            return (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center justify-center gap-2">
                        <span className="px-3 py-1.5 bg-surface-container-high text-secondary rounded-lg text-[10px] font-black uppercase tracking-wider border border-outline-variant/30 shadow-sm inline-block">Pending Confirm</span>
                    </div>
                    <span className="text-xs font-bold text-secondary/50">— Waiting for seller —</span>
                </div>
            );
        }
        if (order.status === 'confirmed') {
            return (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center justify-center gap-2 text-warning">
                        <span className="px-3 py-1.5 bg-[#fef3c7] text-[#b45309] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#b45309]/10 shadow-sm inline-block">To Process</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-secondary">
                        <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                        Preparing Goods
                    </div>
                </div>
            );
        }
        if (order.status === 'shipped') {
            return (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center justify-center gap-2 text-primary">
                        <span className="px-3 py-1.5 bg-[#e0f2fe] text-[#0369a1] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#0369a1]/10 shadow-sm inline-block animate-pulse">In Transit</span>
                    </div>
                    <div className="flex flex-col items-center text-xs font-bold text-secondary">
                        <span className="flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                            Shipping Partner
                        </span>
                    </div>
                </div>
            );
        }
        if (order.status === 'delivered') {
            return (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center justify-center gap-2 text-success">
                        <span className="px-3 py-1.5 bg-[#e6f4ea] text-[#1e7e34] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#1e7e34]/10 shadow-sm inline-block">Delivered</span>
                    </div>
                    <span className="text-xs font-bold text-secondary text-center">Successfully received</span>
                </div>
            );
        }
        if (order.status === 'canceled') {
            return (
                <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center justify-center gap-2 text-error">
                        <span className="px-3 py-1.5 bg-[#fdecea] text-[#c62828] rounded-lg text-[10px] font-black uppercase tracking-wider border border-[#c62828]/10 shadow-sm inline-block">Canceled</span>
                    </div>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-2 text-secondary">
                    <span className="px-3 py-1.5 bg-surface-container-high text-secondary rounded-lg text-[10px] font-black uppercase tracking-wider border border-outline-variant/30 shadow-sm inline-block">{order.status}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8FAFC]">
            

            <div className="p-10 max-w-[1440px] mx-auto w-full space-y-6">
                {/* Status Tabs */}
                <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/30 overflow-hidden">
                    <div className="border-b border-outline-variant/30 flex px-8 overflow-x-auto bg-surface-container-low/20 custom-scrollbar">
                        {tabs.map(tab => {
                            const count = summary[tab] || 0;
                            const isActive = statusFilter === tab;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => { setStatusFilter(tab); setMeta({ ...meta, page: 1 }); }}
                                    className={`px-6 py-5 text-sm whitespace-nowrap tracking-tight flex items-center gap-2 transition-colors ${isActive ? 'font-black text-primary border-b-[3px] border-primary' : 'font-bold text-secondary hover:text-primary'}`}
                                >
                                    {tab} {tab !== 'All Orders' && `(${count})`}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="p-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="relative w-full md:w-[500px] group">
                            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder="Search by Order ID, Phone, or Customer Name..."
                                className="w-full pl-14 pr-6 py-4 bg-surface-container-low border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-secondary/60 outline-none"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setMeta({ ...meta, page: 1 }); }}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Date Range Picker */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setTempDateFrom(dateFrom);
                                        setTempDateTo(dateTo);
                                        setShowDatePicker(!showDatePicker);
                                        setShowSortDropdown(false);
                                    }}
                                    className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${
                                        (dateFrom || dateTo)
                                            ? 'bg-primary/5 border-primary/30 text-primary'
                                            : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                    {(dateFrom || dateTo)
                                        ? `${dateFrom || '...'} → ${dateTo || '...'}`
                                        : 'Date Range'}
                                    {(dateFrom || dateTo) && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDateFrom('');
                                                setDateTo('');
                                                setMeta(prev => ({ ...prev, page: 1 }));
                                            }}
                                            className="material-symbols-outlined text-[16px] text-error hover:scale-110 transition-transform"
                                            title="Clear date filter"
                                        >close</span>
                                    )}
                                </button>

                                {showDatePicker && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowDatePicker(false)}></div>
                                        <div className="absolute right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-level-1 z-50 p-5 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <p className="text-xs font-black uppercase tracking-widest text-secondary mb-4">Filter by Date Range</p>
                                            <div className="flex flex-col gap-3">
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary/70 mb-1 block">From</label>
                                                    <input
                                                        type="date"
                                                        value={tempDateFrom}
                                                        max={tempDateTo || undefined}
                                                        onChange={(e) => setTempDateFrom(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-secondary/70 mb-1 block">To</label>
                                                    <input
                                                        type="date"
                                                        value={tempDateTo}
                                                        min={tempDateFrom || undefined}
                                                        onChange={(e) => setTempDateTo(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                <button
                                                    onClick={() => {
                                                        setDateFrom('');
                                                        setDateTo('');
                                                        setTempDateFrom('');
                                                        setTempDateTo('');
                                                        setShowDatePicker(false);
                                                        setMeta(prev => ({ ...prev, page: 1 }));
                                                    }}
                                                    className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-xs font-bold text-secondary hover:bg-surface-container-low transition-all"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setDateFrom(tempDateFrom);
                                                        setDateTo(tempDateTo);
                                                        setShowDatePicker(false);
                                                        setMeta(prev => ({ ...prev, page: 1 }));
                                                    }}
                                                    className="flex-1 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Filter Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className={`flex items-center gap-2 px-5 py-3 border rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer ${sortBy !== 'newest'
                                            ? 'bg-primary/5 border-primary/30 text-primary'
                                            : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                    {sortBy === 'newest' && 'Filter'}
                                    {sortBy === 'oldest' && 'Oldest First'}
                                    {sortBy === 'priceAsc' && 'Price: Low to High'}
                                    {sortBy === 'priceDesc' && 'Price: High to Low'}
                                    <span className="material-symbols-outlined text-secondary text-sm ml-1">expand_more</span>
                                </button>
                                {showSortDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowSortDropdown(false)}></div>
                                        <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-level-1 z-50 p-2 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <button
                                                onClick={() => { setSortBy('newest'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'newest' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Newest First
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('oldest'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'oldest' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Oldest First
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('priceAsc'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'priceAsc' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Price: Low to High
                                            </button>
                                            <button
                                                onClick={() => { setSortBy('priceDesc'); setShowSortDropdown(false); setMeta(prev => ({ ...prev, page: 1 })); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${sortBy === 'priceDesc' ? 'bg-primary/5 text-primary' : 'text-secondary hover:bg-surface-container-low'}`}
                                            >
                                                Price: High to Low
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 border border-outline-variant rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">
                                <span className="material-symbols-outlined text-[20px]">download</span>
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Orders Data Table */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="bg-surface-container-low/50">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 w-[22%] min-w-[220px]">Order Details</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 w-[38%] min-w-[350px]">Product Information</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-right w-[13%] min-w-[130px]">Payment</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-center w-[14%] min-w-[140px]">Logistics Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-secondary/70 text-right w-[13%] min-w-[130px]">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-secondary font-bold">Loading orders...</td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-secondary font-bold">No orders found.</td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id} className="hover:bg-surface-container-low/30 transition-all group">
                                            <td className="px-8 py-6 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span onClick={() => onViewDetails && onViewDetails(order._id)} className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer bg-surface-container-low px-1.5 py-0.5 rounded w-fit break-all">{order.order_code}</span>
                                                    <span className="text-sm font-black text-on-surface mt-1">{order.customer_id?.full_name || 'Unknown User'}</span>
                                                    <span className="text-xs font-bold text-secondary">{order.customer_id?.phone || 'No phone'}</span>
                                                    <span className="text-[10px] font-bold text-secondary/60 mt-0.5">{formatDate(order.createdAt)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 align-top">
                                                <div className="flex flex-col gap-4">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            <div className="size-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container border border-outline-variant/30 shadow-sm">
                                                                <img src={item.product_id?.media_url || 'https://placehold.co/100x100?text=No+Image'} className="w-full h-full object-cover" alt="product" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-on-surface line-clamp-1">{item.product_id?.name || 'Unknown Product'}</span>
                                                                <span className="text-xs font-bold text-secondary">Qty: {item.quantity < 10 ? `0${item.quantity}` : item.quantity} {item.variant_id?.attributes ? `• ${Object.values(item.variant_id.attributes).join(', ')}` : ''}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-right align-top">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-primary">{formatPrice(order.total_final)}</span>
                                                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{order.payment_order_id?.payment_method || 'N/A'}</span>
                                                    {order.coin_discount > 0 && (
                                                        <span className="text-[10px] font-black text-[#b45309] mt-1.5 bg-[#fef3c7] px-2 py-0.5 rounded-lg w-fit ml-auto border border-[#b45309]/10 shadow-sm">-{formatPrice(order.coin_discount)} (Coins)</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 align-top text-center">
                                                {renderLogisticsStatus(order)}
                                            </td>
                                            <td className="px-8 py-6 align-top">
                                                {renderActionButtons(order)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 pr-40 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/20">
                        <div className="flex items-center gap-4">
                            <p className="text-[11px] font-black text-secondary uppercase tracking-widest">
                                Showing <span className="text-primary font-black">{(meta.page - 1) * meta.limit + 1} - {Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-on-surface font-black">{meta.total}</span> orders
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={meta.page === 1}
                                onClick={() => setMeta({ ...meta, page: 1 })}
                                className="size-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary disabled:opacity-50 transition-all"
                                title="First Page"
                            >
                                <span className="material-symbols-outlined text-lg">keyboard_double_arrow_left</span>
                            </button>
                            <button
                                disabled={meta.page === 1}
                                onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                                className="size-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary disabled:opacity-50 transition-all"
                                title="Previous Page"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                            </button>

                            {[...Array(meta.totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setMeta({ ...meta, page: i + 1 })}
                                    className={`size-10 flex items-center justify-center rounded-xl font-black text-xs transition-all ${meta.page === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:bg-surface-variant/50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={meta.page === meta.totalPages}
                                onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                                className="size-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary disabled:opacity-50 transition-all"
                                title="Next Page"
                            >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                            </button>
                            <button
                                disabled={meta.page === meta.totalPages}
                                onClick={() => setMeta({ ...meta, page: meta.totalPages })}
                                className="size-10 flex items-center justify-center rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-secondary hover:text-primary disabled:opacity-50 transition-all"
                                title="Last Page"
                            >
                                <span className="material-symbols-outlined text-lg">keyboard_double_arrow_right</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Custom Status Update Confirmation Modal */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/10">
                                <span className="material-symbols-outlined text-[32px]">info</span>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Confirm Status Change</h3>
                                <p className="text-slate-500 font-medium text-sm">
                                    Are you sure you want to change this order status to <span className="font-bold text-primary uppercase">{confirmModal.newStatus}</span>?
                                </p>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setConfirmModal({ isOpen: false, orderId: null, newStatus: '' })}
                                    className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={executeStatusUpdate}
                                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm hover:brightness-110 shadow-lg shadow-primary/20 cursor-pointer"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Spacing */}
                <div className="h-24"></div>
            </div>
        </div>
    );
};

export default SellerOrders;
