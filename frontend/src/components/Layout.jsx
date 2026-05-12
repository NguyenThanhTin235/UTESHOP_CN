import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Header />
      <main className="flex-grow-1 d-flex flex-column align-items-center py-5">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
