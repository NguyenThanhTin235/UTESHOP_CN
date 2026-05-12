import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-bottom py-3 px-4">
      <div className="logo-container d-flex align-items-center gap-2" style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
        <div className="logo-icon border border-2 border-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
          <i className="fa-solid fa-diamond" style={{ fontSize: '14px' }}></i>
        </div>
        UTEShop
      </div>
    </header>
  );
};

export default Header;
