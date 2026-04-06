import { useState, useMemo, useEffect } from 'react';
import { STATUS, TC, TEAMS } from '../data/statusDefs';
import { HEROES, MONTHS, MONTH_WEEKS, XP_WEIGHT } from '../data/config';
import { HISTORY, computePM } from '../data/history';
import { rankFromPct } from '../data/ranks';
import { getWeekLabel } from '../utils/xpCalculator';
import Bar from './Bar';
import './MonthlyView.css';

// Merge static HISTORY with localStorage saved weeks
function getMergedHistory(savedWeeks) {
  const merged = {};
  // Start with static HISTORY
  for (const [name, entries] of Object.entries(HISTORY)) {
    merged[name] = [...entries];
  }
  // Overlay saved weeks from localStorage
  for (const [weekLabel, snapshots] of Object.entries(savedWeeks)) {
    for (const snap of snapshots) {
      if (!merged[snap.name]) merged[snap.name] = [];
      // Remove any existing entry for this week (static gets overridden)
      merged[snap.name] = merged[snap.name].filter(e => e.week !== weekLabel);
      merged[snap.name].push({
        week: weekLabel,
        goals: snap.goals,
        eow: snap.eow || "pending",
        notes: snap.notes || "",
        statuses: snap.statuses,
      });
    }
  }
  return merged;
}

