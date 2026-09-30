import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const STORAGE_KEY = 'yatralok_admin_read_activity';

const AdminNotifications = () => {
  const [activities, setActivities] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    api.get('/admin/activity').then((response) => setActivities(response.data?.data || [])).catch(() => setActivities([]));
  }, []);

  const markRead = (activityId) => {
    const next = [...new Set([...readIds, activityId])];
    setReadIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const markAllRead = () => {
    const next = activities.map((activity) => activity.id);
    setReadIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return <div className="w-full px-4 sm:px-6 xl:px-10 py-8"><div className="flex flex-col lg:flex-row gap-8 items-start"><Sidebar role="admin" /><main className="flex-1 min-w-0 w-full space-y-6"><header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4"><div><p className="text-sm font-bold uppercase tracking-wide text-blue-700">Platform activity</p><h1 className="text-3xl font-extrabold text-slate-900 mt-1">Admin Notifications</h1><p className="text-sm text-slate-600 mt-1">Registration, SOS and review events from the existing activity stream.</p></div><button type="button" onClick={markAllRead} disabled={activities.every((activity) => readIds.includes(activity.id))} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"><CheckCheck className="w-4 h-4" />Mark all read</button></header>
    <div className="space-y-3">{activities.length ? activities.map((activity) => { const read = readIds.includes(activity.id); return <article key={activity.id} className={`rounded-2xl border p-5 ${read ? 'bg-white border-slate-200' : 'bg-blue-50 border-blue-200'}`}><div className="flex justify-between items-start gap-4"><div><div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${activity.type === 'SOS_ALERT' ? 'bg-red-600' : activity.type === 'REGISTRATION' ? 'bg-emerald-600' : 'bg-blue-600'}`} /><h2 className="font-bold text-slate-900">{activity.title}</h2><span className="text-xs font-bold uppercase text-slate-500">{activity.type?.replace('_', ' ')}</span></div><p className="text-sm text-slate-700 mt-2">{activity.description}</p><p className="text-xs text-slate-500 mt-2">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Timestamp unavailable'}</p></div>{read ? <span className="text-xs font-semibold text-slate-500">Read</span> : <button type="button" onClick={() => markRead(activity.id)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-blue-700">Mark read</button>}</div></article>; }) : <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center"><Bell className="w-9 h-9 text-slate-400 mx-auto" /><p className="font-bold text-slate-900 mt-3">No platform activity</p><p className="text-sm text-slate-600 mt-1">The activity service did not return any recent records.</p></div>}</div>
  </main></div></div>;
};

export default AdminNotifications;