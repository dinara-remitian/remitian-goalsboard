export function matchMember(name, members) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  let f = members.find((m) => m.name.toLowerCase() === n);
  if (f) return f;
  f = members.find(
    (m) =>
      m.name.toLowerCase().includes(n) || n.includes(m.name.toLowerCase())
  );
  if (f) return f;
  const ft = n.split(/\s+/)[0];
  const fm = members.filter(
    (m) => m.name.toLowerCase().split(/\s+/)[0] === ft
  );
  if (fm.length === 1) return fm[0];
  const lt = n.split(/\s+/).pop();
  const lm = members.filter((m) => {
    const p = m.name.toLowerCase().split(/\s+/);
    return p.length > 1 && p[p.length - 1] === lt;
  });
  if (lm.length === 1) return lm[0];
  return null;
}
