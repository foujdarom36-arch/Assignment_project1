import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import authService from '../services/authService';
import Button from '../components/ui/Button';

const Login = () => {
  const { verifyOTP, requestOTP, setIsAuthenticated } = useAppContext();
  const navigate = useNavigate();

  // Login stage state: 'email' | 'otp'
  const [stage, setStage] = useState('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);

  const otpInputsRef = useRef([]);

  // Handle countdown timer
  useEffect(() => {
    let interval = null;
    if (stage === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (stage === 'otp' && resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [stage, resendTimer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setEmailError('Please enter email or phone number');
      return;
    }
    setEmailError('');
    setIsLoading(true);

    try {
      await authService.requestOTP(emailOrPhone);
      setStage('otp');
      setResendTimer(20);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setEmailError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Keep only numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue) {
      const newOtp = [...otpValues];
      newOtp[index] = '';
      setOtpValues(newOtp);
      return;
    }

    const newOtp = [...otpValues];
    // If user pasted a 6 digit code
    if (cleanValue.length > 1) {
      const pastedCode = cleanValue.slice(0, 6).split('');
      pastedCode.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtpValues(newOtp);
      otpInputsRef.current[Math.min(pastedCode.length - 1, 5)]?.focus();
      return;
    }

    newOtp[index] = cleanValue;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (index < 5 && cleanValue) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        // Clear previous and focus it
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        otpInputsRef.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        // Clear current
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otpValues.join('');
    if (otpString.length < 6) {
      setOtpError('Please enter complete 6-digit OTP');
      return;
    }

    setOtpError('');
    setIsLoading(true);

    try {
      await authService.verifyOTP(otpString, emailOrPhone);
      // Context will set user details and login state
      setIsAuthenticated(true);
      navigate('/');
    } catch (err) {
      setOtpError(err.response?.data?.message || err.message || 'Please enter a valid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      await authService.requestOTP(emailOrPhone);
      setResendTimer(20);
      setCanResend(false);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
    } catch (err) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-5xl min-h-[580px] border border-slate-100">
        
        {/* Left Graphics Pane */}
        <div className="w-full md:w-[50%] p-8 flex flex-col justify-between bg-gradient-to-tr from-slate-50 to-blue-50 relative overflow-hidden border-r border-slate-100">
          {/* Logo brand */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-2xl font-black text-brand-dark tracking-tight">Productr</span>
            <span className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">♾️</span>
          </div>

          {/* Premium Runner Card Illustration */}
          <div className="my-auto py-12 flex justify-center items-center">
            <div className="relative w-72 h-96 rounded-[32px] overflow-hidden bg-gradient-to-b from-orange-400 via-orange-500 to-amber-600 shadow-2xl flex flex-col items-center justify-between p-6 transform hover:scale-[1.01] transition-transform duration-500">
              
              {/* Top ambient highlight */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white/25 to-transparent blur-xl pointer-events-none" />

              {/* Silhouette Runner Graphics */}
              <div className="w-full h-full flex items-center justify-center relative z-10 select-none">
                <svg className="w-40 h-40 text-black/80 drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]" viewBox="0 0 100 100" fill="currentColor">
                  {/* High quality runner silhouette vector path */}
                  <path d="M52.3,18.8c3,0,5.5-2.5,5.5-5.5s-2.5-5.5-5.5-5.5s-5.5,2.5-5.5,5.5S49.3,18.8,52.3,18.8z M71.8,36.5l-8.6-6.1 c-2-1.4-4.8-1.1-6.4,0.8L47.7,42L42,35.8c-1.3-1.4-3.5-1.9-5.4-1.2L20.8,40.4c-1.8,0.7-2.8,2.7-2.1,4.5c0.7,1.8,2.7,2.8,4.5,2.1 l12.7-4.8l4.4,4.8l-12.7,22.2c-1,1.7-0.4,3.9,1.3,4.9c1.7,1,3.9,0.4,4.9-1.3L48,51.9l6.5,6c1.1,1,1.8,2.5,1.8,4.1v21.5 c0,2,1.6,3.6,3.6,3.6s3.6-1.6,3.6-3.6V62.4C63.5,57.1,60.8,52.1,56.4,49l-2.4-2.2l5-5.8l16,11.3c0.7,0.5,1.5,0.7,2.3,0.7 c1.2,0,2.4-0.6,3-1.7C81.4,39.6,80.8,37.4,71.8,36.5z" />
                </svg>
              </div>

              {/* Bottom Text Overlay */}
              <div className="text-center relative z-10 w-full mb-4">
                <h4 className="text-lg font-bold text-white tracking-wide">Uplist your</h4>
                <p className="text-sm font-semibold text-white/95 tracking-wide mt-0.5">product to market</p>
              </div>
            </div>
          </div>

          {/* Grid ambient circles */}
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
          
          <div className="text-xs text-slate-400">
            © 2026 Productr Inc. All rights reserved.
          </div>
        </div>

        {/* Right Form Pane */}
        <div className="w-full md:w-[50%] p-10 flex flex-col justify-between bg-white relative">
          
          <div className="my-auto max-w-sm w-full mx-auto space-y-8">
            
            {/* Header Text */}
            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
                Login to your Productr Account
              </h2>
            </div>

            {/* ERROR BOUNDARY ALERT */}
            {stage === 'otp' && otpError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-brand-error text-xs font-medium rounded-lg flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Verification Failed</p>
                  <p className="mt-0.5">{otpError}</p>
                </div>
              </div>
            )}

            {/* STAGE 1: Email or Phone Number */}
            {stage === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-brand-dark mb-2">
                    Email or Phone number
                  </label>
                  <input
                    type="text"
                    id="email"
                    placeholder="Enter email or phone number"
                    value={emailOrPhone}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    className={`w-full px-4 py-3 text-sm rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-all duration-200 ${
                      emailError ? 'border-brand-error focus:ring-1 focus:ring-brand-error' : 'border-slate-200 focus:border-brand-primary'
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-brand-error mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {emailError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full py-3.5 text-sm font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-buttonHover shadow-md transition-colors"
                >
                  Login
                </Button>
              </form>
            )}

            {/* STAGE 2: OTP Entry */}
            {stage === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-brand-dark mb-3">
                    Enter OTP
                  </label>
                  
                  {/* 6 Digit Box Inputs */}
                  <div className="flex justify-between gap-2.5">
                    {otpValues.map((val, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength="6" // allow pasting
                        ref={(el) => (otpInputsRef.current[idx] = el)}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-12 h-12 text-center text-lg font-bold rounded-lg border bg-slate-50/50 text-brand-dark focus:bg-white focus:outline-none transition-all duration-200 ${
                          otpError
                            ? 'border-brand-error bg-red-50/20 text-brand-error focus:ring-1 focus:ring-brand-error'
                            : 'border-slate-200 focus:border-brand-primary'
                        }`}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="text-xs text-brand-error mt-2.5 text-center font-medium">
                      Please enter a valid OTP
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full py-3.5 text-sm font-semibold rounded-lg text-white bg-brand-primary hover:bg-brand-buttonHover shadow-md transition-colors"
                  >
                    Enter your OTP
                  </Button>

                  {/* Resend Timer Text */}
                  <div className="text-center">
                    {canResend ? (
                      <p className="text-xs text-slate-500">
                        Didn't receive OTP?{' '}
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-brand-primary font-bold hover:underline focus:outline-none"
                        >
                          Resend
                        </button>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Didn't receive OTP? Resend in{' '}
                        <span className="font-semibold text-slate-600">{resendTimer}s</span>
                      </p>
                    )}
                  </div>
                </div>
              </form>
            )}

            {/* Back to Email Selection if in OTP Stage */}
            {stage === 'otp' && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStage('email')}
                  className="text-xs text-slate-500 hover:text-brand-primary transition-colors font-medium"
                >
                  ← Change Email/Phone
                </button>
              </div>
            )}
          </div>

          {/* Footer Signup Link */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-400 font-medium select-none">
              Don't have a Productr Account?{' '}
              <span className="text-brand-primary font-bold hover:underline cursor-pointer">
                SignUp Here
              </span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
