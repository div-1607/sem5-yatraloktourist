import React, { useState } from 'react';
import { AlertTriangle, PhoneCall } from 'lucide-react';
import SOSModal from './SOSModal';

const FloatingSOS = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold tracking-wider text-xs uppercase shadow-glow-red border-2 border-red-400/60 active:scale-95 transition-all duration-300"
          title="Trigger Emergency SOS Alert"
        >
          {/* Pulsing ring aura */}
          <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping opacity-75 pointer-events-none"></span>

          <AlertTriangle className="w-5 h-5 text-white animate-pulse" />
          <span className="hidden sm:inline-block font-black">SOS Emergency</span>
        </button>
      </div>

      <SOSModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default FloatingSOS;
