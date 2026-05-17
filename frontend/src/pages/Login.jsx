import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, googleLogin, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && user) {
      toast.dismiss();
      toast.success('Login successful!');
      navigate('/');
      dispatch(reset());
    }
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      console.log(tokenResponse);
      dispatch(googleLogin(tokenResponse.access_token));
    },
    onError: () => toast.error('Google Login Failed'),
  });

  return (
    <Layout>
      <div className="w-full max-w-[440px] my-auto py-8">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="font-['Manrope'] text-3xl font-bold text-[#004ac6] tracking-tighter">UTEShop</Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl p-8 border border-[#c3c6d7] shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-[#131b2e]">Login</h1>
            <p className="text-sm text-[#434655] mt-1">Welcome back to the UTEShop community.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4 text-left">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#434655] block px-1" htmlFor="email">Email address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#434655] text-[20px]">mail</span>
                <input 
                  className="w-full pl-11 pr-4 py-3 bg-[#faf8ff] rounded-lg border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none text-base text-[#131b2e]" 
                  id="email" 
                  name="email" 
                  placeholder="name@example.com" 
                  required 
                  type="email" 
                  value={email} 
                  onChange={onChange} 
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium text-[#434655]" htmlFor="password">Password</label>
                <Link className="text-xs font-medium text-[#004ac6] hover:underline transition-all" to="/forgot-password">Forgot Password?</Link>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#434655] text-[20px]">lock</span>
                <input 
                  className="w-full pl-11 pr-11 py-3 bg-[#faf8ff] rounded-lg border border-[#c3c6d7] focus:border-[#004ac6] focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none text-base text-[#131b2e]" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={onChange} 
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#434655] hover:text-[#004ac6] transition-colors" 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <div className="pt-2">
              <button 
                className="w-full py-3 px-4 bg-[#004ac6] text-white font-bold text-xl rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-[#c3c6d7] flex-grow"></div>
            <span className="text-xs font-medium text-[#737686]">or login with</span>
            <div className="h-px bg-[#c3c6d7] flex-grow"></div>
          </div>

          {/* Social Options */}
          <div className="space-y-6">
            <button 
              type="button" 
              onClick={() => handleGoogleLogin()} 
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#c3c6d7] rounded-lg hover:bg-[#f2f3ff] transition-colors bg-white shadow-sm"
            >
              <img alt="Google" className="w-5 h-5" src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
              <span className="text-xs font-medium text-[#131b2e]">Continue with Google</span>
            </button>
          </div>

          {/* Secondary Option */}
          <div className="mt-8 text-center">
            <p className="text-sm text-[#434655]">
              Don't have an account? <Link className="text-[#004ac6] font-bold hover:underline ml-1" to="/register">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Security/Trust Badges */}
        <div className="mt-8 flex justify-center items-center gap-8 opacity-60">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span className="text-xs font-medium uppercase tracking-widest text-[#131b2e]">SSL SECURED</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span className="text-xs font-medium uppercase tracking-widest text-[#131b2e]">GENUINE PRODUCTS</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;

