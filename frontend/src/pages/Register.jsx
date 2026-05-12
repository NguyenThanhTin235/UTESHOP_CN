import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP, reset } from '../redux/authSlice';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { fullName, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'OTP has been sent to your email') {
      toast.dismiss();
      toast.success(message);
      navigate('/verify-otp', { state: { regData: formData } });
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch, formData]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.dismiss();
      toast.error('Passwords do not match');
    } else {
      dispatch(sendOTP(email.trim()));
    }
  };

  return (
    <Layout>
      <div className="register-card bg-white shadow-sm border rounded-4 p-4 p-md-5 mb-4" style={{ width: '100%', maxWidth: '520px' }}>
        <div className="text-center mb-4">
          <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" 
               style={{ width: '56px', height: '56px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <i className="fa-solid fa-diamond fs-4"></i>
          </div>
          <h1 className="fw-bold h3 mb-1">Create your account</h1>
          <p className="text-muted small">Start shopping from multiple fashion stores</p>
        </div>

        <form onSubmit={onSubmit}>
          <InputField
            label="Full name"
            type="text"
            name="fullName"
            value={fullName}
            placeholder="Eleanor Rigby"
            icon="fa-regular fa-user"
            onChange={onChange}
            required
          />

          <InputField
            label="Email address"
            type="email"
            name="email"
            value={email}
            placeholder="eleanor@fashion.com"
            icon="fa-regular fa-envelope"
            onChange={onChange}
            required
          />

          <div className="row g-3">
            <div className="col-6">
              <InputField
                label="Password"
                type="password"
                name="password"
                value={password}
                placeholder="••••••••"
                icon="fa-solid fa-lock"
                onChange={onChange}
                required
              />
            </div>
            <div className="col-6">
              <InputField
                label="Confirm"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                placeholder="••••••••"
                icon="fa-solid fa-lock"
                onChange={onChange}
                required
              />
            </div>
          </div>

          <PrimaryButton type="submit" isLoading={isLoading} className="mt-2 py-3 rounded-3">
            Create account <i className="fa-solid fa-arrow-right ms-2"></i>
          </PrimaryButton>

          <div className="text-center mt-3 text-muted" style={{ fontSize: '12px' }}>
            <i className="fa-solid fa-shield-halved me-2"></i>
            Your data is protected by industry standard encryption
          </div>
        </form>

        <div className="d-flex align-items-center my-4 text-muted small fw-bold">
          <hr className="flex-grow-1" />
          <span className="px-3">OR</span>
          <hr className="flex-grow-1" />
        </div>

        <div className="row g-2 mb-4">
          {[
            { icon: 'fa-regular fa-circle-check', label: 'MULTI-VENDOR' },
            { icon: 'fa-regular fa-circle-check', label: 'SECURE PAY' },
            { icon: 'fa-regular fa-circle-check', label: 'FREE RETURNS' },
          ].map((feature, idx) => (
            <div key={idx} className="col-4">
              <div className="bg-light rounded-pill py-2 px-1 text-center d-flex flex-column align-items-center gap-1" style={{ fontSize: '9px', fontWeight: '700' }}>
                <i className={`${feature.icon} text-primary fs-6`}></i>
                {feature.label}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center small text-muted">
          Already have an account? <Link to="/login" className="text-primary fw-bold text-decoration-none">Login</Link>
        </div>
      </div>

      <div className="d-flex gap-3 text-muted small fw-bold mb-4" style={{ letterSpacing: '0.5px' }}>
        <a href="#" className="text-decoration-none text-muted">PRIVACY POLICY</a>
        <span>▪</span>
        <a href="#" className="text-decoration-none text-muted">TERMS OF SERVICE</a>
        <span>▪</span>
        <a href="#" className="text-decoration-none text-muted">HELP CENTER</a>
      </div>
    </Layout>
  );
};

export default Register;
