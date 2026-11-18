import React from 'react';

export default function OfflineBanner({ isOffline = true, queuedCount = 2, onViewOutbox }) {
  if (!isOffline && queuedCount === 0) return null;

  return (
    <div className="fixed top-[48px] w-full z-40 bg-amber-banner text-amber-dark px-margin-mobile md:px-margin-desktop py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm font-label-bold text-label-bold">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[20px]">cloud_off</span>
        <span>
          {isOffline
            ? `Offline Mode Active • ${queuedCount} actions queued in local outbox. Data will auto-sync upon connection.`
            : `Back Online • Syncing ${queuedCount} queued actions...`}
        </span>
      </div>
      <button 
        onClick={onViewOutbox} 
        className="whitespace-nowrap hover:underline underline-offset-2 text-left font-bold"
      >
        View Outbox ({queuedCount}) →
      </button>
    </div>
  );
}