function WeekRow({ entry }) {
  const [showNotes, setShowNotes] = useState(false);
  const s = STATUS[entry.eow] || STATUS.pending;
  return (
    <div className={`rounded-lg border px-3 py-2 ${s.bg} ${s.border}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-500">📅 {entry.week}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color}`}>{s.emoji} {s.label}</span>
      </div>
      <ul className="space-y-0.5">{entry.goals.map((g, i) => {
        const gs = entry.statuses?.[i] ? (STATUS[entry.statuses[i]] || STATUS.pending) : null;
        return <li key={i} className="text-xs text-slate-600">{gs ? `${gs.emoji} ` : "• "}{g}</li>;
      })}</ul>
      {entry.notes && (
        <div className="mt-1">
          <button onClick={() => setShowNotes(!showNotes)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">📝 {showNotes ? "Hide" : "Notes"}</button>
          {showNotes && <p className="text-xs text-slate-500 mt-1 whitespace-pre-line bg-white/60 rounded px-2 py-1">{entry.notes}</p>}
        </div>
      )}
    </div>
  );
}

// Week-level view: shows all people for a specific week
function WeekPeopleView({ weekLabel, allMembers, mergedHistory }) {
  const [expanded, setExpanded] = useState(null);
  const currentWeekLabel = getWeekLabel();
  const isCurrentWeek = weekLabel === currentWeekLabel;

  const entries = allMembers.map(m => {
    const hist = mergedHistory[m.name] || [];
    let entry = hist.find(e => e.week === weekLabel);
    // For the current/active week, fall back to live member data
    if (!entry && isCurrentWeek && m.goals.length > 0) {
      const allPending = m.statuses.every(s => s === "pending");
      const allComplete = m.statuses.every(s => s === "complete");
      const hasBehind = m.statuses.some(s => s === "behind");
      const hasComplete = m.statuses.some(s => s === "complete");
      const hasProgress = m.statuses.some(s => s === "in_progress");
      entry = {
        week: weekLabel,
        goals: m.goals,
        statuses: m.statuses,
        notes: m.notes || "",
        eow: allPending ? "pending" : allComplete ? "complete" : hasBehind ? "behind" : hasComplete ? "almost_complete" : hasProgress ? "in_progress" : "not_started",
      };
    }
    return { member: m, entry };
  }).filter(({ entry }) => entry && entry.goals.length > 0);

  if (entries.length === 0) {
    return <p className="text-sm text-slate-400 text-center py-4">No goals recorded for {weekLabel}.</p>;
  }

  return (
    <div className="space-y-1.5">
      {entries.map(({ member: m, entry }) => {
        const tc = TC[m.team];
        const s = STATUS[entry.eow] || STATUS.pending;
        const isOpen = expanded === m.id;
        return (
          <div key={m.id} className={`rounded-xl border-2 overflow-hidden transition-all ${isOpen ? `${tc.card} ${tc.ring}` : "bg-white border-slate-200"}`}>
            <button onClick={() => setExpanded(isOpen ? null : m.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-black/5 transition-colors">
              <span className="text-lg flex-shrink-0">{HEROES[m.hero % HEROES.length]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color}`}>{s.emoji} {s.label}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${tc.badge}`}>{m.team}</span>
                  <span className="text-xs text-slate-400">{entry.goals.length} goals</span>
                  <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>
            </button>
            {isOpen && (
              <div className="px-4 pb-3 border-t border-slate-200">
                <ul className="space-y-1 mt-2">
                  {entry.goals.map((g, i) => {
                    if (!g) return null;
                    const gs = entry.statuses?.[i] ? (STATUS[entry.statuses[i]] || STATUS.pending) : STATUS.pending;
                    return (
                      <li key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border ${gs.bg} ${gs.border}`}>
                        <span className="text-sm">{gs.emoji}</span>
                        <span className={`text-xs flex-1 font-medium ${gs.color}`}>{g}</span>
                        <span className={`text-xs font-bold ${gs.color}`}>{gs.label}</span>
                      </li>
                    );
                  })}
                </ul>
                {entry.notes && <p className="text-xs text-slate-500 mt-2 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line">📝 {entry.notes}</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function MonthlyView({ allMembers }) {
  const [view, setView] = useState("monthly");
  const [selMonth, setSelMonth] = useState("Mar 2026");
  const [openTeam, setOpenTeam] = useState(null);
  const [expandedHero, setExpandedHero] = useState(null);
  const [selWeek, setSelWeek] = useState(null);
  const [savedWeeks, setSavedWeeks] = useState({});

  // Load saved week history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('remitian-week-history');
      if (raw) setSavedWeeks(JSON.parse(raw));
    } catch {}
  }, []);

  const mergedHistory = useMemo(() => getMergedHistory(savedWeeks), [savedWeeks]);

  const pms = view === "monthly" ? [selMonth] : MONTHS;
  const mWeeks = pms.flatMap(m => MONTH_WEEKS[m] || []);
  const pl = view === "monthly" ? selMonth : view === "quarterly" ? "Q1 2026 (Jan–Mar)" : "2026 YTD";

  function ppd(name) {
    let t = 0, c = 0;
    pms.forEach(mo => {
      // Use merged history for computePM-like calculation
      const weeks = MONTH_WEEKS[mo] || [];
      const h = mergedHistory[name] || [];
      weeks.forEach(wk => {
        const entry = h.find(e => e.week === wk);
        if (entry) { const ng = entry.goals.length; t += ng; c += ng * (XP_WEIGHT[entry.eow] ?? 0); }
      });
    });
    return { t, c, pct: t ? Math.round(c / t * 100) : 0 };
  }

  const ov = useMemo(() => {
    let t = 0, c = 0;
    allMembers.forEach(m => { const d = ppd(m.name); t += d.t; c += d.c; });
    return { t, c, pct: t ? Math.round(c / t * 100) : 0 };
  }, [view, selMonth, allMembers, savedWeeks]);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["monthly","📅 Monthly"],["quarterly","📊 Q1 2026"],["annual","🗓 YTD"]].map(([id, l]) => (
          <button key={id} onClick={() => { setView(id); setSelWeek(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${view === id ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{l}</button>
        ))}
      </div>
      {view === "monthly" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {MONTHS.map(mo => <button key={mo} onClick={() => { setSelMonth(mo); setSelWeek(null); }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selMonth === mo ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{mo}</button>)}
        </div>
      )}

      {/* Week selector pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button onClick={() => setSelWeek(null)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${!selWeek ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>Teams</button>
        {mWeeks.map(wk => (
          <button key={wk} onClick={() => setSelWeek(selWeek === wk ? null : wk)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${selWeek === wk ? "bg-violet-600 border-violet-600 text-white" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{wk}</button>
        ))}
      </div>

      {/* Overall stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{selWeek ? `Week of ${selWeek}` : pl}</p>
            <p className="text-3xl font-black text-slate-800 mt-0.5">{ov.pct}<span className="text-lg text-slate-400">%</span></p>
            <p className={`text-sm font-bold mt-0.5 ${rankFromPct(ov.pct).color}`}>{rankFromPct(ov.pct).name}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p><span className="font-bold text-slate-700">{ov.pct}%</span> progress</p>
            <p><span className="font-bold text-slate-700">{ov.t}</span> goals</p>
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-blue-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-700" style={{ width: `${ov.pct}%` }} />
        </div>
      </div>

      {/* Week-level people view */}
      {selWeek && (
        <WeekPeopleView weekLabel={selWeek} allMembers={allMembers} mergedHistory={mergedHistory} />
      )}

      {/* Team drill-down view */}
      {!selWeek && (
        <div className="space-y-2">
          {TEAMS.map(team => {
            const tc = TC[team], tm = allMembers.filter(m => m.team === team);
            const td = tm.reduce((a, m) => { const d = ppd(m.name); a.t += d.t; a.c += d.c; return a; }, { t: 0, c: 0 });
            const tp = td.t ? Math.round(td.c / td.t * 100) : 0, tr = rankFromPct(tp), io = openTeam === team;
            return (
              <div key={team} className={`rounded-xl border-2 overflow-hidden transition-all ${io ? `${tc.card} ${tc.ring}` : "bg-white border-slate-200"}`}>
                <button onClick={() => setOpenTeam(io ? null : team)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">{team}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black" style={{ color: tc.hex }}>{tp}%</span>
                        <span className="text-slate-400 text-sm">{io ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-semibold ${tr.color}`}>{tr.name}</span>
                      <span className="text-xs text-slate-400">{tm.length} heroes · {tp}%</span>
                    </div>
                    <div className="mt-1.5"><Bar pct={tp} cls={tc.bar} h="h-1.5" /></div>
                  </div>
                </button>
                {io && (
                  <div className="border-t-2 border-white/60 divide-y divide-slate-100">
                    {[...tm].sort((a, b) => ppd(b.name).pct - ppd(a.name).pct).map(m => {
                      const pd = ppd(m.name), rk = rankFromPct(pd.pct), isOpen = expandedHero === m.id;
                      const hist = (mergedHistory[m.name] || []).filter(e => mWeeks.includes(e.week));
                      return (
                        <div key={m.id}>
                          <button onClick={() => setExpandedHero(isOpen ? null : m.id)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 text-left">
                            <span className="text-lg flex-shrink-0">{HEROES[m.hero % HEROES.length]}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                                <span className="text-sm font-black flex-shrink-0" style={{ color: tc.hex }}>{pd.pct}%</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-xs font-semibold ${rk.color}`}>{rk.name}</span>
                                <span className="text-xs text-slate-400">{pd.t} goals</span>
                                {m.streak > 1 && <span className="text-xs text-slate-400">🔥{m.streak}wk</span>}
                                <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
                              </div>
                              <div className="mt-1"><Bar pct={pd.pct} cls={tc.bar} h="h-1.5" /></div>
                            </div>
                          </button>
                          {isOpen && hist.length > 0 && (
                            <div className="px-4 pb-3 space-y-1.5">
                              {hist.map((e, i) => <WeekRow key={i} entry={e} />)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
