import React, { useState } from 'react';
import { AlertTriangle, Radio } from 'lucide-react';
import SOSModal from './SOSModal';

const FloatingSOS = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black tracking-wider text-xs uppercase shadow-glow-danger border border-red-400/80 active:scale-95 transition-all duration-300 animate-pulse-sos cursor-pointer"
          title="Trigger Emergency SOS Alert"
        >
          {/* Pulsing radar aura rings */}
          <span className="absolute -inset-2 rounded-full bg-red-600/30 animate-ping opacity-60 pointer-events-none" />
          <span className="absolute -inset-4 rounded-full bg-red-500/15 animate-pulse opacity-40 pointer-events-none" />

          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Radio className="w-4 h-4 text-white animate-spin" />
          </div>
          <span className="inline-block font-black text-sm tracking-widest text-shadow">
            SOS EMERGENCY
          </span>
        </button>
      </div>

      <SOSModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default FloatingSOS;
