import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './components/LoginPage';
import TraderBuyingHub from './components/TraderBuyingHub';
import Navbar from './components/Navbar';
import OfflineBanner from './components/OfflineBanner';
import Dashboard from './components/Dashboard';
import PlantScanner from './components/PlantScanner';
import ListCrop from './components/ListCrop';
import AuctionFloor from './components/AuctionFloor';
import Marketplace from './components/Marketplace';
import Profile from './components/Profile';
import FarmerInventory from './components/FarmerInventory';
import OutboxModal from './components/OutboxModal';
import Modals from './components/Modals';

function MainAppContent() {
  const {
    isAuthenticated,
    userRole,
    activeTab,
    setActiveTab,
    isOffline,
    activeModal,
    setActiveModal,
    outboxItems,
    setOutboxItems,
    syncAllOutbox,
    addNotification,
  } = useApp();

  const handleSaveScanLog = (logItem) => {
    const nowIST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const newOutboxItem = {
      id: Date.now(),
      type: 'scan',
      title: `Pathology Scan (${logItem.disease})`,
      detail: `${logItem.crop} • ${logItem.confidence} Match`,
      timestamp: nowIST,
    };
    setOutboxItems((prev) => [newOutboxItem, ...prev]);
    addNotification('Scan Log Saved', `Diagnosis for ${logItem.crop} saved to offline field journal.`, 'save');
    alert(`Diagnosis saved to local offline field journal (IST: ${nowIST})! Queued in IndexedDB.`);
  };

  const handleAskExpert = () => {
    setActiveModal('kvk');
  };

  // If user is not authenticated, show the Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background text-on-background antialiased">
      {/* Global Interactive Modals (Notifications, Counter Chat, KVK Helpline, Mandi Rates, NDVI Map, Deal Locked) */}
      <Modals />

      {/* Outbox Sync Modal */}
      <OutboxModal
        isOpen={activeModal === 'outbox'}
        onClose={() => setActiveModal(null)}
        outboxItems={outboxItems}
        onSyncNow={syncAllOutbox}
      />

      {/* Trader Buying Hub (Dedicated Page for Trader role for buying crops directly from farmers) */}
      {activeTab === 'trader-hub' ? (
        <TraderBuyingHub />
      ) : activeTab === 'inventory' ? (
        <>
          <Navbar />
          <FarmerInventory
            onBack={() => setActiveTab('home')}
            onNavigateToListCrop={() => setActiveTab('list-crop')}
          />
        </>
      ) : activeTab === 'scan' ? (
        <PlantScanner
          onBack={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')}
          onSaveLog={handleSaveScanLog}
          onAskExpert={handleAskExpert}
        />
      ) : activeTab === 'list-crop' ? (
        <ListCrop onBack={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')} />
      ) : activeTab === 'auctions' ? (
        <AuctionFloor
          onBack={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')}
          onNavigateToListCrop={() => setActiveTab('list-crop')}
        />
      ) : activeTab === 'market' ? (
        <Marketplace
          onJoinAuction={() => setActiveTab('auctions')}
          onPostRequest={() => setActiveTab('list-crop')}
          onBack={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')}
        />
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar />

          {/* Offline Alert Banner */}
          <OfflineBanner
            isOffline={isOffline}
            queuedCount={outboxItems.length}
            onViewOutbox={() => setActiveModal('outbox')}
          />

          {/* Dynamic Views */}
          {activeTab === 'home' && <Dashboard />}

          {activeTab === 'profile' && (
            <Profile onBack={() => setActiveTab(userRole === 'trader' ? 'trader-hub' : 'home')} />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
