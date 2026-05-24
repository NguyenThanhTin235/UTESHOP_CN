import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const paymentCode = searchParams.get('paymentCode');

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!paymentCode) {
        setError('Invalid payment code');
        setLoading(false);
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
          },
        };
        const response = await axios.get(`http://localhost:5000/api/checkout/order-details/${paymentCode}`, config);
        if (response.data && response.data.success) {
          setOrderData(response.data.data);
        } else {
          setError(response.data?.message || 'Failed to retrieve order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setError(error.response?.data?.message || 'A system error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentCode]);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[800px] mx-auto w-full px-4 pt-28 pb-32">
        {loading ? (
          <div className="bg-white rounded-3xl p-16 border border-[#c3c6d7]/30 shadow-sm flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
            <p className="text-[#505f76] text-sm">Loading your order details...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-[#ba1a1a]/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[36px]">error</span>
            </div>
            <h2 className="text-2xl font-bold text-[#131b2e]">An error occurred</h2>
            <p className="text-[#434655] text-sm max-w-md mx-auto">{error}</p>
            <div className="pt-4">
              <Link to="/" className="bg-[#004ac6] text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-sm">
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : orderData ? (
          <div className="bg-white rounded-3xl border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden text-left">
            
            {/* Banner Header */}
            <div className="bg-gradient-to-r from-[#004ac6] to-[#0053db] p-8 text-center text-white space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-white text-[36px]">check_circle</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Thank you for your purchase!</h2>
              <p className="text-white/80 text-sm max-w-sm mx-auto">
                Your order has been placed successfully and is being prepared by the seller.
              </p>
            </div>

            {/* Main Info */}
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Order Metadata */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[#c3c6d7]/30 text-xs font-semibold">
                <div>
                  <p className="text-[#737686]">Payment Code</p>
                  <p className="text-[#131b2e] font-bold text-sm mt-1">{orderData.paymentOrder.paymentCode}</p>
                </div>
                <div>
                  <p className="text-[#737686]">Payment Method</p>
                  <p className="text-[#131b2e] font-bold text-sm mt-1 uppercase">{orderData.paymentOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[#737686]">Payment Status</p>
                  <p className={`font-bold text-sm mt-1 capitalize ${
                    orderData.paymentOrder.paymentStatus === 'success' ? 'text-emerald-600' : 'text-amber-500'
                  }`}>
                    {orderData.paymentOrder.paymentStatus === 'success' ? 'Paid (Success)' : 'Pending Payment (COD)'}
                  </p>
                </div>
                {orderData.paymentOrder.transactionId && (
                  <div>
                    <p className="text-[#737686]">Transaction ID (VNPAY ID)</p>
                    <p className="text-[#131b2e] font-bold text-sm mt-1">{orderData.paymentOrder.transactionId}</p>
                  </div>
                )}
              </div>

              {/* Sub Orders list */}
              <div className="space-y-6">
                <h3 className="font-bold text-base text-[#131b2e]">Sub-orders</h3>
                
                {orderData.orders.map((subOrder) => (
                  <div key={subOrder.id} className="border border-[#c3c6d7]/50 rounded-xl overflow-hidden">
                    <div className="bg-[#f2f3ff]/40 p-4 border-b border-[#c3c6d7]/40 flex justify-between items-center text-xs">
                      <span className="font-bold text-[#131b2e]">{subOrder.shopId?.name || 'Store'}</span>
                      <span className="text-[#737686]">Order Code: <span className="font-bold text-[#131b2e]">{subOrder.orderCode}</span></span>
                    </div>

                    <div className="p-4 divide-y divide-[#c3c6d7]/20">
                      {subOrder.items.map((item) => (
                        <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                          <div className="min-w-0 pr-4">
                            <p className="font-bold text-[#131b2e] truncate">{item.product?.name}</p>
                            <p className="text-[10px] text-[#737686] mt-0.5">Quantity: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-[#004ac6] flex-shrink-0">
                            {(item.priceAtBuy * item.quantity).toLocaleString()}₫
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-3 bg-[#faf8ff] border-t border-[#c3c6d7]/20 flex justify-between items-center text-xs font-semibold">
                      <span className="text-[#505f76]">Order Total (inc. shipping)</span>
                      <span className="text-[#131b2e] font-bold">{subOrder.totalFinal?.toLocaleString()}₫</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary calculations */}
              <div className="bg-[#f2f3ff]/40 rounded-xl p-5 border border-[#c3c6d7]/20 text-xs font-semibold space-y-3">
                <div className="flex justify-between text-[#505f76]">
                  <span>Subtotal</span>
                  <span>{orderData.paymentOrder.subtotalAmount?.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-[#505f76]">
                  <span>Shipping Fee</span>
                  <span>{orderData.paymentOrder.shippingAmount?.toLocaleString()}₫</span>
                </div>
                {orderData.paymentOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#ba1a1a]">
                    <span>Voucher Discount</span>
                    <span>-{orderData.paymentOrder.discountAmount?.toLocaleString()}₫</span>
                  </div>
                )}
                {orderData.paymentOrder.coinSpentTotal > 0 && (
                  <div className="flex justify-between text-[#ba1a1a]">
                    <span>Coins Used</span>
                    <span>-{orderData.paymentOrder.coinSpentTotal?.toLocaleString()}₫</span>
                  </div>
                )}
                <div className="h-px bg-[#c3c6d7]/30 my-2"></div>
                <div className="flex justify-between items-center pt-1 font-bold text-sm text-[#131b2e]">
                  <span>Total Payment</span>
                  <span className="text-lg text-[#004ac6]">{orderData.paymentOrder.finalAmount?.toLocaleString()}₫</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  to="/order-history" 
                  className="flex-1 bg-[#004ac6] text-white py-3.5 rounded-xl font-bold text-sm text-center hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                  View Order History
                </Link>
                <Link 
                  to="/" 
                  className="flex-1 border border-[#c3c6d7] text-[#505f76] py-3.5 rounded-xl font-bold text-sm text-center hover:bg-[#eaedff] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">store</span>
                  Continue Shopping
                </Link>
              </div>

            </div>
          </div>
        ) : null}
      </main>

      <FABGroup />
      <Footer />
    </div>
  );
};

export default OrderSuccess;
