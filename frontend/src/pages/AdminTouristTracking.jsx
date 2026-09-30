import React, { useEffect, useState } from 'react';
import { Activity, CalendarDays, MapPin, Route, Search, Users } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminTouristTracking = () => {
  const [trips, setTrips] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/trips/admin/all?limit=100').catch(() => ({ data: { success: false, data: [] } })),
      api.get('/locations/admin/active?minutes=30').catch(() => ({ data: { success: false, data: [] } })),
    ]).then(([tripRes, locationRes]) => {
      const records = tripRes.data?.data || [];
      setTrips(records);
      setSelectedTrip(records[0] || null);
      setLocations(locationRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const query = search.toLowerCase();
    return !query || trip.user?.name?.toLowerCase().includes(query) || trip.title?.toLowerCase().includes(query);
  });
  const waypoints = selectedTrip?.waypoints || [];
  const completedCount = waypoints.filter((point) => point.status === 'visited').length;
  const progress = waypoints.length ? Math.round((completedCount / waypoints.length) * 100) : 0;
  const locationFor = (trip) => locations.find((record) =>
    record.userInfo?.digitalId && record.userInfo.digitalId === trip.user?.digitalId
  );

  return (
    <div className="w-full px-4 sm:px-6 xl:px-10 py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <Sidebar role="admin" />
        <main className="flex-1 min-w-0 w-full space-y-7">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Operations</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Tourist Tracking</h1><p className="text-base text-slate-600 mt-1">Trips and itinerary progress from YatraLok records; recent GPS is shown only when a location ping is available.</p></div>
            <div className="flex gap-3"><div className="bg-white border border-slate-200 rounded-xl px-4 py-3"><p className="text-sm text-slate-500">Trips</p><p className="text-2xl font-black text-slate-900">{trips.length}</p></div><div className="bg-white border border-slate-200 rounded-xl px-4 py-3"><p className="text-sm text-slate-500">GPS pings &lt; 30m</p><p className="text-2xl font-black text-emerald-700">{locations.length}</p></div></div>
          </header>

          <section className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
            <div className="xl:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">Trip registry</h2><div className="relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search tourists or trips" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tourist or trip" className="glass-input pl-9 py-2 text-sm w-full sm:w-64" /></div></div>
              {loading ? <p className="p-8 text-center text-slate-500">Loading trip records…</p> : filteredTrips.length ? <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Tourist / Trip</th><th className="px-5 py-3">Current location</th><th className="px-5 py-3">Next destination</th><th className="px-5 py-3">Dates / status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredTrips.map((trip) => { const location = locationFor(trip); const next = (trip.waypoints || []).find((point) => point.status === 'pending'); return <tr key={trip._id} onClick={() => setSelectedTrip(trip)} className={`cursor-pointer hover:bg-blue-50/70 ${selectedTrip?._id === trip._id ? 'bg-blue-50' : ''}`}><td className="px-5 py-4"><p className="font-bold text-slate-900">{trip.user?.name || 'Tourist'}</p><p className="text-sm text-slate-600">{trip.title}</p></td><td className="px-5 py-4 text-sm text-slate-700">{location ? `${location.lastLocation.latitude.toFixed(4)}, ${location.lastLocation.longitude.toFixed(4)}` : 'No recent GPS ping'}</td><td className="px-5 py-4 text-sm font-semibold text-slate-800">{next?.name || 'No upcoming stop'}</td><td className="px-5 py-4"><p className="text-sm text-slate-700">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p><span className="text-xs font-bold capitalize text-blue-700">{trip.status}</span></td></tr>; })}</tbody></table></div> : <div className="p-10 text-center"><Users className="w-9 h-9 text-slate-400 mx-auto" /><p className="text-lg font-bold text-slate-900 mt-3">No trip records found</p><p className="text-sm text-slate-600 mt-1">Tourist itineraries will appear here once saved.</p></div>}
            </div>

            <section className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-2"><Route className="w-5 h-5 text-blue-700" /><h2 className="text-xl font-bold text-slate-900">Journey detail</h2></div>
              {selectedTrip ? <><div><p className="text-lg font-bold text-slate-900">{selectedTrip.user?.name || 'Tourist'} · {selectedTrip.title}</p><p className="text-sm text-slate-600 mt-1">{waypoints.length} itinerary stops · {Math.max(0, Math.ceil((new Date(selectedTrip.endDate) - new Date(selectedTrip.startDate)) / 86400000))} days</p></div><div><div className="flex justify-between text-sm mb-2"><span className="text-slate-600">Journey progress</span><strong>{progress}%</strong></div><div className="h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }} /></div></div><ol className="space-y-0">{waypoints.map((point, index) => { const visited = point.status === 'visited'; const current = !visited && !waypoints.slice(0, index).some((prior) => prior.status === 'pending'); return <li key={point._id || `${point.name}-${index}`} className="relative flex gap-3 pb-5 last:pb-0"><div className="flex flex-col items-center"><span className={`w-3.5 h-3.5 rounded-full mt-1 ${visited ? 'bg-emerald-500' : current ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'}`} />{index < waypoints.length - 1 && <span className="w-px flex-1 bg-slate-200 mt-2" />}</div><div className="flex-1"><div className="flex justify-between gap-3"><p className="font-bold text-slate-900">{point.name}</p><span className={`text-xs font-bold ${visited ? 'text-emerald-700' : current ? 'text-blue-700' : 'text-slate-500'}`}>{visited ? 'Visited' : current ? 'Current / next' : 'Upcoming'}</span></div><p className="text-sm text-slate-500 mt-1">{point.arrivalTime ? new Date(point.arrivalTime).toLocaleDateString() : 'Stay dates not specified'}{point.departureTime ? ` – ${new Date(point.departureTime).toLocaleDateString()}` : ''}</p></div></li>; })}</ol><div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm"><div><p className="text-slate-500">Start date</p><p className="font-semibold mt-1">{new Date(selectedTrip.startDate).toLocaleDateString()}</p></div><div><p className="text-slate-500">End date</p><p className="font-semibold mt-1">{new Date(selectedTrip.endDate).toLocaleDateString()}</p></div></div></> : <p className="text-base text-slate-600">Select a trip to inspect its route and progress.</p>}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
};

export default AdminTouristTracking;