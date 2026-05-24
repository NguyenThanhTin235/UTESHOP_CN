import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const AutoScrollCarousel = ({ items, renderItem }) => {
  const scrollRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (isHovered || !items || items.length === 0) return;

    const container = scrollRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      if (container) {
        container.scrollLeft += 1;
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, items]);

  const duplicatedItems = items ? [...items, ...items] : [];

  return (
    <div 
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="flex gap-6 overflow-x-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{ scrollBehavior: 'auto' }}
    >
      {duplicatedItems.map((item, idx) => (
        <div key={`${item.id}-${idx}`} className="w-[260px] sm:w-[280px] flex-shrink-0 flex flex-col h-full">
          {renderItem(item, idx % items.length)}
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Tab-specific product lists and pagination
  const [recommendedList, setRecommendedList] = useState([]);
  const [bestSellersList, setBestSellersList] = useState([]);
  const [newArrivalsList, setNewArrivalsList] = useState([]);
  const [mostViewedList, setMostViewedList] = useState([]);

  const [recommendedPage, setRecommendedPage] = useState(1);
  const [bestSellersPage, setBestSellersPage] = useState(1);
  const [newArrivalsPage, setNewArrivalsPage] = useState(1);

  const [hasMoreRecommended, setHasMoreRecommended] = useState(true);
  const [hasMoreBestSellers, setHasMoreBestSellers] = useState(true);
  const [hasMoreNewArrivals, setHasMoreNewArrivals] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/public/homepage');
        if (response.data.success) {
          const resData = response.data.data;
          setData(resData);
          setRecommendedList(resData.recommended || []);
          setBestSellersList(resData.bestSellers || []);
          setNewArrivalsList(resData.newArrivals || []);
          setMostViewedList(resData.mostViewed || []);

          setHasMoreRecommended((resData.recommended || []).length >= 10);
          setHasMoreBestSellers((resData.bestSellers || []).length >= 10);
          setHasMoreNewArrivals((resData.newArrivals || []).length >= 10);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
        toast.error('Unable to load homepage data');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Countdown timer for flash sale
  useEffect(() => {
    const campaign = data?.campaign;
    if (!campaign?.endAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const end = new Date(campaign.endAt).getTime();
      const diff = Math.max(0, end - now);

      setCountdown({
        hours: String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0')
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [data?.campaign]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      let nextPage = 1;
      let sortParam = '';

      if (activeTab === 'recommended') {
        nextPage = recommendedPage + 1;
        sortParam = ''; // Default sorting
      } else if (activeTab === 'best-sellers') {
        nextPage = bestSellersPage + 1;
        sortParam = 'top_rated';
      } else if (activeTab === 'new-arrivals') {
        nextPage = newArrivalsPage + 1;
        sortParam = 'oldest';
      }

      const response = await axios.get(`http://localhost:5000/api/public/products`, {
        params: {
          sort: sortParam,
          page: nextPage,
          limit: 10
        }
      });

      if (response.data.success) {
        const newProducts = response.data.data;
        const meta = response.data.meta;
        const totalPages = meta?.pagination?.totalPages || 1;

        if (activeTab === 'recommended') {
          setRecommendedList(prev => [...prev, ...newProducts]);
          setRecommendedPage(nextPage);
          setHasMoreRecommended(nextPage < totalPages && newProducts.length > 0);
        } else if (activeTab === 'best-sellers') {
          setBestSellersList(prev => [...prev, ...newProducts]);
          setBestSellersPage(nextPage);
          setHasMoreBestSellers(nextPage < totalPages && newProducts.length > 0);
        } else if (activeTab === 'new-arrivals') {
          setNewArrivalsList(prev => [...prev, ...newProducts]);
          setNewArrivalsPage(nextPage);
          setHasMoreNewArrivals(nextPage < totalPages && newProducts.length > 0);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast.error('Unable to load more products');
    } finally {
      setLoadingMore(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
      </div>
    );
  }

  const { banners, categories, flashDeals, campaign } = data || {};

  const currentList = activeTab === 'recommended' 
    ? recommendedList 
    : activeTab === 'best-sellers' 
    ? bestSellersList 
    : newArrivalsList;

  const currentHasMore = activeTab === 'recommended'
    ? hasMoreRecommended
    : activeTab === 'best-sellers'
    ? hasMoreBestSellers
    : hasMoreNewArrivals;

  return (
    <div className="text-[#131b2e] min-h-screen bg-[#faf8ff] font-['Manrope']">
      <Header />

      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 space-y-12">
        
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="hidden lg:block bg-white border border-[#c3c6d7] rounded-2xl overflow-hidden shadow-sm h-full">
            <div className="p-4 border-b border-[#c3c6d7]">
              <h3 className="font-bold text-xs uppercase tracking-widest text-[#434655]">Categories</h3>
            </div>
            <nav className="p-2">
              {categories?.map((cat, idx) => (
                <Link key={cat.id} to={`/search?category=${cat.slug}`} className={`category-item flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${idx === 0 ? 'active' : 'text-[#434655]'}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {cat.slug.includes('may-tinh') ? 'computer' : cat.slug.includes('dien-thoai') ? 'smartphone' : cat.slug.includes('dong-ho') ? 'watch' : cat.slug.includes('may-anh') ? 'photo_camera' : cat.slug.includes('women') || cat.slug.includes('men') || cat.slug.includes('fashion') ? 'apparel' : cat.slug.includes('book') ? 'menu_book' : 'category'}
                  </span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </aside>

          <div className="lg:col-span-3 relative h-[450px] rounded-3xl overflow-hidden group shadow-md border border-[#c3c6d7]">
            <img src={banners?.[0]?.imageUrl || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1280"} alt="Hero Banner" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131b2e]/60 to-transparent"></div>
            <div className="relative h-full flex flex-col justify-center px-12 max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#004ac6] px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                CURATED FOR SCHOLARS
              </div>
              <h1 className="text-5xl font-extrabold text-white leading-tight">
                {banners?.[0]?.title || "The Precision Autumn Semester Edit"}
              </h1>
              <p className="text-white/80 text-lg">Engineered for focus. Curated for performance. Discover the intersection of sophisticated design and academic utility.</p>
              <div className="flex gap-4 pt-4">
                <Link to="/search" className="bg-[#004ac6] text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-[#004ac6]/20">Explore the Collection</Link>
                <Link to="#" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-full font-bold hover:bg-white/20 transition-colors">View Lookbook</Link>
              </div>
            </div>
          </div>
        </section>


        {/* Flash Deals */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 fill-1 animate-pulse">bolt</span>
                <h2 className="text-2xl font-extrabold tracking-tight">Flash Sale: {campaign?.name || 'The Lab Edition'}</h2>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="flex flex-col items-center">
                  <div className="bg-[#131b2e] text-white px-3 py-1.5 rounded-lg text-sm font-bold font-mono shadow-sm">{countdown.hours}</div>
                  <span className="text-[8px] uppercase font-bold mt-1 opacity-50">Hrs</span>
                </div>
                <span className="font-bold mb-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="bg-[#131b2e] text-white px-3 py-1.5 rounded-lg text-sm font-bold font-mono shadow-sm">{countdown.minutes}</div>
                  <span className="text-[8px] uppercase font-bold mt-1 opacity-50">Min</span>
                </div>
                <span className="font-bold mb-4">:</span>
                <div className="flex flex-col items-center">
                  <div className="bg-[#131b2e] text-white px-3 py-1.5 rounded-lg text-sm font-bold font-mono shadow-sm">{countdown.seconds}</div>
                  <span className="text-[8px] uppercase font-bold mt-1 opacity-50">Sec</span>
                </div>
              </div>
            </div>
            <Link to="/search?sort=top_rated" className="text-sm font-bold text-[#004ac6] hover:underline">View All Deals</Link>
          </div>

          {(!flashDeals || flashDeals.length === 0) ? (
            <div className="bg-white border border-[#c3c6d7] rounded-2xl p-12 text-center text-[#434655]">
              <span className="material-symbols-outlined text-4xl mb-3 text-[#004ac6]">bolt</span>
              <p className="text-base font-bold text-[#131b2e]">No Active Flash Sale</p>
              <p className="text-xs mt-1">Flash deals are currently being prepared. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashDeals.map((product) => (
                <div key={product.id} className="product-card bg-white border border-[#c3c6d7] rounded-2xl overflow-hidden flex flex-col group cursor-pointer">
                  <Link to={`/product/${product.slug}`} className="aspect-[4/3] bg-[#eaedff] relative block overflow-hidden">
                    <img src={product.media?.[0] || "https://via.placeholder.com/400x300"} alt={product.name} className="w-full h-full object-cover p-2 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                      -{Math.round((1 - product.sellingPrice / product.mrpPrice) * 100)}%
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-[#004ac6] uppercase tracking-widest">Tech Essential</span>
                      <span className="text-[10px] font-medium text-[#434655] flex items-center gap-1"><span className="material-symbols-outlined text-[12px] fill-1 text-amber-500">star</span> {product.averageRating || 5.0} ({product.reviewCount || 0})</span>
                    </div>
                    <Link to={`/product/${product.slug}`} className="font-bold text-sm line-clamp-2 h-[2.5rem] overflow-hidden hover:text-[#004ac6] transition-colors mb-3">{product.name}</Link>
                    
                    <div className="mt-auto space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[#004ac6]">{product.sellingPrice.toLocaleString()}₫</span>
                          <span className="text-xs text-[#434655] line-through">{product.mrpPrice.toLocaleString()}₫</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-[#434655] uppercase">
                            <span>Sold {product.soldCount || 0}</span>
                          </div>
                          <div className="h-1 bg-[#e1e4f5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#004ac6]" style={{ width: '65%' }}></div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#004ac6]/10 text-[#004ac6] rounded-xl font-bold text-xs hover:bg-[#004ac6] hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top 10 Best Sellers (Horizontal Pagination) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c3c6d7] pb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-amber-500">local_fire_department</span>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Top 10 Best Sellers</h2>
                <p className="text-xs text-[#434655]">Most popular and highly purchased products this month</p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <Link to="/search?sort=best_sellers" className="text-sm font-bold text-[#004ac6] hover:underline hidden sm:block">View All</Link>
            </div>
          </div>

          <AutoScrollCarousel 
            items={bestSellersList}
            renderItem={(product, idx) => {
              const actualRank = idx + 1;
              return (
                <div key={product.id} className="product-card bg-[#faf8ff] border border-[#c3c6d7] rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all relative h-full">
                  <Link to={`/product/${product.slug}`} className="aspect-square bg-[#eaedff] relative block overflow-hidden">
                    <img src={product.media?.[0] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-white text-xs font-black rounded-full shadow-lg ${actualRank === 1 ? 'bg-amber-500 ring-4 ring-amber-500/30' : actualRank === 2 ? 'bg-[#c0c0c0] ring-4 ring-[#c0c0c0]/30' : actualRank === 3 ? 'bg-[#cd7f32] ring-4 ring-[#cd7f32]/30' : 'bg-[#131b2e]'}`}>
                      #{actualRank}
                    </div>
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-tight">
                      BEST SELLER
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <Link to={`/product/${product.slug}`} className="font-bold text-sm leading-5 h-10 line-clamp-2 overflow-hidden hover:text-[#004ac6] transition-colors">{product.name}</Link>
                    <div className="space-y-3 pt-2 border-t border-[#c3c6d7]/30">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {product.mrpPrice > product.sellingPrice ? (
                            <span className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#004ac6]">{product.sellingPrice?.toLocaleString()}₫</span>
                              <span className="text-[10px] text-[#505f76] line-through">{product.mrpPrice?.toLocaleString()}₫</span>
                            </span>
                          ) : (
                            <span className="font-bold text-[#004ac6]">{product.sellingPrice?.toLocaleString()}₫</span>
                          )}
                          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold"><span className="material-symbols-outlined text-[14px] fill-1">star</span> {product.averageRating || 5.0}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-[#434655] uppercase">
                            <span>Sold {product.soldCount || 0}</span>
                          </div>
                          <div className="h-1.5 bg-[#e1e4f5] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-amber-500 to-red-500" style={{ width: `${Math.min(100, ((product.soldCount || 10) / 100) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#004ac6]/10 text-[#004ac6] rounded-xl font-bold text-xs hover:bg-[#004ac6] hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </section>

        {/* Top 10 Most Viewed (Horizontal Pagination) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c3c6d7] pb-4 gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[#004ac6]">visibility</span>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Top 10 Most Viewed Products</h2>
                <p className="text-xs text-[#434655]">Products attracting the highest attention and engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-auto">
              <Link to="/search?sort=most_viewed" className="text-sm font-bold text-[#004ac6] hover:underline hidden sm:block">View All</Link>
            </div>
          </div>

          <AutoScrollCarousel 
            items={mostViewedList}
            renderItem={(product, idx) => {
              const actualRank = idx + 1;
              return (
                <div key={product.id} className="product-card bg-[#faf8ff] border border-[#c3c6d7] rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:shadow-md transition-all relative h-full">
                  <Link to={`/product/${product.slug}`} className="aspect-square bg-[#eaedff] relative block overflow-hidden">
                    <img src={product.media?.[0] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center text-white text-xs font-black rounded-full shadow-lg ${actualRank === 1 ? 'bg-amber-500 ring-4 ring-amber-500/30' : actualRank === 2 ? 'bg-[#c0c0c0] ring-4 ring-[#c0c0c0]/30' : actualRank === 3 ? 'bg-[#cd7f32] ring-4 ring-[#cd7f32]/30' : 'bg-[#131b2e]'}`}>
                      #{actualRank}
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                    <Link to={`/product/${product.slug}`} className="font-bold text-sm leading-5 h-10 line-clamp-2 overflow-hidden hover:text-[#004ac6] transition-colors">{product.name}</Link>
                    <div className="space-y-3 pt-2 border-t border-[#c3c6d7]/30">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          {product.mrpPrice > product.sellingPrice ? (
                            <span className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#004ac6]">{product.sellingPrice?.toLocaleString()}₫</span>
                              <span className="text-[10px] text-[#505f76] line-through">{product.mrpPrice?.toLocaleString()}₫</span>
                            </span>
                          ) : (
                            <span className="font-bold text-[#004ac6]">{product.sellingPrice?.toLocaleString()}₫</span>
                          )}
                          <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold"><span className="material-symbols-outlined text-[14px] fill-1">star</span> {product.averageRating || 5.0}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#434655] pt-1">
                          <span className="flex items-center gap-1 text-[#004ac6]"><span className="material-symbols-outlined text-[14px]">visibility</span> {product.viewCount || 0} views</span>
                          <span className="text-[#434655]">Sold {product.soldCount || 0}</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#004ac6]/10 text-[#004ac6] rounded-xl font-bold text-xs hover:bg-[#004ac6] hover:text-white transition-all active:scale-95 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        </section>

        {/* Product Exploration */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#c3c6d7] gap-4">
            <div className="flex gap-8">
              <button onClick={() => setActiveTab('recommended')} className={`tab-btn pb-4 text-sm font-bold ${activeTab === 'recommended' ? 'active text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`}>Recommended</button>
              <button onClick={() => setActiveTab('best-sellers')} className={`tab-btn pb-4 text-sm font-bold ${activeTab === 'best-sellers' ? 'active text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`}>Best Sellers</button>
              <button onClick={() => setActiveTab('new-arrivals')} className={`tab-btn pb-4 text-sm font-bold ${activeTab === 'new-arrivals' ? 'active text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`}>New Arrivals</button>
            </div>
          </div>

          {!currentList || currentList.length === 0 ? (
            <div className="bg-white border border-[#c3c6d7] rounded-2xl p-12 text-center text-[#434655]">
              <span className="material-symbols-outlined text-4xl mb-3 text-[#004ac6]">inventory_2</span>
              <p className="text-base font-bold text-[#131b2e]">No products in this category</p>
              <p className="text-xs mt-1">Products are currently being updated. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {currentList.map((product) => (
                <div key={product.id} className="product-card bg-white border border-[#c3c6d7] rounded-2xl overflow-hidden flex flex-col group cursor-pointer">
                  <Link to={`/product/${product.slug}`} className="aspect-square bg-[#eaedff] relative block overflow-hidden">
                    <img src={product.media?.[0] || "https://via.placeholder.com/400"} alt={product.name} className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-500" />
                    <div className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md uppercase tracking-tight ${activeTab === 'best-sellers' ? 'bg-amber-500' : activeTab === 'new-arrivals' ? 'bg-emerald-600' : 'bg-[#004ac6]'}`}>
                      {activeTab === 'best-sellers' ? 'BEST SELLER' : activeTab === 'new-arrivals' ? 'NEW ARRIVAL' : 'CAMPUS TREND'}
                    </div>
                  </Link>
                  <div className="p-4 flex-grow flex flex-col">
                    <Link to={`/product/${product.slug}`} className="font-bold text-sm line-clamp-2 h-[2.75rem] overflow-hidden leading-snug hover:text-[#004ac6] transition-colors mb-2">{product.name}</Link>
                    <div className="mt-auto space-y-3">
                      <div className="flex flex-col gap-1">
                        {product.mrpPrice > product.sellingPrice ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#004ac6]">{product.sellingPrice.toLocaleString()}₫</span>
                            <span className="text-[10px] text-[#505f76] line-through">{product.mrpPrice.toLocaleString()}₫</span>
                          </div>
                        ) : (
                          <span className="font-bold text-[#004ac6]">{product.sellingPrice.toLocaleString()}₫</span>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-[#434655]">Sold {product.soldCount || 0}</span>
                          <span className="text-[10px] text-[#434655] ml-auto flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px] fill-1 text-amber-500">star</span> {product.averageRating || 5.0} ({product.reviewCount || 0})</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-[#004ac6]/10 text-[#004ac6] rounded-xl font-bold text-xs hover:bg-[#004ac6] hover:text-white transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">shopping_cart</span>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentHasMore && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore} 
                disabled={loadingMore} 
                className="px-12 py-3 rounded-xl border-2 border-[#004ac6] text-[#004ac6] font-bold hover:bg-[#004ac6] hover:text-white transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Products'
                )}
              </button>
            </div>
          )}
        </section>

        {/* Student Perks */}
        <section className="bg-white border border-[#c3c6d7] rounded-3xl p-12 overflow-hidden relative group shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#004ac6]/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-[#004ac6]/10 transition-colors"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight">Verified Student Benefits</h2>
              <p className="text-[#434655] text-lg leading-relaxed">Join 15,000+ scholars getting exclusive access to academic pricing, early-release textbooks, and limited-edition faculty merchandise.</p>
              <button className="bg-[#131b2e] text-white px-8 py-4 rounded-full font-bold hover:bg-[#004ac6] transition-all flex items-center gap-3 shadow-lg shadow-[#131b2e]/10">
                <span className="material-symbols-outlined">verified_user</span>
                Verify My Student ID
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#eaedff] rounded-2xl border border-[#c3c6d7]/50 text-center">
                <p className="text-2xl font-extrabold text-[#004ac6]">15%</p>
                <p className="text-[10px] font-bold text-[#434655] uppercase mt-1 tracking-wider">Tech Discount</p>
              </div>
              <div className="p-6 bg-[#eaedff] rounded-2xl border border-[#c3c6d7]/50 text-center">
                <p className="text-2xl font-extrabold text-[#004ac6]">Free</p>
                <p className="text-[10px] font-bold text-[#434655] uppercase mt-1 tracking-wider">Campus Delivery</p>
              </div>
              <div className="p-6 bg-[#eaedff] rounded-2xl border border-[#c3c6d7]/50 text-center">
                <p className="text-2xl font-extrabold text-[#004ac6]">Priority</p>
                <p className="text-[10px] font-bold text-[#434655] uppercase mt-1 tracking-wider">Lab Access</p>
              </div>
              <div className="p-6 bg-[#eaedff] rounded-2xl border border-[#c3c6d7]/50 text-center">
                <p className="text-2xl font-extrabold text-[#004ac6]">24h</p>
                <p className="text-[10px] font-bold text-[#434655] uppercase mt-1 tracking-wider">Support Line</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <FABGroup />
    </div>
  );
};

export default Home;
