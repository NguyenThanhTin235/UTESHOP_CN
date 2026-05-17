import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser, sendOTP, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { regData } = location.state || {};

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!regData) {
      navigate('/register');
    }
  }, [regData, navigate]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'Registration successful') {
      toast.dismiss();
      toast.success(message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      dispatch(reset());
    }
    
    if (isSuccess && message === 'OTP has been sent to your email') {
      toast.dismiss();
      toast.success('OTP resent successfully!');
      setTimer(59);
      setCanResend(false);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const onResendOTP = () => {
    if (canResend) {
      dispatch(sendOTP(regData.email));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.dismiss();
      toast.error('Please enter all 6 digits');
      return;
    }

    const userData = {
      full_name: regData.fullName,
      email: regData.email.trim(),
      password: regData.password,
      otp_code: otpCode,
    };
    dispatch(registerUser(userData));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="w-full my-auto py-8 flex items-center justify-center">
        <div className="max-w-[480px] w-full">
          {/* Verification Card */}
          <div className="bg-white rounded-[24px] p-8 md:p-12 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30 text-center">
            {/* Illustration/Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 bg-[#004ac6]/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[32px] text-[#004ac6]">verified_user</span>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-[#131b2e] mb-2">OTP Verification</h1>
            <p className="text-sm text-[#434655] mb-8 leading-relaxed">
              Please enter the 6-digit code sent to your email <span className="font-bold text-[#131b2e]">{regData?.email}</span> to complete the security process.
            </p>

            {/* OTP Input Cluster */}
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    className="w-12 h-14 md:w-14 md:h-16 text-center font-bold text-xl md:text-2xl border border-[#c3c6d7] rounded-xl bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all text-[#131b2e]"
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>

              <button 
                className="w-full bg-[#004ac6] text-white font-bold text-lg py-4 rounded-xl shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#c3c6d7]/50">
              <p className="text-sm text-[#434655] mb-2">Didn't receive the code?</p>
              <div className="flex items-center justify-center gap-2">
                <button 
                  type="button" 
                  onClick={onResendOTP} 
                  disabled={!canResend}
                  className={`font-bold transition-all ${canResend ? 'text-[#004ac6] hover:underline cursor-pointer' : 'text-[#737686] cursor-not-allowed'}`}
                >
                  Resend Code
                </button>
                <span className="text-[#434655] opacity-60">•</span>
                <span className="text-[#434655] font-medium text-xs">{formatTime(timer)}s</span>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate('/login')} 
              className="inline-flex items-center gap-2 text-[#434655] hover:text-[#004ac6] transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
