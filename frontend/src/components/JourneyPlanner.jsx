import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, Check, Clock3, Mail, MapPin, Plus, Route, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const toLocalDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const toLocalDateTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return `${toLocalDate(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const localDateOffset = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toLocalDate(date);
};

const emptyDraft = (startingLocation = '') => ({
  title: '',
  startingLocation,
  startDate: localDateOffset(0),
  endDate: localDateOffset(1),
  tripType: 'solo',
  travelerCount: 1,
  description: '',
  waypoints: [],
});

const crowdStyle = (level) => level === 'high'
  ? 'bg-red-100 text-red-800'
  : level === 'moderate'
    ? 'bg-amber-100 text-amber-900'
    : 'bg-emerald-100 text-emerald-800';

const stopRisk = (destination) => {
  const location = `${destination?.title || ''} ${destination?.city || ''} ${destination?.state || ''}`.toLowerCase();
  if (destination?.crowdStatus === 'high') return { level: 'High', reason: 'YatraLok crowd estimate is high.' };
  if (destination?.crowdStatus === 'moderate') return { level: 'Moderate', reason: 'YatraLok crowd estimate is moderate.' };
  if (/leh|ladakh|manali|shimla|mussoorie|nainital|uttarakhand|himachal|sikkim/.test(location)) {
    return { level: 'Moderate', reason: 'General mountain-travel advisory: check altitude, road and weather conditions before departure.' };
  }
  return { level: 'Low', reason: 'No destination-specific hazard feed is connected; this is a baseline planning indicator.' };
};

const destinationIdOf = (stop) => stop.destination?._id || stop.destination || stop.destinationId || '';

const JourneyPlanner = ({ trips = [], selectedTripId, onSelectTrip, onTripsChanged, startingLocation = '', initialDestinationId, userEmail = '' }) => {
  const [destinations, setDestinations] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(() => emptyDraft(startingLocation));
  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [savedTrip, setSavedTrip] = useState(null);
  const [handledDestinationId, setHandledDestinationId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/destinations?limit=1000').catch(() => ({ data: { success: false, data: [] } })),
      api.get('/destinations/recommendations').catch(() => ({ data: { success: false, data: [] } })),
    ]).then(([destinationRes, recommendationRes]) => {
      setDestinations(destinationRes.data?.destinations || destinationRes.data?.data || []);
      setRecommendations(recommendationRes.data?.data || []);
    }).finally(() => setLoadingDestinations(false));
  }, []);

  useEffect(() => {
    if (!selectedTripId) {
      setSavedTrip(null);
      return;
    }
    const trip = trips.find((item) => item._id === selectedTripId);
    if (!trip) return;
    setDraft({
      title: trip.title || '',
      startingLocation: trip.startingLocation || startingLocation,
      startDate: toLocalDate(trip.startDate),
      endDate: toLocalDate(trip.endDate),
      tripType: trip.tripType || 'solo',
      travelerCount: trip.travelerCount || 1,
      description: trip.description || '',
      waypoints: (trip.waypoints || []).map((waypoint, index) => ({
        ...waypoint,
        destinationId: destinationIdOf(waypoint),
        arrivalTime: toLocalDateTime(waypoint.arrivalTime),
        departureTime: toLocalDateTime(waypoint.departureTime),
        activities: Array.isArray(waypoint.activities) ? waypoint.activities : [],
        stayDurationDays: waypoint.stayDurationDays || 0,
        order: index,
      })),
    });
    setSavedTrip(null);
  }, [selectedTripId, trips, startingLocation]);

  useEffect(() => {
    if (!initialDestinationId || initialDestinationId === handledDestinationId || !destinations.length) return;
    const destination = destinations.find((item) => item._id === initialDestinationId || item.slug === initialDestinationId);
    if (destination) {
      setDraft((current) => ({
        ...(current.title ? current : { ...emptyDraft(startingLocation), title: `Trip to ${destination.city || destination.title}` }),
        waypoints: current.waypoints.some((stop) => destinationIdOf(stop) === destination._id)
          ? current.waypoints
          : [...current.waypoints, makeStop(destination, current.waypoints.length)],
      }));
      setHandledDestinationId(initialDestinationId);
    }
  }, [initialDestinationId, handledDestinationId, destinations, startingLocation]);

  const filteredDestinations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return destinations.filter((destination) => !query || [destination.title, destination.city, destination.state, destination.category, ...(destination.tags || [])].join(' ').toLowerCase().includes(query)).slice(0, 10);
  }, [destinations, search]);

  function makeStop(destination, order) {
    const arrival = localDateOffset(order + 1);
    const departure = localDateOffset(order + 2);
    return {
      destinationId: destination._id,
      destination,
      name: destination.title,
      location: { lat: destination.location?.lat, lng: destination.location?.lng },
      arrivalTime: `${arrival}T09:00`,
      departureTime: `${departure}T17:00`,
      stayDurationDays: 1,
      activities: (destination.tags || []).slice(0, 2),
      notes: '',
      status: 'pending',
      order,
    };
  }

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const addDestination = (destination) => {
    if (draft.waypoints.some((stop) => destinationIdOf(stop) === destination._id)) {
      toast('That destination is already in this itinerary.');
      return;
    }
    setDraft((current) => ({
      ...current,
      title: current.title || `Trip to ${destination.city || destination.title}`,
      waypoints: [...current.waypoints, makeStop(destination, current.waypoints.length)],
    }));
    setSavedTrip(null);
  };

  const updateStop = (index, updates) => {
    setDraft((current) => ({
      ...current,
      waypoints: current.waypoints.map((stop, stopIndex) => stopIndex === index ? { ...stop, ...updates } : stop),
    }));
    setSavedTrip(null);
  };

  const removeStop = (index) => setDraft((current) => ({ ...current, waypoints: current.waypoints.filter((_, stopIndex) => stopIndex !== index).map((stop, order) => ({ ...stop, order })) }));

  const moveStop = (index, direction) => setDraft((current) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= current.waypoints.length) return current;
    const waypoints = [...current.waypoints];
    [waypoints[index], waypoints[nextIndex]] = [waypoints[nextIndex], waypoints[index]];
    return { ...current, waypoints: waypoints.map((stop, order) => ({ ...stop, order })) };
  });

  const getDestination = (stop) => stop.destination || destinations.find((item) => item._id === destinationIdOf(stop));

  const saveItinerary = async (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.startDate || !draft.endDate || draft.waypoints.length === 0) {
      toast.error('Add a trip name, travel dates, and at least one destination.');
      return;
    }
    if (new Date(draft.endDate) < new Date(draft.startDate)) {
      toast.error('The trip end date must be on or after the start date.');
      return;
    }
    const waypoints = draft.waypoints.map((stop, order) => {
      const destination = getDestination(stop);
      if (!destination?.location || typeof destination.location.lat !== 'number' || typeof destination.location.lng !== 'number') return null;
      return {
        _id: stop._id,
        destination: destination._id,
        name: destination.title || stop.name,
        location: { lat: destination.location.lat, lng: destination.location.lng },
        arrivalTime: stop.arrivalTime ? new Date(stop.arrivalTime).toISOString() : undefined,
        departureTime: stop.departureTime ? new Date(stop.departureTime).toISOString() : undefined,
        stayDurationDays: Number(stop.stayDurationDays) || 0,
        activities: (stop.activities || []).filter(Boolean),
        notes: stop.notes || '',
        status: stop.status || 'pending',
        order,
      };
    });
    if (waypoints.some((point) => !point)) {
      toast.error('A selected destination is missing coordinates and cannot be added to a saved route.');
      return;
    }
    const payload = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      startingLocation: draft.startingLocation.trim(),
      travelerCount: Math.max(1, Number(draft.travelerCount) || 1),
      startDate: new Date(`${draft.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${draft.endDate}T23:59:00`).toISOString(),
      tripType: draft.tripType,
      waypoints,
      status: 'planning',
    };
    setSaving(true);
    try {
      const response = selectedTripId
        ? await api.put(`/trips/${selectedTripId}`, payload)
        : await api.post('/trips', payload);
      if (!response.data?.success) throw new Error('The itinerary could not be saved.');
      setSavedTrip(response.data.data);
      onSelectTrip(response.data.data._id);
      await onTripsChanged();
      toast.success(selectedTripId ? 'Itinerary updated.' : 'Itinerary saved to My Trips.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not save this itinerary.');
    } finally {
      setSaving(false);
    }
  };

  const emailItinerary = async () => {
    const tripId = savedTrip?._id || selectedTripId;
    if (!tripId) {
      toast.error('Save the itinerary before emailing it.');
      return;
    }
    if (!userEmail) {
      toast.error('Your account does not have an email address.');
      return;
    }
    setEmailing(true);
    try {
      const response = await api.post(`/trips/${tripId}/email`);
      if (!response.data?.success) throw new Error('The itinerary email could not be sent.');
      await onTripsChanged();
      toast.success('Your journey plan has been sent to your registered email.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Could not email this itinerary.');
    } finally {
      setEmailing(false);
    }
  };

  const deleteTrip = async (tripId) => {
    if (!window.confirm('Delete this saved itinerary?')) return;
    try {
      await api.delete(`/trips/${tripId}`);
      if (selectedTripId === tripId) {
        onSelectTrip('');
        setDraft(emptyDraft(startingLocation));
      }
      await onTripsChanged();
      toast.success('Itinerary deleted.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete this itinerary.');
    }
  };

  const totalDays = draft.startDate && draft.endDate
    ? Math.max(1, Math.ceil((new Date(`${draft.endDate}T00:00:00`) - new Date(`${draft.startDate}T00:00:00`)) / 86400000) + 1)
    : 0;

  return (
    <div className="space-y-7">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Journey Planner</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Build your route</h1><p className="text-base text-slate-600 mt-1">Search destinations, schedule each stop, then save the full itinerary to My Trips.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" disabled={!selectedTripId && !savedTrip?._id} onClick={emailItinerary} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-blue-200 bg-white text-blue-800 font-bold hover:bg-blue-50 disabled:opacity-50" title={userEmail ? `Send to ${userEmail}` : 'No email is set on this account'}><Mail className="w-5 h-5" />{emailing ? 'Sending…' : 'Email My Journey Plan'}</button><button type="button" onClick={() => { onSelectTrip(''); setDraft(emptyDraft(startingLocation)); setSavedTrip(null); }} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold"><Plus className="w-5 h-5" />New itinerary</button></div>
      </header>

      {trips.length > 0 && <section className="bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-900">Saved itineraries</h2><span className="text-sm text-slate-500">{trips.length} trips</span></div><div className="flex gap-3 overflow-x-auto pt-4">{trips.map((trip) => <div key={trip._id} className={`min-w-[250px] max-w-[320px] flex-1 rounded-xl border p-4 ${selectedTripId === trip._id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}><p className="font-bold text-slate-900 line-clamp-1">{trip.title}</p><p className="text-sm text-slate-600 mt-1">{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</p><p className="text-sm text-slate-600">{trip.waypoints?.length || 0} stops · {trip.status}</p><div className="flex gap-2 mt-3"><button type="button" onClick={() => onSelectTrip(trip._id)} className="flex-1 rounded-lg bg-white border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-400">Edit / Open</button><button type="button" onClick={() => deleteTrip(trip._id)} aria-label={`Delete ${trip.title}`} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></div></div>)}</div></section>}

      <form onSubmit={saveItinerary} className="space-y-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-700" />Trip details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 xl:col-span-1">Trip name<input required value={draft.title} onChange={(event) => updateDraft('title', event.target.value)} placeholder="e.g. Rajasthan heritage route" className="glass-input mt-1 w-full text-base" /></label>
            <label className="text-sm font-semibold text-slate-700">Starting location<input value={draft.startingLocation} onChange={(event) => updateDraft('startingLocation', event.target.value)} placeholder="City, station or address" className="glass-input mt-1 w-full text-base" /></label>
            <label className="text-sm font-semibold text-slate-700">Travel style<select value={draft.tripType} onChange={(event) => updateDraft('tripType', event.target.value)} className="glass-input mt-1 w-full text-base"><option value="solo">Solo</option><option value="couple">Couple</option><option value="family">Family</option><option value="group">Group</option><option value="business">Business</option></select></label>
            <label className="text-sm font-semibold text-slate-700">Start date<input type="date" required value={draft.startDate} onChange={(event) => updateDraft('startDate', event.target.value)} className="glass-input mt-1 w-full text-base" /></label>
            <label className="text-sm font-semibold text-slate-700">End date<input type="date" required min={draft.startDate} value={draft.endDate} onChange={(event) => updateDraft('endDate', event.target.value)} className="glass-input mt-1 w-full text-base" /></label>
            <label className="text-sm font-semibold text-slate-700">Travelers<input type="number" min="1" max="50" value={draft.travelerCount} onChange={(event) => updateDraft('travelerCount', event.target.value)} className="glass-input mt-1 w-full text-base" /></label>
            <label className="text-sm font-semibold text-slate-700 sm:col-span-2 xl:col-span-3">Trip notes<textarea rows="2" value={draft.description} onChange={(event) => updateDraft('description', event.target.value)} placeholder="What would you like to focus on?" className="glass-input mt-1 w-full resize-y text-base" /></label>
          </div>
          <p className="text-sm text-slate-600 mt-4">{totalDays} total calendar days planned. Travel times between stops are not calculated because route/transit data is not connected.</p>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Search className="w-5 h-5 text-blue-700" />Find destinations</h2><p className="text-sm text-slate-600 mt-1">Add several stops without leaving your itinerary.</p></div><div className="relative w-full md:w-96"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="journey-destination-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search place, city, state or category" className="glass-input w-full pl-9 text-base" /></div></div>
          {loadingDestinations ? <p className="py-8 text-center text-slate-600">Loading destination catalog…</p> : <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">{filteredDestinations.map((destination) => <article key={destination._id} className="rounded-xl border border-slate-200 p-4 flex flex-col"><div className="flex gap-3"><img src={destination.images?.[0]} alt={destination.title} onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} className="w-20 h-20 rounded-lg object-cover bg-slate-100" /><div className="min-w-0"><h3 className="font-bold text-slate-900 line-clamp-1">{destination.title}</h3><p className="text-sm text-slate-600">{destination.city}, {destination.state}</p><p className="text-sm text-amber-700 font-semibold">★ {Number(destination.rating || 0).toFixed(1)} · {destination.category}</p></div></div><p className="text-sm text-slate-600 line-clamp-2 mt-3">{destination.shortDescription || destination.description}</p><div className="flex items-center justify-between gap-2 mt-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${crowdStyle(destination.crowdStatus)}`}>{destination.crowdStatus || 'low'} crowd · {destination.crowdPercentage ?? '—'}% estimate</span><button type="button" onClick={() => addDestination(destination)} disabled={draft.waypoints.some((stop) => destinationIdOf(stop) === destination._id)} className="inline-flex items-center gap-1 rounded-lg bg-blue-700 px-3 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:bg-slate-300"><Plus className="w-4 h-4" />Add</button></div><div className="mt-2 flex gap-3 text-xs text-slate-500"><span>{destination.bestTimeToVisit || 'Visit season not recorded'}</span><Link to={`/destinations/${destination.slug || destination._id}`} className="font-bold text-blue-700">Details</Link></div></article>)}</div>}
          {!loadingDestinations && filteredDestinations.length === 0 && <p className="py-8 text-center text-slate-600">No destinations match this search.</p>}
        </section>

        {recommendations.length > 0 && <section className="rounded-2xl bg-blue-50 border border-blue-100 p-5"><h2 className="font-bold text-slate-900">Recommended for your next route</h2><div className="flex gap-3 overflow-x-auto mt-3">{recommendations.slice(0, 6).map((destination) => <button key={destination._id} type="button" onClick={() => addDestination(destination)} className="shrink-0 rounded-xl bg-white border border-blue-100 px-4 py-3 text-left hover:border-blue-400"><span className="block font-bold text-slate-900">{destination.title}</span><span className="text-sm text-slate-600">{destination.city}, {destination.state} · add stop</span></button>)}</div></section>}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Route className="w-5 h-5 text-blue-700" />Route itinerary</h2><p className="text-sm text-slate-600 mt-1">Reorder stops and enter stay timing and activities for each destination.</p></div><button type="button" onClick={() => document.getElementById('journey-destination-search')?.focus()} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-200"><Plus className="w-4 h-4" />Add next destination</button></div>
          {draft.waypoints.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center"><MapPin className="w-8 h-8 mx-auto text-blue-600" /><p className="font-bold text-slate-900 mt-2">Your route is empty</p><p className="text-sm text-slate-600 mt-1">Search above and add your first destination.</p></div> : <ol className="space-y-4 mt-5">{draft.waypoints.map((stop, index) => { const destination = getDestination(stop); const risk = stopRisk(destination); return <li key={stop._id || `${destinationIdOf(stop)}-${index}`} className="rounded-xl border border-slate-200 p-4 sm:p-5"><div className="flex items-start gap-3"><span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center shrink-0">{index + 1}</span><div className="flex-1 min-w-0"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold text-slate-900">{destination?.title || stop.name}</h3><p className="text-sm text-slate-600">{destination?.city}, {destination?.state}</p></div><div className="flex gap-1"><button type="button" disabled={index === 0} onClick={() => moveStop(index, -1)} aria-label="Move destination earlier" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ArrowUp className="w-4 h-4" /></button><button type="button" disabled={index === draft.waypoints.length - 1} onClick={() => moveStop(index, 1)} aria-label="Move destination later" className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40"><ArrowDown className="w-4 h-4" /></button><button type="button" onClick={() => removeStop(index)} aria-label="Remove destination" className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mt-4"><label className="text-sm font-semibold text-slate-700">Arrival<input type="datetime-local" value={stop.arrivalTime || ''} onChange={(event) => updateStop(index, { arrivalTime: event.target.value })} className="glass-input mt-1 w-full text-sm" /></label><label className="text-sm font-semibold text-slate-700">Departure<input type="datetime-local" value={stop.departureTime || ''} onChange={(event) => updateStop(index, { departureTime: event.target.value })} className="glass-input mt-1 w-full text-sm" /></label><label className="text-sm font-semibold text-slate-700">Stay duration (days)<input type="number" min="0" max="60" value={stop.stayDurationDays ?? 1} onChange={(event) => updateStop(index, { stayDurationDays: Number(event.target.value) })} className="glass-input mt-1 w-full text-sm" /></label><div className="rounded-lg bg-slate-50 p-3"><span className="text-xs font-bold uppercase text-slate-500">Crowd estimate</span><p className="font-bold capitalize text-slate-900 mt-1">{destination?.crowdStatus || 'Not recorded'} · {destination?.crowdPercentage ?? '—'}%</p></div><label className="text-sm font-semibold text-slate-700">Stop status<select value={stop.status || 'pending'} onChange={(event) => updateStop(index, { status: event.target.value })} className="glass-input mt-1 w-full text-sm"><option value="pending">Upcoming</option><option value="visited">Visited</option><option value="skipped">Skipped</option></select></label></div>
            <label className="block text-sm font-semibold text-slate-700 mt-3">Activities / attractions (comma separated)<input value={(stop.activities || []).join(', ')} onChange={(event) => updateStop(index, { activities: event.target.value.split(',').map((activity) => activity.trim()).filter(Boolean) })} placeholder={destination?.tags?.slice(0, 3).join(', ') || 'Add planned activities'} className="glass-input mt-1 w-full text-sm" /></label>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${risk.level === 'High' ? 'bg-red-100 text-red-800' : risk.level === 'Moderate' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'}`}><ShieldAlert className="w-4 h-4" />{risk.level} planning risk</span><span className="text-slate-600">{risk.reason}</span><span className="inline-flex items-center gap-1 text-slate-500"><Clock3 className="w-4 h-4" />Travel time not available</span></div>
            <p className="text-xs text-slate-500 mt-2">Weather and road conditions are not connected. Mountain/high-altitude trips require current local advisories before departure.</p>
          </div></div></li>; })}</ol>}
          <p className="text-xs text-slate-500 mt-4">Crowd values are YatraLok catalog estimates, not verified counts. Risk notes are general planning guidance, not live alerts.</p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => { onSelectTrip(''); setDraft(emptyDraft(startingLocation)); setSavedTrip(null); }} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50">Clear planner</button><button type="submit" disabled={saving || draft.waypoints.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 px-6 py-3.5 text-base font-bold text-white shadow-sm">{saving ? 'Saving itinerary…' : <><Check className="w-5 h-5" />Finish Journey & Save</>}</button></div>
      </form>

      {savedTrip && <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 sm:p-7"><div className="flex items-start gap-3"><Check className="w-6 h-6 text-emerald-700 shrink-0" /><div><h2 className="text-xl font-bold text-slate-900">Itinerary saved: {savedTrip.title}</h2><p className="text-sm text-slate-700 mt-1">{savedTrip.waypoints?.length || 0} destinations · {savedTrip.travelerCount || 1} travelers · {savedTrip.status}</p><ol className="mt-4 space-y-3">{(savedTrip.waypoints || []).map((stop, index) => <li key={stop._id || index} className="flex items-start gap-3"><span className="w-7 h-7 rounded-full bg-white text-blue-800 font-bold flex items-center justify-center">{index + 1}</span><div><p className="font-bold text-slate-900">{stop.name}</p><p className="text-sm text-slate-600">{stop.stayDurationDays || 0} planned days · {(stop.activities || []).join(', ') || 'Activities not set'}</p></div></li>)}</ol><p className="text-sm text-slate-600 mt-4">Email action sends the saved itinerary to {userEmail || 'the email on your account'}. Travel-time estimates, current weather and road advisories are not connected to YatraLok yet.</p></div></div></section>}
    </div>
  );
};

export default JourneyPlanner;
