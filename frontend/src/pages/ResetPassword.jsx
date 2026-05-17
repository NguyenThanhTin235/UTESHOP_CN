import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resetPassword, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [step, setStep] = useState(2);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { newPassword, confirmPassword } = passwords;
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const email = location.state?.email;

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'Password has been updated successfully') {
      toast.dismiss();
      toast.success('Password reset successful! Please login.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onConfirmOtp = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.error('Please enter all 6 digits of OTP');
      return;
    }
    setStep(3);
  };

  const onSubmitPassword = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    dispatch(resetPassword({ email, otp: otpCode, newPassword }));
  };

  const hasUpperAndLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  return (
    <Layout>
      <div className="w-full my-auto py-8 flex items-center justify-center px-4 md:px-0">
        {step === 2 ? (
          <div className="w-full max-w-[520px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-8 md:p-12 border border-[#c3c6d7]/30">
            {/* Title & Branding Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563eb] rounded-full mb-4 text-white shadow-md">
                <span className="material-symbols-outlined text-[32px]">verified_user</span>
              </div>
              <h1 className="text-3xl font-bold text-[#004ac6] mb-2">Forgot Password - OTP Verification</h1>
              <p className="text-base text-[#434655]">
                A verification code has been sent to <span className="font-bold text-[#131b2e]">{email}</span>
              </p>
            </div>

            {/* OTP Input Section */}
            <form onSubmit={onConfirmOtp} className="space-y-8">
              <div className="flex justify-between gap-2 md:gap-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    className="w-12 h-14 md:w-14 md:h-16 text-center font-bold text-xl md:text-2xl border border-[#c3c6d7] rounded-xl bg-white focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 outline-none transition-all text-[#131b2e]"
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    required
                  />
                ))}
              </div>

              <div className="flex flex-col items-center gap-4 pt-2">
                <button 
                  type="submit"
                  className="w-full py-4 bg-[#004ac6] text-white rounded-lg font-bold text-lg hover:brightness-110 transition-all shadow-sm flex items-center justify-center active:scale-[0.98] cursor-pointer"
                >
                  Confirm OTP
                </button>
                <div className="flex items-center gap-2 text-sm text-[#434655]">
                  <span>Didn't receive the code?</span>
                  <button 
                    className="flex items-center gap-1 text-[#004ac6] font-bold hover:underline disabled:text-[#737686] disabled:no-underline transition-all group cursor-pointer" 
                    disabled 
                    type="button"
                  >
                    Resend OTP
                    <span className="font-mono text-xs bg-[#d0e1fb] text-[#54647a] px-2 py-0.5 rounded-full group-disabled:bg-[#dae2fd]">60s</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Decorative Visual for Authenticity */}
            <div className="mt-8 pt-8 border-t border-[#c3c6d7]/30 text-left">
              <div className="flex items-center gap-4 p-4 bg-[#f2f3ff] rounded-xl border border-[#c3c6d7]/20">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-[#004ac6]">security</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-0.5">Account Security</h4>
                  <p className="text-xs leading-relaxed text-[#434655]">This verification code is only valid for 5 minutes. Do not share this code with anyone to protect your privacy.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#c3c6d7]/30 text-center">
              <Link to="/forgot-password" className="inline-flex items-center gap-2 text-[#434655] hover:text-[#004ac6] transition-colors text-xs font-medium">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Change Email
              </Link>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[480px]">
            {/* Form Card */}
            <div className="bg-white rounded-xl p-8 md:p-12 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30">
              {/* Branding/Icon Section */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-[#d0e1fb] text-[#004ac6] rounded-full flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                </div>
                <h1 className="text-3xl font-bold text-[#131b2e] mb-2">Reset Password</h1>
                <p className="text-sm text-[#434655]">Please enter a new password for your account to complete the recovery process.</p>
              </div>

              {/* Input Fields */}
              <form onSubmit={onSubmitPassword} className="space-y-6">
                <div className="space-y-2 text-left">
                  <label className="block text-xs font-medium text-[#434655] ml-1">New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">lock</span>
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-12 pr-11 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-base text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all placeholder:text-[#737686]" 
                      placeholder="Enter new password" 
                      required
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors flex items-center justify-center cursor-pointer" 
                      type="button" 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showNewPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#737686] px-1">Password must be at least 8 characters long.</p>
                </div>

                <div className="space-y-2 text-left">
                  <label className="block text-xs font-medium text-[#434655] ml-1">Confirm New Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">verified_user</span>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-12 pr-11 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-base text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all placeholder:text-[#737686]" 
                      placeholder="Confirm new password" 
                      required
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors flex items-center justify-center cursor-pointer" 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                </div>

                {/* Password Requirements Visual Guide */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                  <div className={`flex items-center gap-1 text-xs ${hasUpperAndLower ? 'text-[#004ac6] font-bold' : 'text-[#737686]'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {hasUpperAndLower ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>Upper & lower case</span>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${hasSpecial ? 'text-[#004ac6] font-bold' : 'text-[#737686]'}`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {hasSpecial ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span>Special character</span>
                  </div>
                </div>

                {/* Primary Action */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full mt-4 bg-[#004ac6] text-white py-4 rounded-lg font-bold text-lg hover:brightness-110 transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                {/* Secondary Link */}
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep(2)} 
                    className="text-xs font-medium text-[#004ac6] hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    Back to OTP Verification
                  </button>
                </div>
              </form>
            </div>

            {/* Contextual Support Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#434655]">
                Having trouble? <Link to="/support" className="text-[#004ac6] font-semibold hover:underline">Contact support</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResetPassword;
