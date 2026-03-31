import { STATUS, TC } from '../data/statusDefs';
import { rankFromPct } from '../data/ranks';
import Bar from './Bar';

export default function TeamCard({ name, members, onClick, active }) {
  const tc = TC[name];
  const gl = members.reduce((s, m) => s + m.goals.filter(Boolean).length, 0);
  const earned = members.reduce(
    (s, m) => s + m.statuses.reduce((a, st, i) => (m.goals[i] ? a + (STATUS[st]?.xp ?? 0) : a), 0),
    0
  );
  const pct = gl ? Math.round((earned / (gl * 100)) * 100) : 0;

  return (
    <button
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition-all shadow-sm hover:shadow-md ${
        active ? `${tc.card} ${tc.ring}` : "bg-white border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{members.length} heroes</p>
        </div>
        <span className="text-base font-black" style={{ color: tc.hex }}>{pct}%</span>
      </div>
      <p className={`text-xs font-semibold mb-1.5 ${rankFromPct(pct).color}`}>{rankFromPct(pct).name}</p>
      <Bar pct={pct} cls={tc.bar} />
      <p className="text-xs text-slate-400 mt-1.5">{pct}% progress</p>
    </button>
  );
}
