import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  Heart,
  Briefcase,
  User,
  Settings,
  MapPin,
  Users,
  AlertTriangle,
  BarChart3,
  LogOut,
  Shield,
  Route,
  TrendingUp,
  Bell,
  Activity,
  FileBarChart,
  CalendarDays,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role = 'tourist', activeTab, onTabChange }) => {
  const { logout, user } = useAuth();

  const touristItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, isTab: true },
    { id: 'journey', name: 'Journey Planner', icon: Route, isTab: true },
    { id: 'destinations', name: 'Destinations', path: '/destinations', icon: Compass, isTab: false },
    { id: 'explore', name: 'Explore', icon: MapPin, isTab: true },
    { id: 'bookmarks', name: 'Bookmarks', icon: Heart, isTab: true },
    { id: 'trips', name: 'My Trips', icon: Briefcase, isTab: true },
    { id: 'crowd', name: 'Crowd Analytics', path: '/crowd-indicator', icon: Activity, isTab: false },
    { id: 'safety', name: 'Geo-Fencing Safety', icon: ShieldAlert, isTab: true },
    { id: 'insights', name: 'Travel Insights', icon: TrendingUp, isTab: true },
    { id: 'notifications', name: 'Notifications', icon: Bell, isTab: true },
    { id: 'profile', name: 'Profile', icon: User, isTab: true },
    { id: 'settings', name: 'Settings', icon: Settings, isTab: true },
  ];

  const adminItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Tourist Tracking', path: '/admin/tracking', icon: Route },
    { name: 'Destination Management', path: '/admin/destinations', icon: MapPin },
    { name: 'Destination Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Crowd Monitoring', path: '/admin/crowd', icon: Activity },
    { name: 'Risk Monitoring', path: '/admin/risk', icon: ShieldAlert },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-80 xl:w-[22rem] shrink-0">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto bg-white border border-slate-200/90 rounded-3xl p-6 xl:p-7 shadow-sm space-y-7 text-slate-800">
        {/* User Mini Profile Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden min-w-0">
            <h4 className="text-base font-bold text-slate-900 truncate">
              {user?.name || 'Explorer'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {role === 'admin' ? 'Administrator' : 'Verified Traveler'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            {role === 'admin' ? 'Admin Controls' : 'Travel Menu'}
          </div>

          <nav className="space-y-2">
            {role === 'tourist'
              ? touristItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab ? activeTab === item.id : false;

                  if (item.isTab && onTabChange) {
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all duration-150 cursor-pointer text-left ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                      >
                        <Icon className={`w-6 h-6 shrink-0 ${isCurrent ? 'text-white' : 'text-slate-500'}`} />
                        <span className="text-base font-bold">{item.name}</span>
                      </button>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path || `/dashboard?tab=${item.id}`}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all duration-150 ${
                          isActive && !item.isTab
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      <Icon className="w-6 h-6 shrink-0 text-slate-500" />
                      <span className="text-base font-bold">{item.name}</span>
                    </NavLink>
                  );
                })
              : adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-bold transition-all duration-150 ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                          <span className="text-base font-bold">{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0 text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
