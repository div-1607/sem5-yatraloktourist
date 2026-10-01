import React from 'react';
import {
  Sparkles,
  Sun,
  Landmark,
  Coffee,
  ShoppingBag,
  Plane,
  Mountain,
  Clock,
  ShieldCheck,
  Compass,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { formatCategoryName } from '../utils/destinationUtils';

/**
 * Category-Specific Information Panel
 * Highlights category-exclusive information strictly on the Destination Details Page,
 * ensuring all card layouts in rails and grids remain visually identical.
 */
const CategorySpecificDetails = ({ destination }) => {
  const category = formatCategoryName(destination.category);

  switch (category) {
    case 'Temples':
      return (
        <section className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200/70">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Temple Specific Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Spiritual Protocols, Darshan & Sacred Etiquette
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Aarti & Darshan Hours
              </span>
              <p className="text-sm font-extrabold text-slate-900">05:30 AM – 12:30 PM</p>
              <p className="text-xs text-slate-600">Evening Session: 04:30 PM – 09:15 PM</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                Dress Code & Protocol
              </span>
              <p className="text-sm font-extrabold text-slate-900">Traditional Attire Recommended</p>
              <p className="text-xs text-slate-600">Footwear deposit counter at main Gopuram/entrance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                Sanctum Guidelines
              </span>
              <p className="text-sm font-extrabold text-slate-900">Prasadam & Archana Counters</p>
              <p className="text-xs text-slate-600">Mobile photography restricted within Garbhagriha.</p>
            </div>
          </div>
        </section>
      );

    case 'Beaches':
      return (
        <section className="bg-white rounded-3xl border border-sky-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200/70">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                Coastal & Beach Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Tide Conditions, Lifeguards & Water Activities
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                Lifeguard Patrol Hours
              </span>
              <p className="text-sm font-extrabold text-slate-900">07:00 AM – 06:30 PM</p>
              <p className="text-xs text-slate-600">Red & yellow flags indicate designated safe swim zones.</p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-600" />
                Water Sports Availability
              </span>
              <p className="text-sm font-extrabold text-slate-900">Parasailing, Jet Ski & Boating</p>
              <p className="text-xs text-slate-600">Operated by certified operators with mandatory life jackets.</p>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-sky-600" />
                Golden Hour & Sunsets
              </span>
              <p className="text-sm font-extrabold text-slate-900">05:45 PM – 06:45 PM</p>
              <p className="text-xs text-slate-600">Best vistas from southern shoreline promenades.</p>
            </div>
          </div>
        </section>
      );

    case 'Historical Sites':
      return (
        <section className="bg-white rounded-3xl border border-stone-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-stone-100 text-stone-800 border border-stone-300">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                Heritage Site Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Architectural History, Guided Tours & Audio Access
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-stone-700" />
                Monument Protection
              </span>
              <p className="text-sm font-extrabold text-slate-900">ASI Protected Monument</p>
              <p className="text-xs text-slate-600">Preserved under archaeological heritage conservation laws.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-stone-700" />
                Guided Audio Tours
              </span>
              <p className="text-sm font-extrabold text-slate-900">Multilingual Audio Headsets</p>
              <p className="text-xs text-slate-600">QR code self-guided digital tour available at ticket entrance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-700" />
                Recommended Tour Duration
              </span>
              <p className="text-sm font-extrabold text-slate-900">2.5 to 3.5 Hours</p>
              <p className="text-xs text-slate-600">Early morning entry recommended to bypass mid-day queues.</p>
            </div>
          </div>
        </section>
      );

    case 'Cafes':
      return (
        <section className="bg-white rounded-3xl border border-rose-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200/70">
              <Coffee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                Cafe & Culinary Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Specialty Brews, Seating Ambiance & Work-Friendly Amenities
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-rose-600" />
                Cuisine & Brews
              </span>
              <p className="text-sm font-extrabold text-slate-900">Artisanal Coffees & Local Bites</p>
              <p className="text-xs text-slate-600">Fresh pastries, specialty brews, and organic regional snacks.</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-600" />
                Work-Friendly Amenities
              </span>
              <p className="text-sm font-extrabold text-slate-900">High-Speed WiFi & Power Outlets</p>
              <p className="text-xs text-slate-600">Quiet terrace and indoor AC seating zones suitable for nomads.</p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Peak Operating Hours
              </span>
              <p className="text-sm font-extrabold text-slate-900">08:00 AM – 11:00 PM</p>
              <p className="text-xs text-slate-600">Evening buzz peaks between 05:30 PM and 08:30 PM.</p>
            </div>
          </div>
        </section>
      );

    case 'Shopping':
      return (
        <section className="bg-white rounded-3xl border border-purple-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200/70">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Shopping & Bazaars Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Bazaar Specialities, Local Handicrafts & Shopping Hours
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />
                Renowned Specialities
              </span>
              <p className="text-sm font-extrabold text-slate-900">Authentic Textiles & Handlooms</p>
              <p className="text-xs text-slate-600">Handicrafts, wooden carvings, silver jewelry, and spices.</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                Bargaining & Payment Tips
              </span>
              <p className="text-sm font-extrabold text-slate-900">UPI / QR Widely Accepted</p>
              <p className="text-xs text-slate-600">Friendly bargaining is customary in open bazaar corridors.</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                Prime Market Timing
              </span>
              <p className="text-sm font-extrabold text-slate-900">11:00 AM – 09:30 PM</p>
              <p className="text-xs text-slate-600">Best experienced in the vibrant evening illumination.</p>
            </div>
          </div>
        </section>
      );

    case 'Airports':
      return (
        <section className="bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/70">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Airport & Transit Hub Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Terminals, City Metro Transit & Passenger Amenities
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-blue-600" />
                Terminal Transit
              </span>
              <p className="text-sm font-extrabold text-slate-900">Domestic & International Gates</p>
              <p className="text-xs text-slate-600">Free inter-terminal shuttles operating every 10-15 minutes.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                Ground Transportation
              </span>
              <p className="text-sm font-extrabold text-slate-900">Metro Station & 24/7 Taxis</p>
              <p className="text-xs text-slate-600">Direct express metro line and prepaid police-verified taxi booths.</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Passenger Services
              </span>
              <p className="text-sm font-extrabold text-slate-900">Lounges, Cloakroom & DigiYatra</p>
              <p className="text-xs text-slate-600">Biometric paperless gate check-in enabled for swift security entry.</p>
            </div>
          </div>
        </section>
      );

    case 'Hill Stations':
    case 'Tourist Places':
    default:
      return (
        <section className="bg-white rounded-3xl border border-emerald-200/80 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Tourist & Mountain Explorer Guide
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Scenic Viewpoints, Trekking Trails & Nature Safeties
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Mountain className="w-3.5 h-3.5 text-emerald-600" />
                Scenic Vistas & Photography
              </span>
              <p className="text-sm font-extrabold text-slate-900">Panoramic Mountain Overlooks</p>
              <p className="text-xs text-slate-600">Sunrise and sunset view decks offer crystal-clear Himalayan horizons.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
                Trail & Cable Car Access
              </span>
              <p className="text-sm font-extrabold text-slate-900">Marked Hiking Paths & Ropeway</p>
              <p className="text-xs text-slate-600">Follow signposted tracks; check local weather before alpine ascents.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Geofenced Safety Telemetry
              </span>
              <p className="text-sm font-extrabold text-slate-900">Active YatraLok Safety Zone</p>
              <p className="text-xs text-slate-600">SOS assistance units and local tourist police posts within 2 km.</p>
            </div>
          </div>
        </section>
      );
  }
};

export default CategorySpecificDetails;
