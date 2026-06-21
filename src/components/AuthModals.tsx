import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModals: React.FC<AuthModalsProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'Buyer' | 'Contractor' | 'Supplier'>('Buyer');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // Success flow
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    
    if (res.success) {
      setSuccessMsg('Successfully logged in!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        // Clear forms
        setLoginEmail('');
        setLoginPassword('');
      }, 1500);
    } else {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validations
    if (password !== confirmPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setRegisterError('Please enter a valid 10-digit phone number.');
      return;
    }

    if (role !== 'Buyer' && !companyName.trim()) {
      setRegisterError('Company name is required for Contractors and Suppliers.');
      return;
    }

    setRegisterLoading(true);
    const res = await register({
      name,
      email,
      phone,
      password,
      companyName: companyName || undefined,
      role
    });
    setRegisterLoading(false);

    if (res.success) {
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
        // Clear forms
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setCompanyName('');
        setRole('Buyer');
      }, 1500);
    } else {
      setRegisterError(res.error || 'Failed to register');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] flex items-center justify-center p-md md:p-lg">
      <div className="bg-white rounded-[24px] border border-[#E9ECEF] w-full max-w-lg p-lg md:p-xl space-y-lg text-left shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-sm hover:bg-[#F8F9FA] rounded-full text-[#6C757D] transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {successMsg ? (
          <div className="py-xl text-center space-y-md">
            <span className="material-symbols-outlined text-[64px] text-green-600 animate-bounce block">check_circle</span>
            <h3 className="font-headline-h3 text-[24px] text-[#0A0A0A] font-extrabold">{successMsg}</h3>
            <p className="text-secondary text-sm">Welcome to Arcus Construction Commerce.</p>
          </div>
        ) : (
          <>
            {/* Header Tabs */}
            <div className="flex border-b border-[#E9ECEF] -mx-lg px-lg">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setLoginError('');
                  setRegisterError('');
                }}
                className={`pb-md font-bold text-sm uppercase tracking-wider relative flex-1 transition-all ${
                  activeTab === 'login' 
                    ? 'text-[#0A0A0A]' 
                    : 'text-[#6C757D] hover:text-[#0A0A0A]'
                }`}
              >
                Sign In
                {activeTab === 'login' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC107] rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setLoginError('');
                  setRegisterError('');
                }}
                className={`pb-md font-bold text-sm uppercase tracking-wider relative flex-1 transition-all ${
                  activeTab === 'register' 
                    ? 'text-[#0A0A0A]' 
                    : 'text-[#6C757D] hover:text-[#0A0A0A]'
                }`}
              >
                Register
                {activeTab === 'register' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FFC107] rounded-t-full" />
                )}
              </button>
            </div>

            {/* Form */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-md">
                <div className="space-y-xs">
                  <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Welcome back to ARCUS</h3>
                  <p className="text-secondary text-xs">Enter your details to sign in and manage your procurement.</p>
                </div>

                {loginError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                    {loginError}
                  </div>
                )}

                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Email Address</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-11 rounded-[12px] transition-colors shadow disabled:opacity-50 mt-sm flex items-center justify-center gap-xs"
                >
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                  <span className="material-symbols-outlined text-sm">login</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-sm">
                <div className="space-y-xs">
                  <h3 className="font-headline-h3 text-[22px] text-[#0A0A0A] font-extrabold">Create Business Account</h3>
                  <p className="text-secondary text-xs">Register your company profile to access B2B custom quotes and price tiers.</p>
                </div>

                {registerError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-sm text-red-700 text-xs rounded-r">
                    {registerError}
                  </div>
                )}

                {/* Role selection tab button group */}
                <div className="flex flex-col gap-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">B2B Account Type</label>
                  <div className="grid grid-cols-3 gap-xs bg-[#F8F9FA] p-xs rounded-lg">
                    {(['Buyer', 'Contractor', 'Supplier'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setRole(r);
                          setRegisterError('');
                        }}
                        className={`py-xs px-xs font-bold text-xs rounded-md text-center transition-all ${
                          role === r 
                            ? 'bg-white text-[#0A0A0A] shadow-sm' 
                            : 'text-[#6C757D] hover:text-[#0A0A0A]'
                        }`}
                      >
                        {r === 'Buyer' ? 'Builder/Buyer' : r === 'Contractor' ? 'Contractor' : 'Supplier'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Contact Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. 9999988888"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">
                      Company Name {role === 'Buyer' ? '(Optional)' : '(Required)'}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="e.g. Acme Infra"
                      required={role !== 'Buyer'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6C757D] font-label-caps">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white border border-[#E9ECEF] rounded-lg h-11 px-md text-body-sm outline-none focus:border-2 focus:border-[#FFC107] focus:ring-0"
                      placeholder="Retype password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-[#FFC107] hover:bg-[#fabd00] text-[#0A0A0A] font-bold h-11 rounded-[12px] transition-colors shadow disabled:opacity-50 mt-sm flex items-center justify-center gap-xs"
                >
                  {registerLoading ? 'Creating Account...' : 'Register Company'}
                  <span className="material-symbols-outlined text-sm">badge</span>
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
