import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';

const SellerCancellations = ({ setActiveTab }) => {
    const { user } = useSelector(state => state.auth);
    const { unreadCount } = useNotifications();
    const [cancellations, setCancellations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState({ new: 0, system: 0, seller: 0, refund: 0 });
    const [actionModal, setActionModal] = useState({
        isOpen: false,
        id: null,
        type: '', // 'approved' or 'rejected'
        reason: ''
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCancellations();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [activeFilter, search]);

    const fetchCancellations = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/cancellations`, {
                params: {
                    status: activeFilter,
                    search: search
                },
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setCancellations(res.data.data);

                // Calculate simple stats based on loaded data
                const pendingCount = res.data.data.filter(c => c.status === 'pending').length;
                const totalRefund = res.data.data.reduce((acc, c) => acc + (c.order_id?.total_final || 0), 0);

                setStats(prev => ({
                    ...prev,
                    new: pendingCount,
                    refund: totalRefund
                }));
            }
        } catch (error) {
            toast.error('Failed to load cancellations');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (id, status) => {
        setActionModal({
            isOpen: true,
            id,
            type: status,
            reason: ''
        });
    };

    const executeUpdateStatus = async () => {
        const { id, type, reason } = actionModal;
        if (type === 'rejected' && !reason.trim()) {
            toast.error("Please enter a reason for rejection.");
            return;
        }

        setActionModal({ isOpen: false, id: null, type: '', reason: '' });
        try {
            const res = await axios.put(`http://localhost:5000/api/seller/cancellations/${id}/status`, { status: type }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                toast.success(res.data.message);
                fetchCancellations(); // Reload the list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#F8FAFC]">
            

            <div className="p-10 max-w-[1440px] mx-auto w-full space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">pending_actions</span>
                            </div>
                            {stats.new > 0 && <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">NEW</span>}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">To Respond</span>
                        <div className="text-2xl font-black mt-1">{stats.new} Requests</div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm group hover:border-error/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-12 rounded-2xl bg-error/10 flex items-center justify-center text-error">
                                <span className="material-symbols-outlined">system_update_alt</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">System Canceled</span>
                        <div className="text-2xl font-black mt-1">0 Orders</div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm group hover:border-secondary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                                <span className="material-symbols-outlined">person_cancel</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Seller Canceled</span>
                        <div className="text-2xl font-black mt-1">0 Orders</div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm group hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">account_balance_wallet</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">Total Refund</span>
                        <div className="text-2xl font-black mt-1">{formatCurrency(stats.refund)}</div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/30 overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-outline-variant/30 flex px-8 overflow-x-auto custom-scrollbar bg-surface-container-low/20">
                        {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className={`px-6 py-6 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${activeFilter === tab
                                        ? 'text-primary border-b-[3px] border-primary'
                                        : 'text-secondary hover:text-primary'
                                    }`}
                            >
                                {tab === 'Pending' ? `Pending (${stats.new})` : tab === 'All' ? 'All Requests' : tab}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left border-b border-outline-variant/20 bg-surface-container-low/10">
                                    <th className="pl-8 pr-4 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60">Order Information</th>
                                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60">Customer</th>
                                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60">Reason</th>
                                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60 text-right">Refund Amount</th>
                                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60">Status</th>
                                    <th className="pl-4 pr-8 py-6 text-[10px] font-black uppercase tracking-widest text-secondary/60 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-500 font-bold">Loading...</td>
                                    </tr>
                                ) : cancellations.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center text-slate-500 font-bold">No cancellations found.</td>
                                    </tr>
                                ) : (
                                    cancellations.map((cancel) => {
                                        const firstItem = cancel.items && cancel.items.length > 0 ? cancel.items[0] : null;
                                        const productName = firstItem?.product_id?.name || 'Unknown Product';
                                        // Normally would fetch image from firstItem.product_id.media, but we mock it here if absent
                                        const productImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200";

                                        return (
                                            <tr key={cancel._id} className="hover:bg-surface-container-low/30 transition-colors group">
                                                <td className="pl-8 pr-4 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-16 rounded-2xl bg-surface-container-high overflow-hidden border border-outline-variant/30 shrink-0">
                                                            <img src={productImage} alt="Product" className="size-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-xs font-black text-primary hover:underline cursor-pointer">{cancel.order_id?.order_code || '#UNKNOWN'}</span>
                                                            <span className="text-sm font-bold truncate max-w-[200px] text-on-surface">{productName}</span>
                                                            <span className="text-[10px] font-bold text-secondary">Qty: {firstItem?.quantity || 1}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-black text-on-surface">{cancel.user_id?.full_name || 'Guest'}</span>
                                                        <span className="text-[10px] font-bold text-secondary">{cancel.user_id?.email || ''}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6">
                                                    <div className="flex flex-col gap-1 max-w-[250px]">
                                                        <span className="text-sm font-bold text-on-surface">{cancel.reason}</span>
                                                        <span className="text-[10px] font-medium text-secondary italic">"Requested on {new Date(cancel.createdAt).toLocaleDateString()}"</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6 text-right">
                                                    <span className="text-sm font-black text-on-surface">{formatCurrency(cancel.order_id?.total_final || 0)}</span>
                                                </td>
                                                <td className="px-4 py-6">
                                                    {cancel.status === 'pending' && (
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20">Pending Review</span>
                                                    )}
                                                    {cancel.status === 'approved' && (
                                                        <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Approved</span>
                                                    )}
                                                    {cancel.status === 'rejected' && (
                                                        <span className="px-3 py-1 bg-error/10 text-error text-[10px] font-black uppercase tracking-widest rounded-full border border-error/20">Rejected</span>
                                                    )}
                                                </td>
                                                <td className="pl-4 pr-8 py-6">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {cancel.status === 'pending' ? (
                                                            <>
                                                                <button onClick={() => handleUpdateStatus(cancel._id, 'approved')} className="p-2.5 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all group/btn shadow-sm" title="Approve">
                                                                    <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                                                                </button>
                                                                <button onClick={() => handleUpdateStatus(cancel._id, 'rejected')} className="p-2.5 rounded-xl bg-error/10 text-error hover:bg-error hover:text-white transition-all group/btn shadow-sm" title="Reject">
                                                                    <span className="material-symbols-outlined text-[18px] font-bold">close</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <div className="text-[10px] font-bold text-secondary italic mr-2">Processed</div>
                                                        )}
                                                        <button className="p-2.5 rounded-xl bg-surface-container-high text-secondary hover:bg-on-surface hover:text-white transition-all group/btn shadow-sm flex items-center justify-center" title="View Detail">
                                                            <span className="material-symbols-outlined text-[18px] font-bold">visibility</span>
                                                        </button>
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

            {/* Custom Action Modal for Approve/Reject */}
            {actionModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
                        {actionModal.type === 'approved' ? (
                            <>
                                <div className="size-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
                                    <span className="material-symbols-outlined text-[32px] font-bold">check_circle</span>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Approve Cancellation?</h3>
                                    <p className="text-slate-500 font-medium text-sm text-slate-500">
                                        Are you sure you want to approve this cancellation request? <span className="font-bold text-error">This will cancel the order permanently</span>.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setActionModal({ isOpen: false, id: null, type: '', reason: '' })}
                                        className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeUpdateStatus}
                                        className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:bg-green-700 shadow-lg shadow-green-200 cursor-pointer"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="size-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto border border-error/10">
                                    <span className="material-symbols-outlined text-[32px] font-bold">cancel</span>
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Reject Cancellation?</h3>
                                    <p className="text-slate-500 font-medium text-sm text-slate-500">
                                        Please provide a reason for rejecting this cancellation request.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <textarea 
                                        rows="3"
                                        placeholder="Reason for rejection..."
                                        value={actionModal.reason}
                                        onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all placeholder:text-secondary/50 placeholder:font-bold"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setActionModal({ isOpen: false, id: null, type: '', reason: '' })}
                                        className="flex-1 py-4 border border-slate-200 rounded-2xl font-black text-sm text-slate-600 hover:bg-slate-50 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={executeUpdateStatus}
                                        className="flex-1 py-4 bg-error text-white rounded-2xl font-black text-sm hover:brightness-110 shadow-lg shadow-error/20 cursor-pointer"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default SellerCancellations;
