export function rankFromPct(pct) {
  if (pct >= 90) return { name: "Ultimate Villain 😈", color: "text-red-600" };
  if (pct >= 75) return { name: "Chaos Overlord 💀", color: "text-purple-600" };
  if (pct >= 60) return { name: "Dark Sorcerer 🧙", color: "text-indigo-600" };
  if (pct >= 45) return { name: "Dragon Slayer 🐉", color: "text-emerald-600" };
  if (pct >= 30) return { name: "Shadow Knight ⚔️", color: "text-cyan-600" };
  if (pct >= 15) return { name: "Goblin Smasher 👊", color: "text-amber-600" };
  if (pct > 0) return { name: "Village Scout 🗺️", color: "text-orange-500" };
  return { name: "Lost Peasant 🥔", color: "text-slate-400" };
}
