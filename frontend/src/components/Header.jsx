import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    setSearchTerm(q || '');
  }, [location.search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val.trim() === '' && location.pathname === '/search') {
      const currentParams = new URLSearchParams(location.search);
      if (currentParams.has('q')) {
        currentParams.delete('q');
        navigate(`/search${currentParams.toString() ? `?${currentParams.toString()}` : ''}`);
      }
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      const currentParams = new URLSearchParams(location.search);
      if (searchTerm.trim()) {
        currentParams.set('q', searchTerm.trim());
      } else {
        currentParams.delete('q');
      }
      navigate(`/search${currentParams.toString() ? `?${currentParams.toString()}` : ''}`);
    }
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'].includes(location.pathname);

  return (
    <header className="bg-white shadow-[0px_4px_20px_rgba(15,23,42,0.05)] sticky top-0 z-50 font-medium text-[#131b2e] font-['Manrope']">
      <div className="flex justify-between items-center w-full px-4 md:px-10 py-4 max-w-[1280px] mx-auto gap-8">
        <div className="flex items-center gap-8">
          <Link className="font-['Manrope'] text-2xl text-[#004ac6] tracking-tight font-extrabold" to="/">UTEShop</Link>
          <nav className="hidden md:flex gap-6">
            <Link className={`text-sm font-medium ${isActive('/') ? 'text-[#004ac6] underline underline-offset-8 decoration-2 font-bold' : 'text-[#434655] hover:text-[#004ac6] transition-colors'}`} to="/">Home</Link>
            <Link className={`text-sm font-medium ${isActive('/search') ? 'text-[#004ac6] underline underline-offset-8 decoration-2 font-bold' : 'text-[#434655] hover:text-[#004ac6] transition-colors'}`} to="/search">Shop</Link>
            <Link className={`text-sm font-medium ${isActive('/promotions') ? 'text-[#004ac6] underline underline-offset-8 decoration-2 font-bold' : 'text-[#434655] hover:text-[#004ac6] transition-colors'}`} to="/promotions">Promotions</Link>
            <Link className={`text-sm font-medium ${isActive('/blog') ? 'text-[#004ac6] underline underline-offset-8 decoration-2 font-bold' : 'text-[#434655] hover:text-[#004ac6] transition-colors'}`} to="/blog">Blog</Link>
            <Link className={`text-sm font-medium ${isActive('/support') ? 'text-[#004ac6] underline underline-offset-8 decoration-2 font-bold' : 'text-[#434655] hover:text-[#004ac6] transition-colors'}`} to="/support">Support</Link>
          </nav>
        </div>
        
        {!isAuthPage && (
          <div className="hidden lg:flex flex-1 max-w-md relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#434655] group-focus-within:text-[#004ac6] transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Search for academic collections..." 
              className="w-full bg-[#f2f3ff] border-none rounded-full py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-[#004ac6]/20 transition-all outline-none text-[#131b2e]"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearch}
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          {!isAuthPage && (
            <button className="lg:hidden p-2 hover:bg-[#f2f3ff] rounded-full transition-all duration-200">
              <span className="material-symbols-outlined text-[#434655]">search</span>
            </button>
          )}

          <Link to="/cart" className="p-2 hover:bg-[#f2f3ff] rounded-full transition-all duration-200 relative text-[#434655]">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#004ac6] text-[10px] text-white flex items-center justify-center rounded-full font-bold">
              {isAuthPage ? "0" : "3"}
            </span>
          </Link>

          {!isAuthPage && (
            <Link to="/notifications" className="p-2 hover:bg-[#f2f3ff] rounded-full transition-all duration-200 text-[#434655] relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>
            </Link>
          )}

          {user ? (
            <Link to="/user/profile" className="flex items-center gap-2 p-1 pr-3 hover:bg-[#f2f3ff] rounded-full transition-all duration-200 border border-[#c3c6d7]/30">
              <img src={user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:5000${user.avatarUrl}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'User')}&background=004ac6&color=fff`} alt="Avatar" className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="text-sm font-bold text-[#131b2e] hidden md:block tracking-tight">{user.fullName}</span>
            </Link>
          ) : (
            <Link to="/login" className="p-2 hover:bg-[#f2f3ff] rounded-full transition-all duration-200 text-[#434655]">
              <span className="material-symbols-outlined">account_circle</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
