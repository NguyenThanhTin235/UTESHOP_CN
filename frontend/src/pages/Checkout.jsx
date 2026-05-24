import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", 
  "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", 
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", 
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", 
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", 
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP Hồ Chí Minh", "Trà Vinh", 
  "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

const Checkout = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected item IDs from router location state
  const selectedItemIds = location.state?.selectedItemIds || [];

  // State variables
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  
  // Add new address form state
  const [addressFormData, setAddressFormData] = useState({
    label: 'Home',
    recipient_name: '',
    recipient_phone: '',
    street_address: '',
    city: '',
    is_default: false
  });

  // Coupon & Coin toggles
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponAppliedCode, setCouponAppliedCode] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Preview data state
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if user is not authenticated, or to cart if no items selected
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login');
    } else if (selectedItemIds.length === 0) {
      toast.error('Please select items in your cart to proceed to checkout');
      navigate('/cart');
    }
  }, [user, selectedItemIds, navigate]);

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/users/addresses', config);
      if (response.data && response.data.success) {
        const addrList = response.data.data || [];
        setAddresses(addrList);
        
        // Auto select default address
        const defAddr = addrList.find(a => a.isDefault);
        if (defAddr) {
          setSelectedAddressId(defAddr.id);
        } else if (addrList.length > 0) {
          setSelectedAddressId(addrList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to retrieve address list');
    }
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Fetch Preview calculation
  const fetchPreview = async () => {
    try {
      setLoadingPreview(true);
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const response = await axios.post(
        'http://localhost:5000/api/checkout/preview',
        {
          itemIds: selectedItemIds,
          couponCode: couponAppliedCode || undefined,
          useCoins
        },
        config
      );

      if (response.data && response.data.success) {
        setPreviewData(response.data.data);
        if (response.data.data.couponError) {
          toast.error(response.data.data.couponError);
          setCouponAppliedCode('');
        }
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error(error.response?.data?.message || 'An error occurred while calculating order summary');
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (user && selectedItemIds.length > 0) {
      fetchPreview();
    }
  }, [user, selectedItemIds, couponAppliedCode, useCoins]);

  // Apply Coupon Action
  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    setCouponAppliedCode(couponCodeInput.trim());
    toast.success(`Applying coupon: ${couponCodeInput.trim().toUpperCase()}`);
  };

  // Remove Coupon Action
  const handleRemoveCoupon = () => {
    setCouponAppliedCode('');
    setCouponCodeInput('');
    toast.success('Coupon removed');
  };

  // Add Address Action
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const { recipient_name, recipient_phone, street_address, city } = addressFormData;

    if (!recipient_name.trim() || !recipient_phone.trim() || !street_address.trim() || !city) {
      return toast.error('Please fill in all address details');
    }

    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(recipient_phone.trim())) {
      return toast.error('Invalid phone number');
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const response = await axios.post(
        'http://localhost:5000/api/users/addresses',
        addressFormData,
        config
      );

      if (response.data && response.data.success) {
        toast.success('Address added successfully');
        setShowAddAddressForm(false);
        setAddressFormData({
          label: 'Home',
          recipient_name: '',
          recipient_phone: '',
          street_address: '',
          city: '',
          is_default: false
        });
        await fetchAddresses();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add new address');
    }
  };

  // Place Order Action
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    try {
      setSubmitting(true);
      const config = {
        headers: {
          Authorization: `Bearer ${(localStorage.getItem('token') || sessionStorage.getItem('token') || '') || ''}`,
        },
      };
      const response = await axios.post(
        'http://localhost:5000/api/checkout/place-order',
        {
          itemIds: selectedItemIds,
          addressId: selectedAddressId,
          couponCode: couponAppliedCode || undefined,
          useCoins,
          paymentMethod
        },
        config
      );

      if (response.data && response.data.success) {
        const { redirectUrl } = response.data.data;
        toast.success('Order placed successfully!');
        window.dispatchEvent(new Event('cartUpdate'));
        // If payment is COD or VNPAY mock, navigate to it
        if (redirectUrl.startsWith('/')) {
          navigate(redirectUrl);
        } else {
          window.location.href = redirectUrl;
        }
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Order failed, please try again');
    } finally {
      setSubmitting(false);
    }
  };

  // Get active address object
  const activeAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 pt-24 pb-32">
        <h1 className="text-3xl font-extrabold text-left mb-8 tracking-tight">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-8 flex flex-col gap-6 text-left">
            
            {/* Address Selection */}
            <section className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#004ac6]">location_on</span>
                  <h2 className="text-lg font-bold">Shipping Address</h2>
                </div>
                <button 
                  onClick={() => setShowAddressModal(true)}
                  className="text-[#004ac6] font-bold text-sm hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {activeAddress ? (
                <div className="space-y-1">
                  <p className="font-bold text-base">{activeAddress.recipientName} | {activeAddress.recipientPhone}</p>
                  <p className="text-[#505f76] text-sm leading-relaxed">{activeAddress.streetAddress}, {activeAddress.city}</p>
                  {activeAddress.isDefault && (
                    <span className="inline-block mt-2 bg-[#d0e1fb] text-[#004ac6] px-3 py-0.5 rounded-full text-xs font-bold">Default</span>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-[#505f76] mb-4">You do not have any shipping addresses yet.</p>
                  <button 
                    onClick={() => {
                      setShowAddressModal(true);
                      setShowAddAddressForm(true);
                    }}
                    className="bg-[#004ac6] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all cursor-pointer"
                  >
                    Add Shipping Address
                  </button>
                </div>
              )}
            </section>

            {/* Vendor split items list */}
            {loadingPreview ? (
              <div className="bg-white rounded-2xl p-12 border border-[#c3c6d7]/30 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#004ac6]"></div>
              </div>
            ) : previewData ? (
              <div className="flex flex-col gap-6">
                {previewData.shops.map((shopGroup) => (
                  <section key={shopGroup.shop.id} className="bg-white rounded-2xl border border-[#c3c6d7]/20 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden">
                    
                    {/* Shop Header */}
                    <div className="p-4 border-b border-[#c3c6d7]/30 bg-[#f2f3ff]/40 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#505f76]">storefront</span>
                      <h3 className="font-bold text-sm text-[#131b2e]">{shopGroup.shop.name}</h3>
                    </div>

                    {/* Shop Items List */}
                    <div className="p-6 divide-y divide-[#c3c6d7]/20">
                      {shopGroup.items.map((item) => (
                        <div key={item.cartItemId} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border border-[#c3c6d7]/30 flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                          />
                          <div className="flex-grow min-w-0 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-sm text-[#131b2e] line-clamp-2">{item.name}</h4>
                              <p className="text-[11px] text-[#737686] mt-1">Variant: {item.variantName}</p>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <p className="font-bold text-sm text-[#004ac6]">{item.price?.toLocaleString()}₫</p>
                              <p className="text-xs text-[#505f76] font-medium">x{item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shop Shipping Fee and subtotal */}
                    <div className="px-6 py-4 bg-[#f2f3ff]/20 border-t border-[#c3c6d7]/20 flex justify-between items-center text-xs font-semibold">
                      <div className="flex items-center gap-1 text-[#505f76]">
                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                        <span>Shipping Fee</span>
                      </div>
                      <span className="text-[#131b2e] font-bold">{shopGroup.shippingFee?.toLocaleString()}₫</span>
                    </div>

                  </section>
                ))}
              </div>
            ) : null}

            {/* Payment Method Selector */}
            <section className="bg-white rounded-2xl p-6 border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-bold mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* VNPAY */}
                <label 
                  className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'vnpay' 
                      ? 'border-[#004ac6] bg-[#f2f3ff]/40 text-[#004ac6]' 
                      : 'border-[#outline-variant] hover:bg-[#faf8ff] text-[#505f76]'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'vnpay'} 
                    onChange={() => setPaymentMethod('vnpay')}
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined text-2xl mb-2">account_balance</span>
                  <span className="font-bold text-sm">VNPAY Payment Gateway</span>
                  {paymentMethod === 'vnpay' && (
                    <div className="absolute top-2 right-2">
                      <span className="material-symbols-outlined text-[#004ac6] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </label>

                {/* COD */}
                <label 
                  className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod' 
                      ? 'border-[#004ac6] bg-[#f2f3ff]/40 text-[#004ac6]' 
                      : 'border-[#outline-variant] hover:bg-[#faf8ff] text-[#505f76]'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    checked={paymentMethod === 'cod'} 
                    onChange={() => setPaymentMethod('cod')}
                    className="sr-only"
                  />
                  <span className="material-symbols-outlined text-2xl mb-2">payments</span>
                  <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                  {paymentMethod === 'cod' && (
                    <div className="absolute top-2 right-2">
                      <span className="material-symbols-outlined text-[#004ac6] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                  )}
                </label>

              </div>
            </section>

          </div>

          {/* Right Column: Pricing Summary */}
          <div className="lg:col-span-4 flex flex-col gap-6 text-left">
            
            {/* Promotion & Coin Toggle */}
            <section className="bg-white rounded-2xl p-6 border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#004ac6]">confirmation_number</span>
                <h2 className="text-base font-bold">Promotions & Coins</h2>
              </div>

              {/* Voucher apply form */}
              {previewData?.couponCode ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span className="text-xs font-bold">Applied: {previewData.couponCode}</span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-[#ba1a1a] hover:underline text-xs font-bold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code..."
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    className="flex-grow bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs px-4 py-2.5 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none text-[#131b2e]"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-[#004ac6] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#003ea8] transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Coins Toggle */}
              {previewData && (
                <div className="flex items-center justify-between pt-4 border-t border-[#c3c6d7]/30">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#505f76]">monetization_on</span>
                    <div className="text-left">
                      <p className="text-xs font-bold">Use Coins</p>
                      <p className="text-[10px] text-[#737686]">Balance: {previewData.coinBalance?.toLocaleString()} coins</p>
                    </div>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={useCoins} 
                      onChange={(e) => setUseCoins(e.target.checked)} 
                      disabled={previewData.coinBalance === 0}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-[#outline-variant] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#004ac6] peer-disabled:opacity-55"></div>
                  </label>
                </div>
              )}
            </section>

            {/* Calculations Breakdown */}
            <section className="bg-white rounded-2xl p-6 border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)]">
              <h2 className="text-lg font-bold mb-4">Order Summary</h2>

              {loadingPreview ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#004ac6]"></div>
                </div>
              ) : previewData ? (
                <div className="space-y-3 mb-6 font-semibold text-sm">
                  
                  <div className="flex justify-between text-[#505f76] text-xs">
                    <span>Subtotal</span>
                    <span>{previewData.subtotalAmount?.toLocaleString()}₫</span>
                  </div>

                  <div className="flex justify-between text-[#505f76] text-xs">
                    <span>Shipping Total</span>
                    <span>{previewData.shippingAmount?.toLocaleString()}₫</span>
                  </div>

                  {previewData.couponDiscount > 0 && (
                    <div className="flex justify-between text-[#ba1a1a] text-xs">
                      <span>Voucher Discount</span>
                      <span>-{previewData.couponDiscount?.toLocaleString()}₫</span>
                    </div>
                  )}

                  {previewData.coinDiscount > 0 && (
                    <div className="flex justify-between text-[#ba1a1a] text-xs">
                      <span>Coins Used</span>
                      <span>-{previewData.coinDiscount?.toLocaleString()}₫</span>
                    </div>
                  )}

                  <div className="h-px bg-[#c3c6d7]/30 my-2"></div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-[#131b2e]">Total Payment</span>
                    <span className="font-extrabold text-2xl text-[#004ac6]">{previewData.finalAmount?.toLocaleString()}₫</span>
                  </div>

                </div>
              ) : null}

              <button 
                onClick={handlePlaceOrder}
                disabled={submitting || loadingPreview || !selectedAddressId}
                className="w-full bg-[#004ac6] text-white py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex justify-center items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                    <span>Place Order Now</span>
                  </>
                )}
              </button>
              
              <p className="text-center text-[10px] text-[#737686] mt-4 leading-normal">
                By clicking "Place Order", you agree to the UTEShop Terms & Conditions
              </p>
            </section>

          </div>

        </div>
      </main>

      {/* Address Selection Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-[#c3c6d7]/30">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#c3c6d7]/30 flex justify-between items-center">
              <h3 className="text-xl font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6]">location_on</span>
                Select Shipping Address
              </h3>
              <button 
                onClick={() => {
                  setShowAddressModal(false);
                  setShowAddAddressForm(false);
                }}
                className="text-[#505f76] hover:text-[#ba1a1a] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow space-y-6 text-left">
              
              {showAddAddressForm ? (
                /* Add New Address Form */
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <h4 className="font-bold text-sm text-[#004ac6] border-b border-[#c3c6d7]/30 pb-2">Add New Address</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#434655] mb-1">Address Type</label>
                      <select 
                        value={addressFormData.label} 
                        onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none transition-all"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="School">School / Dormitory</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#434655] mb-1">Recipient Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Recipient name"
                        value={addressFormData.recipient_name}
                        onChange={(e) => setAddressFormData({ ...addressFormData, recipient_name: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#434655] mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="0xxx xxx xxx"
                        value={addressFormData.recipient_phone}
                        onChange={(e) => setAddressFormData({ ...addressFormData, recipient_phone: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#434655] mb-1">Province / City *</label>
                      <select 
                        required
                        value={addressFormData.city}
                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none transition-all"
                      >
                        <option value="">Select Province/City</option>
                        {VIETNAM_PROVINCES.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-[#434655] mb-1">Detailed Address *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Street address, ward, district..."
                        value={addressFormData.street_address}
                        onChange={(e) => setAddressFormData({ ...addressFormData, street_address: e.target.value })}
                        className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#004ac6] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox"
                      id="modal_set_default"
                      checked={addressFormData.is_default}
                      onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                      className="w-4 h-4 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
                    />
                    <label htmlFor="modal_set_default" className="text-xs text-[#131b2e] cursor-pointer">Set as default address</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#c3c6d7]/30">
                    <button 
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="px-6 py-2 rounded-lg border border-[#737686] text-[#505f76] text-xs font-bold hover:bg-[#eaedff] transition-all"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 rounded-lg bg-[#004ac6] text-white text-xs font-bold hover:opacity-90 transition-all shadow-sm"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              ) : (
                /* Select Address List */
                <div className="space-y-4">
                  {addresses.length === 0 ? (
                    <p className="text-center text-sm text-[#505f76]">No saved addresses found.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-[#004ac6] bg-[#f2f3ff]/30'
                              : 'border-[#c3c6d7]/50 hover:bg-[#faf8ff]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="bg-[#e2e7ff] text-[#434655] px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              {addr.label || 'Address'}
                            </span>
                            {selectedAddressId === addr.id && (
                              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">check_circle</span>
                            )}
                          </div>
                          <p className="font-bold text-sm text-[#131b2e]">{addr.recipientName} | {addr.recipientPhone}</p>
                          <p className="text-xs text-[#505f76] mt-1 leading-normal">{addr.streetAddress}, {addr.city}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-[#c3c6d7]/30">
                    <button 
                      onClick={() => setShowAddAddressForm(true)}
                      className="text-[#004ac6] font-bold text-xs hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add_location</span>
                      Add New Address
                    </button>
                    
                    <button 
                      onClick={() => setShowAddressModal(false)}
                      className="bg-[#004ac6] text-white px-6 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      <FABGroup />
      <Footer />
    </div>
  );
};

export default Checkout;
