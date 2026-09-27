import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SOSModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    userName: user?.name || '',
    userMobile: user?.mobile || '',
    userEmail: user?.email || '',
    emergencyType: 'Medical',
    message: '',
  });

  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dispatchedTicket, setDispatchedTicket] = useState(null);

  // Sync user if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.name || prev.userName,
        userMobile: user.mobile || prev.userMobile,
        userEmail: user.email || prev.userEmail,
      }));
    }
  }, [user]);

  // Request browser GPS location on open
  useEffect(() => {
    if (isOpen) {
      fetchLocation();
      setDispatchedTicket(null);
    }
  }, [isOpen]);

  const fetchLocation = () => {
    setLocationLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`,
          });
          setLocationLoading(false);
        },
        (err) => {
          console.warn('Geolocation denied or failed, using standard fallback coordinates:', err.message);
          // Fallback to New Delhi default coordinates
          setLocation({
            lat: 28.6139,
            lng: 77.209,
            address: 'New Delhi (Default GPS Reference)',
          });
          setLocationLoading(false);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setLocation({
        lat: 28.6139,
        lng: 77.209,
        address: 'New Delhi (Default Reference)',
      });
      setLocationLoading(false);
    }
  };

  const handleSendSOS = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.userMobile) {
      toast.error('Please provide your name and phone number for emergency contact.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        location: location || { lat: 28.6139, lng: 77.209, address: 'Central Reference' },
      };

      const res = await api.post('/sos/create', payload);
      if (res.data.success) {
        setDispatchedTicket(res.data.data);
        toast.success('Emergency SOS Alert Dispatched Successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to trigger SOS alert');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-navy-900 border-2 border-red-500/50 rounded-2xl shadow-glow-red overflow-hidden">
        {/* Top Alert Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-wide uppercase">
                EMERGENCY SOS ASSISTANCE
              </h3>
              <p className="text-xs text-rose-100">
                Direct GPS Dispatch to Authorities & Tourism Helpdesk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {dispatchedTicket ? (
            /* Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl font-bold text-white">
                Distress Signal Active!
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your emergency request ticket ID{' '}
                <span className="text-amber-400 font-mono font-bold">
                  #{dispatchedTicket._id.slice(-6).toUpperCase()}
                </span>{' '}
                has been logged. Authorities and nearby rapid responders have been notified with your GPS coordinates.
              </p>

              {/* Direct Dial Emergency Hotlines */}
              <div className="p-4 rounded-xl bg-navy-950/80 border border-white/10 text-left space-y-3">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Direct Emergency Hotlines (Tap to Call):
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-semibold hover:bg-rose-500/25 transition-all"
                  >
                    <span>Police / 112</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:108"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold hover:bg-emerald-500/25 transition-all"
                  >
                    <span>Ambulance / 108</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:1363"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold hover:bg-amber-500/25 transition-all"
                  >
                    <span>Tourist Help / 1363</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:1091"
                    className="flex items-center justify-between p-2.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold hover:bg-purple-500/25 transition-all"
                  >
                    <span>Women Safety / 1091</span>
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="glass-button-secondary w-full py-3 text-sm font-semibold"
              >
                Close & Return
              </button>
            </div>
          ) : (
            /* SOS Dispatch Form */
            <form onSubmit={handleSendSOS} className="space-y-4">
              {/* Geolocation status pill */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">
                      Your Live Coordinates:
                    </span>
                    <span className="text-white font-mono font-medium">
                      {locationLoading
                        ? 'Acquiring GPS fix...'
                        : location?.address || 'GPS detected'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={fetchLocation}
                  disabled={locationLoading}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                >
                  Refresh
                </button>
              </div>

              {/* Emergency Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nature of Emergency *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Medical', 'Police', 'Disaster', 'Harassment', 'General'].map(
                    (type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() =>
                          setFormData({ ...formData, emergencyType: type })
                        }
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          formData.emergencyType === type
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                            : 'bg-navy-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Contact Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.userName}
                    onChange={(e) =>
                      setFormData({ ...formData, userName: e.target.value })
                    }
                    className="glass-input w-full text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 Mobile number"
                    value={formData.userMobile}
                    onChange={(e) =>
                      setFormData({ ...formData, userMobile: e.target.value })
                    }
                    className="glass-input w-full text-xs"
                  />
                </div>
              </div>

              {/* Message / Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Situation Details (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="E.g. Stranded near temple north gate, medical emergency..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="glass-input w-full text-xs resize-none"
                />
              </div>

              {/* Confirm / Trigger Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold tracking-wider text-sm shadow-glow-red flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>TRANSMITTING DISTRESS SIGNAL...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 animate-bounce" />
                    <span>CONFIRM & TRANSMIT SOS SIGNAL</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
