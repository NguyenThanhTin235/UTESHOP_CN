import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import axios from 'axios';
import toast from 'react-hot-toast';

const SecuritySettings = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Password fields
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2FA & alerts settings
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    securityAlerts: {
      loginAlerts: true,
      passwordChanges: true
    }
  });
  const [fetchingSettings, setFetchingSettings] = useState(true);



  // Fetch security settings on mount
  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const res = await axios.get('http://localhost:5000/api/users/security/settings', config);
      if (res.data?.success) {
        setSettings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch security settings', err);
    } finally {
      setFetchingSettings(false);
    }
  };



  const handleToggle2FA = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const newStatus = !settings.twoFactorEnabled;
      const res = await axios.put('http://localhost:5000/api/users/security/settings', {
        twoFactorEnabled: newStatus
      }, config);
      if (res.data?.success) {
        setSettings(res.data.data);
        toast.success(`Two-Factor Authentication ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (err) {
      toast.error('Failed to update 2FA setting');
    }
  };

  const handleToggleAlerts = async (type) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const updatedAlerts = {
        ...settings.securityAlerts,
        [type]: !settings.securityAlerts[type]
      };
      const res = await axios.put('http://localhost:5000/api/users/security/settings', {
        securityAlerts: updatedAlerts
      }, config);
      if (res.data?.success) {
        setSettings(res.data.data);
        toast.success('Security alert settings updated');
      }
    } catch (err) {
      toast.error('Failed to update alert settings');
    }
  };



  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword) {
      return toast.error('Please fill in all password fields');
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      return toast.error('New passwords do not match');
    }

    // Client-side regex check
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      return toast.error('New password must be at least 8 characters, include a number and a special character');
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };

      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      };

      await axios.put('http://localhost:5000/api/users/profile/change-password', payload, config);
      
      toast.success('Password updated successfully');
      setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  };

  const onLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const avatarSrc = user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=004ac6&color=fff`;

  return (
    <Layout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-10 py-8 md:py-12 flex flex-col md:flex-row gap-8 items-start">
        {/* SideNavBar */}
        <aside className="w-full md:w-72 flex flex-col gap-4 md:sticky md:top-24 flex-shrink-0">
          {/* User Info Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#c3c6d7]/30 mb-2 text-left">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#004ac6] flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                <img src={avatarSrc} alt={user?.fullName || 'Avatar'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-[#131b2e] tracking-tight truncate">{user?.fullName || 'User'}</h3>
                <p className="text-sm text-[#434655]">{user?.tier || 'Standard Member'}</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 text-left">
            <Link to="/user/profile" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">person</span>
              <span>Personal Profile</span>
            </Link>
            <Link to="/order-history" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">shopping_bag</span>
              <span>Order History</span>
            </Link>
            <Link to="/reviews" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">star</span>
              <span>My Reviews</span>
            </Link>
            <Link to="/wishlist" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">favorite</span>
              <span>Wishlist</span>
            </Link>
            <Link to="/address-book" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">location_on</span>
              <span>Shipping Address</span>
            </Link>
            <Link to="/coins" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">monetization_on</span>
              <span>My Coins</span>
            </Link>
            <Link to="/messages" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">chat</span>
              <span>Messages</span>
            </Link>
            {/* Active Item: Security Settings */}
            <Link to="/security" className="flex items-center px-4 py-3 space-x-3 bg-[#004ac6] text-white font-bold rounded-xl shadow-lg shadow-[#004ac6]/20 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              <span>Security Settings</span>
            </Link>
          </nav>

          <div className="mt-6 pt-4 border-t border-[#c3c6d7]/50 text-left">
            <button onClick={onLogout} className="w-full flex items-center px-4 py-3 space-x-3 text-[#b3261e] hover:bg-[#b3261e]/10 transition-all font-medium rounded-xl cursor-pointer">
              <span className="material-symbols-outlined">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 w-full bg-white rounded-xl shadow-sm border border-[#c3c6d7]/30 p-8 md:p-12 text-left">
          <div className="max-w-2xl mx-auto">
            <header className="mb-8 border-b border-[#dae2fd] pb-6">
              <h1 className="text-3xl font-extrabold text-[#131b2e] mb-2 tracking-tight">Security Settings</h1>
              <p className="text-[#434655]">Manage your password, two-factor authentication, and security alerts.</p>
            </header>

            {/* Change Password Section */}
            <div className="space-y-6 mb-12">
              <h2 className="text-2xl font-bold text-[#131b2e] tracking-tight">Change Password</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#434655] uppercase tracking-wider block">Current Password</label>
                  <div className="relative">
                    <input 
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#faf8ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all text-[#131b2e]" 
                      placeholder="••••••••••••" 
                      type={showOldPassword ? "text" : "password"}
                    />
                    <button 
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors" 
                      type="button"
                    >
                      <span className="material-symbols-outlined">{showOldPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#434655] uppercase tracking-wider block">New Password</label>
                  <div className="relative">
                    <input 
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#faf8ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all text-[#131b2e]" 
                      placeholder="••••••••••••" 
                      type={showNewPassword ? "text" : "password"}
                    />
                    <button 
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors" 
                      type="button"
                    >
                      <span className="material-symbols-outlined">{showNewPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#434655] uppercase tracking-wider block">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      name="confirmNewPassword"
                      value={formData.confirmNewPassword}
                      onChange={handleInputChange}
                      className="w-full bg-[#faf8ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all text-[#131b2e]" 
                      placeholder="••••••••••••" 
                      type={showConfirmPassword ? "text" : "password"}
                    />
                    <button 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors" 
                      type="button"
                    >
                      <span className="material-symbols-outlined">{showConfirmPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                {/* Security Requirements Checklist */}
                <div className="bg-[#f2f3ff] p-6 rounded-xl border border-[#c3c6d7]/30 space-y-2 mt-6">
                  <p className="text-sm text-[#434655] font-bold mb-4">Security Requirements:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-[#434655]">
                      {formData.newPassword.length >= 8 ? (
                        <span className="material-symbols-outlined text-[#004ac6] scale-75" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c3c6d7] scale-75">radio_button_unchecked</span>
                      )}
                      <span>At least 8 characters</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#434655]">
                      {/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? (
                        <span className="material-symbols-outlined text-[#004ac6] scale-75" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c3c6d7] scale-75">radio_button_unchecked</span>
                      )}
                      <span>Include uppercase & lowercase</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm text-[#434655]">
                      {/[0-9]/.test(formData.newPassword) && /[!@#$%^&*]/.test(formData.newPassword) ? (
                        <span className="material-symbols-outlined text-[#004ac6] scale-75" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      ) : (
                        <span className="material-symbols-outlined text-[#c3c6d7] scale-75">radio_button_unchecked</span>
                      )}
                      <span>Include number and special character</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#004ac6] text-white font-bold px-8 py-4 rounded-lg shadow-sm hover:opacity-90 transition-all flex-1 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancel}
                    className="bg-[#faf8ff] border border-[#c3c6d7] text-[#505f76] font-bold px-8 py-4 rounded-lg hover:bg-[#eaedff] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* 2FA and Security Alerts Preferences Section */}
            <div className="mt-12 pt-8 border-t border-[#dae2fd]">
              <h2 className="text-2xl font-bold text-[#131b2e] mb-2 tracking-tight">Two-Factor Authentication & Alerts</h2>
              <p className="text-sm text-[#434655] mb-6">Manage additional security verification and email warnings.</p>
              
              {fetchingSettings ? (
                <div className="py-8 text-center text-sm text-[#737686]">Loading security settings...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 2FA Option */}
                  <div className="bg-[#faf8ff] p-6 rounded-xl border border-[#c3c6d7]/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[#004ac6]">verified_user</span>
                        <h3 className="font-bold text-[#131b2e]">Two-Factor Auth (2FA)</h3>
                      </div>
                      <p className="text-xs text-[#434655] mb-6">Require verification via email OTP when logging in from a new device.</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${settings.twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button
                        type="button"
                        onClick={handleToggle2FA}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.twoFactorEnabled ? 'bg-[#004ac6]' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Alerts Settings */}
                  <div className="bg-[#faf8ff] p-6 rounded-xl border border-[#c3c6d7]/30 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-[#004ac6]">notifications_active</span>
                      <h3 className="font-bold text-[#131b2e]">Security Alerts</h3>
                    </div>
                    
                    {/* Alert 1 */}
                    <div className="flex items-center justify-between py-2 border-b border-[#dae2fd]/50">
                      <div>
                        <p className="text-sm font-semibold text-[#131b2e]">New login attempts</p>
                        <p className="text-xs text-[#434655]">Get notified when logged in from a new device</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAlerts('loginAlerts')}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.securityAlerts?.loginAlerts ? 'bg-[#004ac6]' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.securityAlerts?.loginAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Alert 2 */}
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-semibold text-[#131b2e]">Password changes</p>
                        <p className="text-xs text-[#434655]">Receive emails when your password is modified</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleAlerts('passwordChanges')}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings.securityAlerts?.passwordChanges ? 'bg-[#004ac6]' : 'bg-gray-200'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings.securityAlerts?.passwordChanges ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>



            {/* Information Card */}
            <div className="mt-12 p-6 bg-[#d3e4fe]/20 border border-[#d0e1fb] rounded-xl flex items-start gap-4">
              <span className="material-symbols-outlined text-[#004ac6]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              <div>
                <p className="text-sm font-bold text-[#0b1c30]">Keep your account safe</p>
                <p className="text-sm text-[#38485d] mt-1">Regularly updating your password, enabling 2FA, and monitoring your security alerts enhance your account security and prevent unauthorized access.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <FABGroup />
    </Layout>
  );
};

export default SecuritySettings;
