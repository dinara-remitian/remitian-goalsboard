import { STATUS } from '../data/statusDefs';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${s.color}`}>
      <span>{s.emoji}</span>
      <span>{s.label}</span>
    </span>
  );
}
