import React from 'react';
import { useApp } from '../context/AppContext';

export default function Profile({ onBack }) {
  const { farmerProfile, setFarmerProfile, outboxItems, syncAllOutbox, addNotification } = useApp();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
  ];

  const nowIST = new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const handleSelectLanguage = (langName) => {
    setFarmerProfile((prev) => ({ ...prev, language: langName }));
    addNotification('Language Updated', `Interface language preference set to ${langName}.`, 'translate');
  };

  const handleEditProfile = () => {
    const newName = prompt('Enter your full name:', farmerProfile.name);
    if (newName) {
      setFarmerProfile((prev) => ({ ...prev, name: newName }));
      addNotification('Profile Updated', `Farmer name updated to ${newName}.`, 'person');
    }
  };

  return (
    <main className="pt-[100px] md:pt-[110px] max-w-[1000px] mx-auto px-margin-mobile md:px-gutter pb-32 select-none">
      <div className="flex flex-col gap-6">
        {/* Header Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm border border-outline-variant/60">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg border-2 border-white">
              {farmerProfile.name?.slice(0, 2).toUpperCase() || 'RK'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-2xl font-bold text-on-surface">
                  {farmerProfile.name}
                </h2>
                <span className="material-symbols-outlined text-emerald-600 text-[20px] fill">
                  verified
                </span>
                <button
                  onClick={handleEditProfile}
                  className="text-xs text-primary font-bold hover:underline ml-1"
                >
                  [Edit]
                </button>
              </div>
              <p className="text-sm text-on-surface-variant font-medium">
                {farmerProfile.farmName} • {farmerProfile.zone}
              </p>
              <div className="inline-flex items-center gap-2 mt-2 bg-emerald-100/70 text-emerald-900 px-3 py-0.5 rounded-full text-xs font-bold">
                <span>🌾 PM-KISAN ID: {farmerProfile.pmKisanId}</span>
                <span>•</span>
                <span>Aadhaar KYC Verified</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-low px-4 py-2.5 rounded-2xl border border-outline-variant/40 text-left sm:text-right">
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider block">
              Indian Standard Time (IST)
            </span>
            <span className="font-mono text-base font-extrabold text-primary">
              {nowIST} (UTC+5:30)
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Land Records & Verification */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/50">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">landscape</span>
                Land Records &amp; Geo-Plots
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                8.5 Acres
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Khasra / Khatoni No.</span>
                <span className="font-bold text-on-surface">{farmerProfile.khasra}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Soil Type</span>
                <span className="font-bold text-on-surface">{farmerProfile.soilType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Primary Crops</span>
                <span className="font-bold text-on-surface">Basmati Paddy, Sharbati Wheat</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">Nearest APMC Mandi</span>
                <span className="font-bold text-primary">{farmerProfile.nearestMandi}</span>
              </div>
            </div>
          </div>

          {/* Direct Bank Escrow Account */}
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-outline-variant/50">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance</span>
                Escrow Payout Account
              </h3>
              <span className="bg-primary-fixed text-primary text-xs font-bold px-2.5 py-0.5 rounded-full">
                Active &amp; Verified
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Bank Name</span>
                <span className="font-bold text-on-surface">State Bank of India (SBI)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">Account No.</span>
                <span className="font-mono font-bold text-on-surface">{farmerProfile.sbiAccount}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-outline-variant/20">
                <span className="text-on-surface-variant">IFSC Code</span>
                <span className="font-mono font-bold text-on-surface">{farmerProfile.ifsc}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-on-surface-variant">UPI ID</span>
                <span className="font-bold text-emerald-800">{farmerProfile.upiId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Preferences */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/50 flex flex-col gap-5">
          <h3 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">translate</span>
            Regional Language / भाषा चयन ({farmerProfile.language})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.name)}
                className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center text-center ${
                  farmerProfile.language === lang.name
                    ? 'bg-primary text-white border-primary shadow-sm ring-2 ring-primary/40'
                    : 'bg-surface-container-low text-on-surface-variant border-outline-variant/50 hover:bg-surface-container'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <hr className="border-outline-variant/30 my-1" />

          {/* Offline Sync Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-on-surface text-sm">Offline Storage &amp; IndexedDB Outbox</h4>
              <p className="text-xs text-on-surface-variant">
                {outboxItems.length} actions pending auto-sync to cloud servers upon connectivity.
              </p>
            </div>
            <button
              onClick={syncAllOutbox}
              className="bg-secondary-container text-on-secondary-container px-5 py-2.5 rounded-xl font-bold text-xs hover:brightness-105 active:scale-95 transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              Force Auto-Sync Now
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
