import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const Reviews = () => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/reviews', config);
        if (response.data && response.data.success) {
          setReviews(response.data.data || []);
        } else {
          setReviews([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">My Reviews</h1>
          <p className="text-sm text-[#434655] mt-1">Manage your ratings and reviews for academic collections and merchandise.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : reviews.length === 0 ? (
          /* Standardized Data-Driven Empty State */
          <div className="bg-white rounded-3xl p-12 md:p-16 border border-[#c3c6d7]/30 shadow-sm text-center max-w-2xl mx-auto my-8 space-y-6">
            <div className="w-24 h-24 bg-[#004ac6]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="material-symbols-outlined text-[#004ac6] text-[48px]">rate_review</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#131b2e]">No Reviews Written</h2>
            <p className="text-[#434655] text-base leading-relaxed max-w-md mx-auto">
              You haven't written any product reviews yet. Share your thoughts and academic experiences on products you've purchased to help fellow students.
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
          /* Reviews List Grid */
          <div className="space-y-6 max-w-4xl mx-auto">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-6 md:p-8 border border-[#c3c6d7]/30 shadow-sm space-y-4">
                <div className="flex items-center gap-4 border-b border-[#c3c6d7]/20 pb-4">
                  <img src={rev.productImage || 'https://via.placeholder.com/100'} alt={rev.productName} className="w-16 h-16 rounded-xl object-cover border border-[#c3c6d7]/20" />
                  <div>
                    <h4 className="font-bold text-base text-[#131b2e]">{rev.productName}</h4>
                    <p className="text-xs text-[#737686]">Reviewed on {rev.date || new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex text-amber-500 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`material-symbols-outlined text-base ${i < rev.rating ? 'fill-current' : ''}`}>star</span>
                    ))}
                  </div>
                  <p className="text-sm text-[#434655] leading-relaxed">{rev.comment}</p>
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

export default Reviews;
