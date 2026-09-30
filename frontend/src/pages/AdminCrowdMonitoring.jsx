import React, { useEffect, useState } from 'react';
import { Activity, MapPin, Users } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminCrowdMonitoring = () => {
  const [overview, setOverview] = useState(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/crowd/status').catch(() => ({ data: { success: false } })),
      api.get('/destinations?limit=1000&sort=crowd-desc').catch(() => ({ data: { success: false, data: [] } })),
    ]).then(([crowdRes, destinationRes]) => {
      if (crowdRes.data?.success) setOverview(crowdRes.data.summary);
      setDestinations(destinationRes.data?.destinations || destinationRes.data?.data || []);
    });
  }, []);

  const crowdPlaces = destinations.filter((item) => item.crowdStatus).sort((a, b) => (b.crowdPercentage || 0) - (a.crowdPercentage || 0));
  const levels = [['low', 'Low crowd', 'bg-emerald-100 text-emerald-800'], ['moderate', 'Moderate crowd', 'bg-amber-100 text-amber-900'], ['high', 'High crowd', 'bg-red-100 text-red-800']];

  return (
    <div className="w-full px-4 sm:px-6 xl:px-10 py-8"><div className="flex flex-col lg:flex-row gap-8 items-start"><Sidebar role="admin" /><main className="flex-1 min-w-0 w-full space-y-7">
      <header><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Destination safety</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Crowd Monitoring</h1><p className="text-base text-slate-600 mt-1">YatraLok crowd levels are platform indicators and estimates; they are not verified real-world headcounts.</p></header>
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">{levels.map(([key, label, color]) => <div key={key} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center justify-between"><span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>{label}</span><Users className="w-5 h-5 text-slate-500" /></div><p className="text-3xl font-black text-slate-900 mt-4">{overview?.[key]?.count ?? '—'} <span className="text-base font-semibold text-slate-500">destinations</span></p><p className="text-sm text-slate-600 mt-1">{overview?.[key]?.percentage ?? 0}% of destinations with platform crowd status</p></div>)}</section>
      <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-700" /><div><h2 className="text-xl font-bold text-slate-900">Destination crowd register</h2><p className="text-sm text-slate-500 mt-1">Live tourist count and independently verified forecasts are not currently provided by the connected backend.</p></div></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Destination</th><th className="px-5 py-3">Current tourists</th><th className="px-5 py-3">Expected tourists</th><th className="px-5 py-3">Crowd level</th><th className="px-5 py-3">Average stay</th><th className="px-5 py-3">Best visiting period</th></tr></thead><tbody className="divide-y divide-slate-100">{crowdPlaces.map((item) => { const level = item.crowdStatus; const color = level === 'low' ? 'bg-emerald-100 text-emerald-800' : level === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'; return <tr key={item._id}><td className="px-5 py-4"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-700" /><div><p className="font-semibold text-slate-900">{item.title}</p><p className="text-xs text-slate-500">{item.city}, {item.state}</p></div></div></td><td className="px-5 py-4 text-sm text-slate-600">Unavailable</td><td className="px-5 py-4 text-sm text-slate-600">Unavailable</td><td className="px-5 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${color}`}>{level} · {item.crowdPercentage ?? 0}% estimate</span></td><td className="px-5 py-4 text-sm text-slate-600">Not recorded</td><td className="px-5 py-4 text-sm text-slate-700">{item.bestTimeToVisit || 'Not recorded'}</td></tr>; })}</tbody></table></div></section>
    </main></div></div>
  );
};

export default AdminCrowdMonitoring;