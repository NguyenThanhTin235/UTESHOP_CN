import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VNPayMock = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const paymentCode = searchParams.get('paymentCode');
  const amount = searchParams.get('amount');

  const [processing, setProcessing] = useState(false);

  const handleSimulatePayment = async (status) => {
    if (!paymentCode) {
      toast.error('Invalid payment code');
      return;
    }

    try {
      setProcessing(true);
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };

      const response = await axios.post(
        'http://localhost:5000/api/checkout/vnpay-callback',
        {
          paymentCode,
          status // 'success' or 'failed'
        },
        config
      );

      if (response.data && response.data.success) {
        if (status === 'success') {
          toast.success('Simulated VNPAY payment successful!');
          navigate(`/order-success?paymentCode=${paymentCode}`);
        } else {
          toast.error('VNPAY transaction failed or canceled. You can repay from your order history.');
          navigate('/order-history');
        }
      } else {
        toast.error(response.data?.message || 'An error occurred while updating the order status');
      }
    } catch (error) {
      console.error('Error in VNPAY mock callback:', error);
      toast.error(error.response?.data?.message || 'Connection error to server');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-[#f2f4f7] min-h-screen flex items-center justify-center font-['Manrope'] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-200 overflow-hidden text-left">
        
        {/* VNPAY Brand Header */}
        <div className="bg-[#005ba4] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-amber-400">payments</span>
            <div>
              <h2 className="font-extrabold text-lg tracking-tight">VNPAY GATEWAY</h2>
              <p className="text-[10px] text-gray-200">Simulated Electronic Payment Gateway</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
            Sandbox Mode
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 border-b border-gray-100 bg-[#faf8ff] space-y-4">
          <h3 className="font-bold text-sm text-[#131b2e] uppercase tracking-wider">Payment Details</h3>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-semibold">Payment Code:</span>
            <span className="text-sm font-bold text-[#131b2e]">{paymentCode || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-semibold">Payment Amount:</span>
            <span className="text-xl font-extrabold text-[#005ba4]">{Number(amount || 0).toLocaleString()}₫</span>
          </div>
        </div>

        {/* Bank Selection simulation (Aesthetics only) */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Simulation Option</p>
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex gap-2 items-start leading-relaxed font-semibold">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0 text-amber-600">info</span>
            <span>
              This is the **VNPAY Mock** payment portal. Please choose one of the options below to proceed with the transaction.
            </span>
          </div>

          {processing ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#005ba4]"></div>
              <p className="text-xs text-gray-500 font-bold">Transmitting transaction results to UTEShop...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              
              {/* Success Button */}
              <button 
                onClick={() => handleSimulatePayment('success')}
                className="w-full bg-[#005ba4] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#004780] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                Simulate Successful Payment
              </button>

              {/* Fail Button */}
              <button 
                onClick={() => handleSimulatePayment('failed')}
                className="w-full bg-white border-2 border-red-500 text-red-500 py-4 rounded-xl font-bold text-sm hover:bg-red-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Simulate Failed / Cancelled Payment
              </button>

            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-semibold">
          <span>Secure 256-bit SSL Connection</span>
          <span>© 2026 VNPAY Mock Portal</span>
        </div>

      </div>
    </div>
  );
};

export default VNPayMock;
