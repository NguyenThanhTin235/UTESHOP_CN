import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf8ff] font-['Manrope']">
      <Header />
      <main className="flex-grow flex flex-col items-center py-12 px-4 md:px-10 w-full max-w-[1440px] mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
