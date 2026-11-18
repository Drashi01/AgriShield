import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState('farmer'); // 'farmer' | 'trader'
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'id'
  
  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [apmcLicense, setApmcLicense] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'farmer') {
      setIdentifier('');
    } else {
      setIdentifier('');
    }
  };

  const handleQuickDemoLogin = (role) => {
    setIsLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      login(role, { isDemo: true });
      setIsLoading(false);
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg(
        selectedRole === 'farmer'
          ? 'Please enter your Mobile Number or PM-KISAN ID'
          : 'Please enter your Mobile Number or APMC License No.'
      );
      return;
    }

    if (!isRegisterMode && !password.trim()) {
      setErrorMsg('Please enter your password / OTP PIN');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (selectedRole === 'farmer') {
        login('farmer', {
          name: fullName || 'Ramesh Kumar',
          identifier,
          zone: location || 'Punjab Zone 4',
        });
      } else {
        login('trader', {
          name: fullName || 'Vikram Sethi',
          company: companyName || 'Apex Agro Millers',
          apmcLicense: apmcLicense || 'PB-MND-88219',
          identifier,
        });
      }
      setIsLoading(false);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07241A] via-[#0A3D2C] to-[#041A13] text-white flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-40 -mb-40" />

      {/* Top Brand Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex items-center justify-between border-b border-emerald-900/40 bg-emerald-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/50">
            <span className="material-symbols-outlined text-[26px] font-bold">potted_plant</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              AgriShield <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">Unified Agri Portal</span>
            </h1>
            <p className="text-xs text-emerald-200/70 font-medium hidden sm:block">
              India's Premier Digital Agriculture & Direct Farm-to-Trader Marketplace
            </p>
          </div>
        </div>

        {/* Language & Help Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 bg-emerald-900/50 border border-emerald-700/40 px-3 py-1.5 rounded-full text-xs text-emerald-200">
            <span className="material-symbols-outlined text-[16px] text-emerald-400">verified_user</span>
            <span>e-NAM & SBI Escrow Protected</span>
          </div>
          <button
            onClick={() => alert('AgriShield 24x7 Kisan & Vyapari Helpline: 1800-180-1551 (Toll Free)')}
            className="flex items-center gap-1 text-xs bg-emerald-800/50 hover:bg-emerald-700/60 px-3 py-1.5 rounded-xl border border-emerald-600/40 text-emerald-100 transition"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>Helpline</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[980px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Hero Card / Benefits Banner */}
          <div className="lg:col-span-5 bg-gradient-to-b from-emerald-900/80 to-emerald-950/90 rounded-3xl p-7 border border-emerald-700/40 backdrop-blur-xl shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-800/70 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-600/50 mb-4">
                <span className="material-symbols-outlined text-[15px]">eco</span>
                <span>Direct Digital Mandi</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight mb-3">
                Empowering Farmers. Streamlining Traders.
              </h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed mb-6">
                Connect directly without middlemen. Sell crops at competitive live wholesale auctions or source fresh harvest lots directly from verified farm gates.
              </p>

              {/* Persona Features List */}
              <div className="space-y-3.5 mb-6">
                <div className={`p-3 rounded-2xl transition border ${selectedRole === 'farmer' ? 'bg-emerald-800/70 border-emerald-400/60' : 'bg-emerald-950/50 border-emerald-800/40 opacity-80'}`}>
                  <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-200">
                    <span className="material-symbols-outlined text-amber-400 text-[20px]">agriculture</span>
                    <span>For Farmers (किसान भाई):</span>
                  </div>
                  <p className="text-xs text-emerald-100/70 mt-1 pl-7">
                    • AI Crop Pathology Scanner (95% Accuracy)<br />
                    • Multi-Trader Live Bidding Floor<br />
                    • Instant SBI Escrow Direct Payout
                  </p>
                </div>

                <div className={`p-3 rounded-2xl transition border ${selectedRole === 'trader' ? 'bg-emerald-800/70 border-emerald-400/60' : 'bg-emerald-950/50 border-emerald-800/40 opacity-80'}`}>
                  <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-200">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]">storefront</span>
                    <span>For Traders & Millers (व्यापारी एवं खरीदार):</span>
                  </div>
                  <p className="text-xs text-emerald-100/70 mt-1 pl-7">
                    • Dedicated Crop Buying & Procurement Page<br />
                    • Direct Farm-Gate Bulk Sourcing at Floor Price<br />
                    • Verified Moisture & Quality Assaying Reports
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Footer Badges */}
            <div className="pt-4 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300/80">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-400">shield</span>
                APMC & GST Verified
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-amber-400">lock</span>
                256-Bit Escrow Vault
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-400">bolt</span>
                Instant Payouts
              </span>
            </div>
          </div>

          {/* Right Login Form Card */}
          <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-7 sm:p-9 shadow-2xl flex flex-col justify-between border border-slate-200 relative">
            
            <div>
              {/* Role Selection Tabs */}
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Your Account Role / भूमिका चुनें
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('farmer')}
                    className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">agriculture</span>
                    <span>Farmer (किसान)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('trader')}
                    className={`flex items-center justify-center gap-2.5 py-3 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                      selectedRole === 'trader'
                        ? 'bg-emerald-900 text-white shadow-md shadow-slate-950/20 scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">storefront</span>
                    <span>Trader (व्यापारी/खरीदार)</span>
                  </button>
                </div>
              </div>

              {/* Header Title for Active Role */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    {selectedRole === 'farmer' ? '🌾 Farmer Login' : '🏢 Trader & Buyer Login'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedRole === 'farmer'
                      ? 'Access your farm dashboard, AI diagnostic scanner, and live crop auctions'
                      : 'Access the dedicated crop buying portal to purchase crops directly from farmers'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  {isRegisterMode ? 'Switch to Sign In' : 'New? Register'}
                </button>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login / Register Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (पूरा नाम) *
                    </label>
                    <input
                      type="text"
                      placeholder={selectedRole === 'farmer' ? 'e.g. Ramesh Kumar' : 'e.g. Vikram Sethi'}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 text-sm font-medium"
                      required
                    />
                  </div>
                )}

                {isRegisterMode && selectedRole === 'trader' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Company / Business Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Agro Millers Ltd."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        APMC License / GSTIN *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PB-MND-88219"
                        value={apmcLicense}
                        onChange={(e) => setApmcLicense(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                {isRegisterMode && selectedRole === 'farmer' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Farm Location / Village & District *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Khanna, Ludhiana (Punjab Zone 4)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                      required
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      {selectedRole === 'farmer'
                        ? 'Mobile Number or PM-KISAN ID'
                        : 'Mobile Number, APMC License, or Work Email'}
                    </label>
                    <span className="text-[11px] text-emerald-700 font-bold">Aadhaar / KYC Verified</span>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      {selectedRole === 'farmer' ? 'smartphone' : 'badge'}
                    </span>
                    <input
                      type="text"
                      placeholder={
                        selectedRole === 'farmer'
                          ? 'Enter 10-digit Mobile or PB-9921-4820'
                          : 'Enter Phone or APMC License (e.g. PB-MND-88219)'
                      }
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password or 6-Digit OTP (पासवर्ड / ओटीपी)
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Demo Mode: You can enter any 4+ characters or click the 1-Click Demo Login button below!')}
                      className="text-[11px] text-emerald-700 hover:underline font-bold"
                    >
                      Forgot / Request OTP?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                      lock
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-slate-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
                  </label>
                  <span className="text-[11px] text-slate-400">SSL Encrypted 🔒</span>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-lg transition flex items-center justify-center gap-2 ${
                    selectedRole === 'farmer'
                      ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/20 active:scale-[0.99]'
                      : 'bg-emerald-950 hover:bg-black shadow-slate-900/20 active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      <span>Authenticating Securely...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        {selectedRole === 'farmer' ? 'login' : 'shopping_cart_checkout'}
                      </span>
                      <span>
                        {isRegisterMode
                          ? `Complete Registration as ${selectedRole === 'farmer' ? 'Farmer' : 'Trader'}`
                          : selectedRole === 'farmer'
                          ? 'Sign In to Farmer Dashboard'
                          : 'Sign In to Trader Buying Portal'}
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Instant Demo Login Presets */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    ⚡ Instant 1-Click Test Logins (डेमो लॉगिन)
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                    Ready to Test
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('farmer')}
                    className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 text-left transition flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition">
                      👨‍🌾
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-emerald-950 truncate flex items-center gap-1">
                        Ramesh Kumar
                        <span className="material-symbols-outlined text-[13px] text-emerald-600 fill">verified</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium truncate">
                        Farmer • Punjab Zone 4
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('trader')}
                    className="p-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-left transition flex items-center gap-3 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition">
                      🏢
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 truncate flex items-center gap-1">
                        Vikram Sethi
                        <span className="material-symbols-outlined text-[13px] text-blue-600 fill">verified</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-medium truncate">
                        Trader • Apex Agro Millers
                      </div>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Support Footnote */}
            <div className="mt-4 pt-3 text-center text-[11px] text-slate-400">
              Government of India e-NAM & APMC Compliant Platform • 2026 AgriShield Digital Network
            </div>

          </div>

        </div>
      </main>

      {/* Footer Strip */}
      <footer className="relative z-10 py-3 text-center text-xs text-emerald-200/60 bg-emerald-950/80 border-t border-emerald-900/40">
        <span>AgriShield • Unified Agriculture Intelligence & Direct Crop Trading Floor</span>
      </footer>
    </div>
  );
}
