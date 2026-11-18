import React from 'react';

export default function OutboxModal({ isOpen, onClose, outboxItems = [], onSyncNow }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-outline-variant flex flex-col gap-5 animate-[scaleIn_0.2s_ease-out]">
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-banner text-[26px]">
              cloud_sync
            </span>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">
              Offline Sync Outbox
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="text-xs text-on-surface-variant leading-relaxed">
          The following transactions and diagnoses are cached in client-side <strong>IndexedDB</strong>. They will automatically push to the Google Cloud backend as soon as rural 4G/5G connectivity resumes.
        </p>

        {/* List of Outbox Items */}
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto hide-scrollbar">
          {outboxItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500 bg-surface-container-low rounded-2xl">
              All changes are fully synced! No pending actions.
            </div>
          ) : (
            outboxItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {item.type === 'scan' ? 'center_focus_strong' : 'inventory_2'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-on-surface">{item.title}</h4>
                    <p className="text-xs text-on-surface-variant">{item.detail}</p>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                      IST: {item.timestamp}
                    </span>
                  </div>
                </div>
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  Queued
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-outline-variant text-on-surface font-bold text-xs rounded-xl hover:bg-surface-container transition"
          >
            Close
          </button>
          <button
            onClick={onSyncNow}
            className="flex-1 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            Sync All Now
          </button>
        </div>
      </div>
    </div>
  );
}
