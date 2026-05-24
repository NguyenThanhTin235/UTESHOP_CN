import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../redux/authSlice';
import Layout from '../components/Layout';
import FABGroup from '../components/FABGroup';
import axios from 'axios';
import toast from 'react-hot-toast';

const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", 
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", 
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", 
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", 
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", 
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const AddressBook = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    city: '',
    is_default: false
  });

  const fetchAddresses = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/users/addresses', config);
      if (response.data && response.data.success) {
        setAddresses(response.data.data || []);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      toast.error('Failed to load addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchAddresses();
    }
  }, [user, navigate]);

  const onLogout = (e) => {
    e.preventDefault();
    dispatch(logout());
    navigate('/login');
  };

  const handleAddNewClick = () => {
    setFormData({
      labelType: 'Home',
      label: '',
      recipient_name: '',
      recipient_phone: '',
      street_address: '',
      city: '',
      is_default: false
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (address) => {
    const currentLabel = address.label || 'Home';
    const isCommon = ['Home', 'Office'].includes(currentLabel);

    setFormData({
      labelType: isCommon ? currentLabel : 'Other',
      label: isCommon ? '' : currentLabel,
      recipient_name: address.recipientName,
      recipient_phone: address.recipientPhone,
      street_address: address.streetAddress,
      city: address.city || '',
      is_default: address.isDefault || false
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDeleteClick = (addressId) => {
    setDeleteConfirmId(addressId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      await axios.delete(`http://localhost:5000/api/users/addresses/${deleteConfirmId}`, config);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      await axios.put(`http://localhost:5000/api/users/addresses/${addressId}`, { is_default: true }, config);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const name = formData.recipient_name.trim();
    const phone = formData.recipient_phone.trim();
    const street = formData.street_address.trim();
    const city = formData.city?.trim() || '';

    if (!name || !phone || !street || !city) {
      return toast.error('Please fill all required fields');
    }

    if (name.length < 2) {
      return toast.error('Recipient name must be at least 2 characters long');
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone)) {
      return toast.error('Please enter a valid Vietnamese phone number');
    }

    if (street.length < 5) {
      return toast.error('Please provide a more detailed street address');
    }

    const payload = {
      ...formData,
      recipient_name: name,
      recipient_phone: phone,
      street_address: street,
      city: formData.city?.trim() || '',
      label: formData.labelType === 'Other' ? formData.label.trim() : formData.labelType
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/users/addresses/${editingId}`, payload, config);
        toast.success('Address updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/users/addresses', payload, config);
        toast.success('Address added successfully');
      }
      
      setShowForm(false);
      fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
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
            {/* Active Item: Address Book */}
            <Link to="/address-book" className="flex items-center px-4 py-3 space-x-3 bg-[#004ac6] text-white font-bold rounded-xl shadow-lg shadow-[#004ac6]/20 transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
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
        <section className="flex-1 w-full flex flex-col gap-8 text-left">
          {/* Content Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-extrabold text-[#004ac6] tracking-tight">Shipping Addresses</h1>
              <p className="text-sm text-[#434655] mt-1">Manage your delivery locations for faster checkout.</p>
            </div>
            {!showForm && (
              <button 
                onClick={handleAddNewClick}
                className="bg-[#004ac6] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all text-sm font-bold shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add New Address
              </button>
            )}
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
             </div>
          ) : showForm ? (
            /* Management Form Section */
            <div className="bg-white border border-[#c3c6d7] rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[#004ac6] mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined">add_location</span>
                {editingId ? 'Edit Address Details' : 'Add Address Details'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-bold text-[#434655] mb-1">Address Label</label>
                        <select 
                          name="labelType" value={formData.labelType || 'Home'} onChange={handleInputChange}
                          className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all appearance-none"
                        >
                          <option value="Home">Home</option>
                          <option value="Office">Office</option>
                          <option value="Other">Other...</option>
                        </select>
                      </div>
                      {formData.labelType === 'Other' && (
                        <div className="flex-1">
                          <label className="block text-sm font-bold text-[#434655] mb-1">Custom Label</label>
                          <input 
                            name="label" value={formData.label} onChange={handleInputChange}
                            className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all" 
                            placeholder="e.g. Apartment" type="text" 
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#434655] mb-1">Recipient Name *</label>
                      <input 
                        name="recipient_name" value={formData.recipient_name} onChange={handleInputChange} required
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all" 
                        placeholder="Full Name" type="text" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#434655] mb-1">Phone Number *</label>
                      <input 
                        name="recipient_phone" value={formData.recipient_phone} onChange={handleInputChange} required
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all" 
                        placeholder="0xxx xxx xxx" type="tel" 
                      />
                    </div>
                  </div>
                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-[#434655] mb-1">City/Province *</label>
                      <select 
                        name="city" value={formData.city} onChange={handleInputChange} required
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all appearance-none"
                      >
                        <option value="">Select City/Province</option>
                        {VIETNAM_PROVINCES.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#434655] mb-1">Detailed Address *</label>
                      <textarea 
                        name="street_address" value={formData.street_address} onChange={handleInputChange} required
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#004ac6] outline-none transition-all" 
                        placeholder="House number, Street name..." rows="4"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    name="is_default" checked={formData.is_default} onChange={handleInputChange}
                    className="w-5 h-5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]" 
                    id="set_default" type="checkbox" 
                  />
                  <label className="text-base text-[#131b2e] cursor-pointer" htmlFor="set_default">Set as default address</label>
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t border-[#c3c6d7]/50">
                  <button 
                    onClick={() => setShowForm(false)}
                    className="px-8 py-3 rounded-lg border border-[#737686] text-[#505f76] font-bold hover:bg-[#eaedff] transition-all text-sm" 
                    type="button"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-8 py-3 rounded-lg bg-[#004ac6] text-white font-bold hover:opacity-90 transition-all text-sm shadow-sm" 
                    type="submit"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
              <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[48px]">location_off</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">No Shipping Addresses</h2>
              <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
                You haven't saved any shipping addresses yet. Add your home or campus delivery address for a faster checkout experience.
              </p>
              <div className="pt-4">
                <button 
                  onClick={handleAddNewClick}
                  className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">add_location</span>
                  Add New Address
                </button>
              </div>
            </div>
          ) : (
            /* Address Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {addresses.map((address) => (
                <div key={address.id} className={`bg-white p-6 rounded-xl relative overflow-hidden ${address.isDefault ? 'border-2 border-[#004ac6] shadow-[0px_4px_20px_rgba(15,23,42,0.05)]' : 'border border-[#c3c6d7] shadow-sm'}`}>
                  {address.isDefault && (
                    <div className="absolute top-0 right-0 bg-[#004ac6] text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-lg">
                      Default
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${address.isDefault ? 'bg-[#d0e1fb] text-[#004ac6]' : 'bg-[#e2e7ff] text-[#434655]'}`}>
                      <span className="material-symbols-outlined text-[16px]">
                        {address.label && address.label.toLowerCase().includes('office') ? 'work' : 'home'}
                      </span>
                      {address.label || (address.isDefault ? 'Primary' : 'Address')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-[#131b2e]">{address.recipientName}</h4>
                    <p className="text-[#434655] text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      {address.recipientPhone}
                    </p>
                    <p className="text-[#434655] text-base leading-relaxed mt-2 line-clamp-2">
                      {address.streetAddress}{address.city ? `, ${address.city}` : ''}
                    </p>
                  </div>
                  <div className={`mt-4 pt-4 flex ${address.isDefault ? 'gap-4 border-t border-[#c3c6d7]/50' : 'justify-between items-center border-t border-[#c3c6d7]/50'}`}>
                    <div className="flex gap-4">
                      <button onClick={() => handleEditClick(address)} className="text-[#004ac6] font-bold text-sm flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteClick(address.id)} className="text-[#ba1a1a] font-bold text-sm flex items-center gap-1 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Delete
                      </button>
                    </div>
                    {!address.isDefault && (
                      <button onClick={() => handleSetDefault(address.id)} className="text-[#505f76] font-bold text-sm hover:text-[#004ac6] transition-colors">
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <FABGroup />

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#c3c6d7]/30 transform scale-100 transition-all text-center space-y-6">
            <div className="w-16 h-16 bg-[#ba1a1a]/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[36px]">delete_forever</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#131b2e]">Delete Shipping Address</h3>
              <p className="text-[#434655] text-sm leading-relaxed">
                Are you sure you want to delete this address? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-[#737686] text-[#505f76] font-bold hover:bg-[#eaedff] transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-[#ba1a1a] text-white font-bold hover:bg-[#ba1a1a]/90 transition-all text-sm shadow-md shadow-[#ba1a1a]/20 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AddressBook;
