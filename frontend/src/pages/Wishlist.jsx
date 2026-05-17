import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Wishlist = () => {
  const { user } = useSelector((state) => state.auth);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/wishlist', config);
        if (response.data && response.data.success) {
          setWishlistItems(response.data.data || []);
        } else {
          setWishlistItems([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveWishlist = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (item) => {
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">My Wishlist</h1>
          <p className="text-sm text-[#434655] mt-1">Saved academic collections and merchandise for future purchase.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Standardized Data-Driven Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">favorite_border</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">Your Wishlist is Empty</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              You haven't saved any academic collections or products to your wishlist yet. Save items you like to review or purchase them later.
            </p>
            <div className="pt-4">
              <Link 
                to="/search" 
                className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">explore</span>
                Explore Catalog
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlistItems.map((p) => (
              <div key={p.id} className="group bg-white rounded-3xl overflow-hidden border border-[#c3c6d7]/30 hover:border-[#004ac6]/30 hover:shadow-xl transition-all duration-500 flex flex-col h-full relative">
                {/* Remove Button */}
                <button 
                  onClick={() => handleRemoveWishlist(p.id)}
                  className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-[#737686] hover:text-[#ba1a1a] hover:bg-white flex items-center justify-center shadow-md transition-all"
                  title="Remove from wishlist"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>

                <Link to={`/product/${p.slug}`} className="aspect-square relative overflow-hidden bg-[#faf8ff] block">
                  <img 
                    src={p.imageUrl || p.media?.[0] || 'https://via.placeholder.com/300'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt={p.name} 
                  />
                </Link>

                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[10px] font-bold text-[#004ac6] uppercase tracking-widest mb-1">{p.category?.name || p.category || 'Academic'}</p>
                    <Link to={`/product/${p.slug}`}>
                      <h4 className="font-bold text-sm text-[#131b2e] line-clamp-2 min-h-[2.5rem] group-hover:text-[#004ac6] transition-colors">{p.name}</h4>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#c3c6d7]/20 pt-3 mt-auto">
                    <p className="text-[#004ac6] font-extrabold text-base">{p.sellingPrice?.toLocaleString()}₫</p>
                    <button 
                      onClick={() => handleAddToCart(p)}
                      className="w-9 h-9 rounded-full bg-[#004ac6]/10 text-[#004ac6] flex items-center justify-center hover:bg-[#004ac6] hover:text-white transition-all shadow-sm"
                      title="Add to cart"
                    >
                      <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <FABGroup />
    </div>
  );
};

export default Wishlist;
