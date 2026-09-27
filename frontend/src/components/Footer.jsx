import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, Heart, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-navy-950/90 backdrop-blur-xl text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-glow-amber">
                <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-wider text-white">
                YATRA LOK
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's premier smart tourism platform combining real-time crowd safety indicators, GPS emergency SOS dispatch, and curated cultural discoveries.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Verified Safe Tourism Partner</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="hover:text-amber-400 transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/crowd-safety" className="hover:text-amber-400 transition-colors">
                  Real-time Crowd Indicator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-amber-400 transition-colors">
                  Tourist Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition-colors">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase">
              Key Categories
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/destinations?category=Temples" className="hover:text-amber-400 transition-colors">
                  Ancient Temples & Shrines
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Historical Places" className="hover:text-amber-400 transition-colors">
                  Historical Forts & Palaces
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Beaches" className="hover:text-amber-400 transition-colors">
                  Beaches & Coastal Shacks
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Old Towns" className="hover:text-amber-400 transition-colors">
                  Heritage Old Towns
                </Link>
              </li>
              <li>
                <Link to="/destinations?category=Cafes & Restaurants" className="hover:text-amber-400 transition-colors">
                  Artisanal Cafes & Dining
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Hotlines */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase flex items-center gap-2">
              <Phone className="w-4 h-4 text-rose-400" />
              <span>24x7 Emergency Helplines</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <span>National Emergency</span>
                <span className="text-rose-400 font-bold">112</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <span>Tourist Assistance Helpline</span>
                <span className="text-amber-400 font-bold">1363</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <span>Police Control</span>
                <span className="text-white font-bold">100</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                <span>Women Safety</span>
                <span className="text-pink-400 font-bold">1091</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Yatra Lok. Designed for safe, seamless exploration.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span className="hover:text-white cursor-pointer">Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
