import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerUser, sendOTP, reset } from '../redux/authSlice';
import PrimaryButton from '../components/PrimaryButton';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { regData } = location.state || {};

  const { isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (!regData) {
      navigate('/register');
    }
  }, [regData, navigate]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (isError) {
      toast.dismiss();
      toast.error(message);
      dispatch(reset());
    }

    if (isSuccess && message === 'Registration successful') {
      toast.dismiss();
      toast.success(message || 'Registration successful!');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
      dispatch(reset());
    }
    
    if (isSuccess && message === 'OTP has been sent to your email') {
      toast.dismiss();
      toast.success('OTP resent successfully!');
      setTimer(59);
      setCanResend(false);
      dispatch(reset());
    }
  }, [isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const onResendOTP = () => {
    if (canResend) {
      dispatch(sendOTP(regData.email));
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      toast.dismiss();
      toast.error('Please enter all 6 digits');
      return;
    }

    const userData = {
      full_name: regData.fullName,
      email: regData.email.trim(),
      password: regData.password,
      otp_code: otpCode,
    };
    dispatch(registerUser(userData));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="bg-white shadow-sm border rounded-4 p-4 p-md-5 mb-4 text-center" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" 
             style={{ width: '64px', height: '64px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
          <i className="fa-solid fa-shield-halved fs-3"></i>
        </div>
        
        <h1 className="fw-bold h3 mb-2">Verify Identity</h1>
        <p className="text-muted small mb-4">
          We've sent a 6-digit verification code to<br />
          <strong className="text-dark">{regData?.email}</strong>
        </p>

        <form onSubmit={onSubmit}>
          <div className="d-flex justify-content-between gap-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                className={`form-control text-center fw-bold fs-4 ${digit ? 'border-primary' : ''}`}
                style={{ width: '50px', height: '60px', color: '#2563eb' }}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
            ))}
          </div>

          <div className="timer-info small text-muted mb-2 d-flex align-items-center justify-content-center gap-2">
            <i className="fa-regular fa-clock"></i>
            Resend code in <span className="text-primary fw-bold">{formatTime(timer)}</span>
          </div>

          <button 
            type="button"
            className={`btn btn-link p-0 small fw-bold mb-4 text-decoration-none ${canResend ? 'text-primary' : 'text-muted'}`}
            disabled={!canResend}
            onClick={onResendOTP}
            style={{ cursor: canResend ? 'pointer' : 'not-allowed' }}
          >
            <i className="fa-solid fa-arrow-rotate-right me-2"></i>
            Resend OTP
          </button>

          <PrimaryButton type="submit" isLoading={isLoading} className="py-3 rounded-3 mb-4 shadow-sm">
            Verify & Continue
          </PrimaryButton>
        </form>

        <div className="border-top w-75 mx-auto mb-4"></div>

        <button onClick={() => navigate('/register')} className="btn btn-link text-muted small text-decoration-none mb-4 fw-medium">
          <i className="fa-solid fa-arrow-left me-2"></i> Back to registration
        </button>

        <p className="small text-muted fst-italic px-4">
          Didn't receive the email? Check your spam folder or try another address.
        </p>
      </div>

      <div className="d-flex gap-4 text-muted small fw-bold mb-4" style={{ letterSpacing: '0.5px' }}>
        <span><i className="fa-regular fa-circle-check me-1"></i> SECURE SSL</span>
        <span><i className="fa-regular fa-circle-check me-1"></i> ACADEMIC GRADE</span>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
