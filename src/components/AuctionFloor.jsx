import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function AuctionFloor({ onBack, onNavigateToListCrop }) {
  const {
    batches,
    selectedAuctionId,
    setSelectedAuctionId,
    placeBidOnBatch,
    acceptLeadingBidOnBatch,
    setActiveModal,
    openChatWith,
  } = useApp();

  const currentBatch = batches.find((b) => b.id === selectedAuctionId) || batches[0];

  const [customBid, setCustomBid] = useState((currentBatch.leadingBid + 1.0).toFixed(2));
  const [secondsRemaining, setSecondsRemaining] = useState(872); // 14m 32s

  useEffect(() => {
    setCustomBid((currentBatch.leadingBid + 1.0).toFixed(2));
  }, [currentBatch.leadingBid]);

  // Live timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickJump = (inc) => {
    const newBid = (parseFloat(currentBatch.leadingBid) + inc).toFixed(2);
    setCustomBid(newBid);
  };

  const handlePlaceBid = () => {
    const bidVal = parseFloat(customBid);
    if (isNaN(bidVal) || bidVal <= currentBatch.leadingBid) {
      alert(`Your bid must be higher than current leading bid of ₹${currentBatch.leadingBid.toFixed(2)}/kg!`);
      return;
    }
    placeBidOnBatch(currentBatch.id, bidVal, 'You (Self / Verified Bidder)');
  };

  const handleExtendTimer = () => {
    setSecondsRemaining((prev) => prev + 300);
    alert('⏱️ Auction bidding timer extended by +5 minutes for final buyer call.');
  };

  return (
    <div className="font-body-md text-on-surface antialiased bg-background min-h-screen select-none">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-touch-target bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            aria-label="Back to dashboard"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container text-primary transition active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
            AgriBid Pro
          </h1>
          <span className="hidden sm:inline-block bg-primary-fixed text-primary px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">
            Live Terminal
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <button
            onClick={() => {
              openChatWith({
                id: currentBatch.id,
                title: `${currentBatch.title} (${currentBatch.quantityKg} ${currentBatch.unit || 'Kg'})`,
                buyer: currentBatch.leadingBuyer || 'Apex Agro Millers',
                farmer: currentBatch.farmer || 'Farmer Ramesh Kumar',
                price: `₹${currentBatch.leadingBid.toFixed(2)} / ${currentBatch.unit || 'Kg'}`,
              });
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold transition active:scale-95 shadow-sm"
            title="Direct Trader-Farmer Chat & Counter Offers"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">chat</span>
            <span>Direct Chat</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          <button
            onClick={() => setActiveModal('notifications')}
            className="p-2 rounded-full hover:bg-surface-container transition"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* SideNavBar (Desktop) */}
      <nav className="fixed left-0 top-0 h-full z-40 pt-16 w-64 hidden md:flex flex-col bg-surface-container border-r border-outline-variant">
        <div className="p-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-base text-primary font-bold truncate">
            Bidding Terminal
          </h2>
          <p className="font-label-bold text-xs text-on-surface-variant truncate">
            Lot #{currentBatch.id} • Punjab Zone 4
          </p>
        </div>

        {/* Lot Switcher */}
        <div className="px-3 py-2 border-b border-outline-variant/40">
          <span className="text-[11px] font-bold uppercase text-gray-500 block mb-1.5">
            Active Bidding Rooms:
          </span>
          <div className="flex flex-col gap-1">
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setSelectedAuctionId(b.id)}
                className={`text-left p-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  selectedAuctionId === b.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'hover:bg-surface-variant text-on-surface-variant'
                }`}
              >
                <span className="truncate">{b.title}</span>
                <span className="text-[10px] opacity-90">₹{b.leadingBid.toFixed(2)}</span>
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 py-3 flex flex-col gap-1 px-3">
          <li>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-container text-white rounded-xl font-label-bold text-xs font-bold shadow-sm">
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              Live Room
            </div>
          </li>
          <li>
            <div
              onClick={onBack}
              className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all cursor-pointer font-label-bold text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
              All Batches
            </div>
          </li>
          <li>
            <div
              onClick={() => setActiveModal('mandi')}
              className="flex items-center gap-3 px-4 py-2.5 text-on-surface-variant hover:bg-surface-variant rounded-xl transition-all cursor-pointer font-label-bold text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              Mandi Trends
            </div>
          </li>
        </ul>

        <div className="p-4">
          <button
            onClick={onNavigateToListCrop}
            className="w-full bg-primary text-white font-label-bold text-xs h-11 rounded-xl shadow hover:bg-primary/90 active:scale-98 transition flex items-center justify-center gap-2 font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create New Batch
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="pt-20 pl-0 md:pl-64 pb-28 md:pb-12 min-h-screen">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          {/* Center Column: Batch Info & Bid Stream */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Top Batch Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-1">
                    {currentBatch.title}
                  </h2>
                  <p className="font-body-lg text-on-surface-variant font-medium">
                    {currentBatch.quantityKg.toLocaleString()} {currentBatch.unit || 'kg'} Batch • {currentBatch.grade} • Moisture {currentBatch.moisture}
                  </p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className="bg-tertiary-container text-white px-3 py-1 rounded-full font-label-bold text-xs flex items-center gap-1 font-bold shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    {currentBatch.isOrganic ? 'Verified Organic' : 'Verified Batch'}
                  </span>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    <span>{currentBatch.farmer} • {currentBatch.location}</span>
                  </div>
                </div>
              </div>

              {/* Photos Row */}
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {currentBatch.images?.map((img, i) => (
                  <img
                    key={i}
                    className="w-32 h-32 object-cover rounded-xl border border-outline-variant shadow-sm flex-shrink-0"
                    alt={currentBatch.title}
                    src={img}
                  />
                ))}
              </div>
            </div>

            {/* Live Header & Bid Stream Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col flex-1">
              {/* Live Header */}
              <div className="bg-surface-container-high p-5 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {/* Countdown Timer with Pulse Ring */}
                  <div className="flex items-center gap-2 bg-[#FDB233] text-[#291800] px-4 py-2 rounded-xl font-headline-md text-xl font-bold shadow-[0_0_12px_rgba(253,178,51,0.5)]">
                    <div className="w-3 h-3 rounded-full bg-[#291800] pulse-live"></div>
                    <span>{formatTimer(secondsRemaining)}</span>
                  </div>
                  <div className="text-on-surface-variant flex gap-3 text-xs font-label-bold font-semibold">
                    <span>Floor: ₹{currentBatch.floorPrice.toFixed(2)}/kg</span>
                    <span>•</span>
                    <span>Bids: {currentBatch.bidsCount}</span>
                  </div>
                </div>

                <div className="text-left md:text-right flex flex-col md:items-end">
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    Current Leading Bid
                  </div>
                  <div className="font-display-lg text-3xl font-extrabold text-primary leading-none my-1">
                    ₹{currentBatch.leadingBid.toFixed(2)}{' '}
                    <span className="text-lg text-on-surface-variant font-medium">/ kg</span>
                  </div>
                  <div className="text-xs text-secondary font-bold">
                    Total: ₹{(currentBatch.leadingBid * currentBatch.quantityKg).toLocaleString('en-IN')} • {currentBatch.leadingBuyer}
                  </div>
                </div>
              </div>

              {/* Real-time Bid Stream */}
              <div className="p-5 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[380px]">
                {/* Active Leader */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary-container/10 border-2 border-primary shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary text-white">
                      {currentBatch.leadingBuyer?.slice(0, 2).toUpperCase() || 'AA'}
                    </div>
                    <div>
                      <div className="font-label-bold text-sm text-on-surface font-bold flex items-center gap-1.5">
                        {currentBatch.leadingBuyer}
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold">
                          LEADER
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant">Just now • Live Escrow Guaranteed</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-headline-md text-lg font-bold text-primary">
                      ₹{currentBatch.leadingBid.toFixed(2)}/kg
                    </div>
                    <div className="text-xs text-emerald-700 font-semibold flex items-center justify-end gap-0.5">
                      <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                      +₹1.00
                    </div>
                  </div>
                </div>

                {/* Earlier Bids */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/40 opacity-80">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-surface-variant text-on-surface-variant">
                      GV
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">Green Valley Farms Export</div>
                      <div className="text-[10px] text-gray-500">14 sec ago</div>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-on-surface-variant">
                    ₹{(currentBatch.leadingBid - 1.0).toFixed(2)}/kg
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container/50 border border-outline-variant/40 opacity-70">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs bg-surface-variant text-on-surface-variant">
                      FR
                    </div>
                    <div>
                      <div className="font-bold text-xs text-on-surface">FreshRoots Wholesale Ltd.</div>
                      <div className="text-[10px] text-gray-500">45 sec ago</div>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-on-surface-variant">
                    ₹{(currentBatch.leadingBid - 2.5).toFixed(2)}/kg
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding Action & Seller Controls */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Place Your Bid Card */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-headline-md text-xl font-bold text-on-surface border-b border-outline-variant/40 pb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Place Your Bid
              </h3>

              {/* Quick Jumps */}
              <div>
                <label className="block font-label-bold text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">
                  Quick Step Jumps
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickJump(0.5)}
                    className="py-2.5 px-3 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-high hover:border-primary transition font-bold text-sm"
                  >
                    +₹0.50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump(1.0)}
                    className="py-2.5 px-3 border-2 border-primary bg-primary-fixed text-primary rounded-xl font-bold text-sm shadow-sm"
                  >
                    +₹1.00
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickJump(2.0)}
                    className="py-2.5 px-3 border border-outline-variant rounded-xl text-on-surface hover:bg-surface-container-high hover:border-primary transition font-bold text-sm"
                  >
                    +₹2.00
                  </button>
                </div>
              </div>

              {/* Custom Bid Input */}
              <div>
                <label className="block font-label-bold text-xs text-on-surface-variant mb-2 font-bold uppercase tracking-wider">
                  Custom Bid (₹ / kg)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-on-surface-variant font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={customBid}
                    onChange={(e) => setCustomBid(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-2 focus:ring-primary text-xl font-extrabold text-primary transition"
                  />
                </div>
              </div>

              {/* Estimated Total Calculation */}
              <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-on-surface-variant font-medium text-xs">Estimated Total Sum</span>
                  <span className="font-headline-md text-xl font-extrabold text-primary">
                    ₹{(parseFloat(customBid || 0) * currentBatch.quantityKg).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-on-surface-variant">
                  <span>Batch Volume: {currentBatch.quantityKg.toLocaleString()} kg</span>
                  <span className="text-emerald-700 font-bold">Direct Escrow</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePlaceBid}
                className="w-full bg-primary text-white font-headline-md text-base h-14 rounded-xl shadow hover:bg-primary/90 active:scale-98 transition flex items-center justify-center gap-2 font-bold"
              >
                <span className="material-symbols-outlined">gavel</span>
                Place Verified Bid
              </button>
            </div>

            {/* Farmer / Seller Controls */}
            <div className="bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant p-5 shadow-sm space-y-4">
              <h3 className="font-label-bold text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-[18px] text-primary">admin_panel_settings</span>
                Farmer / Seller Controls
              </h3>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    openChatWith({
                      id: currentBatch.id,
                      title: `${currentBatch.title} (${currentBatch.quantityKg} ${currentBatch.unit || 'Kg'})`,
                      buyer: currentBatch.leadingBuyer || 'Apex Agro Millers',
                      farmer: currentBatch.farmer || 'Farmer Ramesh Kumar',
                      price: `₹${currentBatch.leadingBid.toFixed(2)} / ${currentBatch.unit || 'Kg'}`,
                    });
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span>
                  <span>Direct Chat &amp; Negotiate Terms</span>
                </button>
                <button
                  type="button"
                  onClick={() => acceptLeadingBidOnBatch(currentBatch)}
                  className="w-full py-3 px-4 bg-tertiary-container text-white rounded-xl font-bold hover:bg-tertiary shadow transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  Accept Leading Bid (₹{currentBatch.leadingBid.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={handleExtendTimer}
                  className="w-full py-3 px-4 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary-container/10 transition flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">more_time</span>
                  Extend Timer (+5m)
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-3 pt-2 bg-surface border-t border-outline-variant shadow-lg md:hidden">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center bg-primary text-white rounded-xl px-4 py-1.5 flex-1 max-w-[80px]"
        >
          <span className="material-symbols-outlined">sensors</span>
          <span className="text-[11px] font-bold mt-0.5">Live</span>
        </button>
        <button
          onClick={onBack}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-1.5 flex-1 max-w-[80px]"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="text-[11px] font-medium mt-0.5">Home</span>
        </button>
        <button
          onClick={onNavigateToListCrop}
          className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-xl px-4 py-1.5 flex-1 max-w-[80px]"
        >
          <span className="material-symbols-outlined">add_box</span>
          <span className="text-[11px] font-medium mt-0.5">New Lot</span>
        </button>
      </nav>
    </div>
  );
}
