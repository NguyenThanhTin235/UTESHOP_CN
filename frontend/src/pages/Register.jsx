import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { fullName, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      toast.success(message);
      navigate('/verify-otp', { state: { regData: formData } });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch, formData]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.dismiss();
      toast.error('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Password strength validation
    if (password.length < 8) {
      toast.dismiss();
      toast.error('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.dismiss();
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.dismiss();
      toast.error('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.dismiss();
      toast.error('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) {
      toast.dismiss();
      toast.error('Password must contain at least one special character');
      return;
    }

    if (password !== confirmPassword) {
      toast.dismiss();
      toast.error('Passwords do not match');
    } else {
      dispatch(sendOTP(email.trim()));
    }
  };

  return (
    <Layout>
      <div className="w-full my-auto py-8 flex items-center justify-center">
        <div className="w-full max-w-[1000px] grid md:grid-cols-2 bg-white rounded-xl border border-[#c3c6d7] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden my-auto">
          {/* Left Side: Visual/Context */}
          <div className="hidden md:flex relative overflow-hidden bg-[#2563eb] p-10 flex-col justify-end text-[#eeefff]">
            <div className="absolute inset-0 z-0">
              <img 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMydRTsBmspK2mLaDDclXxglmNfSFiYJlOJJhhYsgX0ndssV51gbCEKZwCSF0vYf5mHHoyXyT6PqqTUAqOMTfnXplybz3mgeJR0EqLEhw4Wfnk7ttAtrlxmdAPQrAdLhbNiXc7ggbIxwEr5pOttI7I4ywnfB7hBnVLd5Y5MLv4EYk_kQOGz2fkwgQmPcd9nBwfglTaEd-aTLHa52JxdGqFwMJD41MURNeHsVd8aWqui1tdm_-4PQXa4y0CP6J0ZYI1dd-MmNBfXAo" 
                alt="Campus marketplace" 
              />
            </div>
            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-white">Join the UTEShop Community</h2>
              <p className="text-base opacity-90 leading-relaxed">Connecting students and faculty through the most modern and sophisticated academic shopping experiences.</p>
              <div className="flex gap-4 pt-4 items-center">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#2563eb] bg-[#dae2fd] overflow-hidden">
                    <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBE-tlrqomVlDje5USwvo0JdnA17t6S8Q_zFN1RhLCAQkJDLaFqMTkf2jmdVQsqlodiDvLzCckdip04_r8xVNUaXeziloZMaxPD-Xelw_uvKdOFSxYXQ70JSvhFuQGYubbuj4PBd28-6kNbOom9T3J-V1MnOCtRcuud5DWxVh5DVxckWZtf0hPG-CTcYW8naQm-qJH3UW-gv_fhpkmtuXrYd9DXCbAbAHEIlX_RuoLKpwvM2Dq2vE0TOQWMQp4MWvvK7kNY64E4FsA" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#2563eb] bg-[#dae2fd] overflow-hidden">
                    <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpvbjg_MrGDiK0kFfCl7JsJr_MCUq9DpXLDGiCxPMPcOWrc-l9SWWVOVp1BLf-y2nNLXf9FMnxqMsxU6KRGb7xdqyhjedG0CWiYLLPcckkhwxDbJF3J8Bskeq_NlARXdZjVrgXwNMH8DahchW8Cs8QB4JJ3cXd6JTF0zJ-Kt2zhUZwp7TwlhT-45rjDDzgu2v8wRCE0zaaIF6ShBrr5CHzj4Rja6j8c-sfApxg5zrhaLhKW2MB6_IdlLCOMPjtmLvcSREYZnrXLz8" />
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-[#2563eb] bg-[#dae2fd] overflow-hidden">
                    <img alt="User" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBylUv_z5hONdbePey2rTYz4TODmXSaKXKbBv3hWXKE894pkJy8h1KTzeL9y3q0UnNEhlkJqjQbTfXm16x_K3vtnOH_xijQT45qa6jO-UXRjrgla8IgMQq-XT_-sGEJTYMIzzewUT3rH9kamyMZC7IOT7fUhpJU_z3rWJ9W3NdlJrp7ec8WiIl69gnYOibIjQmUh_K3OaH31ffrt8sf9v0kk-GH6YiU3y9A6BY0gaETQzQuy9j1BOwNr0LwT-40i7apXDoE73Ooa-g" />
                  </div>
                </div>
                <p className="text-xs font-medium self-center text-white">More than 5000+ members joined</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 md:p-12 bg-white flex flex-col justify-center">
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-bold text-[#004ac6] mb-2">Create Account</h1>
              <p className="text-sm text-[#434655]">Please fill in the information below to start shopping at UTEShop marketplace.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 text-left">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#434655] block px-1" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">person</span>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all" 
                    id="fullName" 
                    name="fullName"
                    placeholder="John Doe" 
                    type="text" 
                    value={fullName}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[#434655] block px-1" htmlFor="email">Email address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">mail</span>
                  <input 
                    className="w-full pl-11 pr-4 py-3 bg-white border border-[#c3c6d7] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all" 
                    id="email" 
                    name="email"
                    placeholder="example@student.hcmute.edu.vn" 
                    type="email" 
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#434655] block px-1" htmlFor="password">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">lock</span>
                    <input 
                      className="w-full pl-11 pr-11 py-3 bg-white border border-[#c3c6d7] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all" 
                      id="password" 
                      name="password"
                      placeholder="••••••••" 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={onChange}
                      required
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors flex items-center justify-center cursor-pointer" 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility" : "visibility_off"}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#434655] block px-1" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] text-[20px]">lock_reset</span>
                    <input 
                      className="w-full pl-11 pr-11 py-3 bg-white border border-[#c3c6d7] rounded-lg text-sm text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] transition-all" 
                      id="confirmPassword" 
                      name="confirmPassword"
                      placeholder="••••••••" 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={onChange}
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
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 pt-2 px-1">
                <input 
                  className="mt-1 w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]/20 cursor-pointer" 
                  id="terms" 
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label className="text-sm text-[#434655]" htmlFor="terms">
                  I agree to the <a className="text-[#004ac6] hover:underline font-medium" href="#">Terms of Service</a> and <a className="text-[#004ac6] hover:underline font-medium" href="#">Privacy Policy</a>.
                </label>
              </div>

              {/* Submit Button */}
              <button 
                className="w-full bg-[#004ac6] text-white py-3.5 rounded-lg font-bold text-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                ) : (
                  "Register Now"
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-[#c3c6d7]/40 text-center">
              <p className="text-sm text-[#434655]">
                Already have an account? <Link className="text-[#004ac6] font-bold hover:underline ml-1" to="/login">Login</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
