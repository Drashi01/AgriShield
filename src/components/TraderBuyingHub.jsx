import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateApmcInvoicePdf } from '../utils/pdfGenerator';

export default function TraderBuyingHub() {
  const {
    traderProfile,
    batches,
    traderOrders,
    placeBidOnBatch,
    executeTraderBuyNow,
    postTraderDemand,
    addEscrowFunds,
    setActiveModal,
    setModalData,
    logout,
    switchRole,
    addNotification,
    watchlist,
    toggleWatchlist,
    openChatWith,
    openBillGenerator,
  } = useApp();

  // Navigation inside Trader Buying Hub
  const [traderTab, setTraderTab] = useState('marketplace'); // 'marketplace' | 'orders' | 'demands' | 'arbitrage'
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);
  const [maxMoisture, setMaxMoisture] = useState(14);
  const [sortBy, setSortBy] = useState('featured'); // 'featured' | 'price_low' | 'price_high' | 'distance' | 'quantity'

  // Modal / Action states
  const [selectedBatchForBuy, setSelectedBatchForBuy] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(500);
  const [selectedBatchForBid, setSelectedBatchForBid] = useState(null);
  const [customBidAmount, setCustomBidAmount] = useState(0);
  const [selectedBatchForAssay, setSelectedBatchForAssay] = useState(null);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [fundsToAdd, setFundsToAdd] = useState(50000);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);

  // New Demand Form State
  const [demandForm, setDemandForm] = useState({
    cropName: 'Sharbati Wheat Grade A',
    category: 'grains',
    targetQuantityKg: 5000,
    targetPricePerKg: 33.5,
    maxMoisture: 10.5,
    preferredZone: 'Punjab & Haryana Mandis',
    deliveryDays: 7,
  });

  // Filtered Batches for Trader Buying
  const filteredBatches = batches
    .filter((batch) => {
      const matchesSearch =
        batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.farmer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'organic'
          ? batch.isOrganic
          : batch.category === selectedCategory;

      const matchesGrade = selectedGrade === 'all' ? true : batch.grade === selectedGrade;
      const matchesOrganic = organicOnly ? batch.isOrganic : true;
      const matchesDistance = (batch.distance || 10) <= maxDistance;
      const moistureNum = parseFloat(batch.moisture) || 11.0;
      const matchesMoisture = moistureNum <= maxMoisture;

      return matchesSearch && matchesCategory && matchesGrade && matchesOrganic && matchesDistance && matchesMoisture;
    })
    .sort((a, b) => {
      if (sortBy === 'price_low') return (a.leadingBid || a.floorPrice) - (b.leadingBid || b.floorPrice);
      if (sortBy === 'price_high') return (b.leadingBid || b.floorPrice) - (a.leadingBid || a.floorPrice);
      if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'quantity') return (b.quantityKg || 0) - (a.quantityKg || 0);
      return 0; // featured
    });

  // Open Buy Now Modal
  const handleOpenBuyNow = (batch) => {
    setSelectedBatchForBuy(batch);
    setBuyQuantity(batch.quantityKg || 1000);
  };

  // Confirm Purchase Execution
  const handleConfirmPurchase = () => {
    if (!selectedBatchForBuy) return;
    const pricePerKg = selectedBatchForBuy.leadingBid || selectedBatchForBuy.floorPrice;
    const baseCost = pricePerKg * buyQuantity;
    const apmcCess = baseCost * 0.015; // 1.5% Mandi Cess
    const freightEstimate = Math.round(buyQuantity * 0.85); // ₹0.85/kg freight
    const totalPayable = baseCost + apmcCess + freightEstimate;

    if (totalPayable > traderProfile.escrowBalance) {
      alert(`Insufficient Escrow Wallet Balance! Need ₹${totalPayable.toLocaleString('en-IN')}, available ₹${traderProfile.escrowBalance.toLocaleString('en-IN')}. Please add funds to proceed.`);
      setShowAddFundsModal(true);
      return;
    }

    executeTraderBuyNow(selectedBatchForBuy, buyQuantity, {
      baseCost,
      apmcCess,
      freightEstimate,
      totalPayable,
      pricePerKg,
    });

    setSelectedBatchForBuy(null);
  };

  // Open Bid Modal
  const handleOpenBidModal = (batch) => {
    setSelectedBatchForBid(batch);
    setCustomBidAmount(Math.round((batch.leadingBid + 1.0) * 10) / 10);
  };

  // Confirm Bid
  const handleConfirmBid = () => {
    if (!selectedBatchForBid || customBidAmount <= selectedBatchForBid.leadingBid) {
      alert(`Bid must be higher than current leading bid of ₹${selectedBatchForBid.leadingBid.toFixed(2)}/kg`);
      return;
    }

    placeBidOnBatch(selectedBatchForBid.id, customBidAmount, `${traderProfile.company} (You)`);
    setSelectedBatchForBid(null);
  };

  // Handle Direct Chat with Farmer
  const handleDirectChat = (batch) => {
    openChatWith({
      id: batch.id,
      title: `${batch.title} (${batch.quantityKg} ${batch.unit})`,
      buyer: traderProfile.company,
      farmer: batch.farmer || 'Farmer Ramesh Kumar',
      price: `₹${(batch.leadingBid || batch.floorPrice).toFixed(2)} / ${batch.unit}`,
      premium: '+5% negotiable',
      timeLeft: batch.timeLeft || 'Live Now',
      isFarmerChat: true,
    });
  };

  // Request Lab Assaying
  const handleRequestAssay = (batch) => {
    setSelectedBatchForAssay(batch);
    setTimeout(() => {
      addNotification(
        'Assaying Sample Requested',
        `Digital moisture and grain quality assaying request sent to Farmer ${batch.farmer} for lot #${batch.id}.`,
        'biotech'
      );
      alert(`✅ Quality & Moisture Assaying Request dispatched to ${batch.farmer}! Laboratory technician will collect sample within 4 hours.`);
      setSelectedBatchForAssay(null);
    }, 300);
  };

  // Post Procurement Demand
  const handlePostDemandSubmit = (e) => {
    e.preventDefault();
    postTraderDemand(demandForm);
    alert(`✅ Wholesale Buying Requirement for ${demandForm.targetQuantityKg} kg of ${demandForm.cropName} broadcasted to 1,200+ local farmers!`);
    setTraderTab('marketplace');
  };

  // Add Funds to Escrow
  const handleAddEscrowFunds = () => {
    addEscrowFunds(fundsToAdd);
    setShowAddFundsModal(false);
    alert(`✅ ₹${fundsToAdd.toLocaleString('en-IN')} added to your SBI Protected Escrow Wallet!`);
  };

  // Categories list
  const categories = [
    { id: 'all', label: 'All Crops (सभी फसलें)', icon: 'grid_view' },
    { id: 'grains', label: 'Grains & Cereals (अनाज)', icon: 'grain' },
    { id: 'pulses', label: 'Pulses & Legumes (दालें)', icon: 'nutrition' },
    { id: 'vegetables', label: 'Vegetables (सब्जियां)', icon: 'temp_preferences_custom' },
    { id: 'oilseeds', label: 'Oilseeds (तिलहन)', icon: 'water_drop' },
    { id: 'organic', label: 'Certified Organic (जैविक)', icon: 'eco' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 pb-24 font-sans select-none">
      
      {/* Top Trader Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand & Trader Portal Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    AgriShield <span className="text-amber-400 font-extrabold text-sm uppercase tracking-wider">Trader Portal</span>
                  </h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    APMC Live
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {traderProfile.company} • Lic #{traderProfile.apmcLicense}
                </p>
              </div>
            </div>

            {/* Mobile Escrow quick badge */}
            <div className="md:hidden flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300">
              <span>₹{(traderProfile.escrowBalance / 100000).toFixed(1)}L</span>
            </div>
          </div>

          {/* Trader Quick Stats & Action Center */}
          <div className="flex items-center gap-3 flex-wrap justify-between md:justify-end">
            {/* Escrow Balance Wallet */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-1.5 flex items-center gap-3">
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  SBI Escrow Vault Balance
                </div>
                <div className="text-sm sm:text-base font-black text-amber-400 font-mono">
                  ₹{traderProfile.escrowBalance.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                onClick={() => setShowAddFundsModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-black transition flex items-center gap-1 shadow-sm active:scale-95"
                title="Add balance to Escrow Wallet"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add Funds</span>
              </button>
            </div>

            {/* Bill Generator button */}
            <button
              onClick={() => openBillGenerator()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Generate Official APMC Bill & Invoice"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span className="hidden sm:inline">Bill</span> Generator
            </button>

            {/* Direct Trader-Farmer Chat button */}
            <button
              onClick={() => setActiveModal('chat')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Open Direct Chat & Negotiation"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span className="hidden sm:inline">Farmer</span> Chat
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            </button>

            {/* Switch to Farmer Mode button */}
            <button
              onClick={() => switchRole('farmer')}
              className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/40 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 active:scale-95"
              title="Switch directly to Farmer View"
            >
              <span className="material-symbols-outlined text-[16px]">agriculture</span>
              <span className="hidden sm:inline">Switch to</span> Farmer View
            </button>

            {/* Logout button */}
            <button
              onClick={logout}
              className="bg-slate-800 hover:bg-red-950/60 hover:text-red-300 hover:border-red-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* Trader Navigation Sub-Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar border-t border-slate-800/80 pt-2 pb-2">
          <button
            onClick={() => setTraderTab('marketplace')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              traderTab === 'marketplace'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span>Direct Farm Sourcing ({batches.length} Lots)</span>
          </button>

          <button
            onClick={() => setTraderTab('orders')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 whitespace-nowrap relative ${
              traderTab === 'orders'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span>My Procurement Orders</span>
            {traderOrders.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {traderOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTraderTab('demands')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              traderTab === 'demands'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>Post Buying Requirement</span>
          </button>

          <button
            onClick={() => setTraderTab('arbitrage')}
            className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center gap-2 whitespace-nowrap ${
              traderTab === 'arbitrage'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span>Mandi Arbitrage Radar</span>
          </button>
        </div>
      </header>

      {/* Live Mandi Arbitrage Ticker */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white text-xs py-2 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 font-black text-amber-300 shrink-0">
            <span className="material-symbols-outlined text-[16px] text-amber-400">insights</span>
            <span>LIVE WHOLESALE BENCHMARK:</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] font-medium shrink-0">
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">Khanna APMC Wheat:</span> ₹34.80/kg
              <span className="text-emerald-300 font-bold">(Farm Direct: ₹32.00 • Save ₹2.80)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">Ludhiana Hybrid Tomato:</span> ₹44.00/kg
              <span className="text-emerald-300 font-bold">(Farm Direct: ₹38.00 • Save ₹6.00)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold text-white">Rajpura Organic Rajma:</span> ₹118.00/kg
              <span className="text-emerald-300 font-bold">(Farm Direct: ₹95.00 • Save ₹23.00)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ===================== TAB 1: SOURCING MARKETPLACE ===================== */}
        {traderTab === 'marketplace' && (
          <div className="space-y-6">
            
            {/* Top Sourcing Header Hero */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30 mb-3">
                  <span className="material-symbols-outlined text-[15px]">verified</span>
                  <span>Direct Farm-Gate Procurement Hub</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Buy Fresh Crop Harvests Directly from Verified Farmers
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Eliminate multiple mandi agent cuts. Procure bulk harvest lots with 100% verified moisture certificates, assaying reports, and SBI Escrow protection.
                </p>
              </div>

              {/* Quick Actions Card on Right */}
              <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
                <button
                  onClick={() => setTraderTab('demands')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-5 py-3 rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Post Sourcing Demand</span>
                </button>
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 text-center text-xs">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Average Trader Margin</span>
                  <span className="text-emerald-400 font-extrabold text-base">+18.4% Net Savings</span>
                </div>
              </div>
            </div>

            {/* Categories Carousel */}
            <div className="flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shadow-sm border ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-amber-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-amber-500">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Smart Filters & Search Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                {/* Search Box */}
                <div className="sm:col-span-6 relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by crop (e.g. Tomato, Wheat), farmer name, or village..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  )}
                </div>

                {/* Grade Filter */}
                <div className="sm:col-span-3">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="all">All Quality Grades (सभी ग्रेड)</option>
                    <option value="Grade A+">Grade A+ (Export Quality)</option>
                    <option value="Grade A">Grade A (Premium Mill Grade)</option>
                    <option value="Grade B">Grade B (Standard Mandi)</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="sm:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-bold text-slate-700 bg-white"
                  >
                    <option value="featured">Sort: Featured Live Lots</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="distance">Distance: Nearest Farm Gate</option>
                    <option value="quantity">Lot Size: Largest Volume</option>
                  </select>
                </div>
              </div>

              {/* Extra Filter Toggles: Distance, Moisture, Organic */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Organic Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      checked={organicOnly}
                      onChange={(e) => setOrganicOnly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-900">🌿 Organic Certified Only</span>
                  </label>

                  {/* Distance Slider */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Max Radius:</span>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      step="5"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-24 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-900">{maxDistance} km</span>
                  </div>

                  {/* Max Moisture */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-600">Max Moisture:</span>
                    <input
                      type="range"
                      min="8"
                      max="16"
                      step="0.5"
                      value={maxMoisture}
                      onChange={(e) => setMaxMoisture(parseFloat(e.target.value))}
                      className="w-20 accent-slate-900 cursor-pointer"
                    />
                    <span className="font-mono font-bold text-slate-900">{maxMoisture}%</span>
                  </div>
                </div>

                <div className="text-slate-500 font-bold">
                  Showing <span className="text-slate-900">{filteredBatches.length}</span> verified farm lots
                </div>
              </div>
            </div>

            {/* Farm Lots Grid */}
            {filteredBatches.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">search_off</span>
                <h3 className="text-lg font-bold text-slate-800">No crop lots matched your filters</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Try adjusting the maximum distance, moisture limit, or category filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedGrade('all');
                    setOrganicOnly(false);
                    setMaxDistance(80);
                    setMaxMoisture(15);
                    setSearchQuery('');
                  }}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBatches.map((batch) => {
                  const isWatchlisted = watchlist.includes(batch.id);
                  const pricePerKg = batch.leadingBid || batch.floorPrice;
                  const estimatedTotalLotPrice = pricePerKg * batch.quantityKg;

                  return (
                    <div
                      key={batch.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Crop Image & Badges */}
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            src={batch.images?.[0] || 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80'}
                            alt={batch.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                            <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              LIVE HARVEST LOT
                            </span>
                            {batch.isOrganic && (
                              <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                🌿 Organic
                              </span>
                            )}
                          </div>

                          {/* Watchlist Bookmark */}
                          <button
                            onClick={() => toggleWatchlist(batch.id)}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center transition active:scale-90"
                            title={isWatchlisted ? 'Remove Bookmark' : 'Bookmark Lot'}
                          >
                            <span className={`material-symbols-outlined text-[18px] ${isWatchlisted ? 'text-amber-400 fill' : ''}`}>
                              bookmark
                            </span>
                          </button>

                          {/* Bottom info over image */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                            <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-amber-400">timer</span>
                              {batch.timeLeft || '24h left'}
                            </span>
                            <span className="bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-emerald-400">pin_drop</span>
                              {batch.distance} km away
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-4">
                          
                          {/* Title & Farmer Identity */}
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                                {batch.title}
                              </h3>
                              <span className="text-[11px] font-mono font-bold text-slate-400">
                                #{batch.id}
                              </span>
                            </div>

                            {/* Farmer Details */}
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                              <span className="material-symbols-outlined text-[16px] text-emerald-600">person</span>
                              <span className="font-bold text-slate-800">{batch.farmer || 'Ramesh Kumar'}</span>
                              <span>•</span>
                              <span className="text-slate-500 truncate">{batch.location || 'Punjab Zone 4'}</span>
                            </div>
                          </div>

                          {/* Quality Specs Grid */}
                          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Available Lot</span>
                              <span className="text-xs font-black text-slate-900">
                                {batch.quantityKg?.toLocaleString('en-IN')} {batch.unit || 'Kg'}
                              </span>
                            </div>
                            <div className="border-x border-slate-200">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Assayed Grade</span>
                              <span className="text-xs font-black text-emerald-700">{batch.grade || 'Grade A'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Moisture</span>
                              <span className="text-xs font-black text-slate-900">{batch.moisture || '11.2%'}</span>
                            </div>
                          </div>

                          {/* Pricing Matrix */}
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                                Direct Farm Rate
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-slate-950 font-mono">
                                  ₹{pricePerKg.toFixed(2)}
                                </span>
                                <span className="text-xs font-bold text-slate-600">/ {batch.unit || 'kg'}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">
                                Full Lot Value
                              </span>
                              <span className="text-xs font-mono font-extrabold text-slate-900">
                                ₹{estimatedTotalLotPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="block text-[10px] text-emerald-700 font-bold">
                                {batch.bidsCount || 0} active bids
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="p-5 pt-0 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {/* Buy Now Button */}
                          <button
                            onClick={() => handleOpenBuyNow(batch)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-slate-900/10 active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px] text-amber-400">bolt</span>
                            <span>Buy Now (थोक खरीद)</span>
                          </button>

                          {/* Place Bid Button */}
                          <button
                            onClick={() => handleOpenBidModal(batch)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <span className="material-symbols-outlined text-[16px]">gavel</span>
                            <span>Place APMC Bid</span>
                          </button>
                        </div>

                        {/* Secondary Actions: Chat & Assaying Sample */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDirectChat(batch)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            <span>Chat with Farmer</span>
                          </button>

                          <button
                            onClick={() => handleRequestAssay(batch)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-1.5 px-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1 border border-emerald-200"
                          >
                            <span className="material-symbols-outlined text-[14px]">science</span>
                            <span>Request Lab Test</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ===================== TAB 2: MY PROCUREMENT ORDERS ===================== */}
        {traderTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">receipt_long</span>
                    <span>Trader Procurement Orders &amp; Tax Invoices</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Track your purchased crop batches, digital bills, SBI Escrow release statuses, and farm pickup logistics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1.5 rounded-xl">
                    {traderOrders.length} Executed Deals
                  </span>
                </div>
              </div>

              {/* Orders List */}
              {traderOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <span className="material-symbols-outlined text-[54px] text-slate-300 mb-3">shopping_cart</span>
                  <h3 className="text-base font-bold text-slate-700">No Crop Orders Placed Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
                    Browse the Direct Farm Sourcing marketplace to purchase fresh lots directly from farmers with instant escrow protection.
                  </p>
                  <button
                    onClick={() => setTraderTab('marketplace')}
                    className="bg-slate-900 text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-slate-800 transition"
                  >
                    Browse Live Crop Lots
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 mt-4">
                  {traderOrders.map((order) => (
                    <div key={order.orderId} className="py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 p-3 rounded-2xl transition">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg shrink-0">
                          📦
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{order.cropTitle}</h4>
                            <span className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                              {order.orderId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Purchased from <span className="font-bold text-slate-800">{order.farmerName}</span> • {order.farmerLocation}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-600">
                            <span>Quantity: <b>{order.quantityKg?.toLocaleString('en-IN')} kg</b></span>
                            <span>•</span>
                            <span>Rate: <b>₹{order.pricePerKg?.toFixed(2)}/kg</b></span>
                            <span>•</span>
                            <span>Date: <b>{order.timestamp}</b></span>
                          </div>
                        </div>
                      </div>

                      {/* Right side: Amount & Actions */}
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                        <div>
                          <div className="text-base sm:text-lg font-black text-slate-950 font-mono text-right">
                            ₹{order.totalPayable?.toLocaleString('en-IN')}
                          </div>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            SBI Escrow Locked (Safe)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => {
                              openBillGenerator({
                                invoiceNo: order.orderId ? `PB-INV-${order.orderId}` : undefined,
                                cropTitle: order.cropTitle,
                                quantityKg: order.quantityKg,
                                pricePerKg: order.pricePerKg,
                                farmer: order.farmerName,
                                trader: traderProfile.company,
                              });
                            }}
                            className="bg-emerald-800 text-white hover:bg-emerald-700 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                            <span>Generate Official APMC Bill</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== TAB 3: POST BUYING REQUIREMENT ===================== */}
        {traderTab === 'demands' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold mb-2">
                  <span className="material-symbols-outlined text-[15px]">campaign</span>
                  <span>Trader Procurement Broadcast</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Post Your Wholesale Crop Buying Demand (खरीद मांग)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Specify your required crop, tonnage, acceptable moisture limit, and target price. Your requirement will be broadcasted to over 1,200+ local registered farmers.
                </p>
              </div>

              <form onSubmit={handlePostDemandSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Crop Variety Needed *
                    </label>
                    <input
                      type="text"
                      value={demandForm.cropName}
                      onChange={(e) => setDemandForm({ ...demandForm, cropName: e.target.value })}
                      placeholder="e.g. Sharbati Wheat Grade A"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={demandForm.category}
                      onChange={(e) => setDemandForm({ ...demandForm, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium bg-white"
                    >
                      <option value="grains">Grains & Cereals (अनाज)</option>
                      <option value="pulses">Pulses & Legumes (दालें)</option>
                      <option value="vegetables">Vegetables (सब्जियां)</option>
                      <option value="oilseeds">Oilseeds (तिलहन)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Volume / Quantity (Kg) *
                    </label>
                    <input
                      type="number"
                      value={demandForm.targetQuantityKg}
                      onChange={(e) => setDemandForm({ ...demandForm, targetQuantityKg: parseFloat(e.target.value) })}
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      = {(demandForm.targetQuantityKg / 1000).toFixed(1)} Metric Tonnes (MT)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Buying Rate (₹ / Kg) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={demandForm.targetPricePerKg}
                      onChange={(e) => setDemandForm({ ...demandForm, targetPricePerKg: parseFloat(e.target.value) })}
                      placeholder="e.g. 33.5"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                      required
                    />
                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                      Estimated Outlay: ₹{(demandForm.targetQuantityKg * demandForm.targetPricePerKg).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Acceptable Moisture %
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={demandForm.maxMoisture}
                      onChange={(e) => setDemandForm({ ...demandForm, maxMoisture: parseFloat(e.target.value) })}
                      placeholder="e.g. 11.0"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Sourcing Region / Mandis
                    </label>
                    <input
                      type="text"
                      value={demandForm.preferredZone}
                      onChange={(e) => setDemandForm({ ...demandForm, preferredZone: e.target.value })}
                      placeholder="e.g. Ludhiana, Khanna, Fatehgarh Sahib"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Trader Guarantee &amp; Escrow Verification</span>
                  </div>
                  <p>
                    Your procurement demand is published under APMC License #{traderProfile.apmcLicense}. Farmers can accept your price directly or send you counter quotes.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 px-4 rounded-xl text-sm transition shadow-lg active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px] text-amber-400">broadcast_on_personal</span>
                  <span>Broadcast Buying Demand to Local Farmers</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================== TAB 4: MANDI ARBITRAGE RADAR ===================== */}
        {traderTab === 'arbitrage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                    <span>Mandi vs Farm-Gate Price Arbitrage Radar</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Live comparison of local APMC Mandi wholesale rates versus direct farm-gate farmer listings.
                  </p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-xl">
                  Refreshed: Real-time IST
                </span>
              </div>

              {/* Arbitrage Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    crop: 'Sharbati Wheat Grade A',
                    apmcMandi: 'Khanna Grain Mandi',
                    apmcRate: 34.80,
                    farmRate: 32.00,
                    marginPct: '+8.7%',
                    availQty: '2,500 Kg',
                  },
                  {
                    crop: 'Hybrid Red Tomatoes',
                    apmcMandi: 'Ludhiana APMC',
                    apmcRate: 44.00,
                    farmRate: 38.00,
                    marginPct: '+15.8%',
                    availQty: '1,200 Kg',
                  },
                  {
                    crop: 'Organic Red Kidney Beans',
                    apmcMandi: 'Rajpura Wholesale Yard',
                    apmcRate: 118.00,
                    farmRate: 95.00,
                    marginPct: '+24.2%',
                    availQty: '800 Kg',
                  },
                  {
                    crop: 'Basmati Rice 1121',
                    apmcMandi: 'Sirhind Mandi',
                    apmcRate: 42.50,
                    farmRate: 38.50,
                    marginPct: '+10.4%',
                    availQty: '4,000 Kg',
                  },
                  {
                    crop: 'Yellow Mustard Seeds',
                    apmcMandi: 'Patiala Mandi',
                    apmcRate: 56.00,
                    farmRate: 51.50,
                    marginPct: '+8.7%',
                    availQty: '1,800 Kg',
                  },
                  {
                    crop: 'Red Nashik Onion',
                    apmcMandi: 'Jalandhar Sabzi Mandi',
                    apmcRate: 26.50,
                    farmRate: 22.00,
                    marginPct: '+20.4%',
                    availQty: '3,200 Kg',
                  },
                ].map((item, idx) => {
                  const perKgSaving = (item.apmcRate - item.farmRate).toFixed(2);
                  return (
                    <div key={idx} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm text-slate-900">{item.crop}</h4>
                        <span className="bg-emerald-100 text-emerald-900 text-[11px] font-black px-2 py-0.5 rounded-md">
                          {item.marginPct} Saving
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">{item.apmcMandi}</span>
                          <span className="font-mono font-bold text-slate-700">₹{item.apmcRate.toFixed(2)}/kg</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Farm-Gate Direct</span>
                          <span className="font-mono font-black text-emerald-700">₹{item.farmRate.toFixed(2)}/kg</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-2.5 rounded-xl text-xs text-emerald-950 flex items-center justify-between font-bold">
                        <span>Net Trader Profit:</span>
                        <span className="font-mono text-emerald-800 font-black">+₹{perKgSaving} / kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: BUY NOW PROCUREMENT CHECKOUT MODAL */}
      {/* ========================================================================= */}
      {selectedBatchForBuy && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-[10px] font-black px-2.5 py-0.5 rounded-full mb-1">
                  <span className="material-symbols-outlined text-[13px]">bolt</span>
                  DIRECT WHOLESALE CROP BUYOUT
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedBatchForBuy.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Seller: <span className="font-bold text-slate-800">{selectedBatchForBuy.farmer}</span> • {selectedBatchForBuy.location}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchForBuy(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Quantity Slider / Input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Select Procurement Volume (Kg):</span>
                <span className="font-mono text-slate-900 font-extrabold text-sm">{buyQuantity.toLocaleString('en-IN')} Kg</span>
              </div>
              <input
                type="range"
                min="100"
                max={selectedBatchForBuy.quantityKg || 1000}
                step="50"
                value={buyQuantity}
                onChange={(e) => setBuyQuantity(parseInt(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                <span>Min: 100 Kg</span>
                <button
                  onClick={() => setBuyQuantity(selectedBatchForBuy.quantityKg || 1000)}
                  className="text-amber-700 hover:underline font-extrabold"
                >
                  Buy Entire Lot ({selectedBatchForBuy.quantityKg} Kg)
                </button>
              </div>
            </div>

            {/* Itemized Price Breakdown */}
            {(() => {
              const pricePerKg = selectedBatchForBuy.leadingBid || selectedBatchForBuy.floorPrice;
              const baseCost = pricePerKg * buyQuantity;
              const apmcCess = baseCost * 0.015;
              const freightEstimate = Math.round(buyQuantity * 0.85);
              const totalPayable = baseCost + apmcCess + freightEstimate;

              return (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Base Crop Cost ({buyQuantity} kg @ ₹{pricePerKg.toFixed(2)})</span>
                    <span className="font-mono font-bold text-slate-900">₹{baseCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">APMC Statutory Mandi Cess (1.5%)</span>
                    <span className="font-mono font-bold text-slate-900">₹{apmcCess.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Est. Farm-to-Warehouse Logistics</span>
                    <span className="font-mono font-bold text-slate-900">₹{freightEstimate.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-2 text-sm font-extrabold bg-slate-900 text-white px-3.5 rounded-xl mt-2">
                    <span>Total Amount (SBI Escrow Lock):</span>
                    <span className="font-mono text-amber-400">₹{totalPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Your Escrow Wallet: <b>₹{traderProfile.escrowBalance.toLocaleString('en-IN')}</b></span>
                    <span className="text-emerald-700 font-bold">100% Escrow Protected</span>
                  </div>
                </div>
              );
            })()}

            {/* Confirm Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSelectedBatchForBuy(null)}
                className="py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPurchase}
                className="py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs transition shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-400">lock</span>
                <span>Confirm &amp; Lock Deal</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PLACE APMC BID MODAL */}
      {/* ========================================================================= */}
      {selectedBatchForBid && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Place Live APMC Wholesale Bid
                </h3>
                <p className="text-xs text-slate-500">{selectedBatchForBid.title} • #{selectedBatchForBid.id}</p>
              </div>
              <button
                onClick={() => setSelectedBatchForBid(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] text-slate-500 font-bold uppercase">Current Leading Bid</span>
              <div className="text-2xl font-black font-mono text-slate-900">
                ₹{selectedBatchForBid.leadingBid.toFixed(2)} <span className="text-xs text-slate-500 font-normal">/ {selectedBatchForBid.unit}</span>
              </div>
              <span className="text-[11px] text-slate-500 block">by {selectedBatchForBid.leadingBuyer}</span>
            </div>

            {/* Bid Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your New Bid (₹ / {selectedBatchForBid.unit}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={customBidAmount}
                  onChange={(e) => setCustomBidAmount(parseFloat(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-base focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Quick Increment Buttons */}
              <div className="flex items-center gap-2 mt-2">
                {[0.5, 1.0, 2.0, 5.0].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => setCustomBidAmount(Math.round((selectedBatchForBid.leadingBid + inc) * 10) / 10)}
                    className="flex-1 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800 transition"
                  >
                    +₹{inc}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleConfirmBid}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">gavel</span>
              <span>Submit Verified APMC Bid</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INVOICE / RECEIPT VIEWER */}
      {/* ========================================================================= */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tax Invoice &amp; e-Way Bill</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Invoice #{selectedOrderReceipt.orderId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Buyer:</span> <b>{traderProfile.company}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">APMC License:</span> <b>{traderProfile.apmcLicense}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Seller / Farmer:</span> <b>{selectedOrderReceipt.farmerName}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Farm Location:</span> <b>{selectedOrderReceipt.farmerLocation}</b></div>
              <hr className="border-slate-200 my-1" />
              <div className="flex justify-between"><span className="text-slate-500">Commodity:</span> <b>{selectedOrderReceipt.cropTitle}</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Net Weight:</span> <b>{selectedOrderReceipt.quantityKg} Kg</b></div>
              <div className="flex justify-between"><span className="text-slate-500">Rate / Kg:</span> <b>₹{selectedOrderReceipt.pricePerKg?.toFixed(2)}</b></div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-800">₹{selectedOrderReceipt.totalPayable?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  generateApmcInvoicePdf({
                    invoiceNo: selectedOrderReceipt.orderId || 'APMC-INV-7719',
                    cropTitle: selectedOrderReceipt.cropTitle,
                    farmerName: selectedOrderReceipt.farmerName,
                    farmerLocation: selectedOrderReceipt.farmerLocation,
                    traderName: traderProfile.name,
                    traderCompany: traderProfile.company,
                    apmcLicense: traderProfile.apmcLicense,
                    quantityKg: selectedOrderReceipt.quantityKg,
                    pricePerKg: selectedOrderReceipt.pricePerKg,
                    paymentMode: 'e-NAM Protected Escrow (Auto-Settled)',
                    escrowStatus: 'Funds Locked in Escrow',
                    mandiFeePercent: 1.5,
                    rdfFeePercent: 1.0,
                    weighbridgeFee: 150,
                  });
                }}
                className="bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-md flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Official Tax PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD FUNDS TO ESCROW MODAL */}
      {/* ========================================================================= */}
      {showAddFundsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Add Funds to Escrow Vault</h3>
                <p className="text-xs text-slate-500">Top up your SBI Corporate Escrow Account</p>
              </div>
              <button
                onClick={() => setShowAddFundsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Enter Amount (₹) *
              </label>
              <input
                type="number"
                step="5000"
                value={fundsToAdd}
                onChange={(e) => setFundsToAdd(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-base focus:ring-2 focus:ring-slate-900"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setFundsToAdd(amt)}
                    className="py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-800"
                  >
                    +₹{(amt / 1000)}k
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddEscrowFunds}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-xl text-xs transition shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
              <span>Deposit into Escrow via SBI NetBanking / RTGS</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
