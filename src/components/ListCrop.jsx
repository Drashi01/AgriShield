import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function ListCrop({ onBack }) {
  const { createNewBatchListing, addNotification, setActiveTab, farmerProfile } = useApp();

  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Specs & Pricing, 3: Photos & Location

  // Step 1: Details
  const [category, setCategory] = useState('grains');
  const [cropVariety, setCropVariety] = useState('Basmati Rice - Pusa 1121');
  const [harvestStatus, setHarvestStatus] = useState('immediate');
  const [expectedDate, setExpectedDate] = useState('');
  const [moisture, setMoisture] = useState('11.5');
  const [grade, setGrade] = useState('Grade A+');
  const [isOrganic, setIsOrganic] = useState(true);

  // Step 2: Quantity & Pricing
  const [totalQuantity, setTotalQuantity] = useState('1200');
  const [selectedUnit, setSelectedUnit] = useState('Kg');
  const [minLot, setMinLot] = useState('100');
  const [floorPrice, setFloorPrice] = useState('38.50');
  const [duration, setDuration] = useState('48h');

  // Step 3: Photos & Location
  const [photos, setPhotos] = useState([]);
  const [landmarkNotes, setLandmarkNotes] = useState('');
  const [locationName, setLocationName] = useState(farmerProfile.zone);
  const fileInputRef = useRef(null);

  const categories = [
    { id: 'grains', label: 'Grains', icon: 'grass' },
    { id: 'vegetables', label: 'Vegetables', icon: 'eco' },
    { id: 'pulses', label: 'Pulses', icon: 'grain' },
    { id: 'fruits', label: 'Fruits', icon: 'nutrition' },
    { id: 'oilseeds', label: 'Oilseeds', icon: 'water_drop' },
  ];

  const suggestedVarieties = {
    grains: ['Basmati Rice - Pusa 1121', 'Sharbati Wheat Grade-A', 'Sona Masoori Rice', 'Maize Hybrid HQPM'],
    vegetables: ['Organic Hybrid Tomatoes', 'Red Onion Nasik', 'Potatoes Kufri Jyoti', 'Green Chilli G4'],
    pulses: ['Chana Dal (Desi Chickpea)', 'Moong Dal Green', 'Toor Dal Premium', 'Urad Dal Black'],
    fruits: ['Nagpur Orange', 'Alphonso Mango Grade-1', 'Himachal Royal Apple', 'Cavendish Banana'],
    oilseeds: ['Mustard Pusa Bold', 'Soybean JS 335', 'Groundnut G-2', 'Sunflower Sunbred'],
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPhotoUrls = files.map((file) => URL.createObjectURL(file));
      setPhotos((prev) => [...prev, ...newPhotoUrls].slice(0, 4));
    }
  };

  const handleRemovePhoto = (index, e) => {
    e.stopPropagation();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      const listingData = {
        category,
        cropVariety,
        harvestStatus,
        expectedDate: harvestStatus === 'expected' ? expectedDate : 'Ready for Dispatch',
        moisture: `${moisture}%`,
        grade,
        isOrganic,
        totalQuantity,
        selectedUnit,
        minLot,
        floorPrice: `₹${floorPrice}`,
        duration,
        photos,
        locationName,
        landmarkNotes,
      };
      createNewBatchListing(listingData);
      setActiveTab('home');
    }
  };

  const handleDraft = () => {
    addNotification(
      'Draft Saved Offline',
      `Draft for ${cropVariety || 'Crop Batch'} saved in local storage.`,
      'save'
    );
    alert('Draft saved locally in offline storage!');
  };

  return (
    <div className="bg-surface-bright text-on-surface antialiased min-h-screen flex flex-col select-none pb-28 pt-16">
      {/* Hidden File Input for Multiple Crop Photos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* TopAppBar */}
      <header className="bg-surface-bright shadow-sm flex items-center justify-between px-4 h-16 w-full fixed top-0 z-50 border-b border-outline-variant/30">
        <button
          onClick={currentStep > 1 ? () => setCurrentStep(currentStep - 1) : onBack}
          aria-label="Go back"
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 text-primary"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h1 className="font-headline-md text-headline-md font-bold text-primary truncate px-2">
          List New Crop Batch
        </h1>

        <button
          onClick={() =>
            alert('Listing Tip: High-definition crop photos showing grain size and clean sorting attract 2.4x more verified wholesale buyers.')
          }
          aria-label="Help"
          className="w-12 h-12 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 text-primary"
        >
          <span className="material-symbols-outlined">help</span>
        </button>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 pt-6 pb-12 px-margin-mobile md:px-margin-desktop w-full max-w-container-max mx-auto space-y-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Stepper Navigation */}
          <section aria-label="Progress" className="w-full">
            <div className="relative flex items-center justify-between w-full max-w-sm mx-auto">
              {/* Connecting Line Background */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-surface-container-highest z-0"></div>
              {/* Connecting Line Active */}
              <div
                className="absolute left-0 top-1/2 transform -translate-y-1/2 h-[2px] bg-primary z-0 transition-all duration-500 ease-in-out"
                style={{
                  width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
                }}
              ></div>

              {/* Step 1 */}
              <div
                onClick={() => setCurrentStep(1)}
                className="relative z-10 flex flex-col items-center gap-1 cursor-pointer bg-surface-bright px-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                    currentStep > 1
                      ? 'bg-primary text-on-primary'
                      : currentStep === 1
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container-lowest text-outline border-2 border-outline-variant'
                  }`}
                >
                  {currentStep > 1 ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    '1'
                  )}
                </div>
                <span className="font-label-sm text-label-sm text-primary font-bold">Details</span>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setCurrentStep(2)}
                className="relative z-10 flex flex-col items-center gap-1 cursor-pointer bg-surface-bright px-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                    currentStep > 2
                      ? 'bg-primary text-on-primary'
                      : currentStep === 2
                      ? 'bg-surface-container-lowest border-2 border-primary text-primary font-bold'
                      : 'bg-surface-container-lowest text-outline border-2 border-outline-variant'
                  }`}
                >
                  {currentStep > 2 ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    '2'
                  )}
                </div>
                <span
                  className={`font-label-sm text-label-sm ${
                    currentStep >= 2 ? 'text-primary font-bold' : 'text-outline'
                  }`}
                >
                  Specs
                </span>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setCurrentStep(3)}
                className="relative z-10 flex flex-col items-center gap-1 cursor-pointer bg-surface-bright px-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${
                    currentStep === 3
                      ? 'bg-surface-container-lowest border-2 border-primary text-primary font-bold'
                      : 'bg-surface-container-lowest text-outline border-2 border-outline-variant'
                  }`}
                >
                  <span className="font-label-bold text-label-bold">3</span>
                </div>
                <span
                  className={`font-label-sm text-label-sm ${
                    currentStep === 3 ? 'text-primary font-bold' : 'text-outline'
                  }`}
                >
                  Photos
                </span>
              </div>
            </div>
          </section>

          {/* STEP 1: DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  What are you listing?
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  Select a category and specify the variety to help buyers find your produce.
                </p>
              </div>

              {/* Category Grid */}
              <div className="space-y-3">
                <label className="font-label-bold text-label-bold text-on-surface block font-bold">
                  Crop Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setCategory(cat.id);
                        if (suggestedVarieties[cat.id]?.[0]) {
                          setCropVariety(suggestedVarieties[cat.id][0]);
                        }
                      }}
                      className={`h-28 rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        category === cat.id
                          ? 'border-primary bg-primary-fixed text-primary shadow-sm ring-1 ring-primary'
                          : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                      <span className="font-label-bold text-label-bold text-center font-semibold">
                        {cat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crop Variety Input */}
              <div className="space-y-2">
                <label className="font-label-bold text-label-bold text-on-surface block font-bold">
                  Crop Name &amp; Variety
                </label>
                <input
                  type="text"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  className="block w-full px-4 h-[48px] bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary font-bold text-primary"
                  placeholder="e.g. Basmati Rice - Pusa 1121"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestedVarieties[category]?.map((varName) => (
                    <button
                      key={varName}
                      type="button"
                      onClick={() => setCropVariety(varName)}
                      className={`text-xs px-3 py-1 rounded-full border transition ${
                        cropVariety === varName
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-container-low text-on-surface-variant border-outline-variant/50 hover:bg-surface-container'
                      }`}
                    >
                      {varName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Harvest Status Toggle */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                <label className="font-label-bold text-label-bold text-on-surface block font-bold">
                  Harvest Status
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div
                    onClick={() => setHarvestStatus('immediate')}
                    className={`flex-1 cursor-pointer rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                      harvestStatus === 'immediate'
                        ? 'border-primary bg-primary-fixed/40 shadow-sm'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        harvestStatus === 'immediate' ? 'border-primary' : 'border-outline-variant'
                      }`}
                    >
                      {harvestStatus === 'immediate' && (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-bold text-label-bold text-on-surface font-bold">
                        Ready for Dispatch
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Crop is harvested and stored
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setHarvestStatus('expected')}
                    className={`flex-1 cursor-pointer rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                      harvestStatus === 'expected'
                        ? 'border-primary bg-primary-fixed/40 shadow-sm'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:bg-surface-container-low'
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                        harvestStatus === 'expected' ? 'border-primary' : 'border-outline-variant'
                      }`}
                    >
                      {harvestStatus === 'expected' && (
                        <div className="h-3 w-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-bold text-label-bold text-on-surface font-bold">
                        Expected Harvest
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Still in field, pre-booking
                      </span>
                    </div>
                  </div>
                </div>

                {harvestStatus === 'expected' && (
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="block w-full px-4 h-[48px] bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary mt-2"
                  />
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SPECS & PRICING */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-[fadeIn_0.2s_ease-out]">
              {/* Inventory Volume Card */}
              <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-5 md:p-6 shadow-[0_4px_12px_rgba(26,32,44,0.04)]">
                <h2 className="font-body-lg text-body-lg text-on-surface mb-5 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  Inventory Volume
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block font-label-bold text-label-bold text-on-surface mb-2 font-bold">
                      Total Quantity Available
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        className="flex-1 h-touch-target rounded-lg border border-outline-variant px-4 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-bright placeholder:text-outline font-bold text-lg"
                        placeholder="e.g. 500"
                        type="number"
                        value={totalQuantity}
                        onChange={(e) => setTotalQuantity(e.target.value)}
                      />
                      <div className="flex p-1 bg-surface-container rounded-lg border border-surface-variant sm:w-auto w-full h-touch-target items-center">
                        {['Kg', 'Quintal', 'MT'].map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setSelectedUnit(unit)}
                            className={`flex-1 sm:w-20 h-full rounded-md font-label-bold text-label-bold transition-all flex items-center justify-center ${
                              selectedUnit === unit
                                ? 'bg-primary text-on-primary shadow-sm font-bold'
                                : 'text-on-surface-variant hover:bg-surface-variant/50'
                            }`}
                          >
                            {unit}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-bold text-label-bold text-on-surface mb-2 font-bold">
                      Minimum Bid Lot
                    </label>
                    <div className="relative">
                      <input
                        className="w-full h-touch-target rounded-lg border border-outline-variant pl-4 pr-24 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-bright placeholder:text-outline font-bold"
                        placeholder="e.g. 50"
                        type="number"
                        value={minLot}
                        onChange={(e) => setMinLot(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="font-body-md text-body-md text-outline font-semibold">
                          {selectedUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Auction Pricing Card */}
              <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-5 md:p-6 shadow-[0_4px_12px_rgba(26,32,44,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <h2 className="font-body-lg text-body-lg text-on-surface mb-5 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  Auction Pricing
                </h2>
                <div>
                  <label className="block font-label-bold text-label-bold text-on-surface mb-2 font-bold">
                    Starting / Floor Price
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="font-body-lg text-body-lg text-on-surface font-semibold">₹</span>
                    </div>
                    <input
                      className="w-full h-touch-target rounded-lg border border-outline-variant pl-10 pr-16 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-bright placeholder:text-outline text-lg font-bold text-emerald-800"
                      placeholder="0.00"
                      type="number"
                      step="0.5"
                      value={floorPrice}
                      onChange={(e) => setFloorPrice(e.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-sm font-semibold text-gray-500">/ {selectedUnit}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-surface-container-low rounded-lg border border-surface-variant flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">
                        trending_up
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        Current Mandi Spot Price: <strong className="text-on-surface">₹32/{selectedUnit}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-tertiary-fixed/40 px-2 py-1 rounded text-on-tertiary-fixed-variant">
                      <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                      <span className="font-label-sm text-label-sm font-bold">
                        Recommended: ₹30/{selectedUnit}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Duration Card */}
              <section className="bg-surface-container-lowest rounded-xl border border-surface-variant p-5 md:p-6 shadow-[0_4px_12px_rgba(26,32,44,0.04)]">
                <h2 className="font-body-lg text-body-lg text-on-surface mb-2 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-primary">timer</span>
                  Auction Duration
                </h2>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { id: '24h', label: '24h', tag: 'Fast' },
                    { id: '48h', label: '48h', tag: 'Standard' },
                    { id: '72h', label: '3d', tag: 'Max Reach' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDuration(item.id)}
                      className={`h-touch-target flex flex-col items-center justify-center rounded-xl border cursor-pointer transition-all ${
                        duration === item.id
                          ? 'bg-secondary-container text-on-secondary-container border-secondary-container shadow-sm ring-2 ring-secondary-container'
                          : 'border-outline-variant hover:bg-surface-variant/30 text-on-surface-variant bg-surface-container-lowest'
                      }`}
                    >
                      <span className="font-headline-md text-headline-md leading-none mb-1 font-bold">
                        {item.label}
                      </span>
                      <span className="font-label-sm text-label-sm uppercase tracking-wider text-[10px] font-bold">
                        {item.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* STEP 3: PHOTOS & LOCATION */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
              {/* Photos Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-body-lg text-body-lg text-on-surface font-bold">Crop Photos</h2>
                  <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full font-bold">
                    {photos.length} / 4
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Upload clear photos showing the quality and condition of your crop. Good lighting helps buyers decide faster.
                </p>

                {/* 4-Slot Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => {
                    const photo = photos[index];
                    return photo ? (
                      <div
                        key={index}
                        className="aspect-square rounded-2xl border border-outline-variant overflow-hidden relative group shadow-sm bg-black"
                      >
                        <img
                          src={photo}
                          alt={`Crop sample ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(index, e)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-700 shadow-md transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        key={index}
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low flex flex-col items-center justify-center gap-2 hover:bg-surface-container hover:border-primary transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <span className="material-symbols-outlined text-outline text-[32px]">
                          add_a_photo
                        </span>
                        <span className="font-label-bold text-label-bold text-on-surface-variant">
                          Add Photo
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Divider */}
              <hr className="border-t border-outline-variant/30" />

              {/* Farm Location Section */}
              <section className="space-y-4">
                <h2 className="font-body-lg text-body-lg text-on-surface font-bold">Farm Location</h2>
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
                  {/* Mini Map Preview */}
                  <div
                    className="w-full h-36 bg-surface-container-highest relative bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0, 54, 41, 0.4), rgba(0, 54, 41, 0.7)), url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=80')`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse border border-white/30">
                        <span className="material-symbols-outlined fill text-emerald-400 text-[36px] drop-shadow-lg">
                          location_on
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      ISRO Land Parcel Satellite Grid
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[22px] fill">
                          verified
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-label-bold text-label-bold text-on-surface font-bold">
                          {locationName}
                        </h3>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                          GPS location confirmed based on verified land records.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newLoc = prompt('Enter farm location:', locationName);
                          if (newLoc) setLocationName(newLoc);
                        }}
                        className="text-primary font-label-bold text-label-bold hover:underline py-1 px-2 rounded-lg hover:bg-surface-container-low transition-colors font-bold"
                      >
                        Edit
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label
                        className="font-label-sm text-label-sm text-on-surface-variant block font-medium"
                        htmlFor="landmark-notes"
                      >
                        Landmark Notes (Optional)
                      </label>
                      <textarea
                        id="landmark-notes"
                        rows="3"
                        value={landmarkNotes}
                        onChange={(e) => setLandmarkNotes(e.target.value)}
                        placeholder="e.g., North field next to the old water tower, access via dirt road for heavy trucks."
                        className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface placeholder:text-outline rounded-xl p-3 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {/* BottomNavBar (Footer Actions) */}
      <nav className="bg-surface-container-lowest shadow-[0_-4px_12px_rgba(26,32,44,0.08)] fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 py-3 gap-4 border-t border-outline-variant/20">
        <div className="max-w-2xl mx-auto w-full flex gap-4">
          <button
            type="button"
            onClick={handleDraft}
            className="flex-1 h-[48px] flex items-center justify-center gap-2 border-2 border-outline-variant text-on-surface font-label-bold text-label-bold rounded-xl hover:bg-surface-container-high transition-colors active:scale-[0.98] font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-[1.5] h-[48px] flex items-center justify-center gap-2 bg-primary text-on-primary font-label-bold text-label-bold rounded-xl shadow-sm hover:bg-tertiary transition-colors active:scale-[0.98] font-bold"
          >
            <span>{currentStep === 3 ? 'Publish Live Batch' : 'Next Step'}</span>
            <span className="material-symbols-outlined text-[20px]">
              {currentStep === 3 ? 'rocket_launch' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
