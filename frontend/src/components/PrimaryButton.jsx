import React from 'react';

const PrimaryButton = ({ children, onClick, type = 'button', isLoading = false, className = '' }) => {
  return (
    <button
      type={type}
      className={`btn btn-primary w-100 py-2 fw-semibold ${className}`}
      onClick={onClick}
      disabled={isLoading}
      style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ) : null}
      {children}
    </button>
  );
};

export default PrimaryButton;
