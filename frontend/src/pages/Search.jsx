import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';
import toast from 'react-hot-toast';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);

  // Filter states
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || '');
  const [selectedDimension, setSelectedDimension] = useState(searchParams.get('dimension') || '');

  useEffect(() => {
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setRating(searchParams.get('rating') || '');
    setSort(searchParams.get('sort') || 'newest');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedColor(searchParams.get('color') || '');
    setSelectedDimension(searchParams.get('dimension') || '');
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/public/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = Object.fromEntries([...searchParams]);
        const response = await axios.get('http://localhost:5000/api/public/products', { params });
        if (response.data.success) {
          setProducts(response.data.data);
          setMeta(response.data.meta);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Unable to load product list');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

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

  const handleToggleWishlist = async (productId) => {
    if (!user) {
      toast.error('Please log in to manage your wishlist');
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

  const [expandedCategories, setExpandedCategories] = useState([]);

  // Initialize expanded categories based on selected category
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const selectedObj = categories.find(c => c.slug === selectedCategory);
      if (selectedObj) {
        let toExpand = [];
        if (selectedObj.parentId) {
          const parentObj = categories.find(c => c.id === selectedObj.parentId);
          if (parentObj) {
            toExpand.push(parentObj.slug);
            if (parentObj.parentId) {
              const grandParentObj = categories.find(c => c.id === parentObj.parentId);
              if (grandParentObj) {
                toExpand.push(grandParentObj.slug);
              }
            }
          }
        }
        setExpandedCategories(prev => {
          const merged = new Set([...prev, ...toExpand]);
          return Array.from(merged);
        });
      }
    }
  }, [selectedCategory, categories]);

  const toggleCategory = (slug) => {
    setExpandedCategories(prev => 
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleColorSelect = (color) => {
    if (selectedColor === color) {
      setSelectedColor('');
      handleFilterChange('color', '');
    } else {
      setSelectedColor(color);
      handleFilterChange('color', color);
    }
  };

  const handleDimensionSelect = (dim) => {
    if (selectedDimension === dim) {
      setSelectedDimension('');
      handleFilterChange('dimension', '');
    } else {
      setSelectedDimension(dim);
      handleFilterChange('dimension', dim);
    }
  };

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set('minPrice', minPrice); else newParams.delete('minPrice');
    if (maxPrice) newParams.set('maxPrice', maxPrice); else newParams.delete('maxPrice');
    newParams.set('page', '1');
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAll = () => {
    setSearchParams({});
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedDimension('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const parentCategories = categories.filter(c => !c.parentId);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar: Filters */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border border-[#c3c6d7] p-6 sticky top-24 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">Filters</h2>
                <button 
                  onClick={handleClearAll}
                  className="text-xs font-bold text-[#004ac6] hover:underline uppercase tracking-tighter"
                >
                  Clear All
                </button>
              </div>

              {/* Categories */}
              <div className="border-b border-[#c3c6d7] pb-6 mb-6">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#505f76] mb-4">Categories</h3>
                <div className="space-y-3">
                  {parentCategories.map(cat => (
                    <details 
                      key={cat.id} 
                      open={expandedCategories.includes(cat.slug)}
                      className="group"
                    >
                      <summary 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCategory(cat.slug);
                          if (selectedCategory !== cat.slug) {
                            handleFilterChange('category', cat.slug);
                            setSelectedCategory(cat.slug);
                          } else {
                            handleFilterChange('category', '');
                            setSelectedCategory('');
                          }
                        }}
                        className={`flex justify-between items-center cursor-pointer list-none text-sm font-semibold hover:text-[#004ac6] transition-colors py-1 ${selectedCategory === cat.slug ? 'text-[#004ac6] font-bold' : 'text-[#131b2e]'}`}
                      >
                        <span>{cat.name}</span>
                        <span className={`material-symbols-outlined text-sm transition-transform ${expandedCategories.includes(cat.slug) ? 'rotate-180' : ''}`}>expand_more</span>
                      </summary>
                      
                      {/* Level 2 */}
                      <div className="pl-4 mt-2 space-y-2 border-l border-[#c3c6d7]/50 ml-2">
                        {categories.filter(sub => sub.parentId === cat.id).map(sub => {
                          const level3Cats = categories.filter(grand => grand.parentId === sub.id);
                          const hasLevel3 = level3Cats.length > 0;
                          
                          return (
                            <div key={sub.id} className="space-y-1">
                              <div className="flex items-center justify-between group/sub">
                                <p 
                                  onClick={() => {
                                    if (selectedCategory !== sub.slug) {
                                      handleFilterChange('category', sub.slug);
                                      setSelectedCategory(sub.slug);
                                      if (!expandedCategories.includes(sub.slug)) {
                                        toggleCategory(sub.slug);
                                      }
                                    } else {
                                      handleFilterChange('category', '');
                                      setSelectedCategory('');
                                    }
                                  }}
                                  className={`hover:text-[#004ac6] cursor-pointer text-sm transition-colors flex-grow py-0.5 ${selectedCategory === sub.slug ? 'text-[#004ac6] font-bold' : 'text-[#434655]'}`}
                                >
                                  {sub.name}
                                </p>
                                {hasLevel3 && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCategory(sub.slug);
                                    }}
                                    className="p-0.5 text-[#505f76] hover:text-[#004ac6] transition-colors"
                                  >
                                    <span className={`material-symbols-outlined text-xs transition-transform ${expandedCategories.includes(sub.slug) ? 'rotate-180' : ''}`}>expand_more</span>
                                  </button>
                                )}
                              </div>

                              {/* Level 3 */}
                              {hasLevel3 && expandedCategories.includes(sub.slug) && (
                                <div className="pl-4 space-y-1 border-l border-[#c3c6d7]/50 ml-2 py-1">
                                  {level3Cats.map(grand => (
                                    <p 
                                      key={grand.id}
                                      onClick={() => {
                                        if (selectedCategory !== grand.slug) {
                                          handleFilterChange('category', grand.slug);
                                          setSelectedCategory(grand.slug);
                                        } else {
                                          handleFilterChange('category', '');
                                          setSelectedCategory('');
                                        }
                                      }}
                                      className={`hover:text-[#004ac6] cursor-pointer text-xs transition-colors py-0.5 ${selectedCategory === grand.slug ? 'text-[#004ac6] font-bold' : 'text-[#505f76]'}`}
                                    >
                                      {grand.name}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="border-b border-[#c3c6d7] pb-6 mb-6">
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#505f76] mb-4">Price Range (VND)</h3>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg p-2 text-xs outline-none focus:border-[#004ac6] transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full bg-[#f2f3ff] border border-[#c3c6d7] rounded-lg p-2 text-xs outline-none focus:border-[#004ac6] transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={handlePriceFilter}
                  className="w-full py-2 bg-[#004ac6] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Price
                </button>
              </div>

              {/* Preferences */}
              <div>
                <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#505f76] mb-4">Preferences</h3>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#434655]">Minimum Rating</p>
                    {[4, 3, 2].map(star => (
                      <label key={star} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="rating"
                          checked={Number(rating) === star}
                          onChange={() => {
                            setRating(star);
                            handleFilterChange('rating', star);
                          }}
                          className="w-5 h-5 rounded-full border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]/20 transition-all"
                        />
                        <span className={`text-sm font-medium group-hover:text-[#004ac6] transition-colors ${Number(rating) === star ? 'text-[#004ac6] font-bold' : ''}`}>
                          {star}.0+ <span className="material-symbols-outlined text-[14px] fill-current text-amber-500">star</span>
                        </span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#434655] mb-2">Available Colors</p>
                    <div className="flex gap-2">
                      {[
                        { name: 'black', bg: 'bg-[#131b2e]' },
                        { name: 'white', bg: 'bg-white border border-[#c3c6d7]' },
                        { name: 'blue', bg: 'bg-[#004ac6]' },
                        { name: 'grey', bg: 'bg-[#505f76]' }
                      ].map(item => (
                        <button 
                          key={item.name}
                          onClick={() => handleColorSelect(item.name)}
                          className={`w-6 h-6 rounded-full ${item.bg} transition-all ${selectedColor === item.name ? 'ring-2 ring-[#004ac6] ring-offset-2 scale-110 shadow-md' : 'hover:scale-110'}`}
                          title={item.name}
                        ></button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#434655] mb-2">Dimensions</p>
                    <div className="flex gap-2">
                      {['compact', 'standard', 'large'].map(dim => (
                        <button 
                          key={dim}
                          onClick={() => handleDimensionSelect(dim)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${selectedDimension === dim ? 'bg-[#004ac6] text-white shadow-md' : 'border border-[#c3c6d7] hover:bg-[#f2f3ff]'}`}
                        >
                          {dim}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content: Results */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Results Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#131b2e]">
                  {searchParams.get('q') ? `Results for "${searchParams.get('q')}"` : 'Curated Research Goods'}
                </h1>
                <p className="text-sm text-[#434655] mt-1">
                  Showing {meta?.pagination.count > 0 ? (meta.pagination.currentPage - 1) * meta.pagination.perPage + 1 : 0}-
                  {Math.min(meta?.pagination.currentPage * meta?.pagination.perPage, meta?.pagination.total)} of {meta?.pagination.total} products
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-[#505f76] uppercase tracking-widest">Sort By</span>
                <select 
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    handleFilterChange('sort', e.target.value);
                  }}
                  className="bg-white border border-[#c3c6d7] rounded-xl py-2 px-4 text-sm font-semibold outline-none focus:border-[#004ac6] transition-all cursor-pointer shadow-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="top_rated">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const isWishlisted = wishlistIds.includes(product.id || product._id);
                  return (
                  <div key={product.id} className="group bg-white rounded-2xl border border-transparent hover:border-[#c3c6d7] hover:shadow-xl transition-all duration-500 overflow-hidden relative flex flex-col h-full shadow-sm">
                    <button 
                      onClick={() => handleToggleWishlist(product.id || product._id)}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#004ac6] hover:bg-white hover:scale-110 transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    </button>
                    <Link to={`/product/${product.slug}`} className="aspect-square bg-[#f2f3ff] relative overflow-hidden block">
                      <img 
                        src={product.media?.[0] || "https://via.placeholder.com/400"} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </Link>
                    <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-[10px] font-bold text-[#505f76] uppercase tracking-widest mb-1">{product.category?.name || 'Category'}</p>
                        <Link to={`/product/${product.slug}`} className="font-bold text-sm leading-5 group-hover:text-[#004ac6] transition-colors line-clamp-2 h-10 overflow-hidden mb-2">
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <div className="flex items-center text-[#004ac6]">
                            <span className="material-symbols-outlined text-[14px] fill-current text-amber-500">star</span>
                            <span className="text-xs font-bold ml-0.5">{product.averageRating || '5.0'}</span>
                          </div>
                          <span className="text-[10px] text-[#434655]">({product.reviewCount || 0})</span>
                          <span className="text-[10px] text-[#434655] ml-auto font-medium">Sold {product.soldCount || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-[#c3c6d7]/30 mt-auto">
                        {product.mrpPrice > product.sellingPrice ? (
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-base text-[#004ac6]">{product.sellingPrice.toLocaleString()}₫</span>
                            <span className="text-xs text-[#505f76] line-through">{product.mrpPrice.toLocaleString()}₫</span>
                          </span>
                        ) : (
                          <span className="font-bold text-base text-[#004ac6]">{product.sellingPrice.toLocaleString()}₫</span>
                        )}
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product.id || product._id); }}
                          className="w-8 h-8 bg-[#eaedff] text-[#004ac6] rounded-xl flex items-center justify-center hover:bg-[#004ac6] hover:text-white transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#c3c6d7] shadow-sm">
                <span className="material-symbols-outlined text-6xl text-[#c3c6d7] mb-4">search_off</span>
                <p className="text-[#505f76] font-medium">No matching products found.</p>
                <button 
                  onClick={handleClearAll}
                  className="mt-4 text-[#004ac6] font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Membership Banner */}
            <section className="bg-[#f2f3ff] rounded-3xl overflow-hidden relative border border-[#c3c6d7]/30 group my-12">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 md:p-12">
                <div className="md:col-span-7 space-y-6">
                  <span className="bg-[#004ac6] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">Membership Offer</span>
                  <h2 className="font-extrabold text-3xl text-[#004ac6] tracking-tight">Academic Premium Membership</h2>
                  <p className="text-[#434655] text-sm leading-relaxed max-w-md">
                    Unlock wholesale pricing, early access to rare archival collections, and priority lab equipment calibration services.
                  </p>
                  <button className="bg-[#004ac6] text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl">
                    Join the Institute
                  </button>
                </div>
                <div className="md:col-span-5 relative hidden md:block">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600" alt="Office" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </section>

            {/* Pagination */}
            {meta?.pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button 
                  disabled={meta.pagination.currentPage === 1}
                  onClick={() => handlePageChange(meta.pagination.currentPage - 1)}
                  className="w-10 h-10 rounded-xl border border-[#c3c6d7] flex items-center justify-center hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>
                
                {(() => {
                  const current = meta.pagination.currentPage;
                  const total = meta.pagination.totalPages;
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
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center transition-all ${current === p ? 'bg-[#004ac6] text-white shadow-md' : 'border border-[#c3c6d7] hover:bg-[#f2f3ff]'}`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button 
                  disabled={meta.pagination.currentPage === meta.pagination.totalPages}
                  onClick={() => handlePageChange(meta.pagination.currentPage + 1)}
                  className="w-10 h-10 rounded-xl border border-[#c3c6d7] flex items-center justify-center hover:bg-[#f2f3ff] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />

      {/* BottomNavBar (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 pb-safe bg-white border-t border-[#c3c6d7] md:hidden shadow-lg">
        <Link to="/" className="flex flex-col items-center justify-center text-[#505f76] hover:text-[#004ac6]">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/search" className="flex flex-col items-center justify-center text-[#004ac6]">
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[10px] font-bold">Products</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center justify-center bg-[#eaedff] text-[#004ac6] rounded-full px-4 py-1 font-bold shadow-sm">
          <span className="material-symbols-outlined">shopping_cart</span>
          <span className="text-[10px]">Cart</span>
        </Link>
        <Link to="/user/profile" className="flex flex-col items-center justify-center text-[#505f76] hover:text-[#004ac6]">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-bold">Account</span>
        </Link>
      </nav>

      <FABGroup />
    </div>
  );
};

export default Search;
