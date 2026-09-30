import React, { useEffect, useState } from 'react';
import { BarChart3, MapPin, Route, Star, Users } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminDestinationAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [crowd, setCrowd] = useState(null);
  const [registrationTrend, setRegistrationTrend] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/destinations').catch(() => ({ data: { success: false } })),
      api.get('/destinations?limit=1000&sort=rating-desc').catch(() => ({ data: { success: false, data: [] } })),
      api.get('/crowd/status').catch(() => ({ data: { success: false } })),
      api.get('/analytics/overview').catch(() => ({ data: { success: false } })),
      api.get('/trips/admin/all?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
    ]).then(([analyticsRes, destinationRes, crowdRes, overviewRes, tripsRes]) => {
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      setDestinations(destinationRes.data?.destinations || destinationRes.data?.data || []);
      if (crowdRes.data?.success) setCrowd(crowdRes.data);
      if (overviewRes.data?.success) setRegistrationTrend(overviewRes.data.data?.registrationTrend || []);
      if (tripsRes.data?.success) setTrips(tripsRes.data.data || []);
    });
  }, []);

  const categoryData = analytics?.byCategory || [];
  const maxCategory = Math.max(1, ...categoryData.map((item) => item.count || 0));
  const highestRated = analytics?.topRated || [];
  const stateData = analytics?.byState || [];
  const maxState = Math.max(1, ...stateData.map((item) => item.count || 0));
  const maxRegistrations = Math.max(1, ...registrationTrend.map((item) => item.count || 0));
  const platformStats = new Map();
  trips.forEach((trip) => (trip.waypoints || []).forEach((waypoint) => {
    const destinationId = String(waypoint.destination?._id || waypoint.destination || '');
    if (!destinationId) return;
    const stats = platformStats.get(destinationId) || { tourists: new Set(), upcoming: new Set(), active: new Set(), totalStayDays: 0, stops: 0 };
    const touristId = String(trip.user?._id || trip.user || trip._id);
    stats.tourists.add(touristId);
    if (waypoint.status === 'pending' && trip.status !== 'completed' && trip.status !== 'cancelled') stats.upcoming.add(touristId);
    if (waypoint.status === 'visited' && trip.status === 'active') stats.active.add(touristId);
    stats.totalStayDays += Number(waypoint.stayDurationDays || 0);
    stats.stops += 1;
    platformStats.set(destinationId, stats);
  }));
  const tripPopularity = destinations.map((destination) => ({ destination, count: platformStats.get(String(destination._id))?.stops || 0 })).sort((first, second) => second.count - first.count);
  const mostVisited = tripPopularity[0]?.count ? tripPopularity[0] : null;
  const leastVisited = [...tripPopularity].reverse()[0] || null;

  return (
    <div className="w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start"><Sidebar role="admin" /><main className="flex-1 min-w-0 w-full space-y-7">
        <header><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Platform intelligence</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Destination Analytics</h1><p className="text-base text-slate-600 mt-1">Popularity and crowd indicators are based on YatraLok records and estimates, not verified real-world visitor counts.</p></header>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[['Destinations in catalog', destinations.length, MapPin], ['YatraLok trip records', trips.length, Route], ['Low crowd estimates', crowd?.summary?.low?.count ?? '—', Users], ['Moderate / high estimates', `${crowd?.summary?.moderate?.count ?? '—'} / ${crowd?.summary?.high?.count ?? '—'}`, Users]].map(([title, value, Icon]) => <div key={title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{title}</p><Icon className="w-5 h-5 text-blue-700" /></div><p className="text-3xl font-black text-slate-900 mt-3">{value}</p></div>)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-700" /><h2 className="text-xl font-bold text-slate-900">Destination mix by category</h2></div><p className="text-sm text-slate-500 mt-1">Catalog records grouped by category</p><div className="space-y-4 mt-6">{categoryData.length ? categoryData.map((item) => <div key={item._id || 'Uncategorized'}><div className="flex justify-between text-sm mb-1.5"><span className="font-semibold text-slate-700">{item._id || 'Uncategorized'}</span><span className="text-slate-600">{item.count} places · avg rating {Number(item.avgRating || 0).toFixed(1)}</span></div><div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${(item.count / maxCategory) * 100}%` }} /></div></div>) : <p className="text-slate-600">Category analytics are not available.</p>}</div></section>
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-2"><Star className="w-5 h-5 text-amber-500" /><h2 className="text-xl font-bold text-slate-900">Top-rated destinations</h2></div><p className="text-sm text-slate-500 mt-1">Sorted by destination rating; not a verified visitor ranking</p><div className="divide-y divide-slate-100 mt-4">{highestRated.slice(0, 8).map((item, index) => <div key={item._id} className="py-3 flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="text-sm text-slate-400 font-bold w-6">{index + 1}</span><div><p className="font-bold text-slate-900">{item.title}</p><p className="text-sm text-slate-500">{item.city}, {item.state}</p></div></div><span className="font-bold text-slate-800">{Number(item.rating || 0).toFixed(1)} ★</span></div>)}</div></section>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-700" /><h2 className="text-xl font-bold text-slate-900">Catalog distribution by state</h2></div><p className="text-sm text-slate-500 mt-1">Number of registered YatraLok destination records</p><div className="space-y-3 mt-5">{stateData.slice(0, 10).map((item) => <div key={item._id}><div className="flex justify-between text-sm mb-1"><span className="font-semibold text-slate-700">{item._id || 'Unspecified'}</span><span className="text-slate-600">{item.count}</span></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-sky-600 rounded-full" style={{ width: `${(item.count / maxState) * 100}%` }} /></div></div>)}{!stateData.length && <p className="text-slate-600">State analytics are not available.</p>}</div></section>
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"><div className="flex items-center gap-2"><Users className="w-5 h-5 text-emerald-700" /><h2 className="text-xl font-bold text-slate-900">Tourist registration trend</h2></div><p className="text-sm text-slate-500 mt-1">Platform account registrations · last 30 days, not destination footfall</p><div className="space-y-3 mt-5">{registrationTrend.map((item) => <div key={item._id} className="grid grid-cols-[100px_1fr_36px] gap-3 items-center"><span className="text-xs text-slate-600">{item._id}</span><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.max(3, (item.count / maxRegistrations) * 100)}%` }} /></div><span className="text-sm font-bold text-slate-800 text-right">{item.count}</span></div>)}{!registrationTrend.length && <p className="text-slate-600">No registration trend data is available.</p>}</div></section>
        </div>
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-900">Destination and crowd overview</h2><p className="text-sm text-slate-500 mt-1">Trip associations are YatraLok itinerary records; crowd values are catalog estimates, not verified physical counts.</p><p className="text-sm text-slate-600 mt-2">Most itinerary stops: {mostVisited ? `${mostVisited.destination.title} (${mostVisited.count})` : 'No trip data'} · Least: {leastVisited ? `${leastVisited.destination.title} (${leastVisited.count})` : 'No catalog data'}. Seasonal visitor-footfall trends are not available.</p></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Destination</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Crowd level / estimate</th><th className="px-5 py-3">Tourists on platform trips</th><th className="px-5 py-3">Upcoming / active</th><th className="px-5 py-3">Average planned stay</th><th className="px-5 py-3">Map</th></tr></thead><tbody className="divide-y divide-slate-100">{destinations.slice(0, 100).map((item) => { const level = item.crowdStatus || 'unknown'; const badge = level === 'low' ? 'bg-emerald-100 text-emerald-800' : level === 'high' ? 'bg-red-100 text-red-800' : level === 'moderate' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'; const stats = platformStats.get(String(item._id)); const averageStay = stats?.stops ? (stats.totalStayDays / stats.stops).toFixed(1) : '—'; return <tr key={item._id}><td className="px-5 py-3"><p className="font-semibold text-slate-900">{item.title}</p><p className="text-xs text-slate-500">{item.city}, {item.state}</p></td><td className="px-5 py-3 text-sm text-slate-700">{item.category || '—'}</td><td className="px-5 py-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${badge}`}>{level} · {item.crowdPercentage ?? '—'}%</span></td><td className="px-5 py-3 text-sm text-slate-700">{stats?.tourists.size || 0} tourists · {stats?.stops || 0} stops</td><td className="px-5 py-3 text-sm text-slate-700">{stats?.upcoming.size || 0} upcoming · {stats?.active.size || 0} active</td><td className="px-5 py-3 text-sm text-slate-700">{averageStay}{averageStay !== '—' ? ' days' : ''}</td><td className="px-5 py-3">{Number.isFinite(item.location?.lat) && Number.isFinite(item.location?.lng) ? <a href={`https://www.google.com/maps?q=${item.location.lat},${item.location.lng}`} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700">Map</a> : '—'}</td></tr>; })}</tbody></table></div></section>
      </main></div>
    </div>
  );
};

export default AdminDestinationAnalytics;