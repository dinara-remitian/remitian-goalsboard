import { STATUS } from '../data/statusDefs';

export function computeCompletionPct(statuses, goals) {
  const active = goals.filter(Boolean);
  if (!active.length) return 0;
  const earned = statuses.reduce(
    (s, status, i) => (goals[i] ? s + (STATUS[status]?.xp ?? 0) : s),
    0
  );
  return Math.round((earned / (active.length * 100)) * 100);
}

export function weekXP(member) {
  return member.statuses.reduce((s, st) => s + (STATUS[st]?.xp ?? 0), 0);
}

export function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const fmt = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(mon)} – ${fmt(fri)}, ${fri.getFullYear()}`;
}
