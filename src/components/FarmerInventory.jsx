import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function FarmerInventory({ onBack, onNavigateToListCrop }) {
  const {
    inventoryItems,
    addInventoryStock,
    updateInventoryStock,
    adjustReadyToSell,
    deleteInventoryStock,
    listStockToMarketplace,
    openChatWith,
    openBillGenerator,
    farmerProfile,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // New stock form state
  const [stockForm, setStockForm] = useState({
    cropName: '',
    category: 'grains',
    totalHarvestQty: '',
    readyToSellQty: '',
    unit: 'Kg',
    targetPricePerKg: '',
    moisture: '10.5%',
    grade: 'Grade A+',
    isOrganic: true,
    storageLocation: 'Farm Granary Silo #1',
    notes: '',
  });

  // Calculate high level KPI metrics
  const totalStockKg = inventoryItems.reduce((acc, i) => acc + (i.totalHarvestQty || 0), 0);
  const totalReadyToSellKg = inventoryItems.reduce((acc, i) => acc + (i.readyToSellQty || 0), 0);
  const totalStoredReserveKg = inventoryItems.reduce((acc, i) => acc + (i.storedReserveQty || 0), 0);
  const totalEstimatedValue = inventoryItems.reduce(
    (acc, i) => acc + (i.totalHarvestQty * (i.targetPricePerKg || 0)),
    0
  );

  // Filter items
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch =
      item.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setStockForm({
      cropName: '',
      category: 'grains',
      totalHarvestQty: '',
      readyToSellQty: '',
      unit: 'Kg',
      targetPricePerKg: '',
      moisture: '10.5%',
      grade: 'Grade A+',
      isOrganic: true,
      storageLocation: 'Farm Granary Silo #1',
      notes: '',
    });
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditClick = (item) => {
    setStockForm({
      cropName: item.cropName,
      category: item.category,
      totalHarvestQty: item.totalHarvestQty,
      readyToSellQty: item.readyToSellQty,
      unit: item.unit || 'Kg',
      targetPricePerKg: item.targetPricePerKg,
      moisture: item.moisture || '10.5%',
      grade: item.grade || 'Grade A',
      isOrganic: item.isOrganic,
      storageLocation: item.storageLocation,
      notes: item.notes || '',
    });
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!stockForm.cropName.trim() || !stockForm.totalHarvestQty) {
      alert('Please fill in Crop Name and Total Harvest Quantity!');
      return;
    }

    if (editingItem) {
      updateInventoryStock(editingItem.id, stockForm);
      alert(`✅ Updated stock record for ${stockForm.cropName}`);
    } else {
      addInventoryStock(stockForm);
      alert(`✅ Added ${stockForm.totalHarvestQty} ${stockForm.unit} of ${stockForm.cropName} to Granary Inventory!`);
    }

    setShowAddModal(false);
    setEditingItem(null);
  };

  return (
    <main className="pt-[95px] md:pt-[105px] max-w-[1280px] mx-auto px-margin-mobile md:px-gutter pb-36 select-none font-sans text-on-surface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-surface-container text-primary transition"
              title="Back to Dashboard"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline-md text-2xl sm:text-3xl font-extrabold text-on-background tracking-tight">
              Crop Granary &amp; Inventory Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium mt-1 ml-9">
            {farmerProfile.farmName} • Granary Capacity &amp; Ready-to-Sell Allocations
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap ml-9 md:ml-0">
          <button
            onClick={() => openBillGenerator()}
            className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px] text-amber-600">receipt_long</span>
            <span>Mandi Gate Pass</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Add Fresh Harvest Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">
        {/* Total Stock */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Total Granary Stock</span>
            <span className="material-symbols-outlined text-primary text-[20px]">warehouse</span>
          </div>
          <div className="font-headline-md text-xl sm:text-2xl font-black text-on-surface mt-1">
            {totalStockKg.toLocaleString()} <span className="text-xs font-bold text-gray-500">Kg</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {(totalStockKg / 100).toFixed(1)} Quintals Harvested
          </div>
        </div>

        {/* Ready to Sell */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-emerald-500/40 bg-emerald-50/20 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Ready for Wholesale Sale</span>
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">shopping_cart_checkout</span>
          </div>
          <div className="font-headline-md text-xl sm:text-2xl font-black text-emerald-800 mt-1">
            {totalReadyToSellKg.toLocaleString()} <span className="text-xs font-bold text-emerald-600">Kg</span>
          </div>
          <div className="text-[11px] text-gray-600 font-medium mt-1">
            {Math.round((totalReadyToSellKg / (totalStockKg || 1)) * 100)}% of total harvest active for bids
          </div>
        </div>

        {/* In Silo Reserve */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>In Granary Storage</span>
            <span className="material-symbols-outlined text-amber-600 text-[20px]">inventory</span>
          </div>
          <div className="font-headline-md text-xl sm:text-2xl font-black text-on-surface mt-1">
            {totalStoredReserveKg.toLocaleString()} <span className="text-xs font-bold text-gray-500">Kg</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Safe Storage &amp; Price Arbitrage
          </div>
        </div>

        {/* Estimated Value */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 border border-outline-variant/60 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Estimated Stock Value</span>
            <span className="material-symbols-outlined text-emerald-700 text-[20px]">payments</span>
          </div>
          <div className="font-headline-md text-xl sm:text-2xl font-black text-primary mt-1">
            ₹{totalEstimatedValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Avg Mandi MSP Assayed
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface rounded-2xl border border-outline-variant p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[20px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop variety, silo, grade..."
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary bg-surface-container-low"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Crops' },
            { id: 'grains', label: 'Grains' },
            { id: 'vegetables', label: 'Vegetables' },
            { id: 'pulses', label: 'Pulses' },
            { id: 'oilseeds', label: 'Oilseeds' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Crop Cards List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-surface rounded-3xl border border-outline-variant/60">
            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">inventory_2</span>
            <h3 className="font-bold text-base text-on-surface">No crop stock found</h3>
            <p className="text-xs text-gray-500 mt-1">Try changing your filters or add a new harvest stock.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl shadow-sm"
            >
              Add First Crop Stock
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const readyPercent = Math.round((item.readyToSellQty / (item.totalHarvestQty || 1)) * 100);
            const isHighMoisture = item.moistureValue > 12.5;

            return (
              <div
                key={item.id}
                className="bg-surface rounded-3xl p-5 sm:p-6 border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start sm:items-center gap-4 w-full lg:w-1/3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 relative border border-outline-variant">
                    <img
                      src={item.image}
                      alt={item.cropName}
                      className="w-full h-full object-cover"
                    />
                    {item.isOrganic && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        ORGANIC
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-headline-md text-base sm:text-lg font-bold text-on-surface truncate">
                        {item.cropName}
                      </h3>
                      <span className="bg-primary-fixed text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {item.grade}
                      </span>
                    </div>

                    <div className="text-xs text-on-surface-variant font-medium mt-1 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">warehouse</span>
                        <span>{item.storageLocation}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-gray-400">calendar_today</span>
                        <span>Harvested: {item.harvestDate}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isHighMoisture
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">water_drop</span>
                        Moisture: {item.moisture}
                      </span>

                      <span className="text-[10px] text-gray-500 font-mono">
                        Target: ₹{item.targetPricePerKg}/kg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center: Interactive Ready to Sell Slider & Stock Allocator */}
                <div className="w-full lg:w-1/3 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-500 block font-medium">Ready to Sell Now:</span>
                      <strong className="text-emerald-800 text-sm font-extrabold">
                        {item.readyToSellQty.toLocaleString()} {item.unit}
                      </strong>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-500 block font-medium">Stored In Silo:</span>
                      <strong className="text-on-surface text-sm font-bold">
                        {item.storedReserveQty.toLocaleString()} {item.unit}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-full transition-all duration-300"
                      style={{ width: `${readyPercent}%` }}
                    ></div>
                    <div
                      className="bg-amber-400/80 h-full transition-all duration-300"
                      style={{ width: `${100 - readyPercent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>Total Harvest: {item.totalHarvestQty.toLocaleString()} {item.unit}</span>
                    <span className="font-bold text-emerald-800">{readyPercent}% Offered for Sale</span>
                  </div>

                  {/* Stepper Quick Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => adjustReadyToSell(item.id, item.readyToSellQty - 500)}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold border border-outline-variant transition"
                      title="Decrease Ready-to-sell by 500kg"
                    >
                      -500 Kg
                    </button>
                    <button
                      onClick={() => adjustReadyToSell(item.id, item.readyToSellQty + 500)}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold border border-outline-variant transition"
                      title="Increase Ready-to-sell by 500kg"
                    >
                      +500 Kg
                    </button>
                    <button
                      onClick={() => adjustReadyToSell(item.id, Math.round(item.totalHarvestQty * 0.5))}
                      className="px-2 py-1 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold border border-outline-variant transition"
                    >
                      50% Sell
                    </button>
                    <button
                      onClick={() => adjustReadyToSell(item.id, item.totalHarvestQty)}
                      className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition ml-auto"
                    >
                      100% Sell
                    </button>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="w-full lg:w-auto flex flex-row lg:flex-col gap-2 justify-end">
                  <button
                    onClick={() => listStockToMarketplace(item.id)}
                    className="flex-1 lg:flex-none px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                    title="List this ready batch on the Live Wholesale Auction Floor"
                  >
                    <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                    <span>{item.linkedBatchId ? 'Live in Auction' : 'List in Auction'}</span>
                  </button>

                  <button
                    onClick={() => {
                      openChatWith({
                        id: item.linkedBatchId || item.id,
                        title: `${item.cropName} (${item.readyToSellQty} ${item.unit})`,
                        price: `₹${item.targetPricePerKg.toFixed(2)} / ${item.unit}`,
                        farmer: farmerProfile.name,
                      });
                    }}
                    className="flex-1 lg:flex-none px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>Trader Chat</span>
                  </button>

                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-gray-700 transition"
                      title="Edit Stock Details"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${item.cropName} from inventory?`)) {
                          deleteInventoryStock(item.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition"
                      title="Delete / Archive Record"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Inventory Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-[scaleIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">warehouse</span>
                <h3 className="font-headline-md text-lg font-bold text-on-surface">
                  {editingItem ? 'Edit Granary Crop Record' : 'Add Fresh Harvest to Granary'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Crop Variety Name *</label>
                <input
                  type="text"
                  value={stockForm.cropName}
                  onChange={(e) => setStockForm({ ...stockForm, cropName: e.target.value })}
                  placeholder="e.g. Sharbati Wheat Grade A / Basmati Paddy"
                  className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={stockForm.category}
                    onChange={(e) => setStockForm({ ...stockForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface"
                  >
                    <option value="grains">Grains (गेहूं / धान)</option>
                    <option value="vegetables">Vegetables (टमाटर / प्याज)</option>
                    <option value="pulses">Pulses (दालें / चना)</option>
                    <option value="oilseeds">Oilseeds (सरसों)</option>
                    <option value="fruits">Fruits (फल)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Assayed Grade</label>
                  <select
                    value={stockForm.grade}
                    onChange={(e) => setStockForm({ ...stockForm, grade: e.target.value })}
                    className="w-full px-3 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none bg-surface"
                  >
                    <option value="Grade A+">Grade A+ (Export Premium)</option>
                    <option value="Grade A">Grade A (Standard APMC)</option>
                    <option value="Grade B">Grade B (Fair Average)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Total Harvest Volume (Kg) *</label>
                  <input
                    type="number"
                    value={stockForm.totalHarvestQty}
                    onChange={(e) => setStockForm({ ...stockForm, totalHarvestQty: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Ready to Sell (Kg)</label>
                  <input
                    type="number"
                    value={stockForm.readyToSellQty}
                    onChange={(e) => setStockForm({ ...stockForm, readyToSellQty: e.target.value })}
                    placeholder="e.g. 2500"
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Target Price (₹ / Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={stockForm.targetPricePerKg}
                    onChange={(e) => setStockForm({ ...stockForm, targetPricePerKg: e.target.value })}
                    placeholder="e.g. 35.00"
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Moisture Level (%)</label>
                  <input
                    type="text"
                    value={stockForm.moisture}
                    onChange={(e) => setStockForm({ ...stockForm, moisture: e.target.value })}
                    placeholder="e.g. 10.4%"
                    className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Storage Location / Silo Room</label>
                <input
                  type="text"
                  value={stockForm.storageLocation}
                  onChange={(e) => setStockForm({ ...stockForm, storageLocation: e.target.value })}
                  placeholder="e.g. Farm Granary Silo #1 (Aerated) / Khanna Cold Bay"
                  className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isOrganicCheck"
                  checked={stockForm.isOrganic}
                  onChange={(e) => setStockForm({ ...stockForm, isOrganic: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="isOrganicCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Certified Organic Crop (NPOP Certified)
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-surface-container text-on-surface font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Add to Granary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
