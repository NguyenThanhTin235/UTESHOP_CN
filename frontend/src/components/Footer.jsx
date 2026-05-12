import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-5 px-4 mt-auto">
      <div className="container-xl">
        <div className="row g-4 mb-5">
          <div className="col-lg-4">
            <div className="logo-container d-flex align-items-center gap-2 mb-3" style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
              <div className="logo-icon border border-2 border-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <i className="fa-solid fa-diamond" style={{ fontSize: '14px' }}></i>
              </div>
              UTEShop
            </div>
            <p className="text-muted fst-italic small">
              Elevating the multi-vendor experience with<br />academic precision and soft aesthetics.
            </p>
          </div>
          
          <div className="col-6 col-md-3 col-lg-2 ms-lg-auto">
            <h6 className="fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">New Arrivals</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Featured Designers</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Boutiques</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3">Company</h6>
            <ul className="list-unstyled small text-muted">
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">About Us</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Careers</a></li>
              <li className="mb-2"><a href="#" className="text-decoration-none text-muted">Terms of Service</a></li>
            </ul>
          </div>

          <div className="col-md-3 col-lg-2">
            <h6 className="fw-bold mb-3">Connect</h6>
            <div className="d-flex gap-3 fs-5">
              <a href="#" className="text-dark"><i className="fa-brands fa-twitter"></i></a>
              <a href="#" className="text-dark"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" className="text-dark"><i className="fa-brands fa-github"></i></a>
            </div>
          </div>
        </div>

        <div className="border-top pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-muted" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>
          <div>© 2024 UTESHOP. ALL RIGHTS RESERVED.</div>
          <div>ACADEMIC MODERNISM FRAMEWORK V1.0</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
