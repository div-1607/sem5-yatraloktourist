import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-blue-electric/20 bg-black-midnight/90 backdrop-blur-3xl text-slate-400 text-sm shadow-glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-royal to-blue-electric p-0.5 shadow-glow-electric">
                <div className="w-full h-full bg-black-deep rounded-[14px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-blue-neon" />
                </div>
              </div>
              <span className="text-xl font-black tracking-wider text-white">
                YATRA<span className="text-blue-electric">LOK</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier smart tourism platform combining real-time crowd safety indicators, GPS emergency SOS dispatch, and curated cultural discoveries.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/40 w-fit shadow-glow-safe">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verified Safe Tourism System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Navigation Hub
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-blue-neon font-medium transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-blue-neon font-medium transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/geofencing" className="hover:text-blue-neon font-medium transition-colors">
                  Live Geofence Radar
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-blue-neon font-medium transition-colors">
                  AI Recommendation Engine
                </Link>
              </li>
              <li>
                <Link to="/crowd-safety" className="hover:text-blue-neon font-medium transition-colors">
                  Crowd & Safety Forecast
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-blue-neon font-medium transition-colors">
                  Analytics & Trends
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              Curated Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/destinations?category=Temples" className="hover:text-blue-neon font-medium transition-colors">
                  Sacred Temples & Shrines
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Historical Places" className="hover:text-blue-neon font-medium transition-colors">
                  Historical Forts & Palaces
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Beaches" className="hover:text-blue-neon font-medium transition-colors">
                  Pristine Coastal Bays
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Old Towns" className="hover:text-blue-neon font-medium transition-colors">
                  Heritage Living Towns
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Cafes & Restaurants" className="hover:text-blue-neon font-medium transition-colors">
                  Artisanal Heritage Cafes
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines (Strict Red/Yellow Accents) */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">
              24x7 Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href="tel:112"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-bold hover:bg-red-900/50 transition-all shadow-glow-danger"
              >
                <span>National Emergency</span>
                <span className="font-mono">112</span>
              </a>
              <a
                href="tel:1363"
                className="flex items-center justify-between p-2.5 rounded-xl bg-navy-950/70 border border-blue-electric/30 text-blue-neon font-bold hover:bg-blue-royal/30 transition-all shadow-glow-electric"
              >
                <span>Tourist Helpline</span>
                <span className="font-mono">1363</span>
              </a>
              <a
                href="tel:108"
                className="flex items-center justify-between p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 font-bold hover:bg-red-900/50 transition-all"
              >
                <span>Medical Ambulance</span>
                <span className="font-mono">108</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} YatraLok Smart Tourism Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-mono">Precision Geofencing & AI Safety Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
