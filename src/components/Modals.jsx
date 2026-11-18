import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateInvoicePDF } from '../utils/pdfGenerator';

export default function Modals() {
  const {
    activeModal,
    setActiveModal,
    modalData,
    notifications,
    markAllNotificationsRead,
    farmerProfile,
    traderProfile,
    userRole,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendChatMessage,
    finalizeDealFromChat,
    openBillGenerator,
  } = useApp();

  // Call timer state for KVK Helpline
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Direct Chat input & voice recording simulation state
  const [chatInput, setChatInput] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const activeConv = conversations?.find((c) => c.id === activeConversationId) || conversations?.[0];

  const isUserTrader = userRole === 'trader';
  const myRole = isUserTrader ? 'trader' : 'farmer';
  const counterpartName = isUserTrader
    ? activeConv?.farmerName || 'Farmer Ramesh Kumar'
    : activeConv?.traderName || modalData?.buyer || 'Apex Agro Millers';

  useEffect(() => {
    let interval = null;
    if (activeModal === 'kvk') {
      interval = setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeModal]);

  if (!activeModal) return null;

  const formatCallTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (textToSend = null, options = {}) => {
    const text = textToSend || chatInput;
    if (!text || !text.trim() || !activeConv) return;
    sendChatMessage(activeConv.id, text, options);
    setChatInput('');
  };

  const handleSimulateVoiceNote = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      handleSendMessage('🎤 Voice Note (0:14) — "Confirmed crop quality is prime A+ grade, ready for loading whenever transport truck arrives."', {
        type: 'voice',
      });
    }, 1200);
  };

  const handleSendPhotoAssay = () => {
    handleSendMessage('📷 Shared Moisture & Assay Lab Certificate: 10.4% Moisture, 99.2% Purity Verified by KVK Lab.', {
      type: 'image',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      {/* 1. NOTIFICATIONS MODAL */}
      {activeModal === 'notifications' && (
        <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-[scaleIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[24px]">notifications</span>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">Notifications</h3>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto hide-scrollbar">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl flex items-start gap-3 border transition ${
                  n.unread
                    ? 'bg-primary-fixed/20 border-primary/40'
                    : 'bg-surface-container-low border-outline-variant/30 opacity-80'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-primary-container text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xs text-on-surface">{n.title}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{n.msg}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2 border-t border-outline-variant/30">
            <button
              onClick={markAllNotificationsRead}
              className="flex-1 py-2.5 bg-surface-container text-primary font-bold text-xs rounded-xl hover:bg-surface-container-high transition"
            >
              Mark all as read
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 2. TRADER <-> FARMER DIRECT CHAT & NEGOTIATION MODAL */}
      {activeModal === 'chat' && (
        <div className="bg-surface rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl border border-outline-variant flex flex-col gap-3 animate-[scaleIn_0.2s_ease-out] max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                <span className="material-symbols-outlined text-[24px]">
                  {isUserTrader ? 'agriculture' : 'storefront'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-headline-md text-sm sm:text-base font-bold text-on-surface">
                    {counterpartName}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {isUserTrader ? 'Verified Farmer' : 'APMC Buyer'}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 font-medium flex items-center gap-2">
                  <span>Chatting as: <strong className="text-primary">{isUserTrader ? traderProfile.company : farmerProfile.name}</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  openBillGenerator({
                    cropTitle: activeConv?.cropTitle || modalData?.title,
                    pricePerKg: activeConv?.currentPrice || modalData?.price,
                    trader: isUserTrader ? traderProfile.company : counterpartName,
                    farmer: isUserTrader ? counterpartName : farmerProfile.name,
                  });
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
                title="Generate APMC Mandi Bill & Tax Invoice"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span className="hidden sm:inline">Bill</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal('kvk');
                }}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 transition"
                title="Connect call with agronomist/counterpart"
              >
                <span className="material-symbols-outlined text-[17px]">call</span>
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Active Conversation Switcher Tabs */}
          {conversations && conversations.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 border-b border-outline-variant/30">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    conv.id === activeConv?.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {conv.status.includes('Finalized') ? 'verified' : 'chat'}
                  </span>
                  <span>{conv.cropTitle.split('(')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Lot Context & Escrow Action Bar */}
          <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/40 flex flex-wrap justify-between items-center gap-2 text-xs">
            <div>
              <span className="text-gray-500 block font-medium">Batch In Discussion:</span>
              <span className="font-bold text-on-surface text-sm">
                {activeConv?.cropTitle || modalData?.title || 'Organic Hybrid Tomatoes'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-gray-500 block font-medium">Discussion Price:</span>
                <span className="font-extrabold text-emerald-800 text-sm">
                  {activeConv?.currentPrice || modalData?.price || '₹42.50 / kg'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (activeConv) {
                    finalizeDealFromChat(activeConv.id, activeConv.currentPrice);
                  }
                }}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Lock SBI Escrow</span>
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto flex flex-col gap-3 bg-surface-container-low/60 rounded-2xl text-xs max-h-[300px] min-h-[220px]">
            {activeConv?.messages?.map((m) => {
              const isMine = m.senderRole === myRole;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[85%] ${
                    isMine ? 'self-end items-end' : 'self-start items-start'
                  }`}
                >
                  <span className="text-[10px] text-gray-500 font-medium mb-0.5 px-1">
                    {m.senderName} • {m.timestamp}
                  </span>
                  <div
                    className={`p-3 rounded-2xl leading-relaxed shadow-sm ${
                      isMine
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-white text-on-surface rounded-tl-none border border-outline-variant/40'
                    }`}
                  >
                    {m.text}

                    {m.proposalData && (
                      <div className={`mt-2 p-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                        isMine
                          ? 'bg-white/15 border-white/30 text-white'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}>
                        <span>Proposal: <strong>{m.proposalData.price}</strong> ({m.proposalData.terms})</span>
                        {!isMine && (
                          <button
                            onClick={() => handleSendMessage(`Agreed to proposal of ${m.proposalData.price} with ${m.proposalData.terms}! Locking deal now.`)}
                            className="ml-2 px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-800 transition"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Negotiation Action Chips */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {[
              { label: '💰 Counter ₹41.50/kg', text: 'We propose a counter offer of ₹41.50/kg for the full batch volume.' },
              { label: '💰 Counter ₹43.00/kg', text: 'Can we settle on ₹43.00/kg with guaranteed same-day loading?' },
              { label: '🚚 Farm-Gate Pickup', text: 'We require pickup arranged directly from farm gate with APMC transit e-Way bill.' },
              { label: '🔬 Lab Assaying < 11% Moisture', text: 'Moisture sample assayed at 10.4% with zero fungal infestation.' },
              { label: '🤝 Accept & Lock Contract', text: 'Deal agreed! Please lock the payment in SBI Smart Contract Escrow.' },
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-primary/40 bg-primary-fixed/20 text-primary hover:bg-primary-fixed whitespace-nowrap transition"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Input & Media Actions Bar */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSendPhotoAssay}
              className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-gray-700 flex items-center justify-center transition"
              title="Attach assay certificate or batch photo"
            >
              <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            </button>
            <button
              onClick={handleSimulateVoiceNote}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                isRecordingVoice
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-surface-container hover:bg-surface-container-high text-gray-700'
              }`}
              title="Record voice audio note"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
            </button>

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isRecordingVoice ? 'Recording voice note...' : `Message ${counterpartName}...`}
              className="flex-1 border border-outline-variant rounded-xl text-xs px-3.5 py-2.5 focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              onClick={() => handleSendMessage()}
              className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. KVK AGRONOMIST TELE-CONSULTATION MODAL */}
      {activeModal === 'kvk' && (
        <div className="bg-gradient-to-b from-[#003629] to-[#002117] text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-500/30 flex flex-col items-center text-center gap-5 animate-[scaleIn_0.2s_ease-out]">
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center relative animate-pulse">
            <span className="material-symbols-outlined text-emerald-400 text-5xl">support_agent</span>
            <span className="w-4 h-4 bg-emerald-400 rounded-full absolute bottom-1 right-1 border-2 border-[#003629]"></span>
          </div>

          <div>
            <h3 className="font-headline-md text-xl font-bold text-white">
              Dr. Harpreet Singh (Agronomist)
            </h3>
            <p className="text-xs text-emerald-300 mt-0.5">
              Krishi Vigyan Kendra (KVK Ludhiana &amp; ICAR Helpline)
            </p>
            <div className="inline-block bg-white/10 px-3 py-1 rounded-full text-xs font-mono font-bold mt-2 text-emerald-200">
              ⏱️ Call Duration: {formatCallTime(callSeconds)}
            </div>
          </div>

          {/* Live Call Transcript / Audio Wave */}
          <div className="bg-black/40 border border-white/10 p-4 rounded-2xl w-full text-left text-xs leading-relaxed text-emerald-100">
            <p className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Consultation Audio Transcript:
            </p>
            "Sat Sri Akal Ramesh ji. We received your pathology scan for Early Blight. Given the current 62% humidity in Zone 4, please start Mancozeb spray at 2.5g per liter tomorrow at sunrise. Also maintain a 7-day pre-harvest gap."
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                isMuted ? 'bg-amber-500 text-black' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <span className="material-symbols-outlined">{isMuted ? 'mic_off' : 'mic'}</span>
            </button>
            <button
              onClick={() => {
                setActiveModal(null);
                alert('Call ended with KVK Agronomist. Consultation notes saved to your offline field log.');
              }}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition active:scale-95"
            >
              <span className="material-symbols-outlined text-3xl">call_end</span>
            </button>
            <button
              onClick={() => alert('Speaker switched to Loudspeaker')}
              className="w-12 h-12 rounded-full bg-white/15 text-white hover:bg-white/25 flex items-center justify-center transition"
            >
              <span className="material-symbols-outlined">volume_up</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. MANDI RATES DETAILED BREAKDOWN MODAL */}
      {activeModal === 'mandi' && (
        <div className="bg-surface rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-[scaleIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface">
                Today's APMC Mandi Spot Rates
              </h3>
              <p className="text-xs text-on-surface-variant">Live e-NAM data across Punjab &amp; North India Hubs</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto hide-scrollbar">
            {[
              { commodity: 'Sharbati Wheat (गेहूं)', mandi: 'Khanna Mandi', min: '₹30.50', max: '₹33.50', modal: '₹32.00', change: '+2.4%', up: true },
              { commodity: 'Basmati Paddy 1121 (धान)', mandi: 'Ludhiana Mandi', min: '₹36.00', max: '₹41.00', modal: '₹38.50', change: '+1.8%', up: true },
              { commodity: 'Hybrid Tomato (टमाटर)', mandi: 'Patiala APMC', min: '₹24.00', max: '₹28.50', modal: '₹26.50', change: '-1.8%', up: false },
              { commodity: 'Mustard Bold (सरसों)', mandi: 'Bhatinda Mandi', min: '₹51.00', max: '₹56.00', modal: '₹54.00', change: '+5.1%', up: true },
              { commodity: 'Red Onion Nasik (प्याज)', mandi: 'Jalandhar Mandi', min: '₹19.00', max: '₹24.00', modal: '₹22.00', change: '+0.8%', up: true },
              { commodity: 'Desi Chana (चना)', mandi: 'Sirsa Hub', min: '₹58.00', max: '₹64.00', modal: '₹61.50', change: '+3.2%', up: true },
            ].map((m, i) => (
              <div key={i} className="p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs text-on-surface">{m.commodity}</h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">{m.mandi}</span>
                </div>
                <div className="text-right">
                  <div className="font-headline-md text-sm font-bold text-primary">{m.modal}/kg</div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.up ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {m.up ? `▲ ${m.change}` : `▼ ${m.change}`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            Close Rates Ticker
          </button>
        </div>
      )}

      {/* 5. NDVI SATELLITE SOIL & MOISTURE MODAL */}
      {activeModal === 'ndvi' && (
        <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-[scaleIn_0.2s_ease-out]">
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[24px]">satellite_alt</span>
              <div>
                <h3 className="font-headline-md text-base font-bold text-on-surface">
                  ISRO / Bhuvan NDVI Field Map
                </h3>
                <p className="text-xs text-on-surface-variant">Plot 412/18 (8.5 Acres) • Punjab Zone 4</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="h-44 rounded-2xl overflow-hidden relative border border-outline-variant bg-gradient-to-tr from-emerald-950 to-emerald-800 flex items-center justify-center">
            <img
              alt="Satellite Farm Grid"
              className="w-full h-full object-cover opacity-70"
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
            />
            <div className="absolute inset-0 bg-emerald-900/30"></div>
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Vegetation Index (NDVI): 0.84 (Optimal)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <span className="text-gray-500 block">Soil Moisture (0-30cm)</span>
              <span className="font-bold text-on-surface text-sm">62% (Good)</span>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <span className="text-gray-500 block">Nitrogen (N) Content</span>
              <span className="font-bold text-emerald-800 text-sm">285 kg/ha (Adequate)</span>
            </div>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            🌿 <strong>Soil Recommendation:</strong> Field moisture is within prime harvest limits. Irrigation not required for the next 48 hours.
          </p>

          <button
            onClick={() => setActiveModal(null)}
            className="w-full py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            Close Satellite Diagnostics
          </button>
        </div>
      )}

      {/* 6. DEAL LOCKED & ESCROW PAYOUT CELEBRATION MODAL */}
      {activeModal === 'deal-locked' && (
        <div className="bg-surface rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-emerald-500 flex flex-col items-center text-center gap-4 animate-[scaleIn_0.25s_ease-out]">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl">verified</span>
          </div>

          <div>
            <h3 className="font-headline-md text-xl font-bold text-emerald-900">
              Trade Contract Finalized!
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Smart contract escrow funds successfully locked for {modalData?.batch?.title || 'Crop Batch'}.
            </p>
          </div>

          <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant/40 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Buyer</span>
              <span className="font-bold text-on-surface">{modalData?.batch?.leadingBuyer || 'Apex Agro Foods'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Accepted Price</span>
              <span className="font-bold text-emerald-800 text-sm">₹{modalData?.batch?.leadingBid?.toFixed(2)}/kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Volume</span>
              <span className="font-bold text-on-surface">{modalData?.batch?.quantityKg} {modalData?.batch?.unit || 'Kg'}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-outline-variant/30 text-sm font-extrabold text-primary">
              <span>Total Payout to SBI Escrow</span>
              <span>₹{modalData?.totalPayout}</span>
            </div>
          </div>

          <div className="w-full flex gap-3 pt-2">
            <button
              onClick={() => {
                openBillGenerator({
                  title: modalData?.batch?.title,
                  cropTitle: modalData?.batch?.title,
                  quantityKg: modalData?.batch?.quantityKg,
                  pricePerKg: modalData?.batch?.leadingBid,
                  trader: modalData?.batch?.leadingBuyer,
                  farmer: modalData?.batch?.farmer || farmerProfile.name,
                });
              }}
              className="flex-1 py-3 border-2 border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Generate Official Bill</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="flex-1 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 7. APMC / e-NAM ELECTRONIC TAX INVOICE & BILL GENERATOR MODAL */}
      {activeModal === 'bill' && (
        <div className="bg-surface rounded-3xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl border border-outline-variant flex flex-col gap-4 animate-[scaleIn_0.2s_ease-out] max-h-[92vh] overflow-y-auto">
          {/* Bill Top Bar */}
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[24px]">receipt_long</span>
              </div>
              <div>
                <h3 className="font-headline-md text-base sm:text-lg font-black text-on-surface">
                  APMC Electronic Tax Invoice &amp; Gate Pass
                </h3>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Punjab Mandi Board &amp; e-NAM Standard Compliant
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-gray-500"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Printable Invoice Container */}
          <div className="bg-white text-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4 font-sans text-xs">
            {/* Header / Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wider">
                  Original APMC Mandi Bill
                </span>
                <h4 className="font-extrabold text-base sm:text-lg text-slate-900 mt-1">
                  AgriShield™ Unified Settlement Invoice
                </h4>
                <p className="text-slate-500 text-[11px]">e-NAM APMC Gate Pass PB-MND-412</p>
              </div>
              <div className="text-left sm:text-right font-mono text-[11px] space-y-0.5">
                <div><strong>Invoice #:</strong> {modalData?.invoiceNo || 'PB-INV-882910'}</div>
                <div><strong>Date:</strong> {modalData?.date || new Date().toLocaleDateString()} {modalData?.time || ''}</div>
                <div className="text-emerald-700 font-bold"><strong>Status:</strong> {modalData?.status || 'SBI Escrow Locked'}</div>
              </div>
            </div>

            {/* Seller & Buyer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Seller (Farmer)</span>
                <div className="font-bold text-sm text-slate-900">{modalData?.farmer || farmerProfile.name}</div>
                <div className="text-slate-600 text-[11px]">{farmerProfile.farmName} • {farmerProfile.zone}</div>
                <div className="text-slate-500 text-[10px] font-mono">PM-Kisan ID: {farmerProfile.pmKisanId}</div>
                <div className="text-slate-500 text-[10px] font-mono">SBI Account: {farmerProfile.sbiAccount} ({farmerProfile.ifsc})</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Buyer (APMC Trader)</span>
                <div className="font-bold text-sm text-slate-900">{modalData?.trader || traderProfile.company}</div>
                <div className="text-slate-600 text-[11px]">APMC Lic: {modalData?.traderLicense || traderProfile.apmcLicense}</div>
                <div className="text-slate-500 text-[10px] font-mono">GSTIN: {modalData?.gstin || traderProfile.gstin}</div>
                <div className="text-slate-500 text-[10px]">Contact: {traderProfile.phone}</div>
              </div>
            </div>

            {/* Line Item Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold text-[11px] uppercase border-b border-slate-200">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 text-center">Quality / Moisture</th>
                    <th className="py-2.5 px-2 text-right">Quantity</th>
                    <th className="py-2.5 px-2 text-right">Rate / Kg</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-3">
                      <strong className="block text-slate-900">{modalData?.cropTitle || 'Organic Hybrid Tomatoes'}</strong>
                      <span className="text-[10px] text-slate-500">Punjab Zone 4 Assayed Lot</span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px]">
                      {modalData?.grade || 'Grade A+'} • {modalData?.moisture || '10.4%'}
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      {(modalData?.quantityKg || 1200).toLocaleString()} Kg
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      ₹{parseFloat(modalData?.pricePerKg || 42.50).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{parseFloat(modalData?.baseValue || 51000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tax / Cess Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Gross Crop Value</span>
                <span>₹{parseFloat(modalData?.baseValue || 51000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>APMC Mandi Cess (1.5%)</span>
                <span>₹{parseFloat(modalData?.apmcFee || 765).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Punjab Rural Infrastructure Dev Cess (1.0%)</span>
                <span>₹{parseFloat(modalData?.rdfCess || 510).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Digital Weighbridge &amp; Assaying Surcharge</span>
                <span>₹{parseFloat(modalData?.weighbridgeFee || 250).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-300 text-sm font-black text-emerald-900">
                <span>Total Escrow Amount Payable</span>
                <span>₹{parseFloat(modalData?.totalPayable || 52525).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Footer QR & Authentication */}
            <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-100">
              <div>
                <span>🛡️ Certified e-NAM Digital Smart Contract • Non-repudiable Blockchain Hash: #PB-ENAM-88F9A</span>
              </div>
              <div className="font-mono text-emerald-700 font-bold">
                ✓ VERIFIED DIGITALLY
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => {
                const fileName = generateInvoicePDF(modalData);
                alert(`✅ Official APMC Mandi Bill PDF generated and downloaded: ${fileName}`);
              }}
              className="flex-1 min-w-[150px] py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Download PDF File</span>
            </button>

            <button
              onClick={() => {
                window.print();
              }}
              className="flex-1 min-w-[120px] py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">print</span>
              <span>Print Preview</span>
            </button>

            <button
              onClick={() => {
                const billText = `*AgriShield Official Mandi Bill*\nInvoice: ${modalData?.invoiceNo || 'PB-INV-8829'}\nCrop: ${modalData?.cropTitle || 'Organic Tomatoes'}\nQuantity: ${modalData?.quantityKg || 1200} Kg\nTotal Amount: ₹${parseFloat(modalData?.totalPayable || 52525).toLocaleString('en-IN')}\nStatus: Secured via SBI Smart Escrow`;
                navigator.clipboard?.writeText(billText);
                alert(`📋 Bill Summary copied to clipboard for WhatsApp sharing!\n\n${billText}`);
              }}
              className="py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">share</span>
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                alert(`✅ Invoice #${modalData?.invoiceNo || 'PB-INV-8829'} saved to offline record storage & IndexedDB.`);
                setActiveModal(null);
              }}
              className="py-3 px-4 bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
