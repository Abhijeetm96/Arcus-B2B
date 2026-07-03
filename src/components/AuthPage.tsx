import React, { useState, useEffect, useRef } from 'react';
import { useAuth, type User } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  validateEmail,
  validateIndividualRegistration,
  validateBusinessRegistration,
  validateProfessionalRegistration
} from '../../shared/validation';

export const AuthPage: React.FC = () => {
  const { login, register, refreshUser } = useAuth();
  
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);
  
  // Navigation / Tab states
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Forgot Password flow states
  const [forgotPasswordStep, setForgotPasswordStep] = useState<number>(0); // 0 = none, 1 = enter phone/email, 2 = verify OTP, 3 = reset password
  const [forgotEmailOrPhone, setForgotEmailOrPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // General States
  const [successState, setSuccessState] = useState<'Individual' | 'Business' | 'Professional' | null>(null);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});
  const [loginLoading, setLoginLoading] = useState(false);

  // Email OTP Verification States
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verifyingEmailAddress, setVerifyingEmailAddress] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpError, setEmailOtpError] = useState('');
  const [emailOtpSuccess, setEmailOtpSuccess] = useState('');
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailOtpCountdown, setEmailOtpCountdown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (emailOtpCountdown > 0) {
      timer = setInterval(() => {
        setEmailOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [emailOtpCountdown]);

  const handleResendEmailOtp = async () => {
    setEmailOtpError('');
    setEmailOtpSuccess('');
    if (emailOtpCountdown > 0) return;

    try {
      const res = await apiFetch('/auth/resend-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: verifyingEmailAddress })
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailOtpError(data.error || 'Failed to resend OTP.');
        return;
      }
      setEmailOtpSuccess('A fresh 6-digit verification code has been sent via Resend.');
      setEmailOtpCountdown(60);
    } catch {
      setEmailOtpError('Network error. Please try again.');
    }
  };

  const handleVerifyEmailOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailOtpError('');
    setEmailOtpSuccess('');
    setEmailOtpLoading(true);

    try {
      const res = await apiFetch('/auth/verify-email-otp', {
        method: 'POST',
        body: JSON.stringify({ email: verifyingEmailAddress, otp: emailOtpCode })
      });
      const data = await res.json();
      setEmailOtpLoading(false);
      if (!res.ok) {
        setEmailOtpError(data.error || 'Verification failed.');
        return;
      }
      setEmailOtpSuccess('Email verified successfully! Logging you in...');
      localStorage.setItem('arcus_token', data.token);
      await refreshUser();
      // Hide the email verification UI so the success screen renders
      setIsVerifyingEmail(false);
      const customerType = (data.user.customerType || '').toUpperCase();
      if (customerType === 'BUSINESS') {
        setSuccessState('Business');
      } else if (customerType === 'PROFESSIONAL') {
        setSuccessState('Professional');
      } else {
        setSuccessState('Individual');
      }
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        handleRoleRedirect(data.user);
      }, 3000);
    } catch {
      setEmailOtpLoading(false);
      setEmailOtpError('Network error. Please try again.');
    }
  };

  // Register Account Type
  const [accountType, setAccountType] = useState<'Individual' | 'Business' | 'Professional'>('Individual');

  // Registration Form States - Individual
  const [indName, setIndName] = useState('');
  const [indEmail, setIndEmail] = useState('');
  const [indPhone, setIndPhone] = useState('');
  const [indPassword, setIndPassword] = useState('');
  const [indConfirmPassword, setIndConfirmPassword] = useState('');
  const [indCity, setIndCity] = useState('');
  const [indState, setIndState] = useState('');
  const [indAgree, setIndAgree] = useState(false);
  const [indError, setIndError] = useState('');
  const [indLoading, setIndLoading] = useState(false);

  // Registration Form States - Business
  const [busGst, setBusGst] = useState('');
  const [busName, setBusName] = useState('');
  const [busAddress, setBusAddress] = useState('');
  const [busState, setBusState] = useState('');
  const [busGstStatus, setBusGstStatus] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [gstVerifying, setGstVerifying] = useState(false);
  
  const [busContactName, setBusContactName] = useState('');
  const [busContactEmail, setBusContactEmail] = useState('');
  const [busContactPhone, setBusContactPhone] = useState('');
  const [busPassword, setBusPassword] = useState('');
  const [busConfirmPassword, setBusConfirmPassword] = useState('');
  const [busError, setBusError] = useState('');
  const [busLoading, setBusLoading] = useState(false);

  // Registration Form States - Professional
  const [proName, setProName] = useState('');
  const [proBusinessName, setProBusinessName] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proPassword, setProPassword] = useState('');
  const [proConfirmPassword, setProConfirmPassword] = useState('');
  const [proCategory, setProCategory] = useState('Plumbing');
  const [proExperience, setProExperience] = useState('');
  const [proCity, setProCity] = useState('');
  const [proState, setProState] = useState('');
  const [proGst, setProGst] = useState('');
  const [proWebsite, setProWebsite] = useState('');
  const [proPortfolio, setProPortfolio] = useState('');
  const [proError, setProError] = useState('');
  const [proLoading, setProLoading] = useState(false);

  // Read URL search parameter for tab setting
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash.includes('?')) {
        const queryParams = new URLSearchParams(hash.split('?')[1]);
        const tabParam = queryParams.get('tab');
        if (tabParam === 'login' || tabParam === 'register') {
          setActiveTab(tabParam);
        }
      }
      if (hash.startsWith('#/auth/forgot-password')) {
        setForgotPasswordStep(1);
      } else {
        setForgotPasswordStep(0);
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);



  // GST Verification Live API Call
  const handleVerifyGst = () => {
    const gstClean = busGst.trim().toUpperCase();
    if (!gstClean) {
      setBusError('Please enter a GST number first.');
      return;
    }
    
    // Regular expression for GST validation
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(gstClean)) {
      setBusError('Format invalid. Please enter a valid 15-character GSTIN (e.g. 29ABCDE1234F1Z5).');
      return;
    }

    setBusError('');
    setGstVerifying(true);
    setGstVerified(false);

    apiFetch(`/auth/verify-gst/${gstClean}`)
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'Verification failed. Please check the GST number.');
          });
        }
        return res.json();
      })
      .then(data => {
        setGstVerifying(false);
        setGstVerified(true);
        setBusName(data.legalName || data.tradeName || '');
        setBusAddress(data.address || '');
        setBusState(data.state || '');
        setBusGstStatus(data.status || 'Active');
      })
      .catch(err => {
        setGstVerifying(false);
        setGstVerified(false);
        setBusError(err.message || 'An error occurred while verifying the GST number.');
      });
  };

  const handleRoleRedirect = (userObj: User) => {
    const role = (userObj.role || '').toUpperCase();
    if (role === 'ADMIN') {
      window.location.hash = '#/portal/admin';
      return;
    }
    const customerType = (userObj.customerType || '').toUpperCase();
    if (customerType === 'BUSINESS') {
      window.location.hash = '#/dashboard/business';
    } else if (customerType === 'PROFESSIONAL') {
      window.location.hash = '#/dashboard/professional';
    } else {
      window.location.hash = '#/dashboard/individual';
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginErrors({});

    const emailV = validateEmail(loginEmail);
    if (!emailV.valid) {
      setLoginErrors({ email: emailV.error! });
      setTimeout(() => {
        const input = document.getElementById('login-email');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    if (!loginPassword) {
      setLoginErrors({ password: 'Password is required.' });
      setTimeout(() => {
        const input = document.getElementById('login-password');
        if (input) {
          input.focus();
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setLoginLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      // Automatic role-based redirect
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        const token = localStorage.getItem('arcus_token');
        if (token) {
          apiFetch('/auth/me')
          .then(r => r.json())
          .then(data => {
            handleRoleRedirect(data);
          })
          .catch(() => {
            window.location.hash = '#/account';
          });
        } else {
          window.location.hash = '#/';
        }
      }, 100);
    } else {
      if (res.error === 'email_not_verified') {
        setVerifyingEmailAddress(res.email || loginEmail);
        setIsVerifyingEmail(true);
        setEmailOtpCountdown(60);
      } else {
        setLoginError(res.error || 'Invalid credentials. Please try again.');
      }
    }
  };

  // Submit Registration - Individual
  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIndError('');

    const validationErrors = validateIndividualRegistration({
      name: indName,
      email: indEmail,
      phone: indPhone,
      password: indPassword,
      confirmPassword: indConfirmPassword,
      city: indCity,
      state: indState,
      agree: indAgree
    });

    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      setIndError(firstError);
      return;
    }

    setIndLoading(true);
    const res = await register({
      name: indName,
      email: indEmail,
      phone: indPhone,
      password: indPassword,
      city: indCity,
      state: indState,
      role: 'Individual'
    });
    setIndLoading(false);
    if (res.success) {
      if (res.token && res.user) {
        const loggedUser = res.user;
        setSuccessState('Individual');
        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = setTimeout(() => {
          handleRoleRedirect(loggedUser);
        }, 3000);
      } else {
        setVerifyingEmailAddress(res.email || indEmail);
        setIsVerifyingEmail(true);
        setEmailOtpCountdown(60);
      }
    } else {
      setIndError(res.error || 'Registration failed');
    }
  };

  // Submit Registration - Business
  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusError('');

    const validationErrors = validateBusinessRegistration({
      gstVerified,
      contactName: busContactName,
      email: busContactEmail,
      phone: busContactPhone,
      password: busPassword,
      confirmPassword: busConfirmPassword
    });

    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      setBusError(firstError);
      return;
    }

    setBusLoading(true);
    const res = await register({
      name: busContactName,
      email: busContactEmail,
      phone: busContactPhone,
      password: busPassword,
      companyName: busName,
      gstNumber: busGst,
      state: busState,
      role: 'Business'
    });
    setBusLoading(false);
    if (res.success) {
      if (res.token && res.user) {
        const loggedUser = res.user;
        setSuccessState('Business');
        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = setTimeout(() => {
          handleRoleRedirect(loggedUser);
        }, 3000);
      } else {
        setVerifyingEmailAddress(res.email || busContactEmail);
        setIsVerifyingEmail(true);
        setEmailOtpCountdown(60);
      }
    } else {
      setBusError(res.error || 'Registration failed');
    }
  };

  // Submit Registration - Professional
  const handleProfessionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProError('');

    const validationErrors = validateProfessionalRegistration({
      name: proName,
      businessName: proBusinessName,
      email: proEmail,
      phone: proPhone,
      password: proPassword,
      confirmPassword: proConfirmPassword,
      experience: proExperience,
      city: proCity,
      state: proState,
      website: proWebsite || undefined,
      portfolioUrl: proPortfolio || undefined
    });

    const firstError = Object.values(validationErrors)[0];
    if (firstError) {
      setProError(firstError);
      return;
    }

    setProLoading(true);
    const res = await register({
      name: proName,
      email: proEmail,
      phone: proPhone,
      password: proPassword,
      companyName: proBusinessName,
      role: 'Professional',
      serviceCategory: proCategory,
      experience: proExperience,
      city: proCity,
      state: proState,
      gstNumber: proGst || undefined,
      website: proWebsite || undefined,
      portfolioUrl: proPortfolio || undefined
    });
    setProLoading(false);
    if (res.success) {
      if (res.token && res.user) {
        const loggedUser = res.user;
        setSuccessState('Professional');
        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = setTimeout(() => {
          handleRoleRedirect(loggedUser);
        }, 3000);
      } else {
        setVerifyingEmailAddress(res.email || proEmail);
        setIsVerifyingEmail(true);
        setEmailOtpCountdown(60);
      }
    } else {
      setProError(res.error || 'Registration failed');
    }
  };

  // Forgot Password Steps
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmailOrPhone.trim()) {
      setForgotError('Please enter your email or phone number.');
      return;
    }
    // Simulate sending OTP
    setForgotPasswordStep(2);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (forgotOtp !== '123456' && forgotOtp.length !== 6) {
      setForgotError('Invalid OTP code. Use test code 123456.');
      return;
    }
    setForgotPasswordStep(3);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    setForgotSuccess('Your password has been reset successfully. Redirecting to login...');
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = setTimeout(() => {
      setForgotSuccess('');
      setForgotPasswordStep(0);
      setActiveTab('login');
      window.location.hash = '#/auth?tab=login';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Container */}
      <div className="max-w-[1440px] mx-auto w-full px-lg md:px-xxl py-lg md:py-xxl flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4xl items-center w-full">
          
          {/* LEFT BRANDING PANEL (Hidden on Mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between min-h-[720px] bg-[#0A0A0A] text-white rounded-[32px] p-xxl relative overflow-hidden shadow">
            {/* Logo */}
            <div className="z-10">
              <a href="#/">
                <img
                  alt="ARCUS"
                  className="w-[140px] h-auto object-contain brightness-0 invert"
                  src="/logo.png"
                />
              </a>
            </div>

            {/* Graphic Network Animation */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40">
              <svg width="100%" height="100%" viewBox="0 0 400 400" className="animate-[spin_80s_linear_infinite]">
                <circle cx="200" cy="200" r="160" stroke="rgba(255, 193, 7, 0.2)" strokeWidth="1.5" fill="none" strokeDasharray="5,5" />
                <circle cx="200" cy="200" r="100" stroke="rgba(255, 193, 7, 0.3)" strokeWidth="1.5" fill="none" />
                <circle cx="200" cy="200" r="40" stroke="rgba(255, 193, 7, 0.4)" strokeWidth="2" fill="none" />
                
                {/* Connecting lines */}
                <line x1="200" y1="40" x2="200" y2="360" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <line x1="40" y1="200" x2="360" y2="200" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <line x1="87" y1="87" x2="313" y2="313" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                <line x1="87" y1="313" x2="313" y2="87" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />

                {/* Pulsing points */}
                <circle cx="200" cy="40" r="6" fill="#FFC107" className="animate-pulse" />
                <circle cx="200" cy="360" r="6" fill="#FFC107" className="animate-pulse" />
                <circle cx="40" cy="200" r="6" fill="#FFC107" className="animate-pulse" />
                <circle cx="360" cy="200" r="6" fill="#FFC107" className="animate-pulse" />
                <circle cx="87" cy="87" r="6" fill="#FFC107" className="animate-pulse" />
                <circle cx="313" cy="313" r="6" fill="#FFC107" className="animate-pulse" />
              </svg>

              {/* Floating Labels over the canvas */}
              <div className="absolute inset-0 flex flex-col justify-between p-xxl text-xs font-bold text-center text-primary uppercase tracking-widest font-label-caps pointer-events-none">
                <div className="flex justify-between">
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">Materials</span>
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">Professionals</span>
                </div>
                <div className="flex justify-around my-auto">
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">Projects</span>
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">Orders</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">RFQs</span>
                  <span className="bg-[#0A0A0A] px-2 py-1 rounded border border-white/10">Procurement</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-md text-left mt-xl z-10">
              <h1 className="font-headline-h1 text-[56px] font-extrabold leading-[1.1] tracking-tight text-white font-sans">
                Build Faster.<br />
                Procure Smarter.<br />
                Deliver Better.
              </h1>
              <p className="text-[#FFF] text-[18px] opacity-80 max-w-[500px] leading-relaxed font-body-lg">
                Buy materials, hire professionals and manage projects from one unified platform.
              </p>
            </div>

            {/* Trust Metrics 2x2 */}
            <div className="grid grid-cols-2 gap-lg border-t border-b border-white/10 py-xl my-xl z-10 text-left">
              <div>
                <p className="text-[28px] font-bold text-primary">10,000+</p>
                <p className="text-xs text-white/60 font-semibold font-label-caps uppercase tracking-wide">Products</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-primary">5,000+</p>
                <p className="text-xs text-white/60 font-semibold font-label-caps uppercase tracking-wide">Professionals</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-primary">500+</p>
                <p className="text-xs text-white/60 font-semibold font-label-caps uppercase tracking-wide">Cities Covered</p>
              </div>
              <div>
                <p className="text-[28px] font-bold text-primary">25,000+</p>
                <p className="text-xs text-white/60 font-semibold font-label-caps uppercase tracking-wide">Projects Delivered</p>
              </div>
            </div>

            {/* Trust status footer */}
            <div className="flex justify-between items-center text-xs text-white/50 pt-md z-10 border-t border-white/5">
              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-green-500">verified_user</span> Secure SSL</span>
              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-green-500">verified</span> GST Verified</span>
              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px] text-green-500">shield</span> Verified Pros</span>
            </div>
          </div>

          {/* RIGHT AUTHENTICATION PANEL */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-xs md:p-sm">
            
            {/* Mobile-Only Header Branding */}
            <div className="lg:hidden flex flex-col items-center text-center space-y-sm mb-lg">
              <a href="#/">
                <img
                  alt="ARCUS"
                  className="w-[120px] h-auto object-contain brightness-0"
                  src="/logo.png"
                />
              </a>
              <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-extrabold leading-tight">
                Build Faster. Procure Smarter.
              </h2>
              <p className="text-secondary text-sm">
                Materials, professionals, and project tools combined.
              </p>
            </div>

            <div className="w-full max-w-[520px] bg-white border border-[#E9ECEF] rounded-[24px] p-lg md:p-[48px] shadow-sm relative transition-all duration-300">
              
              {/* EMAIL VERIFICATION SECTION */}
              {isVerifyingEmail ? (
                <div className="space-y-lg animate-fadeIn text-left">
                  <div className="space-y-xs text-left">
                    <button 
                      onClick={() => {
                        setIsVerifyingEmail(false);
                        setEmailOtpError('');
                        setEmailOtpSuccess('');
                        setEmailOtpCode('');
                      }}
                      className="text-xs text-secondary hover:text-[#0A0A0A] flex items-center gap-xs mb-sm font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back to login/register
                    </button>
                    <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold font-sans">Verify Your Email</h2>
                    <p className="text-secondary text-xs">
                      We have sent a 6-digit verification code to <span className="font-bold text-[#0A0A0A]">{verifyingEmailAddress}</span> using Resend.
                    </p>
                  </div>

                  {emailOtpError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r text-left animate-fadeIn">
                      {emailOtpError}
                    </div>
                  )}

                  {emailOtpSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-sm text-green-700 text-xs rounded-r text-left animate-fadeIn">
                      {emailOtpSuccess}
                    </div>
                  )}

                  <form onSubmit={handleVerifyEmailOtpSubmit} className="space-y-md text-left">
                    <div className="flex flex-col gap-xs">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">6-Digit Verification Code</label>
                      <input
                        type="text"
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                        className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-center text-lg tracking-widest outline-none focus:border-2 focus:border-primary focus:ring-0 font-bold"
                        placeholder="0 0 0 0 0 0"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={emailOtpLoading || emailOtpCode.length !== 6}
                      className="w-full bg-primary hover:bg-[#fabd00] disabled:bg-gray-100 disabled:text-gray-400 disabled:opacity-50 text-[#0A0A0A] font-bold h-11 rounded transition-colors shadow flex items-center justify-center gap-xs"
                    >
                      {emailOtpLoading ? 'Verifying...' : 'Verify Email'}
                    </button>

                    <div className="text-center pt-xs">
                      <button
                        type="button"
                        onClick={handleResendEmailOtp}
                        disabled={emailOtpCountdown > 0}
                        className="text-xs font-bold text-primary hover:underline disabled:text-gray-400"
                      >
                        {emailOtpCountdown > 0 ? `Resend Code in ${emailOtpCountdown}s` : 'Resend Verification Email'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : successState ? (
                <div className="text-center space-y-lg py-lg">
                  <span className="material-symbols-outlined text-[72px] text-green-600 animate-bounce block">check_circle</span>
                  
                  {successState === 'Individual' && (
                    <>
                      <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold">Welcome to ARCUS</h2>
                      <p className="text-secondary text-sm leading-relaxed">
                        Your personal account has been created. Start browsing materials or contracting professional services today.
                      </p>
                      <div className="grid grid-cols-2 gap-md pt-md">
                        <a
                          href="#/materials"
                          className="py-3 bg-primary text-[#0A0A0A] font-bold rounded text-center hover:bg-[#fabd00] transition-colors"
                        >
                          Browse Products
                        </a>
                        <a
                          href="#/services"
                          className="py-3 bg-[#0A0A0A] text-white font-bold rounded text-center hover:bg-[#212529] transition-colors"
                        >
                          Browse Services
                        </a>
                      </div>
                    </>
                  )}

                  {successState === 'Business' && (
                    <>
                      <h2 className="font-headline-h2 text-[26px] text-[#0A0A0A] font-bold leading-tight">Business Account Created</h2>
                      
                      {/* B2B benefits checklist */}
                      <div className="bg-[#FFFDF5] border border-primary/20 rounded p-md text-left space-y-xs max-w-sm mx-auto">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider font-label-caps">B2B Core Benefits Activated</p>
                        <ul className="space-y-1 text-xs text-secondary font-medium pt-1">
                          <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-green-600 text-sm">check</span> GST Input Invoices</li>
                          <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-green-600 text-sm">check</span> Tiered Bulk Pricing</li>
                          <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-green-600 text-sm">check</span> Digital RFQ Submissions</li>
                          <li className="flex items-center gap-xs"><span className="material-symbols-outlined text-green-600 text-sm">check</span> Procurement Dashboard</li>
                        </ul>
                      </div>

                      <div className="grid grid-cols-2 gap-md pt-md">
                        <a
                          href="#/materials"
                          className="py-3 bg-primary text-[#0A0A0A] font-bold rounded text-center hover:bg-[#fabd00] transition-colors"
                        >
                          Browse Materials
                        </a>
                        <a
                          href="#/"
                          className="py-3 bg-[#0A0A0A] text-white font-bold rounded text-center hover:bg-[#212529] transition-colors"
                        >
                          Create RFQ
                        </a>
                      </div>
                    </>
                  )}

                  {successState === 'Professional' && (
                    <>
                      <h2 className="font-headline-h2 text-[28px] text-[#0A0A0A] font-bold">Partner Profile Setup</h2>
                      <p className="text-secondary text-sm leading-relaxed">
                        Your profile is active. Completing registration allows you to receive localized leads and send quotes.
                      </p>
                      <div className="flex flex-col gap-sm pt-md">
                        <a
                          href="#/professional-dashboard"
                          className="py-3 bg-primary text-[#0A0A0A] font-bold rounded text-center hover:bg-[#fabd00] transition-colors"
                        >
                          Complete Profile
                        </a>
                        <a
                          href="#/professional-dashboard"
                          className="py-3 bg-transparent border border-[#0A0A0A] text-[#0A0A0A] font-bold rounded text-center hover:bg-[#F8F9FA] transition-colors"
                        >
                          Upload Portfolio
                        </a>
                      </div>
                    </>
                  )}
                </div>
              ) : forgotPasswordStep > 0 ? (
                
                /* FORGOT PASSWORD FLOW */
                <div className="space-y-lg">
                  <div className="space-y-xs text-left">
                    <button 
                      onClick={() => setForgotPasswordStep(0)}
                      className="text-xs text-secondary hover:text-[#0A0A0A] flex items-center gap-xs mb-sm font-semibold"
                    >
                      <span className="material-symbols-outlined text-sm">arrow_back</span> Back to login
                    </button>
                    <h2 className="font-headline-h2 text-[32px] text-[#0A0A0A] font-bold font-sans">Forgot Password</h2>
                    <p className="text-secondary text-xs">
                      {forgotPasswordStep === 1 && "Enter your email or phone to receive a verification OTP."}
                      {forgotPasswordStep === 2 && "A 6-digit OTP code has been dispatched. Enter it below to proceed."}
                      {forgotPasswordStep === 3 && "Create a secure new password for your account."}
                    </p>
                  </div>

                  {forgotError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r text-left">
                      {forgotError}
                    </div>
                  )}

                  {forgotSuccess && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-sm text-green-700 text-xs rounded-r text-left">
                      {forgotSuccess}
                    </div>
                  )}

                  {/* Step 1: Input Contact */}
                  {forgotPasswordStep === 1 && (
                    <form onSubmit={handleForgotSubmit} className="space-y-md text-left">
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Email Or Mobile Number</label>
                        <input
                          type="text"
                          value={forgotEmailOrPhone}
                          onChange={(e) => setForgotEmailOrPhone(e.target.value)}
                          className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                          placeholder="e.g. name@company.com or 9999988888"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-[#0A0A0A] font-bold h-11 rounded hover:bg-[#fabd00] transition-colors shadow"
                      >
                        Send Verification OTP
                      </button>
                    </form>
                  )}

                  {/* Step 2: Input OTP */}
                  {forgotPasswordStep === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-md text-left">
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">6-Digit Verification Code</label>
                        <input
                          type="text"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                          className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-center text-lg tracking-widest outline-none focus:border-2 focus:border-primary focus:ring-0 font-bold"
                          placeholder="0 0 0 0 0 0"
                          required
                        />
                        <p className="text-[10px] text-secondary mt-1">Hint: Use the test bypass code <span className="font-bold text-[#0A0A0A]">123456</span></p>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-[#0A0A0A] font-bold h-11 rounded hover:bg-[#fabd00] transition-colors shadow"
                      >
                        Verify Code
                      </button>
                    </form>
                  )}

                  {/* Step 3: Enter New Password */}
                  {forgotPasswordStep === 3 && (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-md text-left">
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">New Password</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                          placeholder="Min 6 characters"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Confirm New Password</label>
                        <input
                          type="password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                          placeholder="Retype password"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-[#0A0A0A] font-bold h-11 rounded hover:bg-[#fabd00] transition-colors shadow"
                      >
                        Reset Password
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                
                /* GENERAL TAB CONTROLS (LOGIN vs REGISTER) */
                <div className="space-y-lg">
                  {/* Tab Selector */}
                  <div className="flex border-b border-[#E9ECEF] -mx-lg px-lg">
                    <button
                      onClick={() => {
                        setActiveTab('login');
                        setLoginError('');
                      }}
                      className={`pb-md font-bold text-sm uppercase tracking-wider relative flex-1 transition-all ${
                        activeTab === 'login' 
                          ? 'text-[#0A0A0A]' 
                          : 'text-[#6C757D] hover:text-[#0A0A0A]'
                      }`}
                    >
                      Login
                      {activeTab === 'login' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('register');
                        setIndError('');
                        setBusError('');
                        setProError('');
                      }}
                      className={`pb-md font-bold text-sm uppercase tracking-wider relative flex-1 transition-all ${
                        activeTab === 'register' 
                          ? 'text-[#0A0A0A]' 
                          : 'text-[#6C757D] hover:text-[#0A0A0A]'
                      }`}
                    >
                      Register
                      {activeTab === 'register' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                      )}
                    </button>
                  </div>

                  {/* LOGIN SECTION */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLoginSubmit} noValidate className="space-y-md text-left">
                      <div className="space-y-xs">
                        <h2 className="font-headline-h2 text-[32px] text-[#0A0A0A] font-bold font-sans">Welcome Back</h2>
                        <p className="text-secondary text-xs">Sign in to continue to ARCUS.</p>
                      </div>

                      {loginError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                          {loginError}
                        </div>
                      )}

                      {/* Standard email/password login fields */}
                      <div className="flex flex-col gap-xs">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Email Address</label>
                        <input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className={`bg-white border rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0 ${
                            loginErrors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E9ECEF]'
                          }`}
                          placeholder="e.g. name@company.com"
                        />
                        {loginErrors.email && (
                          <p className="text-red-500 text-[10px] font-semibold mt-0.5">{loginErrors.email}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-xs">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Password</label>
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="text-xs text-secondary hover:text-[#0A0A0A] flex items-center gap-xs font-semibold"
                          >
                            <span className="material-symbols-outlined text-[16px]">{showLoginPassword ? 'visibility_off' : 'visibility'}</span>
                            {showLoginPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <input
                          id="login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className={`bg-white border rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0 ${
                            loginErrors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E9ECEF]'
                          }`}
                          placeholder="Enter password"
                        />
                        {loginErrors.password && (
                          <p className="text-red-500 text-[10px] font-semibold mt-0.5">{loginErrors.password}</p>
                        )}
                      </div>

                      {/* Options Row */}
                      <div className="flex justify-between items-center text-xs">
                        <label className="flex items-center gap-xs cursor-pointer select-none text-secondary">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded border-[#E9ECEF] text-primary focus:ring-primary focus:ring-offset-0"
                          />
                          Remember Me
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotPasswordStep(1)}
                          className="text-secondary hover:text-[#0A0A0A] font-semibold"
                        >
                          Forgot Password?
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-[56px] rounded transition-all shadow disabled:opacity-50 mt-sm flex items-center justify-center gap-xs"
                      >
                        {loginLoading ? 'Signing In...' : 'Login'}
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-sm text-[#E9ECEF] font-bold uppercase tracking-widest text-[10px] font-label-caps py-sm">
                        <div className="flex-1 h-px bg-[#E9ECEF]"></div>
                        OR
                        <div className="flex-1 h-px bg-[#E9ECEF]"></div>
                      </div>

                      {/* Social Login Buttons */}
                      <div className="grid grid-cols-2 gap-sm">
                        <button
                          type="button"
                          onClick={() => alert('Simulator: OAuth integration triggers in production.')}
                          className="flex items-center justify-center gap-sm h-11 border border-[#E9ECEF] rounded hover:bg-[#F8F9FA] transition-colors text-xs font-semibold text-[#212529]"
                        >
                          <img src="https://lh3.googleusercontent.com/COxitfgSths3uwXA1Q0lhbhWSX1l526RGL0EGP5cITd45hH8J4O-CslmMN166w6v-Yg" className="w-4 h-4 object-contain" alt="Google" />
                          Google
                        </button>
                        <button
                          type="button"
                          onClick={() => alert('Simulator: OAuth integration triggers in production.')}
                          className="flex items-center justify-center gap-sm h-11 border border-[#E9ECEF] rounded hover:bg-[#F8F9FA] transition-colors text-xs font-semibold text-[#212529]"
                        >
                          <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" className="w-4 h-4 object-contain" alt="LinkedIn" />
                          LinkedIn
                        </button>
                      </div>

                      <div className="text-center text-xs text-secondary mt-lg">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('register')}
                          className="font-bold text-[#0A0A0A] hover:underline"
                        >
                          Create Account
                        </button>
                      </div>
                    </form>
                  )}

                  {/* REGISTRATION SECTION */}
                  {activeTab === 'register' && (
                    <div className="space-y-lg text-left">
                      <div className="space-y-xs">
                        <h2 className="font-headline-h2 text-[32px] text-[#0A0A0A] font-bold font-sans">Create Your ARCUS Account</h2>
                        <p className="text-secondary text-xs">Choose how you would like to use ARCUS.</p>
                      </div>

                      {/* 3 Account Type Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-sm pb-sm">
                        
                        {/* B2C Card */}
                        <div
                          onClick={() => {
                            setAccountType('Individual');
                            setIndError('');
                          }}
                          className={`h-[100px] rounded-[20px] border p-md flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                            accountType === 'Individual'
                              ? 'border-primary bg-[#FFF8E1] shadow-sm'
                              : 'border-[#E9ECEF] bg-white hover:border-primary hover:bg-[#FFFDF5]'
                          }`}
                        >
                          <div className="space-y-xs flex flex-col items-center">
                            <span className="material-symbols-outlined text-[28px] text-primary block">home</span>
                            <h4 className="font-bold text-sm md:text-base text-[#0A0A0A]">Retail</h4>
                          </div>
                        </div>

                        {/* B2B Card */}
                        <div
                          onClick={() => {
                            setAccountType('Business');
                            setBusError('');
                          }}
                          className={`h-[100px] rounded-[20px] border p-md flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                            accountType === 'Business'
                              ? 'border-primary bg-[#FFF8E1] shadow-sm'
                              : 'border-[#E9ECEF] bg-white hover:border-primary hover:bg-[#FFFDF5]'
                          }`}
                        >
                          <div className="space-y-xs flex flex-col items-center">
                            <span className="material-symbols-outlined text-[28px] text-primary block">business</span>
                            <h4 className="font-bold text-sm md:text-base text-[#0A0A0A]">Business (B2B)</h4>
                          </div>
                        </div>

                        {/* Professional Card */}
                        <div
                          onClick={() => {
                            setAccountType('Professional');
                            setProError('');
                          }}
                          className={`h-[100px] rounded-[20px] border p-md flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
                            accountType === 'Professional'
                              ? 'border-primary bg-[#FFF8E1] shadow-sm'
                              : 'border-[#E9ECEF] bg-white hover:border-primary hover:bg-[#FFFDF5]'
                          }`}
                        >
                          <div className="space-y-xs flex flex-col items-center">
                            <span className="material-symbols-outlined text-[28px] text-primary block">engineering</span>
                            <h4 className="font-bold text-sm md:text-base text-[#0A0A0A]">Professional</h4>
                          </div>
                        </div>
                      </div>

                      {/* DYNAMIC FORMS BASED ON SELECTED TYPE */}
                      
                      {/* 1. INDIVIDUAL FORM */}
                      {accountType === 'Individual' && (
                        <form onSubmit={handleIndividualSubmit} className="space-y-md border-t border-[#E9ECEF] pt-lg">
                          <h3 className="font-bold text-[#0A0A0A] text-sm font-sans">Personal Information</h3>
                          
                          {indError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                              {indError}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Full Name</label>
                              <input
                                type="text"
                                value={indName}
                                onChange={(e) => setIndName(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="John Doe"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Mobile Number</label>
                              <input
                                type="tel"
                                value={indPhone}
                                onChange={(e) => setIndPhone(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="9999988888"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-xs">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Email Address</label>
                            <input
                              type="email"
                              value={indEmail}
                              onChange={(e) => setIndEmail(e.target.value)}
                              className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                              placeholder="name@gmail.com"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">City</label>
                              <input
                                type="text"
                                value={indCity}
                                onChange={(e) => setIndCity(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Bangalore"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">State</label>
                              <input
                                type="text"
                                value={indState}
                                onChange={(e) => setIndState(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Karnataka"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Password</label>
                              <input
                                type="password"
                                value={indPassword}
                                onChange={(e) => setIndPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Min 6 characters"
                                minLength={6}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Confirm Password</label>
                              <input
                                type="password"
                                value={indConfirmPassword}
                                onChange={(e) => setIndConfirmPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Retype password"
                                required
                              />
                            </div>
                          </div>

                          <label className="flex items-start gap-xs text-xs text-secondary cursor-pointer select-none py-xs">
                            <input
                              type="checkbox"
                              checked={indAgree}
                              onChange={(e) => setIndAgree(e.target.checked)}
                              className="rounded border-[#E9ECEF] text-primary focus:ring-primary focus:ring-offset-0 mt-0.5"
                              required
                            />
                            <span>I Agree To Terms &amp; Conditions and privacy policy of ARCUS Groups.</span>
                          </label>

                          <button
                            type="submit"
                            disabled={indLoading}
                            className="w-full bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-11 rounded transition-all shadow disabled:opacity-50 mt-sm"
                          >
                            {indLoading ? 'Creating Account...' : 'Create Account'}
                          </button>
                        </form>
                      )}

                      {/* 2. BUSINESS FORM */}
                      {accountType === 'Business' && (
                        <form onSubmit={handleBusinessSubmit} className="space-y-md border-t border-[#E9ECEF] pt-lg">
                          <h3 className="font-bold text-[#0A0A0A] text-sm font-sans flex items-center gap-xs">
                            <span className="material-symbols-outlined text-primary text-md">business_center</span>
                            Business Information
                          </h3>

                          {busError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                              {busError}
                            </div>
                          )}

                          <div className="flex flex-col gap-xs relative">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">GST Number</label>
                            <div className="flex gap-sm">
                              <input
                                type="text"
                                value={busGst}
                                onChange={(e) => setBusGst(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0 flex-1 uppercase"
                                placeholder="e.g. 29GGGGG1314R9Z6"
                                required
                              />
                              <button
                                type="button"
                                onClick={handleVerifyGst}
                                disabled={gstVerifying}
                                className="bg-[#0A0A0A] text-white hover:bg-[#212529] font-bold px-lg rounded h-11 text-xs transition-colors shadow disabled:opacity-50 whitespace-nowrap"
                              >
                                {gstVerifying ? 'Verifying...' : 'Verify GST'}
                              </button>
                            </div>
                            <p className="text-[9px] text-secondary font-medium mt-1">Hint: Enter a valid GSTIN (e.g. <span className="font-bold text-[#0A0A0A]">29AACCG0527D1Z0</span> for Google Karnataka) and click Verify</p>
                          </div>

                          {gstVerified && (
                            <div className="bg-green-50 border border-green-600/10 rounded p-md space-y-xs transition-all animate-[fadeIn_0.3s_ease-out]">
                              <p className="text-xs text-green-700 font-bold flex items-center gap-xs">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                GST Verified: {busName}
                              </p>
                              <div className="grid grid-cols-2 gap-sm text-[11px] text-secondary">
                                <div>
                                  <span className="font-bold block text-[#0A0A0A]">Address</span>
                                  {busAddress}
                                </div>
                                <div>
                                  <span className="font-bold block text-[#0A0A0A]">State</span>
                                  {busState}
                                </div>
                                <div className="col-span-2 flex gap-md">
                                  <span><span className="font-bold text-[#0A0A0A]">GST Status:</span> {busGstStatus}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-xs">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Business Name</label>
                            <input
                              type="text"
                              value={busName}
                              onChange={(e) => setBusName(e.target.value)}
                              className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                              placeholder="Business Name"
                              required
                            />
                          </div>

                          <h3 className="font-bold text-[#0A0A0A] text-xs font-sans border-t border-[#E9ECEF] pt-md mt-sm">Contact Person Details</h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Name</label>
                              <input
                                type="text"
                                value={busContactName}
                                onChange={(e) => setBusContactName(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Contact Name"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Contact Mobile</label>
                              <input
                                type="tel"
                                value={busContactPhone}
                                onChange={(e) => setBusContactPhone(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="9999988888"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-xs">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Contact Email</label>
                            <input
                              type="email"
                              value={busContactEmail}
                              onChange={(e) => setBusContactEmail(e.target.value)}
                              className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                              placeholder="name@company.com"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Password</label>
                              <input
                                type="password"
                                value={busPassword}
                                onChange={(e) => setBusPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Min 6 characters"
                                minLength={6}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Confirm Password</label>
                              <input
                                type="password"
                                value={busConfirmPassword}
                                onChange={(e) => setBusConfirmPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Retype password"
                                required
                              />
                            </div>
                          </div>

                          {/* Business Benefits Summary Sidebar */}
                          <div className="bg-[#FFF8E1]/40 border border-primary/20 rounded p-md space-y-2">
                            <p className="text-xs font-bold text-primary font-label-caps uppercase tracking-wide">Included Corporate Benefits</p>
                            <div className="grid grid-cols-2 gap-xs text-[11px] text-secondary font-medium">
                              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px] text-primary">receipt_long</span> GST Tax Invoicing</span>
                              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px] text-primary">sell</span> Tiered Bulk Pricing</span>
                              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px] text-primary">text_snippet</span> Digital RFQ Submissions</span>
                              <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[14px] text-primary">dashboard</span> Procurement Manager</span>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={busLoading}
                            className="w-full bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-11 rounded transition-all shadow disabled:opacity-50 mt-sm"
                          >
                            {busLoading ? 'Creating Account...' : 'Create Business Account'}
                          </button>
                        </form>
                      )}

                      {/* 3. PROFESSIONAL FORM */}
                      {accountType === 'Professional' && (
                        <form onSubmit={handleProfessionalSubmit} className="space-y-md border-t border-[#E9ECEF] pt-lg">
                          <h3 className="font-bold text-[#0A0A0A] text-sm font-sans flex items-center gap-xs">
                            <span className="material-symbols-outlined text-primary text-md">engineering</span>
                            Professional Information
                          </h3>

                          {proError && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                              {proError}
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Full Name</label>
                              <input
                                type="text"
                                value={proName}
                                onChange={(e) => setProName(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Full Name"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Business / Studio Name</label>
                              <input
                                type="text"
                                value={proBusinessName}
                                onChange={(e) => setProBusinessName(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="e.g. Apex Electricals"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Email Address</label>
                              <input
                                type="email"
                                value={proEmail}
                                onChange={(e) => setProEmail(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="name@company.com"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Mobile Number</label>
                              <input
                                type="tel"
                                value={proPhone}
                                onChange={(e) => setProPhone(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="9999988888"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Service Category</label>
                              <select
                                value={proCategory}
                                onChange={(e) => setProCategory(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                              >
                                <option value="Plumbing">Plumbing</option>
                                <option value="Electrical">Electrical</option>
                                <option value="Carpentry">Carpentry</option>
                                <option value="Painting">Painting</option>
                                <option value="Civil Construction">Civil Construction</option>
                                <option value="Architecture">Architecture</option>
                                <option value="Interior Design">Interior Design</option>
                                <option value="Maintenance">Maintenance</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Experience (Years)</label>
                              <input
                                type="number"
                                value={proExperience}
                                onChange={(e) => setProExperience(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="e.g. 5"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">City</label>
                              <input
                                type="text"
                                value={proCity}
                                onChange={(e) => setProCity(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Mumbai"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">State</label>
                              <input
                                type="text"
                                value={proState}
                                onChange={(e) => setProState(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Maharashtra"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Password</label>
                              <input
                                type="password"
                                value={proPassword}
                                onChange={(e) => setProPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Min 6 characters"
                                minLength={6}
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Confirm Password</label>
                              <input
                                type="password"
                                value={proConfirmPassword}
                                onChange={(e) => setProConfirmPassword(e.target.value)}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                placeholder="Retype password"
                                required
                              />
                            </div>
                          </div>

                          <div className="border-t border-[#E9ECEF] pt-md space-y-sm">
                            <h4 className="font-bold text-[#0A0A0A] text-xs font-sans">Business Details (Optional)</h4>
                            <div className="flex flex-col gap-xs">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">GST Number</label>
                              <input
                                type="text"
                                value={proGst}
                                onChange={(e) => setProGst(e.target.value.toUpperCase())}
                                className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0 uppercase"
                                placeholder="GSTIN"
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                              <div className="flex flex-col gap-xs">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Website URL</label>
                                <input
                                  type="url"
                                  value={proWebsite}
                                  onChange={(e) => setProWebsite(e.target.value)}
                                  className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                  placeholder="https://company.com"
                                />
                              </div>
                              <div className="flex flex-col gap-xs">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-secondary font-label-caps">Portfolio URL</label>
                                <input
                                  type="url"
                                  value={proPortfolio}
                                  onChange={(e) => setProPortfolio(e.target.value)}
                                  className="bg-white border border-[#E9ECEF] rounded h-11 px-md text-body-sm outline-none focus:border-2 focus:border-primary focus:ring-0"
                                  placeholder="https://behance.net/portfolio"
                                />
                              </div>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={proLoading}
                            className="w-full bg-primary hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-11 rounded transition-all shadow disabled:opacity-50 mt-sm"
                          >
                            {proLoading ? 'Joining...' : 'Join As Professional'}
                          </button>
                        </form>
                      )}

                      <div className="text-center text-xs text-secondary mt-lg">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="font-bold text-[#0A0A0A] hover:underline"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
