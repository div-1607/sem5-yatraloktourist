import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Heart,
  Search,
  ShieldCheck,
  MapPin,
  Users,
  AlertTriangle,
  BarChart3,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role = 'tourist' }) => {
  const { logout, user } = useAuth();

  const touristNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Places', path: '/destinations', icon: MapPin },
    { name: 'Crowd Safety', path: '/crowd-safety', icon: ShieldCheck },
  ];

  const adminNav = [
    { name: 'Overview Analytics', path: '/admin', icon: BarChart3 },
    { name: 'Manage Destinations', path: '/admin/destinations', icon: MapPin },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'SOS Emergency Alerts', path: '/admin/sos', icon: AlertTriangle },
  ];

  const items = role === 'admin' ? adminNav : touristNav;

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-28 bg-navy-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-glass space-y-6">
        {/* User Mini Profile */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-950/60 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-navy-950 font-bold flex items-center justify-center text-sm shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
            <p className="text-xs text-amber-400 capitalize">{role === 'admin' ? 'Administrator' : 'Verified Tourist'}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            {role === 'admin' ? 'Admin Portal' : 'Main Menu'}
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-navy-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
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
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Emergency SOS</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Need urgent assistance? Trigger the floating SOS button anytime.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
