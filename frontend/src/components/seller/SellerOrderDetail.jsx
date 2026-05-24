import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SellerOrderDetail = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showShipmentModal, setShowShipmentModal] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    const fetchOrderDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/seller/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setOrder(res.data.data);
                window.dispatchEvent(new CustomEvent('set-order-code', { detail: { code: res.data.data.order_code, status: res.data.data.status } }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch order details');
            onBack();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    useEffect(() => {
        const handleOpenShipment = () => {
            if (order?.status === 'confirmed') setShowShipmentModal(true);
        };
        window.addEventListener('open-shipment-modal', handleOpenShipment);
        return () => window.removeEventListener('open-shipment-modal', handleOpenShipment);
    }, [order]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/seller/orders/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                toast.success('Order status updated successfully');
                fetchOrderDetails();
                if (newStatus === 'shipped') {
                    setShowShipmentModal(false);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 font-bold">Loading order details...</p>
            </div>
        );
    }

    if (!order) return null;

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + ' ₫';
    };

    const getTimelineSteps = () => {
        const steps = [
            { id: 'pending', label: 'Order Placed', icon: 'check', date: order.createdAt },
            { id: 'confirmed', label: 'Payment Confirmed', icon: 'check', date: order.createdAt },
            { id: 'to_ship', label: 'To Ship', icon: 'inventory_2', date: ['shipped', 'delivered'].includes(order.status) ? order.updatedAt : null },
            { id: 'shipped', label: 'Shipped', icon: 'local_shipping', date: ['shipped', 'delivered'].includes(order.status) ? order.updatedAt : null },
            { id: 'delivered', label: 'Completed', icon: 'verified', date: order.status === 'delivered' ? order.updatedAt : null }
        ];

        let currentStepIndex = 0;
        if (order.status === 'confirmed') currentStepIndex = 2;
        if (order.status === 'shipped') currentStepIndex = 3;
        if (order.status === 'delivered') currentStepIndex = 5;
        if (['canceled', 'refunded', 'disputed'].includes(order.status)) currentStepIndex = -1;

        return steps.map((step, index) => {
            let status = 'pending';
            if (currentStepIndex === -1) {
                status = 'canceled';
            } else if (index < currentStepIndex || (index === 0 && order.status !== 'pending') || (index === 1 && order.status !== 'pending')) {
                status = 'completed';
            } else if (index === currentStepIndex) {
                status = 'current';
            }

            return { ...step, status };
        });
    };

    const renderBanner = () => {
        if (order.status === 'canceled') {
            return (
                <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-500/30">
                            <span className="material-symbols-outlined text-4xl">cancel</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order has been Canceled</h2>
                        </div>
                    </div>
                </div>
            );
        }

        if (order.status === 'pending') {
            return (
                <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-slate-500 flex items-center justify-center text-white shadow-2xl shadow-slate-500/30">
                            <span className="material-symbols-outlined text-4xl">pending_actions</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-slate-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Pending</span>
                                <span className="text-sm font-bold text-slate-500">Placed on {formatDate(order.createdAt)}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Waiting for your confirmation</h2>
                            <p className="text-slate-600 font-medium mt-1">Please review the order and confirm it to proceed.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => handleStatusUpdate('canceled')} className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
                            Cancel Order
                        </button>
                        <button onClick={() => handleStatusUpdate('confirmed')} className="px-8 py-4 bg-[#004ac6] text-white rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-[#004ac6]/20 cursor-pointer">
                            Confirm Order
                        </button>
                    </div>
                </div>
            );
        }

        if (order.status === 'confirmed') {
            return (
                <div className="bg-[#004ac6]/5 border border-[#004ac6]/10 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-[#004ac6] flex items-center justify-center text-white shadow-2xl shadow-[#004ac6]/30">
                            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>package_2</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-[#004ac6] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">To Ship</span>
                                <span className="text-sm font-bold text-slate-500">Placed on {formatDate(order.createdAt)}</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order is ready to be processed</h2>
                            <p className="text-slate-600 font-medium mt-1">Please pack the items and confirm the shipment.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => handleStatusUpdate('canceled')} className="px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
                            Cancel Order
                        </button>
                        <button onClick={() => setShowShipmentModal(true)} className="px-8 py-4 bg-green-600 text-white rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-green-600/20 cursor-pointer">
                            Confirm Shipment
                        </button>
                    </div>
                </div>
            );
        }

        if (order.status === 'shipped') {
            return (
                <div className="bg-yellow-50 border border-yellow-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-yellow-500 flex items-center justify-center text-white shadow-2xl shadow-yellow-500/30">
                            <span className="material-symbols-outlined text-4xl">local_shipping</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-yellow-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Shipped</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order is in transit</h2>
                            <p className="text-slate-600 font-medium mt-1">The package has been handed over to the shipping partner.</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (order.status === 'delivered') {
            return (
                <div className="bg-green-50 border border-green-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-green-600 flex items-center justify-center text-white shadow-2xl shadow-green-600/30">
                            <span className="material-symbols-outlined text-4xl">verified</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-4 py-1 bg-green-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Completed</span>
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order has been delivered</h2>
                            <p className="text-slate-600 font-medium mt-1">The customer has successfully received the items.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC]">

            <div className="p-10 max-w-[1440px] mx-auto w-full space-y-8">
                {renderBanner()}

                {order.status !== 'canceled' && (
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-10">
                        <div className="flex justify-between relative">
                            {/* Line connecting steps */}
                            <div className="absolute top-[20px] left-0 w-full h-0.5 bg-slate-100 z-0 flex">
                                {getTimelineSteps().map((step, idx, arr) => (
                                    <div key={idx} className="flex-1 h-full" style={{ backgroundColor: step.status === 'completed' || step.status === 'current' ? '#004ac6' : 'transparent' }}></div>
                                ))}
                            </div>

                            {getTimelineSteps().map((step, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
                                    <div className={`size-10 rounded-full flex items-center justify-center mb-4 ${step.status === 'completed' ? 'bg-[#004ac6] text-white ring-8 ring-[#004ac6]/10' :
                                            step.status === 'current' ? 'bg-[#004ac6]/20 text-[#004ac6] ring-8 ring-[#004ac6]/5 animate-pulse' :
                                                'bg-slate-100 text-slate-500'
                                        }`}>
                                        <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${step.status === 'completed' || step.status === 'current' ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</span>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">{step.date ? formatDate(step.date) : (step.status === 'current' ? 'Pending' : 'Waiting')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Items */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-8 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#004ac6]">inventory_2</span>
                                    Order Items ({order.items?.length || 0})
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="p-8 flex items-center gap-6 group hover:bg-slate-50/50 transition-all">
                                        <div className="size-24 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                            <img src={item.product_id?.media_url || 'https://placehold.co/200x200?text=No+Image'} className="w-full h-full object-cover" alt="Product" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-black text-slate-900 mb-1 group-hover:text-[#004ac6] transition-colors">{item.product_id?.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">SKU: {item.variant_id?.sku || item.product_id?.sku || 'N/A'}</p>
                                            {item.variant_id?.attributes && (
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Variation:</span>
                                                        <span className="text-xs font-black text-slate-900">{Object.values(item.variant_id.attributes).join(' / ')}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-500 mb-1">{formatPrice(item.price_at_buy)} × {item.quantity}</div>
                                            <div className="text-lg font-black text-slate-900">{formatPrice(item.price_at_buy * item.quantity)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 space-y-4">
                            <h3 className="font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#004ac6]">receipt_long</span>
                                Order Summary
                            </h3>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Subtotal ({order.items?.reduce((acc, it) => acc + it.quantity, 0)} items)</span>
                                <span className="font-black text-slate-900">{formatPrice(order.payment_order_id?.subtotal_amount || order.subtotal_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-500">Shipping Fee</span>
                                <span className="font-black text-slate-900">{formatPrice(order.shipping_fee)}</span>
                            </div>
                            {order.coupon_discount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Coupon Discount</span>
                                    <span className="font-black text-red-500">-{formatPrice(order.coupon_discount)}</span>
                                </div>
                            )}
                            {order.coin_discount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Coins Used</span>
                                    <span className="font-black text-[#b45309]">-{formatPrice(order.coin_discount)}</span>
                                </div>
                            )}
                            {order.coupon_discount === 0 && order.coin_discount === 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-slate-500">Discount</span>
                                    <span className="font-black text-slate-900">0 ₫</span>
                                </div>
                            )}
                            <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-lg font-black text-slate-900 tracking-tight">Total Amount</span>
                                <span className="text-2xl font-black text-[#004ac6] tracking-tighter">{formatPrice(order.total_final)}</span>
                            </div>
                            <div className="mt-4 p-4 bg-[#004ac6]/5 rounded-2xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-[#004ac6]">payments</span>
                                <div className="flex-1">
                                    <span className="text-[10px] font-bold text-[#004ac6] uppercase tracking-widest block">Payment Method</span>
                                    <span className="text-xs font-black text-slate-900">{order.payment_order_id?.payment_method?.toUpperCase() || 'COD'}</span>
                                </div>
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${order.payment_status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 opacity-5 pointer-events-none">
                                <span className="material-symbols-outlined text-9xl">location_on</span>
                            </div>
                            <h3 className="font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#004ac6]">local_shipping</span>
                                Shipping Information
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Delivery Address</span>
                                    <p className="font-black text-slate-900 mb-1 text-lg">{order.shipping_address?.recipient_name || order.customer_id?.full_name}</p>
                                    <p className="text-sm font-bold text-slate-600 leading-relaxed">
                                        {order.shipping_address?.street_address || 'No address provided'}<br />
                                        {order.shipping_address?.city || ''}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2">Contact Number</span>
                                    <p className="font-black text-slate-900">{order.shipping_address?.recipient_phone || order.customer_id?.phone || 'N/A'}</p>
                                </div>
                                {order.shipment && (
                                    <div className="pt-6 border-t border-slate-200">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-2 text-[#004ac6]">Shipping Service</span>
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center font-black text-xs text-[#004ac6]">GHN</div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900">{order.shipment.shipping_partner_id?.name || 'Standard'}</p>
                                                <p className="text-[10px] font-bold text-slate-500">Tracking: {order.shipment.tracking_code || 'Pending'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Buyer Profile */}
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 relative overflow-hidden group">
                            <h3 className="font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#004ac6]">person</span>
                                Buyer Profile
                            </h3>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl border-2 border-white shadow-xl">
                                    {(order.customer_id?.full_name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-lg">{order.customer_id?.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-slate-500 font-bold">{order.customer_id?.email}</p>
                                </div>
                            </div>
                            <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <span className="material-symbols-outlined text-lg">chat</span>
                                Message Buyer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipment Modal */}
            {showShipmentModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl">
                        <div className="size-20 rounded-3xl bg-green-100 text-green-600 flex items-center justify-center mb-8 mx-auto">
                            <span className="material-symbols-outlined text-4xl">local_shipping</span>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 text-center mb-4 tracking-tight">Confirm Shipment?</h3>
                        <p className="text-slate-500 text-center font-medium mb-8">This will notify the customer that their order is being prepared and shipped. Make sure to attach the tracking number.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 ml-1">Tracking Number</label>
                                <input type="text" placeholder="e.g., VN123456789" className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-[#004ac6]/20 outline-none" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowShipmentModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                                <button onClick={() => handleStatusUpdate('shipped')} className="flex-1 py-4 bg-[#004ac6] text-white rounded-2xl font-black text-sm hover:brightness-110 shadow-lg shadow-[#004ac6]/20 cursor-pointer">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-24"></div>
        </div>
    );
};

export default SellerOrderDetail;
