export const STATUS = {
  complete: { emoji: "✅", label: "Complete", xp: 100, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  almost_complete: { emoji: "🔥", label: "Almost There", xp: 75, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  in_progress: { emoji: "🚀", label: "In Progress", xp: 50, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  behind: { emoji: "⚠️", label: "Behind", xp: 25, color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  not_started: { emoji: "🌱", label: "Not Started", xp: 0, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
  pending: { emoji: "⏳", label: "Pending", xp: 0, color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  galavanting: { emoji: "🌍", label: "Galavanting", xp: 0, color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-200" },
};

export const TC = {
  Engineering: { hex: "#6366f1", badge: "bg-indigo-100 text-indigo-700 border-indigo-200", bar: "bg-indigo-500", card: "bg-indigo-50 border-indigo-300", ring: "border-indigo-400" },
  Sales: { hex: "#10b981", badge: "bg-emerald-100 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", card: "bg-emerald-50 border-emerald-300", ring: "border-emerald-400" },
  "Cust. Success": { hex: "#f59e0b", badge: "bg-amber-100 text-amber-700 border-amber-200", bar: "bg-amber-400", card: "bg-amber-50 border-amber-300", ring: "border-amber-400" },
  Marketing: { hex: "#ec4899", badge: "bg-pink-100 text-pink-700 border-pink-200", bar: "bg-pink-400", card: "bg-pink-50 border-pink-300", ring: "border-pink-400" },
  Operations: { hex: "#8b5cf6", badge: "bg-violet-100 text-violet-700 border-violet-200", bar: "bg-violet-500", card: "bg-violet-50 border-violet-300", ring: "border-violet-400" },
};

export const TEAMS = Object.keys(TC);
