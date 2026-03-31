import { STATUS, TC } from '../data/statusDefs';
import { HEROES } from '../data/config';
import { computeCompletionPct } from '../utils/xpCalculator';
import './Leaderboard.css';

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ members }) {
  return (
    <div className="rounded-2xl bg-white/90 border border-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">Leaderboard — This Week</p>
      </div>
      {members.map((m, i) => {
        const tc = TC[m.team];
        const pct = computeCompletionPct(m.statuses, m.goals);
        const prevS = m.prevStatus ? STATUS[m.prevStatus] : null;
        return (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
            <span className="text-lg w-7 text-center flex-shrink-0">{MEDALS[i] ?? `#${i + 1}`}</span>
            <span className="text-xl flex-shrink-0">{HEROES[m.hero % HEROES.length]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{m.name}</p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-xs border rounded-full px-2 py-0.5 font-semibold ${tc.badge}`}>{m.team}</span>
                {prevS && <span className={`text-xs ${prevS.color}`}>prev: {prevS.emoji}</span>}
                {m.streak > 1 && <span className="text-xs text-slate-400">🔥{m.streak}wk</span>}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-black" style={{ color: tc.hex }}>{pct}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
