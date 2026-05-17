import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'OTP has been sent to your email') {
      toast.dismiss();
      toast.success('Verification code sent to your email');
      navigate('/reset-password', { state: { email } });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    dispatch(forgotPassword(email));
  };

  return (
    <Layout>
      <div className="w-full my-auto py-8 flex items-center justify-center px-4 md:px-0">
        <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] p-8 md:p-12 border border-[#c3c6d7]/30">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-[#dbe1ff] rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#004ac6] text-[32px]">lock_reset</span>
            </div>
            <h1 className="text-3xl font-bold text-[#131b2e] mb-2">
              Forgot Password - Step 1
            </h1>
            <p className="text-base text-[#434655] max-w-[320px]">
              Enter your email to start the password recovery process.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-[#434655] ml-1" htmlFor="email">
                Email address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">mail</span>
                <input 
                  id="email"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="username@example.com" 
                  required 
                  className="w-full pl-12 pr-4 py-3 bg-[#faf8ff] border border-[#c3c6d7] rounded-lg text-base text-[#131b2e] focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all outline-none placeholder:text-[#737686]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#004ac6] text-white font-bold text-lg py-4 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  Send Verification Code
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#c3c6d7]/30 text-center">
            <p className="text-sm text-[#434655]">
              Remember your password? 
              <Link to="/login" className="text-[#004ac6] font-bold hover:underline ml-1">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
