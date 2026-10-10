import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Search, Trash2, MapPin, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHeatData } from '../../context/HeatDataContext';

export const HistoryPage: React.FC = () => {
  const { token } = useAuth();
  const { setActiveTab, setSelectedLocation } = useHeatData();
  const entries = useQuery(api.history.list, token ? { token } : 'skip') ?? [];
  const remove = useMutation(api.history.remove);
  const clearAll = useMutation(api.history.clearAll);
  const [filter, setFilter] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => entries.filter((entry) =>
    entry.displayName.toLowerCase().includes(filter.toLowerCase()) &&
    (category === 'All' || entry.riskCategory === category)), [category, entries, filter]);

  const viewLocation = (entry: typeof entries[number]) => {
    setSelectedLocation({ id: entry.locationId, displayName: entry.displayName, lat: entry.latitude, lng: entry.longitude, source: 'OpenStreetMap Nominatim' });
    setActiveTab('map');
  };

  if (!token) return null;
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-[#14213D]">Location History</h2><p className="text-xs text-slate-500 mt-1">Your saved locations and precaution progress.</p></div>
      {entries.length > 0 && <button onClick={() => { if (window.confirm('Clear all history and checklist progress?')) void clearAll({ token }); }} className="px-3 py-2 text-xs font-semibold text-red-700 border border-red-200 rounded-lg">Clear All History</button>}
    </div>
    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap gap-2"><div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" /><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search history" className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg" /></div><select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 text-sm border rounded-lg"><option>All</option><option>Lower</option><option>Moderate</option><option>Elevated</option><option>High</option></select></div>
    {filtered.length === 0 ? <div className="bg-white border border-dashed border-slate-300 rounded-xl p-10 text-center text-sm text-slate-500">No saved locations yet. Search for a location from the Heat Risk Map to create history.</div> :
      <div className="space-y-3">{filtered.map((entry) => { const completed = entry.completedTitles.length; const total = 4; const progress = Math.round((completed / total) * 1000) / 10; return <article key={entry._id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-600" /><h3 className="font-bold text-[#14213D]">{entry.displayName}</h3></div><p className="text-xs text-slate-500 mt-1">{entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)} · {new Date(entry.visitedAt).toLocaleString()} · {entry.radiusKm} km</p><p className="text-xs mt-2">{entry.riskScore != null ? `${entry.riskCategory} · ${entry.riskScore}/100` : 'Risk score unavailable'} {entry.isSimulated && <span className="text-amber-700 font-semibold">· SIMULATED</span>}</p></div>
        <div className="w-36"><div className="flex justify-between text-[11px] text-slate-500"><span><ClipboardCheck className="inline w-3 h-3" /> {completed}/{total}</span><span>{progress}%</span></div><div className="h-1.5 bg-slate-100 rounded mt-1"><div className="h-full bg-blue-600 rounded" style={{ width: `${progress}%` }} /></div></div>
        <div className="flex gap-2"><button onClick={() => viewLocation(entry)} className="px-3 py-2 text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg">View Location</button><button onClick={() => { setSelectedLocation({ id: entry.locationId, displayName: entry.displayName, lat: entry.latitude, lng: entry.longitude, source: 'OpenStreetMap Nominatim' }); setActiveTab('actions'); }} className="px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg">View Precautions</button><button onClick={() => { if (window.confirm('Delete this history entry and its checklist progress?')) void remove({ token, historyId: entry._id }); }} className="p-2 text-red-600 border border-red-200 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button></div>
      </article>; })}</div>}
  </section>;
};
