import React from 'react';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    notifications,
    setActiveModal,
    userRole,
    farmerProfile,
    traderProfile,
    switchRole,
    logout,
    openBillGenerator,
  } = useApp();

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-surface/95 backdrop-blur-md border-b border-outline-variant transition-colors duration-200 shadow-sm">
        
        {/* Brand & Role Tag */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="material-symbols-outlined text-primary fill text-[28px]">potted_plant</span>
            <span className="font-headline-md text-xl sm:text-2xl font-black text-primary tracking-tight">
              AgriShield
            </span>
          </div>

          {/* Active Role Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container border border-outline-variant/60">
            <span className="material-symbols-outlined text-[15px] text-primary">
              {userRole === 'trader' ? 'storefront' : 'agriculture'}
            </span>
            <span className="text-on-surface-variant">
              {userRole === 'trader' ? 'Trader Mode' : 'Farmer Mode'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-2 lg:gap-3 items-center">
          {userRole === 'trader' ? (
            <>
              <button
                onClick={() => setActiveTab('trader-hub')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 flex items-center gap-1.5 ${
                  activeTab === 'trader-hub'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                Crop Buying Hub
              </button>
              <button
                onClick={() => setActiveTab('auctions')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 relative ${
                  activeTab === 'auctions'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Live Bidding
                <span className="absolute top-0 right-2 w-2 h-2 bg-error rounded-full" />
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 ${
                  activeTab === 'market'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Marketplace
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('home')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 ${
                  activeTab === 'home'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 flex items-center gap-1 ${
                  activeTab === 'inventory'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">warehouse</span>
                <span>Inventory</span>
              </button>
              <button
                onClick={() => setActiveTab('market')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 ${
                  activeTab === 'market'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setActiveTab('scan')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 ${
                  activeTab === 'scan'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Scan AI
              </button>
              <button
                onClick={() => setActiveTab('auctions')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 relative ${
                  activeTab === 'auctions'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Auctions
                <span className="absolute top-0 right-2 w-2 h-2 bg-error rounded-full" />
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`font-label-bold text-xs lg:text-sm font-bold rounded-full px-4 py-1.5 transition-colors duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                Profile
              </button>
            </>
          )}
        </nav>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Role Switcher Button */}
          <button
            onClick={() => switchRole(userRole === 'farmer' ? 'trader' : 'farmer')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-surface-container-high hover:bg-surface-variant text-primary border border-outline-variant/60 transition active:scale-95"
            title="Switch Persona"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Switch to {userRole === 'farmer' ? 'Trader' : 'Farmer'}</span>
          </button>

          {/* Bill Generator Button */}
          <button
            onClick={() => openBillGenerator()}
            aria-label="Generate APMC Mandi Bill"
            className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-bold transition active:scale-95 shadow-sm"
            title="Generate Official APMC Bill & Tax Invoice"
          >
            <span className="material-symbols-outlined text-[17px] text-amber-700">receipt_long</span>
            <span className="hidden sm:inline">Bill Generator</span>
          </button>

          {/* Direct Trader-Farmer Chat Button */}
          <button
            onClick={() => setActiveModal('chat')}
            aria-label="Trader-Farmer Direct Chat"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 rounded-full text-xs font-bold transition active:scale-95 shadow-sm"
            title="Open Direct Chat & Negotiation"
          >
            <span className="material-symbols-outlined text-[17px] text-emerald-700">chat</span>
            <span className="hidden sm:inline">Trade Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setActiveModal('notifications')}
            aria-label="Notifications"
            className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors duration-200 rounded-full text-on-surface-variant relative active:scale-95"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            aria-label="Logout"
            className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-error text-on-surface-variant transition-colors duration-200 rounded-full active:scale-95"
            title="Sign Out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </header>

      {/* BottomNavBar (Mobile Only) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 pb-safe shadow-lg bg-surface border-t border-outline-variant rounded-t-xl"
        style={{ boxShadow: '0px -4px 12px rgba(26, 32, 44, 0.05)' }}
      >
        {userRole === 'trader' ? (
          <>
            <button
              onClick={() => setActiveTab('trader-hub')}
              className={`flex flex-col items-center justify-center rounded-full px-4 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'trader-hub'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'trader-hub' ? 'fill' : ''}`}>shopping_bag</span>
              <span className="font-label-sm text-label-sm mt-1">Buy Crops</span>
            </button>

            <button
              onClick={() => setActiveTab('market')}
              className={`flex flex-col items-center justify-center rounded-full px-4 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'market'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'market' ? 'fill' : ''}`}>storefront</span>
              <span className="font-label-sm text-label-sm mt-1">Market</span>
            </button>

            <button
              onClick={() => setActiveTab('auctions')}
              className={`flex flex-col items-center justify-center rounded-full px-4 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'auctions'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'auctions' ? 'fill' : ''}`}>gavel</span>
              <span className="font-label-sm text-label-sm mt-1">Auctions</span>
            </button>

            <button
              onClick={() => switchRole('farmer')}
              className="flex flex-col items-center justify-center rounded-full px-3 py-1 text-on-surface-variant hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined">agriculture</span>
              <span className="font-label-sm text-[10px] mt-1">Farmer Mode</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'home'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'home' ? 'fill' : ''}`}>home</span>
              <span className="font-label-sm text-[10px] mt-0.5">Home</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'inventory'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'inventory' ? 'fill' : ''}`}>warehouse</span>
              <span className="font-label-sm text-[10px] mt-0.5">Stock</span>
            </button>

            {/* Scan Center Button */}
            <button
              onClick={() => setActiveTab('scan')}
              aria-label="Scan AI"
              className="flex flex-col items-center justify-center text-white bg-gradient-to-tr from-[#10B981] to-primary rounded-full w-12 h-12 -mt-5 shadow-lg shadow-primary/30 border-4 border-surface scale-95 active:scale-90 transition-transform duration-150 relative z-10"
            >
              <span className="material-symbols-outlined text-[24px]">center_focus_strong</span>
            </button>

            <button
              onClick={() => setActiveTab('auctions')}
              className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1 scale-95 active:scale-90 transition-transform duration-150 relative ${
                activeTab === 'auctions'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined ${activeTab === 'auctions' ? 'fill' : ''}`}>
                  gavel
                </span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-error border border-surface rounded-full"></span>
              </div>
              <span className="font-label-sm text-[10px] mt-0.5">Auctions</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1 scale-95 active:scale-90 transition-transform duration-150 ${
                activeTab === 'profile'
                  ? 'bg-primary-container text-on-primary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className={`material-symbols-outlined ${activeTab === 'profile' ? 'fill' : ''}`}>
                person
              </span>
              <span className="font-label-sm text-[10px] mt-0.5">Profile</span>
            </button>
          </>
        )}
      </nav>
    </>
  );
}
