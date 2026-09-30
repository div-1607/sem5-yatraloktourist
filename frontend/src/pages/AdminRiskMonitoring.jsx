import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const AdminRiskMonitoring = () => {
  const [riskData, setRiskData] = useState(null);
  const [crowdData, setCrowdData] = useState(null);
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/safety').catch(() => ({ data: { success: false } })),
      api.get('/crowd/status').catch(() => ({ data: { success: false } })),
      api.get('/destinations?limit=1000&sort=crowd-desc').catch(() => ({ data: { success: false, data: [] } })),
    ]).then(([riskRes, crowdRes, destinationRes]) => {
      if (riskRes.data?.success) setRiskData(riskRes.data.data);
      if (crowdRes.data?.success) setCrowdData(crowdRes.data.summary);
      setDestinations(destinationRes.data?.destinations || destinationRes.data?.data || []);
    });
  }, []);

  const highCrowd = destinations.filter((destination) => destination.crowdStatus === 'high');
  const riskZones = riskData?.highRiskZones || [];
  const activeIncidents = riskData?.activeIncidents || [];

  return <div className="w-full px-4 sm:px-6 xl:px-10 py-8"><div className="flex flex-col lg:flex-row gap-8 items-start"><Sidebar role="admin" /><main className="flex-1 min-w-0 w-full space-y-7">
    <header><p className="text-sm font-bold uppercase tracking-wide text-red-700">Safety operations</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Risk Monitoring</h1><p className="text-base text-slate-600 mt-1">Platform crowd flags and reported incidents are shown separately. Weather, flood and road risk feeds are not connected.</p></header>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[['High crowd estimates', crowdData?.high?.count ?? 0, 'bg-red-100 text-red-800'], ['Active reported incidents', activeIncidents.length, 'bg-amber-100 text-amber-900'], ['High-risk geofences', riskZones.length, 'bg-blue-100 text-blue-800']].map(([label, value, style]) => <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"><span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${style}`}>{label}</span><p className="text-3xl font-black text-slate-900 mt-3">{value}</p></div>)}</div>
    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"><div className="p-5 border-b border-slate-100"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-700" />High crowd destinations</h2><p className="text-sm text-slate-600 mt-1">Catalog-maintained estimates, not verified real-world counts.</p></div><div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Destination</th><th className="px-5 py-3">Platform crowd flag</th><th className="px-5 py-3">Crowd estimate</th><th className="px-5 py-3">General advisory</th><th className="px-5 py-3">Location</th></tr></thead><tbody className="divide-y divide-slate-100">{highCrowd.map((destination) => { const mountain = /leh|ladakh|manali|shimla|mussoorie|nainital|uttarakhand|himachal|sikkim/i.test(`${destination.title} ${destination.city} ${destination.state}`); return <tr key={destination._id}><td className="px-5 py-4"><p className="font-bold text-slate-900">{destination.title}</p><p className="text-sm text-slate-600">{destination.city}, {destination.state}</p></td><td className="px-5 py-4"><span className="rounded-full bg-red-100 text-red-800 px-3 py-1 text-sm font-bold">High</span></td><td className="px-5 py-4 text-sm font-semibold text-slate-800">{destination.crowdPercentage ?? '—'}% YatraLok estimate</td><td className="px-5 py-4 text-sm text-slate-700">{mountain ? 'Mountain access/weather can change; confirm with local authorities.' : 'Check official local advisories before departure.'}</td><td className="px-5 py-4">{Number.isFinite(destination.location?.lat) && Number.isFinite(destination.location?.lng) ? <a className="inline-flex items-center gap-1 text-sm font-bold text-blue-700" href={`https://www.google.com/maps?q=${destination.location.lat},${destination.location.lng}`} target="_blank" rel="noreferrer"><MapPin className="w-4 h-4" />Map</a> : <span className="text-sm text-slate-500">Not mapped</span>}</td></tr>; })}</tbody></table>{highCrowd.length === 0 && <p className="p-7 text-center text-slate-600">No destinations currently carry a high YatraLok crowd flag.</p>}</div></section>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6"><section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-700" />High-risk geofences</h2><p className="text-sm text-slate-500 mt-1">Configured zones from the safety analytics service</p><div className="divide-y divide-slate-100 mt-4">{riskZones.map((zone) => <div key={zone._id} className="py-3 flex items-center justify-between gap-3"><div><p className="font-bold text-slate-900">{zone.name}</p><p className="text-sm text-slate-600 capitalize">{zone.type} · {zone.alertLevel || 'alert level not set'}</p></div><span className="text-sm text-slate-600">{zone.radius} m</span></div>)}{!riskZones.length && <p className="py-4 text-sm text-slate-600">No active high-risk geofences returned.</p>}</div></section><section className="bg-white border border-slate-200 rounded-2xl p-6"><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-700" />Reported incidents</h2><p className="text-sm text-slate-500 mt-1">Incident records from the safety service</p><div className="divide-y divide-slate-100 mt-4">{activeIncidents.map((incident) => <div key={incident._id} className="py-3"><div className="flex justify-between gap-3"><p className="font-bold text-slate-900">{incident.title || incident.type || 'Reported incident'}</p><span className="text-xs font-bold uppercase text-amber-800">{incident.severity || 'Unspecified'}</span></div><p className="text-sm text-slate-600 mt-1">{incident.description || incident.zone?.name || 'No additional detail'}</p></div>)}{!activeIncidents.length && <p className="py-4 text-sm text-slate-600">No unresolved incident reports were returned.</p>}</div></section></div>
  </main></div></div>;
};

export default AdminRiskMonitoring;