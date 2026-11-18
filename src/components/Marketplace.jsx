import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function Marketplace({ onJoinAuction, onPostRequest, onBack }) {
  const {
    batches,
    watchlist,
    toggleWatchlist,
    setActiveModal,
    setSelectedAuctionId,
    setActiveTab,
    openChatWith,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Filtering logic
  const filteredBatches = batches
    .filter((batch) => {
      const matchesSearch =
        batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.sellerType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRadius = (batch.distance || 10) <= radiusKm;
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'organic'
          ? batch.isOrganic
          : batch.category === selectedCategory;
      return matchesSearch && matchesRadius && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'price_asc') return a.leadingBid - b.leadingBid;
      if (sortBy === 'price_desc') return b.leadingBid - a.leadingBid;
      return 0;
    });

  const handleJoinSpecificAuction = (batch) => {
    setSelectedAuctionId(batch.id);
    if (onJoinAuction) {
      onJoinAuction(batch);
    } else {
      setActiveTab('auctions');
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col md:flex-row overflow-hidden select-none">
      {/* SideNavBar (Desktop) */}
      <nav className="bg-surface-container-low h-screen w-64 hidden md:flex flex-col border-r border-outline-variant fixed left-0 top-0 z-40">
        <div className="p-5 flex items-center justify-between">
          <h1 className="font-headline-md text-2xl font-extrabold text-primary tracking-tight">
            AgriMarket
          </h1>
          <button
            onClick={onBack}
            className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant"
            title="Back to farmer home"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        </div>

        {/* Buyer Profile Box */}
        <div className="px-4 py-2 border-b border-outline-variant mb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-primary/30">
              <span className="material-symbols-outlined text-primary text-[24px]">store</span>
            </div>
            <div>
              <div className="font-label-bold text-sm font-bold text-on-surface">Wholesale Portal</div>
              <div className="font-label-sm text-xs text-emerald-700 font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified APMC Buyer
              </div>
            </div>
          </div>
          <button
            onClick={onPostRequest}
            className="w-full h-11 bg-primary text-white rounded-xl font-label-bold text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            List / Post Crop Batch
          </button>
        </div>

        {/* Side Nav Links */}
        <ul className="flex flex-col gap-1.5 flex-grow overflow-y-auto px-3">
          <li>
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-xl font-label-bold text-sm font-bold shadow-sm cursor-pointer">
              <span className="material-symbols-outlined">search</span>
              Discover Auctions
            </div>
          </li>
          <li>
            <div
              onClick={() => alert(`Your Watchlist contains ${watchlist.length} monitored lots.`)}
              className="flex items-center justify-between px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer font-label-bold text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">visibility</span>
                Watchlist
              </div>
              <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full text-xs font-bold">
                {watchlist.length}
              </span>
            </div>
          </li>
          <li>
            <div
              onClick={() => setActiveModal('mandi')}
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer font-label-bold text-sm"
            >
              <span className="material-symbols-outlined">trending_up</span>
              Spot Rates Ticker
            </div>
          </li>
          <li>
            <div
              onClick={() => setActiveModal('ndvi')}
              className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-xl transition-all cursor-pointer font-label-bold text-sm"
            >
              <span className="material-symbols-outlined">satellite_alt</span>
              Satellite Soil Map
            </div>
          </li>
        </ul>

        <div className="mt-auto px-3 py-4 border-t border-outline-variant">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-on-surface-variant hover:bg-surface-container rounded-xl transition text-sm font-medium"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Switch to Farmer View
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col md:ml-64 h-screen w-full relative">
        {/* Top Search & Filter Bar */}
        <header className="bg-surface border-b border-outline-variant px-margin-mobile md:px-6 py-4 z-30 sticky top-0 shadow-sm flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center w-full">
            {/* Search Input */}
            <div className="relative w-full lg:w-[42%] flex-shrink-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">search</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by crop, variety, or farmer region..."
                className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-xl bg-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary text-sm transition"
              />
            </div>

            {/* Radius Slider */}
            <div className="w-full lg:w-[28%] flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/40">
              <span className="font-label-bold text-xs text-on-surface whitespace-nowrap font-bold">
                Radius:
              </span>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="font-label-bold text-xs text-primary whitespace-nowrap font-bold w-20 text-right">
                {radiusKm} km
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-full pl-3 pr-8 py-2.5 text-xs border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary rounded-xl bg-surface font-bold text-on-surface cursor-pointer"
              >
                <option value="distance">Distance: Nearest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2 overflow-x-auto hide-scrollbar pb-1">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'grains', label: 'Grains & Pulses' },
              { id: 'vegetables', label: 'Fresh Vegetables' },
              { id: 'fruits', label: 'Seasonal Fruits' },
              { id: 'organic', label: 'Organic Certified', icon: 'verified' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setSelectedCategory(chip.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1 whitespace-nowrap ${
                  selectedCategory === chip.id
                    ? 'border-2 border-primary bg-primary-container text-on-primary-container shadow-sm'
                    : 'border border-outline-variant bg-surface text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {chip.icon && (
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">
                    {chip.icon}
                  </span>
                )}
                {chip.label}
              </button>
            ))}
          </div>
        </header>

        {/* Split Screen Layout */}
        <div className="flex flex-grow overflow-hidden relative">
          {/* Left Panel: Scrollable List */}
          <div className="w-full md:w-[45%] lg:w-[40%] bg-background border-r border-outline-variant overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4 pb-28">
            <div className="flex justify-between items-center">
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                Live Auctions ({filteredBatches.length})
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                Within {radiusKm} km radius
              </span>
            </div>

            {filteredBatches.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-outline-variant/60">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">search_off</span>
                <h3 className="font-bold text-on-surface">No batches found</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Try expanding your search radius or changing category filters.
                </p>
              </div>
            ) : (
              filteredBatches.map((batch) => {
                const isBookmarked = watchlist.includes(batch.id);
                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedMarker(batch.id)}
                    className={`bg-surface rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group ${
                      selectedMarker === batch.id
                        ? 'border-primary ring-2 ring-primary/40 bg-primary-fixed/10'
                        : 'border-outline-variant'
                    }`}
                  >
                    <div className="flex gap-3.5 h-full">
                      {/* Thumbnail Image */}
                      <div className="w-1/3 rounded-xl overflow-hidden relative bg-surface-variant flex-shrink-0">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 min-h-[110px]"
                          src={batch.images?.[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=400&q=80'}
                          alt={batch.title}
                        />
                        {batch.isLive && (
                          <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                            LIVE
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(batch.id);
                          }}
                          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition ${
                            isBookmarked ? 'bg-amber-400 text-black' : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isBookmarked ? 'bookmark' : 'bookmark_border'}
                          </span>
                        </button>
                      </div>

                      {/* Batch Details */}
                      <div className="w-2/3 flex flex-col justify-between">
                        <div>
                          <h3 className="font-headline-md text-sm font-bold text-on-surface leading-snug line-clamp-2">
                            {batch.title} — {batch.quantityKg} {batch.unit || 'Kg'}
                          </h3>

                          <div className="flex items-center gap-2 mt-1 mb-1.5 flex-wrap">
                            <span className="flex items-center text-on-surface-variant font-label-sm text-[11px] gap-0.5 bg-surface-container px-2 py-0.5 rounded font-medium">
                              <span className="material-symbols-outlined text-[13px]">location_on</span>
                              {batch.distance || 8.2} km
                            </span>
                            <span className="flex items-center text-error font-label-sm text-[11px] gap-0.5 bg-error-container/40 px-2 py-0.5 rounded font-bold">
                              <span className="material-symbols-outlined text-[13px]">schedule</span>
                              {batch.timeLeft}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                            <span className="material-symbols-outlined text-secondary text-[14px]">star</span>
                            <span className="font-bold text-on-surface">{batch.rating || '5.0'}</span>
                            <span>• {batch.sellerType || 'Verified Seller'}</span>
                          </div>
                        </div>

                        {/* Pricing & Actions */}
                        <div className="flex items-end justify-between mt-3 border-t border-outline-variant/40 pt-2.5">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-on-surface-variant">
                              Current Bid
                            </div>
                            <div className="font-headline-md text-lg text-primary font-bold">
                              ₹{batch.leadingBid.toFixed(2)}/kg
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openChatWith({
                                  id: batch.id,
                                  title: `${batch.title} (${batch.quantityKg} ${batch.unit || 'Kg'})`,
                                  buyer: batch.farmer || 'Farmer Ramesh Kumar',
                                  farmer: batch.farmer || 'Farmer Ramesh Kumar',
                                  price: `₹${batch.leadingBid.toFixed(2)} / ${batch.unit || 'Kg'}`,
                                });
                              }}
                              className="h-9 px-3 bg-surface-container hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-label-bold text-xs active:scale-95 transition font-bold flex items-center gap-1"
                              title="Direct Chat with Farmer"
                            >
                              <span className="material-symbols-outlined text-[15px]">chat</span>
                              <span>Chat</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinSpecificAuction(batch);
                              }}
                              className="h-9 px-3.5 bg-primary text-white rounded-xl font-label-bold text-xs hover:bg-primary/90 active:scale-95 transition shadow-sm font-bold flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[15px]">gavel</span>
                              <span>Bid</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Panel: Interactive Map */}
          <div className="hidden md:block md:w-[55%] lg:w-[60%] relative bg-surface-dim h-full">
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')`,
              }}
            ></div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#003629]/30 via-black/20 to-transparent pointer-events-none"></div>

            {/* Procurement Radius Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="rounded-full border-2 border-primary border-dashed bg-primary/10 flex items-center justify-center relative transition-all duration-300"
                style={{
                  width: `${Math.min(480, radiusKm * 5)}px`,
                  height: `${Math.min(480, radiusKm * 5)}px`,
                }}
              >
                <div className="w-4 h-4 bg-primary rounded-full absolute ring-4 ring-white/80 shadow-lg animate-pulse"></div>
              </div>
            </div>

            {/* Interactive Map Markers */}
            {filteredBatches.map((batch) => (
              <div
                key={batch.id}
                onClick={() => {
                  setSelectedMarker(batch.id);
                  handleJoinSpecificAuction(batch);
                }}
                className={`absolute flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
                  selectedMarker === batch.id ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                }`}
                style={{ top: batch.lat || '40%', left: batch.lng || '50%' }}
              >
                <div className="bg-surface text-on-surface font-label-bold text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-lg border border-outline-variant mb-1 group-hover:bg-primary group-hover:text-white transition">
                  ₹{batch.leadingBid.toFixed(2)}
                </div>
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white relative">
                  <span className="material-symbols-outlined text-white text-[18px]">
                    {batch.category === 'grains' ? 'grass' : batch.category === 'vegetables' ? 'eco' : 'grain'}
                  </span>
                  {batch.isLive && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-error animate-pulse border-2 border-white"></span>
                  )}
                </div>
              </div>
            ))}

            {/* Map Controls */}
            <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-20">
              <button
                onClick={() => alert('GPS centered on Punjab Agricultural Cluster (Ludhiana / Khanna Mandi)')}
                className="w-11 h-11 bg-white text-on-surface rounded-full shadow-lg border border-outline-variant flex items-center justify-center hover:bg-gray-100 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
              <div className="flex flex-col bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden">
                <button
                  onClick={() => setRadiusKm((r) => Math.min(100, r + 10))}
                  className="w-11 h-11 text-on-surface flex items-center justify-center hover:bg-gray-100 transition border-b border-outline-variant text-lg font-bold"
                >
                  +
                </button>
                <button
                  onClick={() => setRadiusKm((r) => Math.max(5, r - 10))}
                  className="w-11 h-11 text-on-surface flex items-center justify-center hover:bg-gray-100 transition text-lg font-bold"
                >
                  -
                </button>
              </div>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-20 left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-outline-variant z-20 text-xs">
              <h4 className="font-label-bold font-bold text-on-surface mb-2">Map Legend</h4>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                  </div>
                  <span className="font-medium text-on-surface-variant">Live Bidding Floor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 bg-white rounded-full border-2 border-primary"></div>
                  <span className="font-medium text-on-surface-variant">Upcoming Harvest</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Menu */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 flex gap-3">
          <button
            onClick={() => alert(`Watchlist contains ${watchlist.length} lots bookmarked for live bid monitoring.`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-secondary-container text-on-secondary-container rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            Watchlist
            <span className="bg-[#291800] text-white px-2 py-0.5 rounded-full text-[10px]">
              {watchlist.length}
            </span>
          </button>
          <button
            onClick={() => setActiveModal('mandi')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-on-surface border border-outline-variant rounded-full shadow-lg hover:bg-surface-container hover:-translate-y-0.5 transition-all font-bold text-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-emerald-700">trending_up</span>
            Mandi Price Index
          </button>
        </div>
      </main>
    </div>
  );
}
