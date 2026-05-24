import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const ShopDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('best_sellers'); // best_sellers, discounts, all
  const [wishlistIds, setWishlistIds] = useState([]);
  
  // Local filters for All Products tab
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc, top_rated
  const [isFollowed, setIsFollowed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch shop data
  useEffect(() => {
    const fetchShopDetail = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/public/shop/${slug}`);
        if (response.data.success) {
          setShopData(response.data.data);
          // Set random follow state initially for demo
          setIsFollowed(localStorage.getItem(`followed_shop_${response.data.data.shop.id}`) === 'true');
        }
      } catch (error) {
        console.error('Error fetching shop detail:', error);
        toast.error('Unable to load shop details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchShopDetail();
  }, [slug, navigate]);

  // Fetch user wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlistIds([]);
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/users/wishlist', config);
        if (response.data && response.data.success) {
          const ids = response.data.data.map(item => item.productId);
          setWishlistIds(ids);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
    };
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, sortBy]);

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please log in to manage your wishlist');
      navigate('/login');
      return;
    }
    const isWishlisted = wishlistIds.includes(productId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token') || ''}`,
        },
      };
      if (isWishlisted) {
        const response = await axios.delete(`http://localhost:5000/api/users/wishlist/${productId}`, config);
        if (response.data && response.data.success) {
          setWishlistIds(prev => prev.filter(id => id !== productId));
          toast.success('Removed from wishlist');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/users/wishlist', { productId }, config);
        if (response.data && response.data.success) {
          setWishlistIds(prev => [...prev, productId]);
          toast.success('Added to wishlist');
        }
      }
    } catch (error) {
      toast.error('Error updating wishlist');
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.error('Please log in to add products to your cart');
      navigate('/login');
      return;
    }
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId,
          variantId: null,
          quantity: 1
        },
        config
      );
      if (response.data && response.data.success) {
        toast.success('Product added to cart successfully!');
        window.dispatchEvent(new Event('cartUpdate'));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const handleFollowToggle = () => {
    if (!shopData) return;
    const newState = !isFollowed;
    setIsFollowed(newState);
    localStorage.setItem(`followed_shop_${shopData.shop.id}`, newState ? 'true' : 'false');
    if (newState) {
      toast.success(`You are now following ${shopData.shop.name}!`);
    } else {
      toast.success(`Unfollowed ${shopData.shop.name}`);
    }
  };

  const handleChatNow = () => {
    toast.success(`Connecting to ${shopData?.shop?.name || 'Shop'} Customer Service...`);
  };

  // Processing products for "All Products" tab
  const getFilteredAndSortedAllProducts = () => {
    if (!shopData) return [];
    let items = [...shopData.allProducts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(term));
    }

    // Sorting
    if (sortBy === 'price_asc') {
      items.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'price_desc') {
      items.sort((a, b) => b.sellingPrice - a.sellingPrice);
    } else if (sortBy === 'top_rated') {
      items.sort((a, b) => b.averageRating - a.averageRating);
    } else {
      // Default / newest
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return items;
  };

  if (loading) {
    return (
      <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
        <Header />
        <div className="flex-grow flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#004ac6]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!shopData) return null;

  const { shop, bestSellers, deepDiscounts } = shopData;
  const itemsPerPage = 8;

  // Determine items based on activeTab
  let currentProducts = [];
  if (activeTab === 'best_sellers') {
    currentProducts = bestSellers || [];
  } else if (activeTab === 'discounts') {
    currentProducts = deepDiscounts || [];
  } else if (activeTab === 'all') {
    currentProducts = getFilteredAndSortedAllProducts();
  }

  const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
  const paginatedProducts = currentProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formattedJoinedDate = shop.joinedAt 
    ? new Date(shop.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';

  // Render product card helper
  const renderProductCard = (product) => {
    const isWishlisted = wishlistIds.includes(product.id || product._id);
    const hasDiscount = product.mrpPrice && product.mrpPrice > product.sellingPrice;
    const discountPercent = hasDiscount 
      ? Math.round((1 - product.sellingPrice / product.mrpPrice) * 100)
      : 0;

    let badgeText = '';
    let badgeBgClass = '';

    if (activeTab === 'best_sellers') {
      badgeText = 'BEST SELLER';
      badgeBgClass = 'bg-red-500';
    } else if (activeTab === 'discounts') {
      badgeText = hasDiscount ? `-${discountPercent}% OFF` : 'TOP DEAL';
      badgeBgClass = 'bg-red-500';
    } else { // activeTab === 'all'
      if (hasDiscount) {
        badgeText = `-${discountPercent}% OFF`;
        badgeBgClass = 'bg-red-500';
      } else {
        const isNewArrival = shopData.allProducts?.slice(0, 8).some(np => (np.id || np._id) === (product.id || product._id));
        if (isNewArrival) {
          badgeText = 'NEW ARRIVAL';
          badgeBgClass = 'bg-emerald-600';
        } else {
          badgeText = 'CAMPUS TREND';
          badgeBgClass = 'bg-[#004ac6]';
        }
      }
    }

    return (
      <div key={product.id || product._id} className="group bg-white rounded-[2rem] border border-transparent hover:border-[#c3c6d7]/50 hover:shadow-2xl transition-all duration-500 overflow-hidden relative flex flex-col h-full shadow-sm">
        {/* Wishlist Heart Button */}
        <button 
          onClick={() => handleToggleWishlist(product.id || product._id)}
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#004ac6] hover:bg-white hover:scale-110 transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>

        {/* Dynamic Badge Tag */}
        {badgeText && (
          <div className={`absolute top-3 left-3 z-10 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-tight ${badgeBgClass}`}>
            {badgeText}
          </div>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.slug}`} className="aspect-square bg-[#f8f7ff] relative overflow-hidden block">
          <img 
            src={product.media?.[0] || "https://via.placeholder.com/400"} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-750 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Product Info */}
        <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
          <div className="space-y-1">
            <h3 className="font-bold text-sm leading-tight text-[#131b2e] group-hover:text-[#004ac6] transition-colors line-clamp-2 h-10 overflow-hidden">
              <Link to={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            
            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
              <div className="flex items-center text-[#004ac6]">
                <span className="material-symbols-outlined text-[15px] fill-current text-amber-500">star</span>
                <span className="text-xs font-black ml-0.5">{product.averageRating || '5.0'}</span>
              </div>
              <span className="text-[10px] text-[#434655] font-semibold">({product.reviewCount || 0} reviews)</span>
              <span className="text-[10px] text-[#434655] font-semibold ml-auto bg-[#faf8ff] px-2 py-0.5 rounded border border-[#c3c6d7]/30">Sold {product.soldCount || 0}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#c3c6d7]/20 mt-auto">
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className="text-[10px] text-[#505f76] line-through font-medium leading-none mb-1">{product.mrpPrice.toLocaleString()}₫</span>
                  <span className="font-black text-base text-[#004ac6] leading-none">{product.sellingPrice.toLocaleString()}₫</span>
                </>
              ) : (
                <span className="font-black text-base text-[#004ac6] leading-none">{product.sellingPrice.toLocaleString()}₫</span>
              )}
            </div>
            <button 
              onClick={() => handleAddToCart(product.id || product._id)}
              className="w-10 h-10 bg-[#eaedff] hover:bg-[#004ac6] text-[#004ac6] hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95 cursor-pointer"
              title="Add to cart"
            >
              <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex justify-center items-center gap-2 pt-8">
        <button 
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage(c => c - 1);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          className="w-10 h-10 rounded-xl border border-[#c3c6d7] flex items-center justify-center hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>
        
        {(() => {
          const current = currentPage;
          const total = totalPages;
          const pages = [];
          
          if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
          } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            
            const start = Math.max(2, current - 1);
            const end = Math.min(total - 1, current + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            
            if (current < total - 2) pages.push('...');
            pages.push(total);
          }
          
          return pages.map((p, idx) => 
            p === '...' ? (
              <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-[#505f76] font-bold select-none">…</span>
            ) : (
              <button 
                key={p}
                onClick={() => {
                  setCurrentPage(p);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${current === p ? 'bg-[#004ac6] text-white shadow-md' : 'border border-[#c3c6d7] hover:bg-[#f2f3ff]'}`}
              >
                {p}
              </button>
            )
          );
        })()}

        <button 
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage(c => c + 1);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
          className="w-10 h-10 rounded-xl border border-[#c3c6d7] flex items-center justify-center hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>
    );
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8">
        {/* Shop Banner & Header Cover */}
        <div className="relative w-full rounded-[2.5rem] overflow-hidden shadow-xl mb-10 border border-[#c3c6d7]/30 bg-slate-900 min-h-[280px] md:min-h-[350px] flex items-center p-6 md:p-12">
          {/* Cover Background (Banner or dynamic gradient) */}
          <div className="absolute inset-0 z-0">
            {shop.bannerUrl ? (
              <img src={shop.bannerUrl} alt={shop.name} className="w-full h-full object-cover opacity-30 blur-[2px] scale-105" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-indigo-900 via-[#00287a] to-[#131b2e] opacity-90"></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
          </div>

          {/* Profile Card overlay (Glassmorphism) */}
          <div className="relative z-10 w-full flex flex-col md:flex-row items-center md:items-start gap-8 bg-white/10 backdrop-blur-md p-6 md:p-8 rounded-[2rem] border border-white/20 shadow-2xl text-white">
            {/* Shop Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white flex-shrink-0 flex items-center justify-center">
              <img 
                src={shop.logoUrl || "https://via.placeholder.com/150?text=Shop"} 
                alt={shop.name} 
                className="w-full h-full object-cover" 
              />
            </div>

            {/* Shop Info details */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight">{shop.name}</h1>
                  <span className="inline-flex self-center items-center gap-1 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Active
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-medium mt-2 leading-relaxed max-w-2xl mx-auto md:mx-0">{shop.description || "Welcome to our shop! We offer the finest curation of premium academic clothing, sportswear, and essential campus collections."}</p>
                
                {/* Address and Phone */}
                <div className="flex flex-wrap items-center justify-center md:justify-start space-x-3 mt-2.5 text-xs md:text-sm text-slate-100 font-medium">
                  {shop.address && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-sky-400">location_on</span>
                      <span>{shop.address}</span>
                    </div>
                  )}
                  {shop.address && shop.phone && (
                    <span className="text-slate-400 font-bold">•</span>
                  )}
                  {shop.phone && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-emerald-400">call</span>
                      <span>{shop.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <button 
                  onClick={handleFollowToggle}
                  className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer ${
                    isFollowed 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-white text-[#004ac6] hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{isFollowed ? 'done' : 'favorite'}</span>
                  {isFollowed ? 'Following' : 'Follow Shop'}
                </button>
                <button 
                  onClick={handleChatNow}
                  className="px-6 py-3 bg-transparent text-white border border-white/40 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  Chat Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Stats Grid (6 cards) */}
        <section className="bg-white rounded-[2rem] border border-[#c3c6d7]/40 shadow-sm p-6 md:p-8 mb-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 divide-x-0 md:divide-x divide-y md:divide-y-0 divide-[#c3c6d7]/30 text-left">
          {/* Products Count */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">inventory_2</span>
              Products
            </span>
            <span className="text-xl font-black text-[#131b2e]">{shop.productCount || shopData.allProducts.length}</span>
          </div>

          {/* Followers */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">group</span>
              Followers
            </span>
            <span className="text-xl font-black text-[#131b2e]">
              {shop.followers >= 1000 ? `${(shop.followers / 1000).toFixed(1)}k` : (shop.followers || '0')}
            </span>
          </div>

          {/* Rating */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">star</span>
              Shop Rating
            </span>
            <span className="text-xl font-black text-[#131b2e] flex items-center gap-1">
              {shop.rating ? `${shop.rating} / 5.0` : '4.8 / 5.0'}
            </span>
          </div>

          {/* Response Rate */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">forum</span>
              Response Rate
            </span>
            <span className="text-xl font-black text-[#131b2e]">{shop.responseRate || 95}%</span>
          </div>

          {/* Response Time */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">pace</span>
              Response Time
            </span>
            <span className="text-sm font-black text-[#131b2e] capitalize">{shop.responseTime || 'within hours'}</span>
          </div>

          {/* Joined Date */}
          <div className="flex flex-col justify-center px-4">
            <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-base text-[#004ac6]">calendar_month</span>
              Joined
            </span>
            <span className="text-sm font-black text-[#131b2e]">{formattedJoinedDate}</span>
          </div>
        </section>

        {/* Tab switch Navigation */}
        <div className="border-b border-[#c3c6d7]/40 mb-8 flex justify-center md:justify-start">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('best_sellers')}
              className={`pb-4 text-sm font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'best_sellers'
                  ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                  : 'text-[#434655] hover:text-[#004ac6]'
              }`}
            >
              Top Selling
            </button>
            <button
              onClick={() => setActiveTab('discounts')}
              className={`pb-4 text-sm font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'discounts'
                  ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                  : 'text-[#434655] hover:text-[#004ac6]'
              }`}
            >
              Hot Discounts
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 text-sm font-bold tracking-tight transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                  : 'text-[#434655] hover:text-[#004ac6]'
              }`}
            >
              All Products
            </button>
          </div>
        </div>

        {/* Tab Body Contents */}
        <div className="space-y-6">
          {/* Tab 1: Best Sellers */}
          {activeTab === 'best_sellers' && (
            <div className="space-y-8">
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(renderProductCard)}
                  </div>
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-[#c3c6d7]/30 shadow-sm">
                  <span className="material-symbols-outlined text-6xl text-[#c3c6d7] mb-4">inventory_2</span>
                  <p className="text-[#505f76] font-bold">No best selling products yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Discounts */}
          {activeTab === 'discounts' && (
            <div className="space-y-8">
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(renderProductCard)}
                  </div>
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-[#c3c6d7]/30 shadow-sm">
                  <span className="material-symbols-outlined text-6xl text-[#c3c6d7] mb-4">percent</span>
                  <p className="text-[#505f76] font-bold">No discount items currently available.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: All Products (with filters, inner shop search) */}
          {activeTab === 'all' && (
            <div className="space-y-8">
              {/* Inner Shop Filters Bar */}
              <div className="bg-white rounded-[1.5rem] border border-[#c3c6d7]/40 p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                {/* Shop Search Bar */}
                <div className="flex items-center bg-[#f8f7ff] rounded-xl px-4 py-2.5 w-full md:w-96 group focus-within:ring-2 focus-within:ring-[#004ac6]/10 transition-all border border-[#c3c6d7]/50">
                  <span className="material-symbols-outlined text-[#505f76] text-xl group-focus-within:text-[#004ac6]">search</span>
                  <input
                    type="text"
                    placeholder="Search in this shop..."
                    className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 font-semibold ml-2 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-[#505f76] hover:text-[#ba1a1a]">
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Sort control */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-[10px] font-black text-[#505f76] uppercase tracking-widest">Sort By</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#f8f7ff] border border-[#c3c6d7]/50 rounded-xl py-2.5 px-4 text-xs font-bold outline-none focus:border-[#004ac6] transition-all cursor-pointer shadow-sm"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="top_rated">Top Rated</option>
                  </select>
                </div>
              </div>

              {/* Product Grid results */}
              {paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProducts.map(renderProductCard)}
                  </div>
                  {renderPagination()}
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-[2rem] border border-[#c3c6d7]/30 shadow-sm">
                  <span className="material-symbols-outlined text-6xl text-[#c3c6d7] mb-4">search_off</span>
                  <p className="text-[#505f76] font-bold">No products match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FABGroup />
    </div>
  );
};

export default ShopDetail;
