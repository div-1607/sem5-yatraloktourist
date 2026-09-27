import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  ShieldAlert,
  Users,
  LayoutDashboard,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  Lock,
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
    { name: 'Explore Places', path: '/destinations' },
    { name: 'Crowd Safety', path: '/crowd-safety' },
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
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-navy-950/80 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-glow-amber group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
              YATRA LOK
            </span>
            <span className="block text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              Smart & Safe Travel
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-navy-900/60 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive(link.path)
                  ? 'bg-amber-500 text-navy-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-amber-500 text-navy-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive('/admin')
                  ? 'bg-rose-600 text-white font-bold shadow-md'
                  : 'text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        {/* Right Action Area */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Emergency Helpline Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium">
            <PhoneCall className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>24x7 Helpline: 112 / 1363</span>
          </div>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-navy-900/60 border border-white/10 hover:border-amber-500/40 transition-all text-sm"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-xs text-white max-w-[120px] truncate">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-amber-400 capitalize">
                    {user?.role}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-navy-900/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-white/10 hover:text-amber-400 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Tourist Dashboard</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Admin Management</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/15 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-amber-400 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="glass-button-primary text-xs tracking-wide uppercase px-5 py-2.5"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-navy-900/60 border border-white/10 text-slate-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-950/95 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-amber-500 text-navy-950 font-bold'
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
                className="px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5"
              >
                Tourist Dashboard
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-rose-400 bg-rose-950/20"
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
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-500/20 text-rose-300 font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out ({user?.name})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-steel-800 text-white font-medium text-sm border border-white/10"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-amber-500 text-navy-950 font-bold text-sm"
                >
                  Sign Up
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
