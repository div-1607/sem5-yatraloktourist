import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  Lock,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Live Geofence', path: '/geofencing' },
    { name: 'AI Recommendations', path: '/recommendations' },
    { name: 'Crowd & Safety', path: '/crowd-safety' },
    { name: 'Analytics', path: '/analytics' },
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-black-midnight/70 border-b border-blue-electric/20 shadow-glass transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-royal to-blue-electric p-0.5 shadow-glow-electric group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-black-deep rounded-[14px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-blue-neon group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-white">
              YATRA<span className="text-blue-electric">LOK</span>
            </span>
            <span className="block text-[9px] font-bold text-slate-400 tracking-widest uppercase">
              Luxury Smart Tourism
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-navy-950/60 p-1.5 rounded-full border border-blue-electric/25 shadow-glass backdrop-blur-xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive(link.path)
                  ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-red-600 text-white shadow-glow-danger'
                  : 'bg-red-950/50 text-red-400 hover:bg-red-900/60 border border-red-500/40'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Emergency Helpline Pill (Red Alert Style) */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] font-bold shadow-glow-danger">
            <PhoneCall className="w-3.5 h-3.5 text-danger animate-pulse" />
            <span>24x7 SOS: 112 / 1363</span>
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-navy-950/60 border border-blue-electric/30 hover:border-blue-electric shadow-glass transition-all text-sm"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-royal to-blue-electric text-white flex items-center justify-center font-bold text-xs shadow-glow-electric">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-bold text-xs text-white max-w-[110px] truncate">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-blue-neon font-mono uppercase tracking-wider">
                    {user?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-black-midnight/90 backdrop-blur-2xl border border-blue-electric/35 rounded-2xl shadow-glass-panel p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-neon" />
                    <span>Tourist Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/50 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-red-400" />
                        <span>Admin Management</span>
                      </Link>
                      <Link
                        to="/admin/geofences"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-neon hover:bg-blue-royal/30 transition-colors"
                      >
                        <Compass className="w-4 h-4" />
                        <span>Geofence Manager</span>
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/60 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="glass-button-primary text-xs tracking-wider uppercase px-4 py-2"
              >
                Get Digital ID
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-navy-950/70 border border-blue-electric/30 text-white hover:border-blue-electric"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-blue-electric/20 bg-black-midnight/95 backdrop-blur-3xl px-6 py-6 space-y-4 shadow-glass-panel">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white font-bold shadow-glow-electric'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                Tourist Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-bold text-red-400 bg-red-950/40 border border-red-500/30"
              >
                Admin Panel
              </Link>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-400 font-bold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-navy-950/80 border border-blue-electric/30 text-white font-bold text-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-gradient-to-r from-blue-royal to-blue-electric text-white font-bold text-sm shadow-glow-electric"
                >
                  Digital ID
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
