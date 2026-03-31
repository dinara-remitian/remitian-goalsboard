import { useState, useMemo } from 'react';
import { MONTHS, HEROES } from '../data/config';
import { TC, TEAMS } from '../data/statusDefs';
import { rankFromPct } from '../data/ranks';
import { computePM } from '../data/history';
import Bar from './Bar';
import './MonthlyView.css';

export default function MonthlyView({ allMembers }) {
  const [view, setView] = useState("monthly");
  const [selMonth, setSelMonth] = useState("Mar 2026");
  const [openTeam, setOpenTeam] = useState(null);

  const pms = view === "monthly" ? [selMonth] : MONTHS;
  const pl = view === "monthly" ? selMonth : view === "quarterly" ? "Q1 2026 (Jan–Mar)" : "2026 YTD";

  const ov = useMemo(() => {
    let t = 0, c = 0;
    allMembers.forEach((m) => {
      const d = computePM(m.name, pms);
      t += d.t;
      c += d.c;
    });
    return { t, c, pct: t ? Math.round((c / t) * 100) : 0 };
  }, [view, selMonth, allMembers]);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[["monthly", "📅 Monthly"], ["quarterly", "📊 Q1 2026"], ["annual", "🗓 YTD"]].map(([id, l]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              view === id ? "bg-indigo-600 border-indigo-600 text-white shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {view === "monthly" && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {MONTHS.map((mo) => (
            <button
              key={mo}
              onClick={() => setSelMonth(mo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selMonth === mo ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mo}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">{pl}</p>
            <p className="text-3xl font-black text-slate-800 mt-0.5">
              {ov.pct}<span className="text-lg text-slate-400">%</span>
            </p>
            <p className={`text-sm font-bold mt-0.5 ${rankFromPct(ov.pct).color}`}>{rankFromPct(ov.pct).name}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p><span className="font-bold text-slate-700">{ov.c}</span> complete</p>
            <p><span className="font-bold text-slate-700">{ov.t}</span> total</p>
          </div>
        </div>
        <div className="w-full h-3 rounded-full bg-blue-100 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-700" style={{ width: `${ov.pct}%` }} />
        </div>
      </div>

      <div className="space-y-2">
        {TEAMS.map((team) => {
          const tc = TC[team];
          const tm = allMembers.filter((m) => m.team === team);
          const td = tm.reduce((a, m) => {
            const d = computePM(m.name, pms);
            a.t += d.t;
            a.c += d.c;
            return a;
          }, { t: 0, c: 0 });
          const tp = td.t ? Math.round((td.c / td.t) * 100) : 0;
          const tr = rankFromPct(tp);
          const io = openTeam === team;

          return (
            <div key={team} className={`rounded-xl border-2 overflow-hidden transition-all ${io ? `${tc.card} ${tc.ring}` : "bg-white border-slate-200"}`}>
              <button
                onClick={() => setOpenTeam(io ? null : team)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-black/5 transition-colors"
              >
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
                    <span className="text-xs text-slate-400">{tm.length} heroes · {td.c}/{td.t} goals</span>
                  </div>
                  <div className="mt-1.5"><Bar pct={tp} cls={tc.bar} h="h-1.5" /></div>
                </div>
              </button>
              {io && (
                <div className="border-t-2 border-white/60 divide-y divide-slate-100">
                  {tm
                    .sort((a, b) => computePM(b.name, pms).pct - computePM(a.name, pms).pct)
                    .map((m) => {
                      const pd = computePM(m.name, pms);
                      const rk = rankFromPct(pd.pct);
                      return (
                        <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                          <span className="text-lg flex-shrink-0">{HEROES[m.hero % HEROES.length]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800 truncate">{m.name}</p>
                              <span className="text-sm font-black flex-shrink-0" style={{ color: tc.hex }}>{pd.pct}%</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`text-xs font-semibold ${rk.color}`}>{rk.name}</span>
                              <span className="text-xs text-slate-400">{pd.c}/{pd.t} goals</span>
                              {m.streak > 1 && <span className="text-xs text-slate-400">🔥{m.streak}wk</span>}
                            </div>
                            <div className="mt-1"><Bar pct={pd.pct} cls={tc.bar} h="h-1.5" /></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
