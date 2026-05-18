import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile, uploadAvatar, logout, reset } from '../redux/authSlice';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Helper to format date for input type="date"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    try {
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: formatDate(user?.dob),
    gender: user?.gender || '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  // Sync form data when user data changes (e.g. after login or update)
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: formatDate(user.dob),
        gender: user.gender || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isError) {
      toast.error(message, { id: 'profile-error' });
      dispatch(reset());
    }
    if (isSuccess && (message === 'Profile updated successfully' || message === 'Avatar uploaded successfully')) {
      toast.success(message, { id: 'profile-success' });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, dispatch]);

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const onAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const uploadData = new FormData();
      uploadData.append('avatar', file);
      dispatch(uploadAvatar(uploadData));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // Basic Phone validation
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      return toast.error('Invalid Vietnamese phone number format', { id: 'profile-error' });
    }

    dispatch(updateProfile(formData));
  };

  const onLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
            {/* Active Item: Profile */}
            <Link to="/user/profile" className="flex items-center px-4 py-3 space-x-3 bg-[#004ac6] text-white font-bold rounded-xl shadow-lg shadow-[#004ac6]/20 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
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
            <Link to="/security" className="flex items-center px-4 py-3 space-x-3 text-[#434655] hover:bg-[#f7f9ff] hover:text-[#004ac6] transition-all font-medium rounded-xl">
              <span className="material-symbols-outlined">security</span>
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
        <section className="flex-1 w-full">
          <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden border border-[#c3c6d7]/30">
            <div className="p-8 border-b border-[#c3c6d7]/30 text-left">
              <h1 className="text-3xl font-bold text-[#131b2e] tracking-tight">Personal Information</h1>
              <p className="text-sm text-[#434655] mt-2">Manage your identity and contact details across the UTEShop marketplace.</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Avatar Upload */}
                <div className="lg:col-span-4 flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={onAvatarClick}>
                    <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-[#faf8ff] shadow-md bg-[#f7f9ff]">
                      <img 
                        alt="Current Avatar" 
                        className="w-full h-full object-cover" 
                        src={avatarSrc}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute inset-0 bg-[#004ac6]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl backdrop-blur-sm">
                      <span className="material-symbols-outlined text-white text-4xl">photo_camera</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#004ac6] p-2 rounded-full text-white shadow-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} onChange={onAvatarChange} className="hidden" accept="image/*" />
                  <p className="text-xs text-[#434655] text-center px-4 mt-2 leading-relaxed">Click to upload a new profile photo. JPG or PNG, max 5MB.</p>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Full Name</label>
                        <input 
                          className="w-full bg-[#ffffff] border border-[#c3c6d7] rounded-lg p-3 text-base text-[#131b2e] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all outline-none" 
                          type="text" 
                          name="fullName" 
                          value={formData.fullName} 
                          onChange={onChange}
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Account Tier</label>
                        <div className="flex items-center gap-2 bg-[#f7f9ff] border border-[#c3c6d7]/60 p-3 rounded-lg h-[50px]">
                          <span className="material-symbols-outlined text-[#004ac6]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          <span className="text-xs text-[#004ac6] font-bold">{user?.tier || 'Standard Member'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Email Address</label>
                      <input 
                        className="w-full bg-[#f7f9ff] border border-[#c3c6d7]/50 rounded-lg p-3 text-base text-[#434655] cursor-not-allowed outline-none" 
                        readOnly 
                        type="email" 
                        value={formData.email}
                      />
                      <span className="text-xs text-[#434655] flex items-center gap-1 mt-1 font-medium">
                        <span className="material-symbols-outlined text-sm">info</span> Email cannot be changed for security reasons.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Phone Number</label>
                        <input 
                          className="w-full bg-[#ffffff] border border-[#c3c6d7] rounded-lg p-3 text-base text-[#131b2e] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all outline-none" 
                          placeholder="+84 (03) 000-0000" 
                          type="tel" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={onChange}
                        />
                      </div>
                      <div className="flex flex-col gap-1 text-left">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Date of Birth</label>
                        <input 
                          className="w-full bg-[#ffffff] border border-[#c3c6d7] rounded-lg p-3 text-base text-[#131b2e] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all outline-none" 
                          type="date" 
                          name="dob" 
                          value={formData.dob} 
                          onChange={onChange}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#434655]">Gender</label>
                      <select 
                        className="w-full bg-[#ffffff] border border-[#c3c6d7] rounded-lg p-3 text-base text-[#131b2e] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] transition-all appearance-none cursor-pointer outline-none" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={onChange}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="flex justify-end pt-6 mt-6 border-t border-[#c3c6d7]/30">
                      <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="bg-[#004ac6] text-white font-bold px-8 py-3 rounded-lg shadow-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <span className="animate-spin material-symbols-outlined">progress_activity</span> : null}
                        Save changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card for Extra Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d7]/30">
              <div className="flex items-center gap-2 text-[#004ac6] mb-2">
                <span className="material-symbols-outlined">security</span>
                <h4 className="text-sm font-bold text-[#131b2e]">Security Status</h4>
              </div>
              <p className="text-sm text-[#434655]">{user?.twoFactorEnabled ? '2FA security is enabled.' : '2FA security is not enabled.'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d7]/30">
              <div className="flex items-center gap-2 text-[#004ac6] mb-2">
                <span className="material-symbols-outlined">history</span>
                <h4 className="text-sm font-bold text-[#131b2e]">Member Since</h4>
              </div>
              <p className="text-sm text-[#434655]">{user?.createdAt ? `Member since ${new Date(user.createdAt).getMonth() + 1}/${new Date(user.createdAt).getFullYear()}.` : 'Join date not available.'}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c3c6d7]/30">
              <div className="flex items-center gap-2 text-[#004ac6] mb-2">
                <span className="material-symbols-outlined">account_balance_wallet</span>
                <h4 className="text-sm font-bold text-[#131b2e]">UTE Points</h4>
              </div>
              <p className="text-sm text-[#434655]">{user?.loyaltyPoints !== undefined ? `You have ${user.loyaltyPoints.toLocaleString()} loyalty points.` : 'No loyalty points accumulated yet.'}</p>
            </div>
          </div>
        </section>
      </div>

      <FABGroup />
    </Layout>
  );
};

export default Profile;
