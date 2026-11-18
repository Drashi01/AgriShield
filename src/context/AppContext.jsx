import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getDB, queueOfflineAction, getOutboxItems, clearSyncedOutbox } from '../utils/db';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'farmer' | 'trader' | null
  const [currentUser, setCurrentUser] = useState(null);

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'trader-hub' | 'market' | 'scan' | 'auctions' | 'list-crop' | 'profile'
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [activeModal, setActiveModal] = useState(null); // 'notifications', 'chat', 'kvk', 'mandi', 'ndvi', 'outbox', 'product', 'deal-locked'
  const [modalData, setModalData] = useState(null);

  // Farmer Profile State
  const [farmerProfile, setFarmerProfile] = useState({
    name: 'Ramesh Kumar',
    farmName: 'Green Valley Farms',
    zone: 'Zone 4 (Ludhiana, Punjab)',
    khasra: '412/18, Plot-B (8.5 Acres)',
    soilType: 'Alluvial Loam (pH 7.2)',
    pmKisanId: 'PB-9921-4820',
    sbiAccount: '•••• •••• 8829',
    ifsc: 'SBIN0001248',
    upiId: 'rameshkumar@sbi',
    language: 'English',
    nearestMandi: 'Khanna Grain Mandi (14 km)',
  });

  // Trader Profile State
  const [traderProfile, setTraderProfile] = useState({
    name: 'Vikram Sethi',
    company: 'Apex Agro Millers & Commodities Ltd.',
    apmcLicense: 'PB-MND-88219',
    gstin: '03AAACA1234F1Z8',
    zone: 'Punjab & North Zone Mandis',
    escrowBalance: 1450000,
    phone: '+91 98765 43210',
    email: 'procurement@apexagromillers.com',
    rating: '4.9',
    ordersCompleted: 24,
  });

  // Trader Procurement Orders History
  const [traderOrders, setTraderOrders] = useState([
    {
      orderId: 'PO-9912',
      cropTitle: 'Basmati Rice 1121 (Export Grade)',
      batchId: 'BAS-7710',
      quantityKg: 3000,
      pricePerKg: 38.50,
      baseCost: 115500,
      apmcCess: 1732.5,
      freightEstimate: 2550,
      totalPayable: 119782,
      farmerName: 'Balwinder Singh',
      farmerLocation: 'Sirhind, Punjab (18 km)',
      timestamp: 'Yesterday, 04:30 PM',
      status: 'Escrow Locked - In Transit',
    },
  ]);

  // Active Batches in Marketplace / Dashboard
  const [batches, setBatches] = useState([
    {
      id: 'TOM-8834',
      title: 'Organic Hybrid Tomatoes',
      category: 'vegetables',
      quantityKg: 1200,
      unit: 'Kg',
      floorPrice: 30.00,
      leadingBid: 42.50,
      leadingBuyer: 'Apex Agro Foods',
      isOrganic: true,
      grade: 'Grade A+',
      moisture: '11.5%',
      timeLeft: '00:14:32',
      duration: '24h',
      bidsCount: 28,
      activeBidders: 6,
      distance: 8.2,
      farmer: 'Ramesh Kumar',
      location: 'Punjab Zone 4 - Verified',
      rating: '4.9',
      sellerType: 'Verified Organic Farmer',
      images: [
        'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '30%',
      lng: '40%',
    },
    {
      id: 'WHT-5021',
      title: 'Sharbati Wheat Grade-A',
      category: 'grains',
      quantityKg: 2500,
      unit: 'Kg',
      floorPrice: 32.00,
      leadingBid: 34.50,
      leadingBuyer: 'Apex Agro Millers',
      isOrganic: true,
      grade: 'Grade A',
      moisture: '10.2%',
      timeLeft: '02h 15m left',
      duration: '48h',
      bidsCount: 14,
      activeBidders: 4,
      distance: 12.4,
      farmer: 'Ramesh Kumar',
      location: 'Punjab Zone 4 - Verified',
      rating: '5.0',
      sellerType: 'Premium Seller',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '50%',
      lng: '65%',
    },
    {
      id: 'KID-4491',
      title: 'Organic Red Kidney Beans (Rajma)',
      category: 'pulses',
      quantityKg: 800,
      unit: 'Kg',
      floorPrice: 95.00,
      leadingBid: 112.00,
      leadingBuyer: 'Himalayan Organic Traders',
      isOrganic: true,
      grade: 'Grade A',
      moisture: '9.8%',
      timeLeft: '45m left',
      duration: '24h',
      bidsCount: 9,
      activeBidders: 3,
      distance: 21.0,
      farmer: 'Gurpreet Kaur',
      location: 'Fatehgarh Sahib, Punjab',
      rating: '4.8',
      sellerType: 'Certified Organic',
      images: [
        'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '65%',
      lng: '25%',
    },
    {
      id: 'RICE-9932',
      title: 'Traditional Basmati Rice 1121',
      category: 'grains',
      quantityKg: 4000,
      unit: 'Kg',
      floorPrice: 38.00,
      leadingBid: 38.50,
      leadingBuyer: 'Punjab Grain Exporters',
      isOrganic: false,
      grade: 'Grade A+',
      moisture: '10.8%',
      timeLeft: '18h 30m left',
      duration: '48h',
      bidsCount: 16,
      activeBidders: 5,
      distance: 15.0,
      farmer: 'Harpreet Singh',
      location: 'Khanna Mandi Gate 2',
      rating: '4.9',
      sellerType: 'Verified Farm Owner',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '45%',
      lng: '55%',
    },
    {
      id: 'MUST-3312',
      title: 'High-Oil Yellow Mustard Seeds',
      category: 'oilseeds',
      quantityKg: 1800,
      unit: 'Kg',
      floorPrice: 50.00,
      leadingBid: 52.50,
      leadingBuyer: 'Dhara Oil Refineries',
      isOrganic: true,
      grade: 'Grade A',
      moisture: '8.5%',
      timeLeft: '12h 10m left',
      duration: '24h',
      bidsCount: 11,
      activeBidders: 4,
      distance: 19.5,
      farmer: 'Jagtar Singh',
      location: 'Samrala, Punjab',
      rating: '4.7',
      sellerType: 'Certified Oilseed Grower',
      images: [
        'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '58%',
      lng: '35%',
    },
    {
      id: 'ONI-2201',
      title: 'Grade-A Red Onion (Nashik Seed)',
      category: 'vegetables',
      quantityKg: 3500,
      unit: 'Kg',
      floorPrice: 20.00,
      leadingBid: 22.50,
      leadingBuyer: 'Metro Mega Mart Wholesale',
      isOrganic: false,
      grade: 'Grade A',
      moisture: '12.0%',
      timeLeft: '06h 40m left',
      duration: '24h',
      bidsCount: 19,
      activeBidders: 7,
      distance: 11.2,
      farmer: 'Sukhdev Singh',
      location: 'Doraha, Ludhiana',
      rating: '4.8',
      sellerType: 'Verified Vegetable Grower',
      images: [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '35%',
      lng: '48%',
    },
  ]);

  // Selected Auction Batch
  const [selectedAuctionId, setSelectedAuctionId] = useState('TOM-8834');

  // Watchlist items (array of batch IDs)
  const [watchlist, setWatchlist] = useState(['TOM-8834', 'WHT-5021', 'KID-4491']);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New High Bid Received',
      msg: 'Apex Agro Foods increased bid on Organic Tomatoes to ₹42.50/kg (+₹1.00).',
      time: '2m ago',
      unread: true,
      icon: 'gavel',
    },
    {
      id: 2,
      title: 'NDVI Satellite Moisture Alert',
      msg: 'Plot-B root-zone moisture is at 62%. Ideal for evening harvest.',
      time: '1h ago',
      unread: true,
      icon: 'satellite_alt',
    },
    {
      id: 3,
      title: 'Outbox Auto-Sync Complete',
      msg: '2 field pathology scans synchronized with cloud servers.',
      time: '3h ago',
      unread: false,
      icon: 'cloud_done',
    },
  ]);

  // Offline Outbox Items
  const [outboxItems, setOutboxItems] = useState([
    {
      id: 1,
      type: 'scan',
      title: 'Plant Pathology Scan (Early Blight)',
      detail: 'Tomato Field Plot B • 94.2% Match',
      timestamp: '29/08/2026, 05:15:20 PM',
    },
    {
      id: 2,
      type: 'listing',
      title: 'B2B Crop Listing (Basmati Rice)',
      detail: '2,500 kg @ ₹38.50/kg • 48h Auction Window',
      timestamp: '29/08/2026, 05:22:45 PM',
    },
  ]);

  // Scan Logs History
  const [scanLogs, setScanLogs] = useState([
    {
      id: 1,
      crop: 'Tomato',
      disease: 'Early Blight (Alternaria solani)',
      confidence: '94.2%',
      severity: 'Stage 2 - Moderate',
      date: 'Today, 05:15 PM',
    },
  ]);

  // Authentication Login Handler
  const login = (role, customData = {}) => {
    setUserRole(role);
    setIsAuthenticated(true);
    setCurrentUser({
      role,
      name: customData.name || (role === 'farmer' ? farmerProfile.name : traderProfile.name),
      ...customData,
    });

    if (role === 'trader') {
      setActiveTab('trader-hub');
      addNotification(
        'Trader Portal Active',
        `Welcome ${customData.name || traderProfile.name}! Opening wholesale crop buying hub.`,
        'storefront'
      );
    } else {
      setActiveTab('home');
      addNotification(
        'Farmer Portal Active',
        `Welcome ${customData.name || farmerProfile.name}! Farm dashboard loaded.`,
        'agriculture'
      );
    }

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // Authentication Logout Handler
  const logout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Role Switcher (Convenient for Pair-Testing)
  const switchRole = (newRole) => {
    setUserRole(newRole);
    if (newRole === 'trader') {
      setActiveTab('trader-hub');
      addNotification('Switched to Trader Portal', 'Viewing direct crop procurement workstation.', 'storefront');
    } else {
      setActiveTab('home');
      addNotification('Switched to Farmer View', 'Viewing farm management & crop auction floor.', 'agriculture');
    }
  };

  // Trader Buy Now Action
  const executeTraderBuyNow = (batch, quantityKg, paymentDetails) => {
    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const newOrderId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;

    // Deduct Escrow Wallet
    setTraderProfile((prev) => ({
      ...prev,
      escrowBalance: Math.max(0, prev.escrowBalance - paymentDetails.totalPayable),
      ordersCompleted: prev.ordersCompleted + 1,
    }));

    // Record Order
    const newOrder = {
      orderId: newOrderId,
      cropTitle: batch.title,
      batchId: batch.id,
      quantityKg,
      pricePerKg: paymentDetails.pricePerKg,
      baseCost: paymentDetails.baseCost,
      apmcCess: paymentDetails.apmcCess,
      freightEstimate: paymentDetails.freightEstimate,
      totalPayable: paymentDetails.totalPayable,
      farmerName: batch.farmer || 'Verified Farmer',
      farmerLocation: batch.location || 'Punjab Zone',
      timestamp: nowIST,
      status: 'Escrow Locked - Pickup Scheduled',
    };

    setTraderOrders((prev) => [newOrder, ...prev]);

    // Update batch quantity or remove if fully bought
    setBatches((prev) =>
      prev
        .map((b) => {
          if (b.id === batch.id) {
            const remaining = b.quantityKg - quantityKg;
            if (remaining <= 0) return null;
            return { ...b, quantityKg: remaining };
          }
          return b;
        })
        .filter(Boolean)
    );

    addNotification(
      'Crop Purchase Order Executed! 📦',
      `Locked wholesale deal for ${quantityKg} kg of ${batch.title}. Total ₹${paymentDetails.totalPayable.toLocaleString('en-IN')} held in SBI Escrow.`,
      'verified'
    );

    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  // Trader Post Demand
  const postTraderDemand = (demand) => {
    addNotification(
      'Procurement Demand Broadcasted',
      `Requirement for ${demand.targetQuantityKg} kg ${demand.cropName} broadcasted to regional farmers.`,
      'campaign'
    );
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.5 },
    });
  };

  // Add Funds to Escrow
  const addEscrowFunds = (amount) => {
    setTraderProfile((prev) => ({
      ...prev,
      escrowBalance: prev.escrowBalance + amount,
    }));
    addNotification(
      'Escrow Vault Topped Up',
      `Deposited ₹${amount.toLocaleString('en-IN')} to SBI Corporate Escrow Account.`,
      'account_balance_wallet'
    );
  };

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      addNotification('Back Online', 'Network reconnected. Auto-syncing pending outbox items.', 'cloud_done');
    };
    const handleOffline = () => {
      setIsOffline(true);
      addNotification('Offline Mode Active', 'Operating on offline IndexedDB storage. Actions will queue automatically.', 'cloud_off');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addNotification = (title, msg, icon = 'notifications') => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        title,
        msg,
        time: 'Just now',
        unread: true,
        icon,
      },
      ...prev,
    ]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const toggleWatchlist = (batchId) => {
    if (watchlist.includes(batchId)) {
      setWatchlist((prev) => prev.filter((id) => id !== batchId));
      addNotification('Removed from Watchlist', `Batch #${batchId} removed from your watch queue.`, 'visibility_off');
    } else {
      setWatchlist((prev) => [...prev, batchId]);
      addNotification('Added to Watchlist', `Batch #${batchId} bookmarked for live bid monitoring.`, 'visibility');
    }
  };

  const placeBidOnBatch = (batchId, amount, buyerName = 'You (Verified Buyer)') => {
    setBatches((prev) =>
      prev.map((b) => {
        if (b.id === batchId) {
          return {
            ...b,
            leadingBid: amount,
            leadingBuyer: buyerName,
            bidsCount: b.bidsCount + 1,
          };
        }
        return b;
      })
    );

    addNotification(
      'Bid Placed Successfully',
      `Placed verified bid of ₹${amount.toFixed(2)}/kg on #${batchId}.`,
      'gavel'
    );

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const createNewBatchListing = (listingData) => {
    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const newId = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBatch = {
      id: newId,
      title: listingData.cropVariety,
      category: listingData.category,
      quantityKg: parseFloat(listingData.totalQuantity) || 1000,
      unit: listingData.selectedUnit || 'Kg',
      floorPrice: parseFloat(listingData.floorPrice?.replace('₹', '')) || 35.0,
      leadingBid: parseFloat(listingData.floorPrice?.replace('₹', '')) || 35.0,
      leadingBuyer: 'Awaiting first wholesale bid',
      isOrganic: listingData.isOrganic,
      grade: listingData.grade || 'Grade A',
      moisture: listingData.moisture || '11.0%',
      timeLeft: listingData.duration === '24h' ? '23h 59m left' : '47h 59m left',
      duration: listingData.duration || '48h',
      bidsCount: 0,
      activeBidders: 0,
      distance: 4.5,
      farmer: farmerProfile.name,
      location: listingData.locationName || farmerProfile.zone,
      rating: '5.0',
      sellerType: 'Verified Farm Owner',
      images: listingData.photos?.length > 0 ? listingData.photos : [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      ],
      isLive: true,
      lat: '42%',
      lng: '52%',
    };

    setBatches((prev) => [newBatch, ...prev]);

    // Automatically synchronize with Farmer Granary Inventory
    const newInventoryRecord = {
      id: `INV-${newId}`,
      cropName: newBatch.title,
      category: newBatch.category,
      totalHarvestQty: newBatch.quantityKg * 2, // Harvested stock has reserve
      readyToSellQty: newBatch.quantityKg,
      storedReserveQty: newBatch.quantityKg,
      unit: newBatch.unit,
      targetPricePerKg: newBatch.floorPrice,
      moisture: newBatch.moisture,
      moistureValue: parseFloat(newBatch.moisture) || 10.5,
      grade: newBatch.grade,
      isOrganic: newBatch.isOrganic,
      storageLocation: 'Farm Granary Silo #1',
      harvestDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      healthStatus: 'Optimal Moisture',
      linkedBatchId: newId,
      status: 'Listed in Live Auction',
      image: newBatch.images[0],
    };
    setInventoryItems((prev) => [newInventoryRecord, ...prev]);

    // Queue in Outbox
    const outboxItem = {
      id: Date.now(),
      type: 'listing',
      title: `B2B Listing (${newBatch.title})`,
      detail: `${newBatch.quantityKg} ${newBatch.unit} @ ₹${newBatch.floorPrice}/${newBatch.unit}`,
      timestamp: nowIST,
    };
    setOutboxItems((prev) => [outboxItem, ...prev]);

    addNotification('Batch Listing Published', `New batch for ${newBatch.title} is now open for live wholesale bidding!`, 'rocket_launch');
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
    });
  };

  const acceptLeadingBidOnBatch = (batch) => {
    const totalPayout = (batch.leadingBid * batch.quantityKg).toLocaleString('en-IN');
    setModalData({
      batch,
      totalPayout,
    });
    setActiveModal('deal-locked');

    addNotification(
      'Trade Deal Locked! 🤝',
      `Accepted leading bid from ${batch.leadingBuyer} for ${batch.title}. ₹${totalPayout} transferred to SBI Escrow.`,
      'verified_user'
    );

    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.4 },
    });
  };

  // Trader-Farmer Direct Chat State & Conversations
  const [conversations, setConversations] = useState([
    {
      id: 'TOM-8834',
      batchId: 'TOM-8834',
      cropTitle: 'Organic Hybrid Tomatoes (1,200 Kg)',
      farmerName: 'Ramesh Kumar',
      traderName: 'FreshRoots Wholesale Hub',
      currentPrice: '₹42.50 / kg',
      status: 'Negotiation Active',
      lastUpdated: 'Just now',
      unread: false,
      messages: [
        {
          id: 1,
          senderRole: 'trader',
          senderName: 'FreshRoots Wholesale Hub',
          text: 'Namaste Ramesh ji! We are interested in taking the full 1,200 kg batch of Organic Tomatoes. Can you confirm if delivery can be made to Khanna Hub?',
          timestamp: '10:05 AM',
          type: 'text',
        },
        {
          id: 2,
          senderRole: 'farmer',
          senderName: 'Ramesh Kumar',
          text: 'Namaste! Yes, the harvest is ready. Grade-A quality picked this morning. We can deliver to Khanna Hub if ₹42.50/kg rate is locked.',
          timestamp: '10:07 AM',
          type: 'text',
        },
        {
          id: 3,
          senderRole: 'trader',
          senderName: 'FreshRoots Wholesale Hub',
          text: 'Can you do ₹41.00/kg if our transport truck picks up directly from your farm gate in Ludhiana Zone 4?',
          timestamp: '10:09 AM',
          type: 'proposal',
          proposalData: { price: '₹41.00 / kg', terms: 'Farm-gate Pickup' },
        },
      ],
    },
    {
      id: 'WHT-5021',
      batchId: 'WHT-5021',
      cropTitle: 'Sharbati Wheat Grade-A (2,500 Kg)',
      farmerName: 'Ramesh Kumar',
      traderName: 'Apex Agro Millers (Vikram Sethi)',
      currentPrice: '₹34.50 / kg',
      status: 'Bidding & Terms Discussion',
      lastUpdated: '15m ago',
      unread: true,
      messages: [
        {
          id: 1,
          senderRole: 'trader',
          senderName: 'Apex Agro Millers',
          text: 'Ramesh ji, we placed the leading bid of ₹34.50/kg on your Sharbati Wheat batch. Has the grain moisture test report been verified under 11%?',
          timestamp: '09:45 AM',
          type: 'text',
        },
        {
          id: 2,
          senderRole: 'farmer',
          senderName: 'Ramesh Kumar',
          text: 'Yes sir, digital moisture assaying certified 10.2% moisture with Grade-A luster. Ready for immediate loading.',
          timestamp: '09:50 AM',
          type: 'text',
        },
      ],
    },
    {
      id: 'BAS-7710',
      batchId: 'BAS-7710',
      cropTitle: 'Basmati Rice 1121 Export Grade (3,000 Kg)',
      farmerName: 'Balwinder Singh',
      traderName: 'Apex Agro Millers',
      currentPrice: '₹38.50 / kg',
      status: 'Contract Escrow Finalized',
      lastUpdated: 'Yesterday',
      unread: false,
      messages: [
        {
          id: 1,
          senderRole: 'trader',
          senderName: 'Apex Agro Millers',
          text: 'Balwinder ji, payment of ₹1,19,782 is locked in SBI Smart Contract Escrow. Dispatching vehicle PB-10-CZ-4412.',
          timestamp: 'Yesterday 04:32 PM',
          type: 'text',
        },
        {
          id: 2,
          senderRole: 'farmer',
          senderName: 'Balwinder Singh',
          text: 'Received the escrow notification. Bags weighed and ready at farm warehouse.',
          timestamp: 'Yesterday 04:45 PM',
          type: 'text',
        },
      ],
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState('TOM-8834');

  // Open Chat with specific batch/trader/farmer
  const openChatWith = (chatData) => {
    const targetId = chatData.id || chatData.batchId || 'TOM-8834';
    
    // Check if conversation exists, if not create one
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === targetId);
      if (exists) return prev;
      const newConv = {
        id: targetId,
        batchId: targetId,
        cropTitle: chatData.title || chatData.cropTitle || 'Direct Agri Negotiation',
        farmerName: chatData.farmer || farmerProfile.name,
        traderName: chatData.buyer || (userRole === 'trader' ? traderProfile.company : 'Verified APMC Buyer'),
        currentPrice: chatData.price || 'Market Rate',
        status: 'Negotiation Active',
        lastUpdated: 'Just now',
        unread: false,
        messages: [
          {
            id: 1,
            senderRole: userRole === 'trader' ? 'trader' : 'farmer',
            senderName: userRole === 'trader' ? traderProfile.company : farmerProfile.name,
            text: `Hello! I would like to discuss terms and pricing for ${chatData.title || 'this crop lot'}.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
          },
        ],
      };
      return [newConv, ...prev];
    });

    setActiveConversationId(targetId);
    setModalData(chatData);
    setActiveModal('chat');
  };

  // Send Direct Message in Trader-Farmer Chat
  const sendChatMessage = (convId, messageText, options = {}) => {
    if (!messageText || !messageText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isTrader = userRole === 'trader';
    const currentSenderRole = isTrader ? 'trader' : 'farmer';
    const currentSenderName = isTrader ? traderProfile.company : farmerProfile.name;

    const newMsg = {
      id: Date.now(),
      senderRole: currentSenderRole,
      senderName: currentSenderName,
      text: messageText.trim(),
      timestamp: timeStr,
      type: options.type || 'text',
      proposalData: options.proposalData || null,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            lastUpdated: 'Just now',
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Realistic automated responsive reply from counterpart
    setTimeout(() => {
      const counterpartRole = isTrader ? 'farmer' : 'trader';
      const conv = conversations.find((c) => c.id === convId);
      const counterpartName = conv ? (isTrader ? conv.farmerName : conv.traderName) : (isTrader ? 'Farmer Ramesh Kumar' : 'APMC Buyer');

      let replyText = '';
      if (messageText.includes('Counter') || messageText.includes('₹') || options.type === 'proposal') {
        replyText = isTrader
          ? `Deal agreeable! If you can confirm vehicle dispatch for tomorrow morning, I will finalize the lot at this counter rate.`
          : `We accept this counter rate. Placing the updated verified bid and locking escrow funds now.`;
      } else if (messageText.toLowerCase().includes('pickup') || messageText.toLowerCase().includes('delivery') || messageText.toLowerCase().includes('transport')) {
        replyText = isTrader
          ? `Farm gate pickup works well. Our farm is situated near GT Road Milestone 42 with wide 20-ft truck access.`
          : `We will arrange a 3-ton GPS-tracked refrigerated container for direct farm pickup.`;
      } else if (messageText.toLowerCase().includes('moisture') || messageText.toLowerCase().includes('assay') || messageText.toLowerCase().includes('quality')) {
        replyText = isTrader
          ? `Moisture meter recorded 10.4% this morning, zero fungal damage. Digital lab certificate attached.`
          : `Quality assurance verified! We have recorded the sample specs in the APMC digital ledger.`;
      } else {
        replyText = isTrader
          ? `Understood! Let us finalize terms so we can lock the APMC smart contract.`
          : `Thank you for the update. All parameters look optimal. Ready to proceed with contract lock.`;
      }

      const autoReplyMsg = {
        id: Date.now() + 1,
        senderRole: counterpartRole,
        senderName: counterpartName,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === convId) {
            return {
              ...c,
              lastUpdated: 'Just now',
              messages: [...c.messages, autoReplyMsg],
            };
          }
          return c;
        })
      );

      addNotification(
        `New Message from ${counterpartName}`,
        replyText,
        'chat'
      );
    }, 1000);
  };

  const finalizeDealFromChat = (convId, priceStr) => {
    const conv = conversations.find((c) => c.id === convId);
    const batch = batches.find((b) => b.id === convId) || {
      id: convId,
      title: conv?.cropTitle || 'Crop Lot',
      quantityKg: 1200,
      unit: 'Kg',
      leadingBid: parseFloat(priceStr?.replace(/[^0-9.]/g, '')) || 42.0,
      leadingBuyer: conv?.traderName || 'Verified Trader',
    };

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, status: 'Contract Escrow Finalized' } : c))
    );

    acceptLeadingBidOnBatch(batch);
  };

  // Official APMC / e-NAM Tax Invoice & Bill Generator
  const openBillGenerator = (billData = {}) => {
    const defaultBatch = batches[0] || {};
    const qty = billData.quantityKg || defaultBatch.quantityKg || 1200;
    const rate = parseFloat(
      billData.pricePerKg ||
      billData.price?.toString().replace(/[^0-9.]/g, '') ||
      defaultBatch.leadingBid ||
      42.50
    );
    const baseValue = qty * rate;
    const apmcFee = baseValue * 0.015; // 1.5% APMC cess
    const rdfCess = baseValue * 0.010; // 1.0% Rural Dev Fee
    const weighbridgeFee = 250;
    const totalPayable = baseValue + apmcFee + rdfCess + weighbridgeFee;

    const data = {
      invoiceNo: `PB-INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      farmer: billData.farmer || farmerProfile.name,
      farmName: farmerProfile.farmName,
      farmerZone: farmerProfile.zone,
      khasra: farmerProfile.khasra,
      pmKisanId: farmerProfile.pmKisanId,
      upiId: farmerProfile.upiId,
      sbiAccount: farmerProfile.sbiAccount,
      trader: billData.trader || billData.buyer || (userRole === 'trader' ? traderProfile.company : 'Apex Agro Millers & Commodities Ltd.'),
      traderLicense: traderProfile.apmcLicense,
      gstin: traderProfile.gstin,
      cropTitle: billData.title || billData.cropTitle || defaultBatch.title || 'Organic Hybrid Tomatoes',
      grade: billData.grade || defaultBatch.grade || 'Grade A+',
      moisture: billData.moisture || defaultBatch.moisture || '10.4%',
      quantityKg: qty,
      pricePerKg: rate,
      baseValue,
      apmcFee,
      rdfCess,
      weighbridgeFee,
      totalPayable,
      status: 'Secured via SBI Smart Escrow',
      ...billData,
    };
    setModalData(data);
    setActiveModal('bill');
  };

  // Farmer Granary & Crop Inventory Management State
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 'INV-WHT-1',
      cropName: 'Sharbati Wheat Grade A',
      category: 'grains',
      totalHarvestQty: 6000,
      readyToSellQty: 2500,
      storedReserveQty: 3500,
      unit: 'Kg',
      targetPricePerKg: 34.50,
      moisture: '10.2%',
      moistureValue: 10.2,
      grade: 'Grade A',
      isOrganic: true,
      storageLocation: 'Farm Granary Silo #1 (Aerated)',
      harvestDate: '15 Aug 2026',
      healthStatus: 'Optimal (< 11% Moisture)',
      linkedBatchId: 'WHT-5021',
      status: 'Listed in Live Auction',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'INV-TOM-2',
      cropName: 'Organic Hybrid Tomatoes',
      category: 'vegetables',
      totalHarvestQty: 2400,
      readyToSellQty: 1200,
      storedReserveQty: 1200,
      unit: 'Kg',
      targetPricePerKg: 42.50,
      moisture: '11.5%',
      moistureValue: 11.5,
      grade: 'Grade A+',
      isOrganic: true,
      storageLocation: 'Khanna Cold Storage Bay 4',
      harvestDate: '08 Sep 2026',
      healthStatus: 'Fresh Harvest (< 48 hrs)',
      linkedBatchId: 'TOM-8834',
      status: 'Listed in Live Auction',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'INV-RICE-3',
      cropName: 'Traditional Basmati Rice 1121',
      category: 'grains',
      totalHarvestQty: 8000,
      readyToSellQty: 4000,
      storedReserveQty: 4000,
      unit: 'Kg',
      targetPricePerKg: 38.50,
      moisture: '11.8%',
      moistureValue: 11.8,
      grade: 'Grade A+',
      isOrganic: false,
      storageLocation: 'Central Mandi Warehouse Room B',
      harvestDate: '28 Aug 2026',
      healthStatus: 'Curing & Aged Stock',
      linkedBatchId: 'RICE-9932',
      status: 'Ready to Sell',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'INV-KID-4',
      cropName: 'Organic Red Kidney Beans (Rajma)',
      category: 'pulses',
      totalHarvestQty: 1500,
      readyToSellQty: 800,
      storedReserveQty: 700,
      unit: 'Kg',
      targetPricePerKg: 112.00,
      moisture: '9.8%',
      moistureValue: 9.8,
      grade: 'Grade A',
      isOrganic: true,
      storageLocation: 'Farm Grain Bin #3',
      harvestDate: '10 Aug 2026',
      healthStatus: 'Optimal (< 10% Moisture)',
      linkedBatchId: 'KID-4491',
      status: 'Listed in Live Auction',
      image: 'https://images.unsplash.com/photo-1546470427-e26264be0b11?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'INV-MUST-5',
      cropName: 'Yellow Mustard Bold (सरसों)',
      category: 'oilseeds',
      totalHarvestQty: 3200,
      readyToSellQty: 1500,
      storedReserveQty: 1700,
      unit: 'Kg',
      targetPricePerKg: 54.00,
      moisture: '8.5%',
      moistureValue: 8.5,
      grade: 'Grade A+',
      isOrganic: true,
      storageLocation: 'Farm Dry Granary Silo #2',
      harvestDate: '02 Sep 2026',
      healthStatus: 'High Oil Yield Tested',
      linkedBatchId: null,
      status: 'In Farm Storage',
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  // Add new harvest batch to inventory
  const addInventoryStock = (newItemData) => {
    const newId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalQty = parseFloat(newItemData.totalHarvestQty) || 1000;
    const readyQty = parseFloat(newItemData.readyToSellQty) || 500;
    const storedQty = Math.max(0, totalQty - readyQty);

    const newStock = {
      id: newId,
      cropName: newItemData.cropName || 'Fresh Harvest Crop',
      category: newItemData.category || 'grains',
      totalHarvestQty: totalQty,
      readyToSellQty: readyQty,
      storedReserveQty: storedQty,
      unit: newItemData.unit || 'Kg',
      targetPricePerKg: parseFloat(newItemData.targetPricePerKg) || 35.00,
      moisture: newItemData.moisture || '10.5%',
      moistureValue: parseFloat(newItemData.moisture) || 10.5,
      grade: newItemData.grade || 'Grade A',
      isOrganic: Boolean(newItemData.isOrganic),
      storageLocation: newItemData.storageLocation || 'Farm Granary Silo #1',
      harvestDate: newItemData.harvestDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      healthStatus: parseFloat(newItemData.moisture) > 12.5 ? 'Aeration Recommended' : 'Optimal Moisture',
      linkedBatchId: null,
      status: readyQty > 0 ? 'Ready to Sell' : 'In Storage Reserve',
      image: newItemData.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
    };

    setInventoryItems((prev) => [newStock, ...prev]);

    // Outbox queue for offline resilience
    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    setOutboxItems((prev) => [
      {
        id: Date.now(),
        type: 'inventory_add',
        title: `Granary Stock Added (${newStock.cropName})`,
        detail: `${newStock.totalHarvestQty} ${newStock.unit} (${newStock.readyToSellQty} Ready to Sell)`,
        timestamp: nowIST,
      },
      ...prev,
    ]);

    addNotification(
      'Crop Added to Granary Inventory',
      `Logged ${newStock.totalHarvestQty} ${newStock.unit} of ${newStock.cropName} into ${newStock.storageLocation}.`,
      'warehouse'
    );
  };

  // Update existing inventory item
  const updateInventoryStock = (id, updatedFields) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const totalQty = updatedFields.totalHarvestQty !== undefined ? parseFloat(updatedFields.totalHarvestQty) : item.totalHarvestQty;
          const readyQty = updatedFields.readyToSellQty !== undefined ? parseFloat(updatedFields.readyToSellQty) : item.readyToSellQty;
          const storedQty = Math.max(0, totalQty - readyQty);
          return {
            ...item,
            ...updatedFields,
            totalHarvestQty: totalQty,
            readyToSellQty: readyQty,
            storedReserveQty: storedQty,
          };
        }
        return item;
      })
    );
    addNotification('Inventory Updated', `Updated storage and quantity parameters for lot #${id}.`, 'edit');
  };

  // Quick adjust Ready to Sell vs Stored Reserve
  const adjustReadyToSell = (id, newReadyQty) => {
    setInventoryItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const ready = Math.min(item.totalHarvestQty, Math.max(0, parseFloat(newReadyQty) || 0));
          const reserve = item.totalHarvestQty - ready;
          return {
            ...item,
            readyToSellQty: ready,
            storedReserveQty: reserve,
            status: ready > 0 ? (item.linkedBatchId ? 'Listed in Live Auction' : 'Ready to Sell') : 'In Farm Storage',
          };
        }
        return item;
      })
    );
  };

  // Delete inventory item
  const deleteInventoryStock = (id) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== id));
    addNotification('Inventory Item Removed', `Archived stock record #${id}.`, 'delete');
  };

  // 1-Click convert ready-to-sell inventory into live wholesale auction listing
  const listStockToMarketplace = (id, overridePrice = null) => {
    const item = inventoryItems.find((i) => i.id === id);
    if (!item) return;

    if (item.readyToSellQty <= 0) {
      alert(`⚠️ Please set "Ready to Sell" quantity greater than 0 kg first!`);
      return;
    }

    const price = overridePrice || item.targetPricePerKg;
    const newBatchId = `LOT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBatch = {
      id: newBatchId,
      title: item.cropName,
      category: item.category,
      quantityKg: item.readyToSellQty,
      unit: item.unit,
      floorPrice: price,
      leadingBid: price,
      leadingBuyer: 'Awaiting first wholesale bid',
      isOrganic: item.isOrganic,
      grade: item.grade,
      moisture: item.moisture,
      timeLeft: '23h 59m left',
      duration: '24h',
      bidsCount: 0,
      activeBidders: 0,
      distance: 3.5,
      farmer: farmerProfile.name,
      location: farmerProfile.zone,
      rating: '5.0',
      sellerType: 'Verified Farm Owner',
      images: [item.image || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80'],
      isLive: true,
      lat: '40%',
      lng: '50%',
    };

    // Add to live batches
    setBatches((prev) => [newBatch, ...prev]);

    // Update inventory item link
    setInventoryItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, linkedBatchId: newBatchId, status: 'Listed in Live Auction' } : i))
    );

    addNotification(
      'Crop Published to Live Market! 🚀',
      `Listed ${item.readyToSellQty} ${item.unit} of ${item.cropName} at ₹${price}/${item.unit} for wholesale bidding.`,
      'rocket_launch'
    );

    alert(`🎉 Successfully listed ${item.readyToSellQty} ${item.unit} of ${item.cropName} on the Live APMC Wholesale Marketplace!`);
  };

  const syncAllOutbox = () => {
    if (outboxItems.length === 0) {
      alert('Outbox is already fully synchronized!');
      return;
    }
    setOutboxItems([]);
    setActiveModal(null);
    addNotification('Outbox Fully Synchronized', 'All pending transactions, crop photos, and pathology scans were uploaded to cloud servers.', 'cloud_done');
    alert('✅ All offline transactions and diagnostic reports have been successfully synchronized with the cloud backend!');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        userRole,
        currentUser,
        login,
        logout,
        switchRole,
        activeTab,
        setActiveTab,
        isOffline,
        setIsOffline,
        activeModal,
        setActiveModal,
        modalData,
        setModalData,
        farmerProfile,
        setFarmerProfile,
        traderProfile,
        setTraderProfile,
        traderOrders,
        executeTraderBuyNow,
        postTraderDemand,
        addEscrowFunds,
        batches,
        setBatches,
        selectedAuctionId,
        setSelectedAuctionId,
        watchlist,
        toggleWatchlist,
        notifications,
        addNotification,
        markAllNotificationsRead,
        outboxItems,
        setOutboxItems,
        scanLogs,
        setScanLogs,
        placeBidOnBatch,
        createNewBatchListing,
        acceptLeadingBidOnBatch,
        syncAllOutbox,
        conversations,
        setConversations,
        activeConversationId,
        setActiveConversationId,
        openChatWith,
        sendChatMessage,
        finalizeDealFromChat,
        openBillGenerator,
        inventoryItems,
        setInventoryItems,
        addInventoryStock,
        updateInventoryStock,
        adjustReadyToSell,
        deleteInventoryStock,
        listStockToMarketplace,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
