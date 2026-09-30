import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CalendarDays, FileBarChart, Settings, Users } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const DEFAULT_PREFERENCES = { crowdAlerts: true, newTouristAlerts: true, highCrowdThreshold: 75 };

const AdminWorkspacePage = () => {
  const location = useLocation();
  const page = location.pathname.split('/').pop();
  const [trips, setTrips] = useState([]);
  const [report, setReport] = useState(null);
  const [preferences, setPreferences] = useState(() => {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(localStorage.getItem('yatralok_admin_preferences') || '{}') };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  useEffect(() => {
    if (page === 'bookings') {
      api.get('/trips/admin/all?limit=1000').then((res) => setTrips(res.data?.data || [])).catch(() => setTrips([]));
    }
    if (page === 'reports') {
      api.get('/analytics/overview').then((res) => setReport(res.data?.data || null)).catch(() => setReport(null));
    }
  }, [page]);

  const savePreferences = (next) => {
    setPreferences(next);
    localStorage.setItem('yatralok_admin_preferences', JSON.stringify(next));
  };

  const title = page === 'bookings' ? 'Bookings & Trip Records' : page === 'reports' ? 'Platform Reports' : 'Admin Settings';
  const Icon = page === 'bookings' ? CalendarDays : page === 'reports' ? FileBarChart : Settings;

  return <div className="w-full px-4 sm:px-6 xl:px-10 py-8"><div className="flex flex-col lg:flex-row gap-8 items-start"><Sidebar role="admin" /><main className="flex-1 min-w-0 w-full space-y-7">
    <header><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Administration</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">{title}</h1></header>
    {page === 'bookings' && <><section className="bg-blue-50 border border-blue-100 rounded-2xl p-5"><p className="text-base font-bold text-slate-900">Booking provider not connected</p><p className="text-sm text-slate-700 mt-1">These are saved YatraLok trip itineraries, not paid reservations. No payment, hotel, or transport booking data is available in the connected backend.</p></section><section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-900">Saved trip itineraries</h2></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Traveler</th><th className="px-5 py-3">Trip</th><th className="px-5 py-3">Stops</th><th className="px-5 py-3">Travel dates</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{trips.map((trip) => <tr key={trip._id}><td className="px-5 py-4 font-semibold text-slate-800">{trip.user?.name || 'Tourist'}</td><td className="px-5 py-4 font-semibold text-slate-900">{trip.title}</td><td className="px-5 py-4 text-slate-700">{trip.waypoints?.length || 0}</td><td className="px-5 py-4 text-sm text-slate-700">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</td><td className="px-5 py-4 text-sm font-bold capitalize text-blue-700">{trip.status}</td></tr>)}</tbody></table>{trips.length === 0 && <p className="p-8 text-center text-slate-600">No saved trip records.</p>}</div></section></>}
    {page === 'reports' && <><div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">{[['Tourists', report?.summary?.totalUsers, Users], ['Active trips', report?.summary?.activeTrips, CalendarDays], ['Destinations', report?.summary?.totalDestinations, FileBarChart], ['Open SOS', report?.summary?.pendingSOS, Bell]].map(([label, value, MetricIcon]) => <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><MetricIcon className="w-6 h-6 text-blue-700" /><p className="text-sm font-semibold text-slate-600 mt-4">{label}</p><p className="text-3xl font-black text-slate-900 mt-1">{value ?? '—'}</p></div>)}</div><section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-slate-900">Tourist registrations · last 30 days</h2><p className="text-sm text-slate-500 mt-1">Daily account registrations from platform analytics</p><div className="space-y-3 mt-6">{(report?.registrationTrend || []).map((day) => <div key={day._id} className="grid grid-cols-[100px_1fr_45px] gap-3 items-center"><span className="text-sm text-slate-600">{day._id}</span><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.max(3, (day.count / Math.max(1, ...report.registrationTrend.map((entry) => entry.count))) * 100)}%` }} /></div><span className="text-sm font-bold text-slate-800 text-right">{day.count}</span></div>)}{!report?.registrationTrend?.length && <p className="text-slate-600">No registration trend data is available.</p>}</div></section></>}
    {page === 'settings' && <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 max-w-4xl"><div className="flex items-center gap-3"><Settings className="w-6 h-6 text-blue-700" /><div><h2 className="text-xl font-bold text-slate-900">Operations preferences</h2><p className="text-sm text-slate-600 mt-1">Saved in this browser for the current admin workstation.</p></div></div><label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"><span><span className="block font-semibold text-slate-900">Crowd status alerts</span><span className="text-sm text-slate-600">Show warnings for destinations with elevated platform crowd estimates.</span></span><input type="checkbox" checked={preferences.crowdAlerts} onChange={(event) => savePreferences({ ...preferences, crowdAlerts: event.target.checked })} className="w-5 h-5 accent-blue-600" /></label><label className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200"><span><span className="block font-semibold text-slate-900">New tourist registration alerts</span><span className="text-sm text-slate-600">Enable registration notifications in this workspace.</span></span><input type="checkbox" checked={preferences.newTouristAlerts} onChange={(event) => savePreferences({ ...preferences, newTouristAlerts: event.target.checked })} className="w-5 h-5 accent-blue-600" /></label><label className="block p-4 rounded-xl bg-slate-50 border border-slate-200"><span className="block font-semibold text-slate-900">High-crowd alert threshold</span><span className="text-sm text-slate-600">Percentage threshold for highlighting platform crowd estimates.</span><span className="flex items-center gap-3 mt-3"><input type="range" min="50" max="95" step="5" value={preferences.highCrowdThreshold} onChange={(event) => savePreferences({ ...preferences, highCrowdThreshold: Number(event.target.value) })} className="flex-1 accent-blue-600" /><strong className="w-12 text-right">{preferences.highCrowdThreshold}%</strong></span></label></section>}
  </main></div></div>;
};

export default AdminWorkspacePage;