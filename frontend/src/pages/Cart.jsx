import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Cart = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());
  const [localNotes, setLocalNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Auto adjust currentPage if items are deleted
  useEffect(() => {
    const maxPage = Math.ceil(cartItems.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    } else if (cartItems.length === 0) {
      setCurrentPage(1);
    }
  }, [cartItems, itemsPerPage, currentPage]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      if (!token) {
        setCartItems([]);
        setLoading(false);
        return;
      }
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('http://localhost:5000/api/cart', config);
      if (response.data && response.data.success) {
        const items = response.data.data || [];
        setCartItems(items);
        
        // Initialize local notes
        const notesObj = {};
        items.forEach(item => {
          notesObj[item.id] = item.note || '';
        });
        setLocalNotes(notesObj);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Phân trang sản phẩm trước khi gom nhóm
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = cartItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(cartItems.length / itemsPerPage);

  // Group current page items by shop
  const groupedCart = currentItems.reduce((acc, item) => {
    const shopId = item.shop?.id || 'default';
    if (!acc[shopId]) {
      acc[shopId] = {
        shop: item.shop || { id: 'default', name: 'UTEShop Official Store', slug: 'uteshop' },
        items: []
      };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  // Handle individual selection
  const handleSelectItem = (itemId) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  // Check if all items in a shop are selected
  const isShopSelected = (shopId) => {
    const shopItems = groupedCart[shopId]?.items || [];
    return shopItems.length > 0 && shopItems.every(item => selectedItemIds.has(item.id));
  };

  // Handle shop selection
  const handleSelectShop = (shopId) => {
    const shopItems = groupedCart[shopId]?.items || [];
    const allSelected = isShopSelected(shopId);
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      shopItems.forEach(item => {
        if (allSelected) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
      });
      return next;
    });
  };

  // Check if all items in the cart are selected
  const isAllSelected = cartItems.length > 0 && cartItems.every(item => selectedItemIds.has(item.id));

  // Handle select all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cartItems.map(item => item.id)));
    }
  };

  // Update quantity on backend with validation
  const handleQuantityChange = async (item, type) => {
    const currentQty = item.quantity;
    let newQty = type === 'inc' ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return;
    
    if (newQty > item.stock) {
      toast.error(`Only ${item.stock} items left in stock`);
      return;
    }

    // Optimistic update in UI
    setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        'http://localhost:5000/api/cart/update',
        { itemId: item.id, quantity: newQty },
        config
      );
      if (response.data && response.data.success) {
        window.dispatchEvent(new Event('cartUpdate'));
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: currentQty } : i));
      toast.error(error.response?.data?.message || 'Failed to update item quantity');
    }
  };

  // Handle manual typing of quantity at Client
  const handleDirectQuantityChange = (item, valStr) => {
    const cleanVal = valStr.replace(/[^0-9]/g, '');
    setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: cleanVal === '' ? '' : Number(cleanVal) } : i));
  };

  // Validate and submit manual quantity update to Backend
  const handleQuantityBlur = async (item) => {
    let targetQty = item.quantity;
    if (targetQty === '' || targetQty < 1) {
      targetQty = 1;
    }
    if (targetQty > item.stock) {
      toast.error(`Only ${item.stock} items left in stock`);
      targetQty = item.stock;
    }

    setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: targetQty } : i));

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        'http://localhost:5000/api/cart/update',
        { itemId: item.id, quantity: targetQty },
        config
      );
      if (response.data && response.data.success) {
        window.dispatchEvent(new Event('cartUpdate'));
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      fetchCart();
      toast.error(error.response?.data?.message || 'Failed to update item quantity');
    }
  };

  // Save note on blur or enter keypress
  const handleSaveNote = async (itemId, noteText) => {
    const originalItem = cartItems.find(i => i.id === itemId);
    if (originalItem && originalItem.note === noteText) {
      return; // No changes
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.put(
        'http://localhost:5000/api/cart/update',
        { itemId, note: noteText },
        config
      );
      if (response.data && response.data.success) {
        // Sync note in local state
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, note: noteText } : i));
        toast.success('Seller note updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update seller note');
    }
  };

  // Remove individual item
  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, config);
      if (response.data && response.data.success) {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        setSelectedItemIds(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
        toast.success('Item removed from cart');
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  // Remove multiple selected items
  const handleRemoveSelected = async () => {
    const selectedList = Array.from(selectedItemIds);
    if (selectedList.length === 0) {
      toast.error('Please select items to delete');
      return;
    }

    if (selectedList.length === cartItems.length) {
      await handleClearCart();
      return;
    }

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await Promise.all(
        selectedList.map(itemId => 
          axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, config)
        )
      );

      setCartItems(prev => prev.filter(i => !selectedItemIds.has(i.id)));
      setSelectedItemIds(new Set());
      toast.success('Selected items removed successfully');
      window.dispatchEvent(new Event('cartUpdate'));
    } catch (error) {
      toast.error('Failed to remove selected items');
    }
  };

  // Clear entire cart
  const handleClearCart = async () => {
    setShowClearConfirm(true);
  };

  const handleConfirmClearCart = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.delete('http://localhost:5000/api/cart/clear', config);
      if (response.data && response.data.success) {
        setCartItems([]);
        setSelectedItemIds(new Set());
        toast.success('Cart cleared successfully');
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      toast.error('Failed to clear cart');
    } finally {
      setShowClearConfirm(false);
    }
  };

  // Apply Coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    // Hardcode coupon validation matching the template style
    if (couponCode.toUpperCase() === 'UTESHOP200K') {
      setCouponApplied(true);
      toast.success('Applied discount code UTESHOP200K successfully!');
    } else {
      toast.error('Invalid or expired coupon code');
    }
  };

  // Calculations based on selected items
  const selectedItems = cartItems.filter(item => selectedItemIds.has(item.id));
  const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = couponApplied && subtotal > 200000 ? 200000 : 0;
  const total = Math.max(0, subtotal - discount);

  // If user is not logged in, render Login Prompts
  if (!user) {
    return (
      <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
        <Header />
        <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">account_circle</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">Log in to View Cart</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              Please log in to your account to view and manage your online shopping cart securely.
            </p>
            <div className="pt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">login</span>
                Log In Now
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <FABGroup />
      </div>
    );
  }

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 pt-24 pb-32 min-h-screen">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Your Shopping Cart</h1>
            <p className="text-sm text-[#737686]">Selected {selectedItemIds.size} / {cartItems.length} item(s)</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] text-center max-w-2xl mx-auto my-8 space-y-6">
              <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="material-symbols-outlined text-[#004ac6] text-[48px]">remove_shopping_cart</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">Your Cart is Empty</h2>
              <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
                You haven't added any products, course materials, or souvenirs to your cart. Start exploring our store now!
              </p>
              <div className="pt-4">
                <Link 
                  to="/search" 
                  className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">explore</span>
                  Explore Our Store
                </Link>
              </div>
            </div>
          ) : (
            /* Cart Content Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Items List */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                


                {Object.values(groupedCart).map(({ shop, items }) => (
                  <div key={shop.id} className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden border border-[#c3c6d7]/20">
                    
                    {/* Shop Header */}
                    <div className="p-4 border-b border-[#c3c6d7]/50 flex items-center justify-between bg-[#f2f3ff]/40">
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox"
                          checked={isShopSelected(shop.id)}
                          onChange={() => handleSelectShop(shop.id)}
                          className="w-5 h-5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                        />
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#004ac6]">storefront</span>
                          <span className="font-bold text-base text-[#131b2e]">{shop.name}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => toast.success('Shop has not issued any coupons yet')}
                        className="text-[#004ac6] font-bold text-xs hover:underline"
                      >
                        Get Coupon
                      </button>
                    </div>

                    {/* Item Cards inside Shop */}
                    <div className="divide-y divide-[#c3c6d7]/30">
                      {items.map((item) => (
                        <div key={item.id} className="p-6 flex flex-col md:flex-row gap-6">
                          
                          {/* Image & Checkbox */}
                          <div className="flex gap-4 items-start">
                            <input 
                              type="checkbox"
                              checked={selectedItemIds.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="mt-1 w-5 h-5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                            />
                            <img 
                              alt={item.name} 
                              className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl border border-[#c3c6d7]/30 flex-shrink-0" 
                              src={item.imageUrl || 'https://via.placeholder.com/150'}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                            />
                          </div>

                          {/* Info & Operations */}
                          <div className="flex-grow flex flex-col justify-between gap-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="text-left">
                                <h3 className="font-bold text-lg text-[#131b2e] line-clamp-2">
                                  <Link to={`/product/${item.slug}`} className="hover:text-[#004ac6] transition-colors">{item.name}</Link>
                                </h3>
                                <p className="text-xs text-[#505f76] mt-1 font-medium bg-[#eaedff]/50 px-2 py-0.5 rounded-full inline-block">
                                  Variant: {item.variant || 'Default'}
                                </p>
                              </div>
                              <span className="font-bold text-lg text-[#004ac6] whitespace-nowrap">{item.price?.toLocaleString()}₫</span>
                            </div>

                            {/* Quantity, Note & Delete Actions */}
                            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#c3c6d7]/10">
                              
                              {/* Quantity Selector */}
                              <div className="flex items-center border border-[#c3c6d7] rounded-lg overflow-hidden h-10 bg-white">
                                <button 
                                  onClick={() => handleQuantityChange(item, 'dec')}
                                  className="px-3 hover:bg-[#f2f3ff] transition-colors text-[#505f76] flex items-center justify-center border-r border-[#c3c6d7]/30 h-full"
                                >
                                  <span className="material-symbols-outlined text-[18px]">remove</span>
                                </button>
                                <input 
                                  type="text" 
                                  value={item.quantity} 
                                  onChange={(e) => handleDirectQuantityChange(item, e.target.value)}
                                  onBlur={() => handleQuantityBlur(item)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  className="w-12 text-center border-none focus:ring-0 font-bold text-sm bg-transparent text-[#131b2e] p-0"
                                />
                                <button 
                                  onClick={() => handleQuantityChange(item, 'inc')}
                                  className="px-3 hover:bg-[#f2f3ff] transition-colors text-[#505f76] flex items-center justify-center border-l border-[#c3c6d7]/30 h-full"
                                >
                                  <span className="material-symbols-outlined text-[18px]">add</span>
                                </button>
                              </div>

                              {/* Note Input */}
                              <div className="flex-grow max-w-xs">
                                <input 
                                  type="text"
                                  placeholder="Note for seller..."
                                  value={localNotes[item.id] || ''}
                                  onChange={(e) => setLocalNotes({ ...localNotes, [item.id]: e.target.value })}
                                  onBlur={() => handleSaveNote(item.id, localNotes[item.id] || '')}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveNote(item.id, localNotes[item.id] || '');
                                      e.target.blur();
                                    }
                                  }}
                                  className="w-full bg-[#f2f3ff]/50 border border-[#c3c6d7] rounded-lg text-xs px-4 py-2 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none text-[#131b2e] text-left"
                                />
                              </div>

                              {/* Delete Button */}
                              <button 
                                onClick={() => handleRemoveItem(item.id)}
                                className="flex items-center gap-1 text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-2 rounded-lg transition-all font-bold text-xs cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                <span>Remove</span>
                              </button>

                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl p-4 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                    <p className="text-sm text-[#737686] font-medium">
                      Showing <span className="font-bold text-[#131b2e]">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-bold text-[#131b2e]">{Math.min(indexOfLastItem, cartItems.length)}</span> of{' '}
                      <span className="font-bold text-[#131b2e]">{cartItems.length}</span> items
                    </p>
                    <div className="flex items-center gap-1.5">
                      {/* Previous Page Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 rounded-xl border border-[#c3c6d7] text-[#505f76] hover:bg-[#f2f3ff] hover:text-[#004ac6] hover:border-[#004ac6] flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#505f76] disabled:hover:border-[#c3c6d7] disabled:cursor-not-allowed cursor-pointer"
                        title="Previous Page"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === page
                              ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/20'
                              : 'border border-[#c3c6d7] text-[#505f76] hover:bg-[#f2f3ff] hover:text-[#004ac6] hover:border-[#004ac6]'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next Page Button */}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 rounded-xl border border-[#c3c6d7] text-[#505f76] hover:bg-[#f2f3ff] hover:text-[#004ac6] hover:border-[#004ac6] flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#505f76] disabled:hover:border-[#c3c6d7] disabled:cursor-not-allowed cursor-pointer"
                        title="Next Page"
                      >
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Order Summary Right Sidebar (Desktop) */}
              <div className="lg:col-span-4 h-fit sticky top-24">
                <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c3c6d7]/30 flex flex-col gap-6 text-left">
                  <h2 className="font-bold text-xl text-[#131b2e]">Order Summary</h2>

                  {/* Selected Items List in Summary */}
                  {selectedItems.length > 0 ? (
                    <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1 border-b border-[#c3c6d7]/20 pb-4">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="flex gap-3 items-center">
                          <img 
                            src={item.imageUrl || 'https://via.placeholder.com/80'} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-lg border border-[#c3c6d7]/30 flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80'; }}
                          />
                          <div className="flex-grow min-w-0 text-xs text-left">
                            <p className="font-bold text-[#131b2e] truncate">{item.name}</p>
                            <p className="text-[10px] text-[#737686] mt-0.5">
                              {item.variant && item.variant !== 'Standard' ? `${item.variant} | ` : ''}Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-bold text-xs text-[#004ac6] flex-shrink-0">
                            {(item.price * item.quantity).toLocaleString()}₫
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-b border-[#c3c6d7]/20 pb-4">
                      <p className="text-xs text-[#737686] italic text-center py-2">No items selected</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3 font-medium">
                    <div className="flex justify-between text-sm text-[#505f76]">
                      <span>Subtotal ({selectedItems.length} items)</span>
                      <span>{subtotal.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#505f76]">
                      <span>Shipping Fee</span>
                      <span className="text-[#004ac6] font-bold">Free</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-[#ba1a1a]">
                        <span>Discount</span>
                        <span>- {discount.toLocaleString()}₫</span>
                      </div>
                    )}
                    
                    <div className="h-px bg-[#c3c6d7]/30 my-2"></div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-[#131b2e]">Total</span>
                      <span className="font-extrabold text-2xl text-[#004ac6]">{total.toLocaleString()}₫</span>
                    </div>
                    <p className="text-[10px] text-[#737686] text-right italic">(VAT included if applicable)</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Enter promo code (e.g. UTESHOP200K)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={couponApplied}
                        className="flex-grow bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg text-xs px-4 focus:ring-2 focus:ring-[#004ac6]/20 focus:border-[#004ac6] outline-none text-[#131b2e] disabled:opacity-50 text-left py-2"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={couponApplied}
                        className="bg-[#eaedff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white disabled:bg-emerald-100 disabled:text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:cursor-not-allowed cursor-pointer"
                      >
                        {couponApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        if (selectedItemIds.size === 0) {
                          toast.error('Please select at least one item to checkout');
                          return;
                        }
                        navigate('/checkout', { state: { selectedItemIds: Array.from(selectedItemIds) } });
                      }}
                      className="w-full bg-[#004ac6] text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Proceed to Checkout
                    </button>
                  </div>

                  <div className="bg-[#f2f3ff] p-4 rounded-xl flex items-start gap-3 border border-[#c3c6d7]/10">
                    <span className="material-symbols-outlined text-[#004ac6]">verified_user</span>
                    <div>
                      <p className="text-xs font-bold text-[#131b2e]">UTEShop Commitments</p>
                      <p className="text-[11px] text-[#505f76] leading-relaxed mt-1">100% genuine products, official warranty, and flexible 7-day return policy.</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link to="/search" className="text-xs font-bold text-[#004ac6] hover:underline inline-flex items-center gap-1 justify-center">
                      <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                      Continue Shopping
                    </Link>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Bar (Mobile/Summary Alternative) */}
      {!loading && cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white shadow-[0px_-4px_20px_rgba(15,23,42,0.05)] border-t border-[#c3c6d7] flex items-center px-4 py-3 md:px-10 md:py-4">
          <div className="max-w-[1280px] mx-auto w-full flex items-center justify-between gap-4">
            
            {/* Select All Section */}
            <div className="hidden md:flex items-center gap-3">
              <input 
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
              />
              <span className="text-sm font-semibold text-[#131b2e]">Select All ({cartItems.length})</span>
              <button 
                onClick={handleRemoveSelected}
                className="ml-4 font-bold text-xs text-[#ba1a1a] hover:underline cursor-pointer"
              >
                Delete Selected
              </button>
            </div>

            {/* Price & Checkout Section */}
            <div className="flex items-center gap-6 ml-auto w-full md:w-auto justify-between md:justify-end">
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-[#505f76]">Total Payment:</span>
                  <span className="text-xl md:text-2xl font-extrabold text-[#004ac6]">{total.toLocaleString()}₫</span>
                </div>
                {discount > 0 && (
                  <span className="text-xs font-semibold text-emerald-600">Saved {discount.toLocaleString()}₫</span>
                )}
              </div>
              
              <button 
                onClick={() => {
                  if (selectedItemIds.size === 0) {
                    toast.error('Please select items to checkout');
                    return;
                  }
                  navigate('/checkout', { state: { selectedItemIds: Array.from(selectedItemIds) } });
                }}
                className="bg-[#004ac6] text-white px-8 md:px-12 py-3 md:py-4 rounded-xl font-bold text-base shadow-md active:scale-95 hover:opacity-90 transition-all cursor-pointer"
              >
                Checkout
              </button>
            </div>

          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl border border-[#c3c6d7]/30 transform scale-100 transition-all text-center space-y-6">
            <div className="w-16 h-16 bg-[#ba1a1a]/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[36px]">delete_forever</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-[#131b2e]">Clear Cart</h3>
              <p className="text-[#434655] text-sm leading-relaxed">
                Are you sure you want to remove all items from your cart? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-[#737686] text-[#505f76] font-bold hover:bg-[#eaedff] transition-all text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClearCart}
                className="flex-1 py-3 rounded-xl bg-[#ba1a1a] text-white font-bold hover:bg-[#ba1a1a]/90 transition-all text-sm shadow-md shadow-[#ba1a1a]/20 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <FABGroup />
    </div>
  );
};

export default Cart;
