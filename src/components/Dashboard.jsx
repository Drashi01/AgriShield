import React from 'react';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const {
    farmerProfile,
    batches,
    setActiveTab,
    setActiveModal,
    setModalData,
    acceptLeadingBidOnBatch,
    setSelectedAuctionId,
    outboxItems,
    openChatWith,
    inventoryItems,
    adjustReadyToSell,
    listStockToMarketplace,
  } = useApp();

  const activeBatchesCount = batches.length;
  const totalKgLive = batches.reduce((acc, b) => acc + (b.quantityKg || 0), 0);
  const highestLiveBid = Math.max(...batches.map((b) => b.leadingBid || 0), 42.50);

  const totalGranaryStockKg = inventoryItems.reduce((acc, i) => acc + (i.totalHarvestQty || 0), 0);
  const totalReadyToSellKg = inventoryItems.reduce((acc, i) => acc + (i.readyToSellQty || 0), 0);

  const mandiRates = [
    { name: 'Wheat (गेहूं)', price: '₹32.00/kg', change: '+2.4%', positive: true },
    { name: 'Tomato (टमाटर)', price: '₹26.50/kg', change: '-1.8%', positive: false },
    { name: 'Mustard (सरसों)', price: '₹54.00/kg', change: '+5.1%', positive: true },
    { name: 'Onion (प्याज)', price: '₹22.00/kg', change: '+0.8%', positive: true },
  ];

  const incomingBids = [
    {
      id: 'TOM-8834',
      title: 'Organic Hybrid Tomatoes (1,200 kg)',
      buyer: 'FreshRoots Wholesale Hub',
      verified: true,
      price: '₹42.50 / kg',
      premium: '+12%',
      timeLeft: '14m left',
      urgent: true,
    },
    {
      id: 'WHT-5021',
      title: 'Sharbati Wheat Grade-A (2,500 kg)',
      buyer: 'Apex Agro Millers',
      verified: false,
      price: '₹34.50 / kg',
      premium: '+8%',
      timeLeft: '02h 15m left',
      urgent: false,
    },
  ];

  const handleOpenChat = (bid) => {
    openChatWith({
      id: bid.id,
      title: bid.title,
      buyer: bid.buyer,
      farmer: farmerProfile.name,
      price: bid.price,
    });
  };

  const handleEnterSpecificAuction = (batchId) => {
    setSelectedAuctionId(batchId);
    setActiveTab('auctions');
  };

  return (
    <main className="pt-[105px] md:pt-[115px] max-w-[1280px] mx-auto px-margin-mobile md:px-gutter pb-safe flex flex-col gap-8 md:gap-10 select-none">
      {/* Hero Section */}
      <section className="flex flex-col gap-3 mt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">
              Namaste, {farmerProfile.name}
            </h2>
            <span
              className="material-symbols-outlined text-emerald-highlight bg-[#E6F4EA] rounded-full p-0.5 text-[20px] fill"
              title="Verified Farmer KYC"
            >
              verified
            </span>
          </div>
          <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
            {farmerProfile.farmName} • {farmerProfile.zone}
          </p>
        </div>

        <div
          onClick={() => setActiveModal('ndvi')}
          className="inline-flex items-center gap-3 bg-surface-container-high px-4 py-2 rounded-full self-start border border-outline-variant/40 shadow-sm cursor-pointer hover:bg-surface-container transition active:scale-98"
          title="Click to view detailed satellite farm moisture telemetry"
        >
          <span className="text-[18px]">☀️</span>
          <span className="font-label-bold text-label-bold text-on-surface">
            31°C • 62% Humidity • Dry field conditions
          </span>
          <span className="text-xs text-primary font-bold ml-1">View Satellite NDVI →</span>
        </div>
      </section>

      {/* 2x2 Metric Grid */}
      <section className="bento-grid">
        {/* Metric 1: Granary Stock & Ready to Sell */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0px_4px_12px_rgba(26,32,44,0.08)] hover:-translate-y-1 transition-transform duration-200 cursor-pointer border-l-4 border-l-primary"
        >
          <div className="flex items-center justify-between text-on-surface-variant font-label-bold text-label-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">warehouse</span>
              <span>Granary Stock &amp; Inventory</span>
            </div>
            <span className="material-symbols-outlined text-sm text-primary">arrow_forward</span>
          </div>
          <div className="font-headline-md text-headline-md text-on-background font-bold">
            {totalGranaryStockKg.toLocaleString()} <span className="text-xs font-bold text-gray-500">kg total</span>
          </div>
          <div className="font-body-md text-body-md text-emerald-700 font-bold">
            {totalReadyToSellKg.toLocaleString()} kg ready for wholesale sale
          </div>
        </div>

        {/* Metric 2 */}
        <div
          onClick={() => handleEnterSpecificAuction('TOM-8834')}
          className="glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0px_4px_12px_rgba(26,32,44,0.08)] hover:-translate-y-1 transition-transform duration-200 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-secondary-container/20 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-on-surface-variant font-label-bold text-label-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">trending_up</span>
              <span>Highest Live Bid</span>
            </div>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
            </span>
          </div>
          <div className="font-headline-md text-headline-md text-emerald-highlight font-extrabold">
            ₹{highestLiveBid.toFixed(2)} / kg
          </div>
          <div className="font-body-md text-body-md text-outline">
            Organic Tomatoes • 28 bids placed
          </div>
        </div>

        {/* Metric 3 */}
        <div
          onClick={() => setActiveTab('scan')}
          className="glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0px_4px_12px_rgba(26,32,44,0.08)] hover:-translate-y-1 transition-transform duration-200 cursor-pointer border-l-4 border-l-secondary"
        >
          <div className="flex items-center justify-between text-on-surface-variant font-label-bold text-label-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">eco</span>
              <span>Field Health Index</span>
            </div>
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
              Warning
            </span>
          </div>
          <div className="font-headline-md text-headline-md text-on-background font-bold">
            94% Optimal
          </div>
          <div className="font-body-md text-body-md text-outline">
            1 mild leaf warning (Early Blight)
          </div>
        </div>

        {/* Metric 4 */}
        <div
          onClick={() => setActiveModal('outbox')}
          className="glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0px_4px_12px_rgba(26,32,44,0.08)] hover:-translate-y-1 transition-transform duration-200 cursor-pointer border-l-4 border-l-amber-banner"
        >
          <div className="flex items-center justify-between text-on-surface-variant font-label-bold text-label-bold">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">sync_problem</span>
              <span>Pending Sync Queue</span>
            </div>
            <span className="material-symbols-outlined text-sm text-amber-banner">open_in_new</span>
          </div>
          <div className="font-headline-md text-headline-md text-on-background font-bold">
            {outboxItems.length} Queued
          </div>
          <div className="font-body-md text-body-md text-outline">
            IndexedDB offline actions ready
          </div>
        </div>
      </section>

      {/* Primary Action Quick Tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <button
          onClick={() => setActiveTab('scan')}
          className="bg-gradient-to-br from-[#10B981] to-[#047857] text-white rounded-2xl p-6 flex flex-col items-start gap-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left min-h-[140px] relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[100px]">camera_alt</span>
          </div>
          <span className="material-symbols-outlined text-[32px] bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            camera_alt
          </span>
          <div className="mt-auto z-10">
            <h3 className="font-headline-md text-[20px] font-bold leading-tight">Scan Crop Health</h3>
            <p className="font-body-md text-[14px] text-white/80 mt-1">Instant on-device pathology AI</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('list-crop')}
          className="bg-primary text-white rounded-2xl p-6 flex flex-col items-start gap-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left min-h-[140px] relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[100px]">add_box</span>
          </div>
          <span className="material-symbols-outlined text-[32px] bg-white/10 p-2 rounded-xl backdrop-blur-sm">
            add_box
          </span>
          <div className="mt-auto z-10">
            <h3 className="font-headline-md text-[20px] font-bold leading-tight">List New Batch</h3>
            <p className="font-body-md text-[14px] text-white/80 mt-1">Create B2B crop auction</p>
          </div>
        </button>

        <button
          onClick={() => {
            setSelectedAuctionId('TOM-8834');
            setActiveTab('auctions');
          }}
          className="bg-[#FDB233] text-[#291800] rounded-2xl p-6 flex flex-col items-start gap-4 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 text-left min-h-[140px] relative overflow-hidden group"
        >
          <div className="absolute -right-8 -bottom-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-[100px]">gavel</span>
          </div>
          <span className="material-symbols-outlined text-[32px] bg-black/10 p-2 rounded-xl backdrop-blur-sm">
            gavel
          </span>
          <div className="mt-auto z-10">
            <h3 className="font-headline-md text-[20px] font-bold leading-tight">Enter Live Auction</h3>
            <p className="font-body-md text-[14px] text-[#291800]/80 mt-1">2 active bidding rooms</p>
          </div>
        </button>
      </section>

      {/* Farmer Granary & Crop Inventory Section (अनाज भंडार व स्टॉक) */}
      <section className="bg-surface rounded-3xl p-5 sm:p-7 border border-outline-variant/70 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">warehouse</span>
            </div>
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-background">
                Farm Granary &amp; Ready-to-Sell Crop Stock (अनाज भंडार)
              </h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Manage stored harvest reserves vs crops ready for wholesale market listing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className="font-label-bold text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Full Inventory ({inventoryItems.length} Crops)</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Inventory Quick Stock Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {inventoryItems.slice(0, 3).map((item) => {
            const readyPct = Math.round((item.readyToSellQty / (item.totalHarvestQty || 1)) * 100);
            return (
              <div
                key={item.id}
                className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 flex flex-col justify-between gap-3 hover:border-primary/50 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-on-surface leading-tight">
                      {item.cropName}
                    </h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {item.grade}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {item.storageLocation}
                  </div>
                </div>

                {/* Ready to Sell vs Stored */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-800">
                      Ready to Sell: {item.readyToSellQty.toLocaleString()} {item.unit}
                    </span>
                    <span className="text-gray-500">
                      In Silo: {item.storedReserveQty.toLocaleString()} {item.unit}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${readyPct}%` }}
                    ></div>
                    <div
                      className="bg-amber-400 h-full transition-all"
                      style={{ width: `${100 - readyPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-outline-variant/30">
                  <button
                    onClick={() => adjustReadyToSell(item.id, item.readyToSellQty + 500)}
                    className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-[11px] font-bold border border-outline-variant transition text-center"
                    title="Add 500kg to Ready to Sell"
                  >
                    +500kg Sell
                  </button>

                  <button
                    onClick={() => listStockToMarketplace(item.id)}
                    className="flex-1 py-1.5 px-2 bg-primary text-white rounded-xl text-[11px] font-bold hover:bg-primary/90 transition shadow-sm text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[13px]">rocket_launch</span>
                    <span>{item.linkedBatchId ? 'Live' : 'List'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Bids + Mandi Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Recent Live Bids Stream */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline-md text-lg font-bold text-on-background">Incoming Buyer Bids</h3>
            <button
              onClick={() => setActiveTab('auctions')}
              className="font-label-bold text-xs font-bold text-primary hover:underline underline-offset-2"
            >
              View All Live Terminal (8) →
            </button>
          </div>

          {incomingBids.map((bid) => {
            const correspondingBatch = batches.find((b) => b.id === bid.id) || batches[0];
            return (
              <div
                key={bid.id}
                className="glass-card rounded-2xl p-4 flex flex-col gap-3 shadow-[0px_4px_12px_rgba(26,32,44,0.08)]"
              >
                <div className="flex flex-col md:flex-row justify-between gap-2 md:items-start">
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-headline-md text-[18px] text-on-background leading-tight font-bold">
                      {bid.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="font-body-md text-[14px] text-on-surface-variant font-medium">
                        Buyer: {bid.buyer}
                      </span>
                      {bid.verified && (
                        <span className="material-symbols-outlined text-emerald-highlight text-[14px] fill">
                          verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end bg-surface-container-low p-2 rounded-lg border border-outline-variant/30">
                    <div className="flex items-baseline gap-2">
                      <span className="font-headline-md text-[18px] text-on-background font-bold">
                        {bid.price}
                      </span>
                      {bid.premium && (
                        <span className="font-label-bold text-[10px] text-emerald-highlight bg-[#E6F4EA] px-1.5 py-0.5 rounded font-bold">
                          {bid.premium}
                        </span>
                      )}
                    </div>
                    <span className="font-label-bold text-[12px] text-secondary flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">timer</span>
                      {bid.timeLeft}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => acceptLeadingBidOnBatch(correspondingBatch)}
                    className="flex-1 bg-primary text-white font-label-bold text-xs h-9 rounded-xl flex items-center justify-center hover:bg-primary/90 active:scale-[0.99] transition shadow-sm font-bold gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">handshake</span>
                    Accept Bid
                  </button>
                  <button
                    onClick={() => handleOpenChat(bid)}
                    className="flex-1 border border-primary text-primary font-label-bold text-xs h-9 rounded-xl flex items-center justify-center hover:bg-primary/5 active:scale-[0.99] transition font-bold gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    Counter / Chat
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Local Mandi Price Ticker & Satellite Card */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-md text-base font-bold text-on-background">
              Today's Mandi Market Rates
            </h3>
            <button
              onClick={() => setActiveModal('mandi')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Full APMC List →
            </button>
          </div>

          <div
            onClick={() => setActiveModal('mandi')}
            className="glass-card rounded-2xl p-4 shadow-sm flex flex-col max-h-[300px] overflow-y-auto hide-scrollbar gap-2 cursor-pointer hover:border-primary transition"
          >
            {mandiRates.map((item, idx) => (
              <div
                key={idx}
                className={`flex justify-between items-center py-2 ${
                  idx !== mandiRates.length - 1 ? 'border-b border-outline-variant/30' : ''
                }`}
              >
                <span className="font-body-md font-bold text-on-background text-sm">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-label-bold font-bold text-sm">{item.price}</span>
                  <span
                    className={`text-[11px] font-extrabold px-2 py-0.5 rounded ${
                      item.positive
                        ? 'text-emerald-highlight bg-[#E6F4EA]'
                        : 'text-error bg-error-container'
                    }`}
                  >
                    {item.positive ? `▲ ${item.change}` : `▼ ${item.change}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Satellite Weather Feed */}
          <div
            onClick={() => setActiveModal('ndvi')}
            className="rounded-2xl overflow-hidden h-36 relative mt-1 shadow-md bg-gradient-to-br from-primary to-emerald-800 flex items-end p-4 cursor-pointer group hover:brightness-110 transition"
          >
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 flex flex-col text-white">
              <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
                ISRO / NDVI Soil Health Telemetry
              </span>
              <span className="font-label-bold text-sm text-white font-bold">
                Live Field Moisture &amp; Soil Index (Click to inspect)
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
