export default function Bar({ pct, cls, h = "h-2", bg = "bg-blue-100" }) {
  return (
    <div className={`w-full ${h} rounded-full ${bg} overflow-hidden`}>
      <div
        className={`${h} rounded-full transition-all duration-700 ${cls}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
