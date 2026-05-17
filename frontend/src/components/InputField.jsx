import React from 'react';

const InputField = ({ label, type, name, value, onChange, placeholder, icon, required = false, error }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-4 text-left w-full">
      {label && (
        <label className="block text-[11px] font-bold text-[#505f76] uppercase tracking-wider mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center group">
        {icon && (
          <span className="absolute left-4 text-[#737686] group-focus-within:text-[#004ac6] transition-colors flex items-center pointer-events-none">
            <i className={icon}></i>
          </span>
        )}
        <input
          type={inputType}
          name={name}
          className={`w-full bg-[#f2f3ff] border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-[#c3c6d7] focus:border-[#004ac6] focus:ring-[#004ac6]/20'} rounded-xl py-3.5 ${icon ? 'pl-11' : 'pl-4'} ${type === 'password' ? 'pr-12' : 'pr-4'} text-sm text-[#131b2e] placeholder-[#737686] outline-none focus:ring-2 transition-all`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-4 text-[#737686] hover:text-[#004ac6] transition-colors flex items-center justify-center h-full"
            onClick={togglePassword}
          >
            <i className={showPassword ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"}></i>
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default InputField;
