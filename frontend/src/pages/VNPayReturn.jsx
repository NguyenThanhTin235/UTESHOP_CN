import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Loader2, CreditCard, ArrowRight, ShoppingBag, PhoneCall } from 'lucide-react';

const VNPayReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiCalled = useRef(false);

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'failed'
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [amount, setAmount] = useState(0);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Avoid double invocation in React 18 strict mode
    if (apiCalled.current) return;
    apiCalled.current = true;

    const verifyPayment = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        
        // Grab values for display if they exist
        const txRef = params['vnp_TxnRef'] || '';
        const vnpAmount = params['vnp_Amount'] ? Number(params['vnp_Amount']) / 100 : 0;
        
        setPaymentCode(txRef);
        setAmount(vnpAmount);

        const config = {
          headers: {
            Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
          },
        };

        const response = await axios.post(
          'http://localhost:5000/api/checkout/vnpay-verify',
          params,
          config
        );

        if (response.data && response.data.success && response.data.data?.paymentStatus === 'success') {
          setStatus('success');
          toast.success('Thanh toán qua VNPAY thành công!');
        } else {
          setStatus('failed');
          setErrorMessage(response.data?.message || 'Xác thực thanh toán thất bại');
          toast.error(response.data?.message || 'Giao dịch thất bại');
        }
      } catch (error) {
        console.error('Error verifying VNPAY payment:', error);
        setStatus('failed');
        setErrorMessage(
          error.response?.data?.message || 
          'Không thể kết nối đến máy chủ để xác thực giao dịch'
        );
        toast.error('Có lỗi xảy ra khi xác thực giao dịch');
      }
    };

    verifyPayment();
  }, [searchParams]);

  // Countdown timer for success redirect
  useEffect(() => {
    if (status !== 'success') return;

    if (countdown === 0) {
      navigate(`/order-success?paymentCode=${paymentCode}`);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [status, countdown, navigate, paymentCode]);

  return (
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center font-['Manrope'] p-4 md:p-8 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-50/50 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative z-10 transition-all duration-500">
        
        {/* VNPAY Premium Header */}
        <div className="bg-gradient-to-r from-[#005ba4] to-[#007cc4] p-6 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl">
              <CreditCard className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight uppercase">VNPAY GATEWAY</h2>
              <p className="text-[10px] text-blue-100 font-medium">Cổng Thanh Toán Điện Tử Quốc Tế</p>
            </div>
          </div>
          <div className="bg-white/15 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-white/10">
            Secure Verification
          </div>
        </div>

        {/* Dynamic States View */}
        <div className="p-8 md:p-10">
          
          {/* 1. LOADING STATE */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-20 h-20 rounded-full border-4 border-blue-100 animate-ping"></div>
                <div className="w-16 h-16 rounded-full border-4 border-t-[#005ba4] border-r-transparent border-b-transparent border-l-transparent animate-spin relative z-10"></div>
                <Loader2 className="w-8 h-8 text-[#005ba4] animate-spin absolute" />
              </div>
              
              <div className="text-center space-y-2 max-w-sm">
                <h3 className="text-lg font-bold text-slate-800">Đang xác thực thanh toán</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Vui lòng không tắt trình duyệt hoặc tải lại trang trong khi chúng tôi kiểm tra giao dịch của bạn với VNPAY...
                </p>
              </div>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === 'success' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100 shadow-inner">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-800">Thanh toán thành công!</h3>
                  <p className="text-sm text-slate-500">Cảm ơn bạn đã hoàn tất thanh toán cho đơn hàng.</p>
                </div>
              </div>

              {/* Receipt Information Table */}
              <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/60 pb-2">
                  Chi Tiết Giao Dịch
                </h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Mã thanh toán:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                      {paymentCode}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Phương thức:</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      VNPAY QR / Thẻ nội địa
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Số tiền thanh toán:</span>
                    <span className="text-lg font-extrabold text-[#005ba4]">
                      {amount.toLocaleString('vi-VN')}₫
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Trạng thái đơn hàng:</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-full">
                      Chờ xác nhận & Đã thanh toán
                    </span>
                  </div>
                </div>
              </div>

              {/* Redirect Notice & Button */}
              <div className="space-y-4">
                <div className="text-center text-xs text-slate-400 font-medium">
                  Tự động chuyển hướng đến trang đơn hàng sau <span className="text-blue-600 font-bold text-sm">{countdown}s</span>...
                </div>

                <button
                  onClick={() => navigate(`/order-success?paymentCode=${paymentCode}`)}
                  className="w-full bg-gradient-to-r from-[#005ba4] to-[#007cc4] hover:from-[#004780] hover:to-[#006bb0] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Xem chi tiết đơn hàng
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          )}

          {/* 3. FAILED STATE */}
          {status === 'failed' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100 shadow-inner">
                  <XCircle className="w-12 h-12 text-rose-500 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-2xl font-extrabold text-slate-800">Thanh toán thất bại</h3>
                  <p className="text-sm text-slate-500">Giao dịch thanh toán chưa thể hoàn tất hoặc đã bị hủy bỏ.</p>
                </div>
              </div>

              {/* Warning/Alert box */}
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 text-sm text-rose-800 flex gap-3 items-start leading-relaxed">
                <span className="material-symbols-outlined text-rose-600 flex-shrink-0 text-xl mt-0.5">warning</span>
                <div>
                  <h5 className="font-bold mb-1">Chi tiết lỗi:</h5>
                  <p className="text-rose-700/90 font-medium">{errorMessage}</p>
                  <p className="mt-3 text-xs text-rose-600/80 font-medium leading-relaxed">
                    * Lưu ý: Đơn hàng của bạn đã được ghi nhận ở trạng thái "Chờ thanh toán". Bạn có thể thực hiện thanh toán lại hoặc hủy đơn hàng tại trang Lịch sử mua hàng.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => navigate('/order-history')}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Xem Lịch sử mua hàng & Thanh toán lại
                </button>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Quay lại giỏ hàng
                  </button>
                  
                  <button
                    onClick={() => window.open('tel:1900555577')}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Hỗ trợ VNPAY (1900 5555 77)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Security Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Mã hóa bảo mật 256-bit SSL
          </span>
          <span>© 2026 UTE-SHOP & VNPAY</span>
        </div>

      </div>
    </div>
  );
};

export default VNPayReturn;
