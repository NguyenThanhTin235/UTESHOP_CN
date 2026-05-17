import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactions
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/public/product/${slug}`);
        if (response.data.success) {
          setData(response.data.data);
          if (response.data.data.media?.length > 0) {
            setSelectedImage(response.data.data.media[0].mediaUrl);
          }
        }
      } catch (error) {
        toast.error('Failed to load product details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug, navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background text-on-background flex items-center justify-center font-['Manrope'] font-bold text-lg">Loading Academic Collection...</div>;
  }

  if (!data) return null;

  const { product, shop, category, media, variants, stock, sold, reviews, relatedProducts } = data;

  const handleQuantityChange = (type) => {
    if (type === 'inc' && quantity < stock) setQuantity(q => q + 1);
    if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
  };

  const handleAddToCart = () => {
    toast.success('Added to cart successfully!');
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-['Manrope']">
      <Header />
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8 overflow-x-auto whitespace-nowrap pb-2">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {category?.breadcrumbs?.map((bc, i) => (
             <React.Fragment key={i}>
                <Link to={`/category/${bc.slug}`} className="hover:text-primary">{bc.name}</Link>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
             </React.Fragment>
          ))}
          <span className="text-on-surface font-semibold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 group">
              <img src={selectedImage || product?.imageUrl || 'https://via.placeholder.com/600?text=No+Image+Available'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 cursor-zoom-in" />
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                {stock > 0 ? (
                   <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">In Stock</span>
                ) : (
                   <span className="bg-error text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">Out of Stock</span>
                )}
                <span className="bg-[#131b2e] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">Authentic</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {media?.length > 0 ? media.map((m, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(m.mediaUrl)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === m.mediaUrl ? 'border-primary opacity-100 scale-105 shadow-md' : 'border-outline-variant opacity-60 hover:opacity-100 hover:border-primary'}`}
                >
                  <img src={m.mediaUrl} className="w-full h-full object-cover" alt="" />
                </button>
              )) : null}
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <p className="text-[12px] text-primary font-bold tracking-widest uppercase">{shop?.name || 'UTEShop Official Store'}</p>
              <h1 className="text-3xl font-extrabold text-on-surface leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-secondary">
                  <span className="material-symbols-outlined text-[18px] text-amber-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="font-bold">{product.averageRating || 'No ratings'}</span>
                </div>
                <span className="text-outline-variant">|</span>
                <span className="text-sm text-on-surface-variant underline cursor-pointer">{reviews?.length || 0} Reviews</span>
                <span className="text-outline-variant">|</span>
                <span className="text-sm text-on-surface-variant">{sold || 0} Sold</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-6 rounded-2xl space-y-3">
              <div className="flex items-baseline flex-wrap gap-x-4 gap-y-2">
                <p className="text-4xl text-primary font-extrabold">{product.sellingPrice?.toLocaleString()}₫</p>
                {product.mrpPrice > product.sellingPrice ? (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-on-surface-variant line-through">{product.mrpPrice?.toLocaleString()}₫</p>
                    <span className="bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full">
                      -{Math.round((1 - product.sellingPrice / product.mrpPrice) * 100)}%
                    </span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-primary text-sm font-semibold">
                  <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
                  100% Genuine Product
              </div>
            </div>

            {/* Variations */}
            {variants?.length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-3">
                    <p className="text-sm font-bold uppercase tracking-wider text-secondary">Options</p>
                    <div className="flex flex-wrap gap-2">
                        {variants.map(v => (
                            <button 
                                key={v.id} 
                                onClick={() => setSelectedVariant(v)}
                                className={`px-6 py-2 rounded-xl border text-sm font-bold transition-all ${selectedVariant?.id === v.id ? 'border-2 border-primary text-primary bg-primary/5 shadow-sm' : 'border-outline-variant hover:border-primary hover:text-primary'}`}>
                                {Object.values(v.attributes).join(' - ')}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-wider text-secondary">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-surface-container-low rounded-xl p-1 border border-outline-variant/30">
                  <button onClick={() => handleQuantityChange('dec')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                  <input type="text" value={quantity} readOnly className="w-12 text-center bg-transparent border-none focus:ring-0 font-bold" />
                  <button onClick={() => handleQuantityChange('inc')} className="w-10 h-10 flex items-center justify-center hover:bg-surface-container-high rounded-lg transition-colors">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant">{stock || 0} items available</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button onClick={handleAddToCart} disabled={stock <= 0} className="flex items-center justify-center gap-2 border-2 border-primary text-primary py-4 rounded-2xl font-bold hover:bg-primary/5 transition-all disabled:opacity-50 active:scale-95">
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Add to Cart
              </button>
              <button disabled={stock <= 0} className="bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 active:scale-95">
                Buy It Now
              </button>
            </div>
            
            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-outline-variant/30">
                <div className="flex flex-col items-center text-center gap-1">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Genuine</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                    <span className="material-symbols-outlined text-primary">restart_alt</span>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">15-Day Return</span>
                </div>
            </div>

          </div>
        </div>

        {/* View Shop Section */}
        <section className="mt-12 bg-surface-container-low rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 border border-outline-variant/30">
            <div className="flex items-center gap-4 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-outline-variant/30 pb-6 md:pb-0">
                <div className="relative">
                    <img src={shop?.logoUrl || "https://via.placeholder.com/150?text=Shop"} alt="Shop Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-primary ring-4 ring-primary/10" />
                    <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-50 value border-2 border-surface-container-low rounded-full"></span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-on-surface">{shop?.name || 'UTEShop Official Store'}</h3>
                    <p className="text-xs text-on-surface-variant mb-3 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {shop?.address || 'Ho Chi Minh City, Vietnam'}
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                            Chat Now
                        </button>
                        <Link to={`/shop/${shop?.slug || 'uteshop'}`} className="px-4 py-2 border border-outline-variant bg-white rounded-xl text-xs font-bold hover:bg-surface-container-high transition-all flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">storefront</span>
                            View Shop
                        </Link>
                    </div>
                </div>
            </div>

            {/* Shop Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full md:w-2/3">
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Ratings</span>
                    <span className="text-primary font-extrabold text-lg">{shop?.rating ? `${shop.rating} / 5.0` : 'No rating'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Products</span>
                    <span className="text-primary font-extrabold text-lg">{shop?.productCount || '0'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Response Rate</span>
                    <span className="text-primary font-extrabold text-lg">{shop?.responseRate ? `${shop.responseRate}%` : 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Joined</span>
                    <span className="text-primary font-extrabold text-lg">
                      {shop?.joinedAt ? `${new Date().getFullYear() - new Date(shop.joinedAt).getFullYear()} years ago` : 'N/A'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Followers</span>
                    <span className="text-primary font-extrabold text-lg">
                      {shop?.followers ? (shop.followers >= 1000 ? `${(shop.followers / 1000).toFixed(1)}k` : shop.followers) : '0'}
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Response Time</span>
                    <span className="text-primary font-extrabold text-lg">{shop?.responseTime || 'N/A'}</span>
                </div>
            </div>
        </section>

        {/* Consolidated Product Information Stack */}
        <div className="mt-16 relative">
          {/* Quick Navigation Bar (Sticky) */}
          <div className="sticky top-[72px] z-30 bg-background/90 backdrop-blur-md border-b border-outline-variant -mx-4 px-4 md:-mx-10 md:px-10 mb-12">
              <div className="flex gap-8 overflow-x-auto no-scrollbar py-4 max-w-[1280px] mx-auto">
                  <a href="#specifications" className="text-sm font-bold uppercase tracking-widest text-primary border-b-2 border-primary pb-1 whitespace-nowrap">Specifications</a>
                  <a href="#reviews" className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pb-1 whitespace-nowrap">Reviews ({reviews?.length || 0})</a>
                  <a href="#shipping" className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pb-1 whitespace-nowrap">Shipping & Returns</a>
              </div>
          </div>

          <div className="space-y-24">
              {/* Section 1: Specifications & Description */}
              <section id="specifications" className="space-y-12 scroll-mt-32">
                  <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-extrabold text-on-surface">Product Specifications</h2>
                      <div className="flex-grow h-px bg-outline-variant/30"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-6">
                          <h3 className="text-xl font-bold text-on-surface">Overview</h3>
                          {product.description ? (
                              <div dangerouslySetInnerHTML={{__html: product.description}} className="text-sm text-on-surface-variant leading-relaxed space-y-4" />
                          ) : (
                              <p className="text-sm text-on-surface-variant italic">No detailed description available for this product.</p>
                          )}
                          <ul className="space-y-3 text-sm text-on-surface-variant pt-4">
                              <li className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                  316L Surgical Grade Stainless Steel Case
                              </li>
                              <li className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                  Scratch-resistant Sapphire Crystal
                              </li>
                              <li className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
                                  5ATM Water Resistance
                              </li>
                          </ul>
                      </div>
                      <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/30">
                          <h3 className="text-xl font-bold text-on-surface mb-6">Technical Details</h3>
                          <div className="space-y-4">
                              <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                                  <span className="text-sm text-on-surface-variant">Movement</span>
                                  <span className="text-sm font-bold text-on-surface">Automatic Caliber 8</span>
                              </div>
                              <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                                  <span className="text-sm text-on-surface-variant">Power Reserve</span>
                                  <span className="text-sm font-bold text-on-surface">48 Hours</span>
                              </div>
                              <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                                  <span className="text-sm text-on-surface-variant">Strap Material</span>
                                  <span className="text-sm font-bold text-on-surface">Italian Leather</span>
                              </div>
                              <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                                  <span className="text-sm text-on-surface-variant">Warranty</span>
                                  <span className="text-sm font-bold text-on-surface">2 Years Global</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Section 2: Reviews */}
              <section id="reviews" className="space-y-12 scroll-mt-32">
                  <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-extrabold text-on-surface">Customer Reviews</h2>
                      <div className="flex-grow h-px bg-outline-variant/30"></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* Rating Summary */}
                      <div className="lg:col-span-4 space-y-6">
                          <div className="bg-surface-container-low rounded-3xl p-8 text-center space-y-2 border border-outline-variant/30">
                              <p className="text-5xl font-extrabold text-primary">{product.averageRating || 0}</p>
                              <div className="flex justify-center gap-1 text-primary">
                                  <span className="material-symbols-outlined fill-current">star</span>
                                  <span className="material-symbols-outlined fill-current">star</span>
                                  <span className="material-symbols-outlined fill-current">star</span>
                                  <span className="material-symbols-outlined fill-current">star</span>
                                  <span className="material-symbols-outlined fill-current">star</span>
                              </div>
                              <p className="text-sm text-on-surface-variant">Based on {reviews?.length || 0} verified reviews</p>
                          </div>
                          {(() => {
                              const total = reviews?.length || 0;
                              const count5 = reviews?.filter(r => r.rating === 5).length || 0;
                              const count4 = reviews?.filter(r => r.rating === 4).length || 0;
                              const count3 = reviews?.filter(r => r.rating === 3).length || 0;
                              const pct5 = total > 0 ? Math.round((count5 / total) * 100) : 0;
                              const pct4 = total > 0 ? Math.round((count4 / total) * 100) : 0;
                              const pct3 = total > 0 ? Math.round((count3 / total) * 100) : 0;
                              return (
                                  <div className="space-y-3">
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold w-12 text-on-surface-variant">5 Stars</span>
                                          <div className="flex-grow h-2 bg-surface-container-low rounded-full overflow-hidden">
                                              <div className="h-full bg-primary" style={{ width: `${pct5}%` }}></div>
                                          </div>
                                          <span className="text-xs font-bold w-8 text-on-surface">{pct5}%</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold w-12 text-on-surface-variant">4 Stars</span>
                                          <div className="flex-grow h-2 bg-surface-container-low rounded-full overflow-hidden">
                                              <div className="h-full bg-primary" style={{ width: `${pct4}%` }}></div>
                                          </div>
                                          <span className="text-xs font-bold w-8 text-on-surface">{pct4}%</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className="text-xs font-bold w-12 text-on-surface-variant">3 Stars</span>
                                          <div className="flex-grow h-2 bg-surface-container-low rounded-full overflow-hidden">
                                              <div className="h-full bg-primary" style={{ width: `${pct3}%` }}></div>
                                          </div>
                                          <span className="text-xs font-bold w-8 text-on-surface">{pct3}%</span>
                                      </div>
                                  </div>
                              );
                          })()}
                      </div>

                      {/* Review List */}
                      <div className="lg:col-span-8 space-y-8">
                          {reviews?.length > 0 ? reviews.map((r, index) => (
                              <div key={r.id} className={`space-y-4 ${index !== 0 ? 'pt-6 border-t border-outline-variant/30' : ''}`}>
                                  <div className="flex justify-between items-start">
                                      <div className="flex gap-4">
                                          {r.user?.avatarUrl && r.user.avatarUrl !== "https://ui-avatars.com/api/?name=User&background=random" ? (
                                              <img src={r.user.avatarUrl} className="w-12 h-12 rounded-full border border-outline-variant object-cover" alt="Avatar" />
                                          ) : (
                                              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary">
                                                  {r.user?.fullName ? r.user.fullName.substring(0, 2).toUpperCase() : 'JD'}
                                              </div>
                                          )}
                                          <div>
                                              <h4 className="font-bold text-on-surface">{r.user?.fullName || 'John Doe'}</h4>
                                              <div className="flex text-primary text-[14px]">
                                                  {[...Array(5)].map((_, i) => (
                                                      <span key={i} className={`material-symbols-outlined text-[16px] ${i < r.rating ? 'fill-current' : ''}`}>star</span>
                                                  ))}
                                              </div>
                                          </div>
                                      </div>
                                      <span className="text-xs text-on-surface-variant">{new Date(r.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-on-surface-variant leading-relaxed">
                                      {r.comment}
                                  </p>
                              </div>
                          )) : (
                              <div className="text-sm text-on-surface-variant italic py-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                                  No reviews available for this product yet.
                              </div>
                          )}
                      </div>
                  </div>
              </section>

              {/* Section 3: Shipping & Returns */}
              <section id="shipping" className="space-y-12 scroll-mt-32">
                  <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-extrabold text-on-surface">Shipping & Returns</h2>
                      <div className="flex-grow h-px bg-outline-variant/30"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                          <div className="space-y-4">
                              <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface">
                                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                                  Delivery Options
                              </h3>
                              <div className="space-y-3">
                                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-primary/20">
                                      <div>
                                          <p className="font-bold text-on-surface">Standard Delivery</p>
                                          <p className="text-xs text-on-surface-variant">Estimated arrival: 3-5 business days</p>
                                      </div>
                                      <span className="font-extrabold text-primary">FREE</span>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                                      <div>
                                          <p className="font-bold text-on-surface">Express Shipping</p>
                                          <p className="text-xs text-on-surface-variant">Estimated arrival: 1-2 business days</p>
                                      </div>
                                      <span className="font-extrabold text-on-surface">50,000 VND</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-surface-container-low rounded-3xl p-8 space-y-6 border border-outline-variant/30">
                          <h3 className="text-xl font-bold flex items-center gap-2 text-on-surface">
                              <span className="material-symbols-outlined text-primary">assignment_return</span>
                              Return Policy
                          </h3>
                          <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                  <p className="text-sm text-on-surface-variant"><span className="font-bold text-on-surface">15-Day</span> Money Back Guarantee</p>
                              </div>
                              <div className="flex items-start gap-3">
                                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                                  <p className="text-sm text-on-surface-variant"><span className="font-bold text-on-surface">Free</span> Return Shipping on eligible items</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
          </div>
        </div>

        {/* Related Products */}
        <section className="mt-24 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[12px] text-primary mb-2 uppercase tracking-widest font-bold">Recommended</p>
                    <h2 className="text-3xl font-extrabold text-on-surface">You May Also Like</h2>
                </div>
                <button className="text-primary font-bold hover:underline">View All</button>
            </div>
            
            {relatedProducts?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map(p => (
                        <Link to={`/product/${p.slug}`} key={p.id} className="group bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 hover:border-primary/30 hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                            <div className="aspect-square relative overflow-hidden bg-surface-container-low">
                                <img src={p.media?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                            </div>
                            <div className="p-5 flex-grow flex flex-col">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{p.category?.name || 'Category'}</p>
                                <h4 className="font-bold text-sm mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">{p.name}</h4>
                                <div className="mt-auto flex items-center justify-between">
                                    <p className="text-primary font-extrabold">{p.sellingPrice?.toLocaleString()}₫</p>
                                    <button className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                    </button>
                                  </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-on-surface-variant italic py-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                    No recommended products available.
                </div>
            )}
        </section>

      </main>

      <Footer />

      <FABGroup />

    </div>
  );
};

export default ProductDetail;
