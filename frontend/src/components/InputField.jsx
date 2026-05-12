import React from 'react';

const InputField = ({ label, type, name, value, onChange, placeholder, icon, required = false, error }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-3 text-start">
      {label && <label className="form-label fw-semibold text-secondary small mb-1 text-start d-block">{label}</label>}
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-white border-end-0 text-muted">
            <i className={icon}></i>
          </span>
        )}
        <input
          type={inputType}
          name={name}
          className={`form-control ${icon ? 'border-start-0' : ''} ${type === 'password' ? 'border-end-0' : ''} ${error ? 'is-invalid' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{ padding: '10px 12px', fontSize: '14px' }}
        />
        {type === 'password' && (
          <span className="input-group-text bg-white border-start-0 text-muted" style={{ cursor: 'pointer' }} onClick={togglePassword}>
            <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
          </span>
        )}
        {error && <div className="invalid-feedback">{error}</div>}
      </div>
    </div>
  );
};

export default InputField;
