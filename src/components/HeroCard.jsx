import { STATUS, TC } from '../data/statusDefs';
import { HEROES } from '../data/config';
import { computeCompletionPct, weekXP } from '../utils/xpCalculator';
import { rankFromPct } from '../data/ranks';
import Bar from './Bar';
import './HeroCard.css';

export default function HeroCard({ m, expanded, onClick, onEdit }) {
  const tc = TC[m.team];
  const xp = weekXP(m);
  const pct = computeCompletionPct(m.statuses, m.goals);
  const rank = rankFromPct(pct);
  const tot = m.goals.filter(Boolean).length;
  const prevS = m.prevStatus ? STATUS[m.prevStatus] : null;

  return (
    <div className={`rounded-xl border-2 transition-all shadow-sm ${expanded ? `${tc.card} ${tc.ring}` : "bg-white border-slate-200"}`}>
      <button onClick={onClick} className="w-full text-left p-3">
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 border-2 ${tc.ring} flex items-center justify-center text-xl`}>
            {HEROES[m.hero % HEROES.length]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800 truncate">{m.name}</p>
              <span className="text-xs font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 flex-shrink-0">{pct}%</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${tc.badge}`}>{m.team}</span>
              <span className={`text-xs font-semibold ${rank.color}`}>{rank.name}</span>
              {m.statuses[0] === "galavanting" ? (
                <span className="text-xs font-bold text-fuchsia-500 bg-fuchsia-50 border border-fuchsia-200 rounded-full px-2 py-0.5">🌍 Galavanting</span>
              ) : (
                m.streak > 1 && <span className="text-xs text-slate-400">🔥{m.streak}wk</span>
              )}
              {prevS && <span className={`text-xs ${prevS.color}`}>prev: {prevS.emoji} {prevS.label}</span>}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Bar pct={pct} cls={tc.bar} h="h-1.5" />
              <span className="text-xs text-slate-400 flex-shrink-0">{pct}% · {tot} goals</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-sm font-black" style={{ color: tc.hex }}>+{xp}xp</p>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 border-t border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3 mb-1.5">This Week</p>
          {m.statuses[0] === "galavanting" ? (
            <div className="rounded-xl border-2 border-fuchsia-300 bg-gradient-to-r from-fuchsia-50 to-pink-50 px-4 py-3 text-center">
              <p className="text-2xl mb-1">🌍✈️🍹</p>
              <p className="text-sm font-black text-fuchsia-600">Out Here Galavanting</p>
              <select
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onEdit(m.id, 0, e.target.value)}
                value="galavanting"
                className="mt-2 text-xs font-bold border border-fuchsia-300 rounded px-2 py-1 bg-white cursor-pointer text-fuchsia-600"
              >
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.emoji} {v.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              {m.goals.map((g, i) => {
                if (!g) return null;
                const s = STATUS[m.statuses[i]] || STATUS.pending;
                return (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${s.bg} ${s.border}`}>
                    <span className="text-base">{s.emoji}</span>
                    <span className={`text-sm flex-1 font-medium ${s.color} text-left`}>{g}</span>
                    <select
                      value={m.statuses[i]}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onEdit(m.id, i, e.target.value)}
                      className={`text-xs font-bold border rounded px-1 py-0.5 bg-white cursor-pointer ${s.color}`}
                    >
                      {Object.entries(STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v.emoji} {v.label}</option>
                      ))}
                    </select>
                    <span className={`text-xs font-bold ${s.color} flex-shrink-0`}>+{s.xp}xp</span>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(m.id, "add"); }}
            className="mt-2 w-full text-xs text-slate-400 border border-dashed border-slate-300 rounded-lg py-1.5 hover:border-slate-400 hover:text-slate-500 transition-colors"
          >
            + Add goal
          </button>
          {prevS && (
            <div className={`mt-3 rounded-lg border px-3 py-2 ${prevS.bg} ${prevS.border}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Previous Week</p>
              <div className="flex items-center gap-2">
                <span className="text-base">{prevS.emoji}</span>
                <span className={`text-xs font-semibold ${prevS.color}`}>{prevS.label}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
