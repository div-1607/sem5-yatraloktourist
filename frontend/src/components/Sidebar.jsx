import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  ShieldCheck,
  MapPin,
  Users,
  AlertTriangle,
  BarChart3,
  LogOut,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role = 'tourist' }) => {
  const { logout, user } = useAuth();

  const touristNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Destinations', path: '/destinations', icon: MapPin },
    { name: 'Live Geofence Radar', path: '/geofencing', icon: Compass },
    { name: 'AI Recommendations', path: '/recommendations', icon: Heart },
    { name: 'Crowd & Safety', path: '/crowd-safety', icon: ShieldCheck },
    { name: 'Analytics Trends', path: '/analytics', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Overview Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Manage Destinations', path: '/admin/destinations', icon: MapPin },
    { name: 'Geofence Manager', path: '/admin/geofences', icon: Compass },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'SOS Emergency Alerts', path: '/admin/sos', icon: AlertTriangle },
    { name: 'Intelligence Portal', path: '/analytics', icon: BarChart3 },
  ];

  const items = role === 'admin' ? adminNav : touristNav;

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-28 bg-black-midnight/70 backdrop-blur-2xl border border-blue-electric/25 rounded-2xl p-4 shadow-glass space-y-6 text-slate-200">
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-blue-electric/25">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-royal to-blue-electric text-white font-bold flex items-center justify-center text-sm shadow-glow-electric">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
            <p className="text-[10px] text-blue-neon font-mono uppercase tracking-wider font-semibold">
              {role === 'admin' ? 'Master Admin' : 'Verified Tourist'}
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            {role === 'admin' ? 'Admin Command' : 'Navigation Hub'}
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-royal to-blue-electric text-white shadow-glow-electric font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Safety Hotline Note */}
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs shadow-glow-danger">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-red-400">
            <AlertTriangle className="w-3.5 h-3.5 text-danger animate-pulse" />
            <span>Emergency SOS</span>
          </div>
          <p className="text-[11px] text-red-300/90 leading-relaxed font-medium">
            Immediate dispatch active. Tap floating red SOS badge for live response.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-950/60 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
