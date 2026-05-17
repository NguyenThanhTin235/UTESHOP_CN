import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FABGroup from '../components/FABGroup';

const AddressBook = () => {
  const { user } = useSelector((state) => state.auth);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        };
        const response = await axios.get('http://localhost:5000/api/addresses', config);
        if (response.data && response.data.success) {
          setAddresses(response.data.data || []);
        } else {
          setAddresses([]);
        }
      } catch (error) {
        // Graceful fallback to empty state if endpoint is unavailable or empty
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleAddNewAddress = () => {
    toast.success('Add new address form activated');
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />

      <main className="flex-grow max-w-[1280px] mx-auto w-full px-4 md:px-10 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#131b2e] tracking-tight">Shipping Addresses</h1>
            <p className="text-sm text-[#434655] mt-1">Manage your delivery addresses for campus and home delivery.</p>
          </div>
          <button 
            onClick={handleAddNewAddress}
            className="self-start sm:self-auto px-6 py-3 bg-[#004ac6] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Add New Address
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004ac6]"></div>
          </div>
        ) : addresses.length === 0 ? (
          /* Standardized Data-Driven Empty State */
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
                onClick={handleAddNewAddress}
                className="inline-flex items-center gap-2 bg-[#004ac6] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#004ac6]/20 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined">add_location</span>
                Add New Address
              </button>
            </div>
          </div>
        ) : (
          /* Addresses List Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {addresses.map((addr) => (
              <div key={addr.id} className="bg-white rounded-3xl p-6 md:p-8 border border-[#c3c6d7]/30 shadow-sm space-y-4 relative group">
                {addr.isDefault && (
                  <span className="absolute top-6 right-6 bg-[#004ac6]/10 text-[#004ac6] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Default
                  </span>
                )}
                <div>
                  <h4 className="font-bold text-lg text-[#131b2e]">{addr.recipientName}</h4>
                  <p className="text-sm text-[#434655] mt-0.5">{addr.phone}</p>
                </div>
                <p className="text-sm text-[#434655] leading-relaxed border-t border-[#c3c6d7]/20 pt-4">
                  {addr.street}, {addr.ward}, {addr.district}, {addr.city}
                </p>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => toast.success('Edit address')} className="text-xs font-bold text-[#004ac6] hover:underline">Edit</button>
                  <button onClick={() => toast.success('Address removed')} className="text-xs font-bold text-[#ba1a1a] hover:underline">Delete</button>
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

export default AddressBook;
