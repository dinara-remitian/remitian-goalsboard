import { MONTHS } from './config';

// PM tracks total goals (t) and completed goals (c) per month
// March 2026 data: 5 weeks (Mar 2, 9, 16, 23, 30)
// t = total goals set across all weeks, c = goals from weeks with "Completed" status
export const PM = {
  // Aaron: W1(3,AC) W2(3,AC) W3(3,C) W4(3,B) W5(3,-)  → t=15, c=3
  "Aaron Gould": { "Jan 2026": { t: 12, c: 9 }, "Feb 2026": { t: 14, c: 11 }, "Mar 2026": { t: 15, c: 3 } },
  // Adam: W1(2,C) W2(5,C) W3(4,C) W4(2,AC) W5(3,-)  → t=16, c=11
  "Adam Cooper": { "Jan 2026": { t: 12, c: 10 }, "Feb 2026": { t: 12, c: 7 }, "Mar 2026": { t: 16, c: 11 } },
  // Andre: W1(2,C) W2(2,AC) W3(2,AC) W4(4,C) W5(2,-)  → t=12, c=6
  "André Andreotti": { "Jan 2026": { t: 9, c: 8 }, "Feb 2026": { t: 11, c: 8 }, "Mar 2026": { t: 12, c: 6 } },
  // Ben: W1(2,B) W2(3,AC) W3(4,B) W4(3,-) W5(0,-)  → t=12, c=0
  "Ben Greenberg": { "Jan 2026": { t: 12, c: 9 }, "Feb 2026": { t: 13, c: 10 }, "Mar 2026": { t: 12, c: 0 } },
  // Brittany: W1(1,S) W2(3,AC) W3(3,AC) W4(5,C) W5(2,-)  → t=14, c=5
  "Brittany Villani": { "Jan 2026": { t: 0, c: 0 }, "Feb 2026": { t: 0, c: 0 }, "Mar 2026": { t: 14, c: 5 } },
  // Celine: W1(0,OOO) W2(2,AC) W3(1,AC) W4(4,AC) W5(1,-)  → t=8, c=0
  "Celina Mziray": { "Jan 2026": { t: 8, c: 6 }, "Feb 2026": { t: 7, c: 6 }, "Mar 2026": { t: 8, c: 0 } },
  // Claudio: W1(3,C) W2(2,AC) W3(2,B) W4(2,C) W5(2,-)  → t=11, c=5
  "Claudio Torres": { "Jan 2026": { t: 0, c: 0 }, "Feb 2026": { t: 13, c: 9 }, "Mar 2026": { t: 11, c: 5 } },
  // Dinara: W1(2,C) W2(2,AC) W3(2,C) W4(4,C) W5(4,-)  → t=14, c=8
  "Dinara Abdualiyeva": { "Jan 2026": { t: 9, c: 7 }, "Feb 2026": { t: 5, c: 4 }, "Mar 2026": { t: 14, c: 8 } },
  // Felipe: W1(3,B) W2(3,C) W3(3,AC) W4(4,C) W5(4,-)  → t=17, c=7
  "Felipe Gallez": { "Jan 2026": { t: 6, c: 4 }, "Feb 2026": { t: 9, c: 9 }, "Mar 2026": { t: 17, c: 7 } },
  // Georgia: W1(3,AC) W2(3,AC) W3(3,B) W4(3,AC) W5(5,-)  → t=17, c=0
  "Georgia Turner": { "Jan 2026": { t: 9, c: 6 }, "Feb 2026": { t: 12, c: 6 }, "Mar 2026": { t: 17, c: 0 } },
  // Inna: W1(2,AC) W2(2,B) W3(1,S) W4(3,AC) W5(2,-)  → t=10, c=0
  "Inna Fomina": { "Jan 2026": { t: 0, c: 0 }, "Feb 2026": { t: 14, c: 7 }, "Mar 2026": { t: 10, c: 0 } },
  // Jacobs: W1(1,AC) W2(2,B) W3(3,B) W4(1,C) W5(2,-)  → t=9, c=1
  "Marcos Jacobs": { "Jan 2026": { t: 9, c: 6 }, "Feb 2026": { t: 8, c: 4 }, "Mar 2026": { t: 9, c: 1 } },
  // Jamilson: W1(2,AC) W2(2,AC) W3(3,C) W4(1,C) W5(1,-)  → t=9, c=4
  "Jamilson Santos": { "Jan 2026": { t: 9, c: 8 }, "Feb 2026": { t: 8, c: 7 }, "Mar 2026": { t: 9, c: 4 } },
  // Justin: W1(2,-) W2(2,-) W3(0,OOO) W4(0,-) W5(0,-)  → t=4, c=0
  "Justin Bell": { "Jan 2026": { t: 9, c: 5 }, "Feb 2026": { t: 16, c: 4 }, "Mar 2026": { t: 4, c: 0 } },
  // Leighanne: W1(3,B) W2(4,AC) W3(4,AC) W4(4,B) W5(4,-)  → t=19, c=0
  "Leighanne Murray": { "Jan 2026": { t: 12, c: 9 }, "Feb 2026": { t: 9, c: 7 }, "Mar 2026": { t: 19, c: 0 } },
  // Lucas: W1(2,AC) W2(1,B) W3(1,AC) W4(1,C) W5(3,-)  → t=8, c=1
  "Lucas Amorim": { "Jan 2026": { t: 9, c: 7 }, "Feb 2026": { t: 7, c: 5 }, "Mar 2026": { t: 8, c: 1 } },
  // Mike: W1(3,S) W2(3,AC) W3(3,AC) W4(4,AC) W5(4,S)  → t=17, c=0
  "Mykhailo Lishchuk": { "Jan 2026": { t: 12, c: 7 }, "Feb 2026": { t: 15, c: 8 }, "Mar 2026": { t: 17, c: 0 } },
  // Mo: new hire, minimal data → t=0, c=0
  "Mo Abdirahman": { "Jan 2026": { t: 0, c: 0 }, "Feb 2026": { t: 0, c: 0 }, "Mar 2026": { t: 0, c: 0 } },
  // Nick: W1(3,B) W2(3,AC) W3(3,AC) W4(3,AC) W5(3,S)  → t=15, c=0
  "Nick Lawrence": { "Jan 2026": { t: 12, c: 11 }, "Feb 2026": { t: 12, c: 12 }, "Mar 2026": { t: 15, c: 0 } },
  // Noah: W1(3,B) W2(3,AC) W3(1,C) W4(3,AC) W5(3,-)  → t=13, c=1
  "Noah Gould": { "Jan 2026": { t: 9, c: 6 }, "Feb 2026": { t: 9, c: 7 }, "Mar 2026": { t: 13, c: 1 } },
  // Nnamdi: W1(3,AC) W2(3,C) W3(3,C) W4(4,C) W5(4,-)  → t=17, c=10
  "Nnamdi Nwafor": { "Jan 2026": { t: 9, c: 7 }, "Feb 2026": { t: 9, c: 8 }, "Mar 2026": { t: 17, c: 10 } },
  // PO: W1(4,AC) W2(3,C) W3(4,C) W4(3,AC) W5(4,-)  → t=18, c=7
  "PO Charlebois": { "Jan 2026": { t: 12, c: 10 }, "Feb 2026": { t: 14, c: 12 }, "Mar 2026": { t: 18, c: 7 } },
  // Scott: W1(6,AC) W2(4,AC) W3(6,AC) W4(4,AC) W5(7,S)  → t=27, c=0
  "Scott Rockefeller": { "Jan 2026": { t: 4, c: 2 }, "Feb 2026": { t: 8, c: 6 }, "Mar 2026": { t: 27, c: 0 } },
  // Solon: W1(1,vac) W2(4,-) W3(1,C) W4(5,C) W5(4,-)  → t=15, c=6
  "Solon Angel": { "Jan 2026": { t: 12, c: 9 }, "Feb 2026": { t: 14, c: 8 }, "Mar 2026": { t: 15, c: 6 } },
  // Stefan: W1(3,AC) W2(2,AC) W3(2,-) W4(2,-) W5(4,-)  → t=13, c=0
  "Stefan Celeski": { "Jan 2026": { t: 9, c: 6 }, "Feb 2026": { t: 9, c: 5 }, "Mar 2026": { t: 13, c: 0 } },
  // Larry: always 1 goal "Be amazing", always complete per week → t=5, c=5
  "Larry Garfinkle": { "Jan 2026": { t: 3, c: 3 }, "Feb 2026": { t: 3, c: 3 }, "Mar 2026": { t: 5, c: 5 } },
};

export function computePM(name, months) {
  let t = 0, c = 0;
  months.forEach(mo => {
    const d = PM[name]?.[mo];
    if (d) { t += d.t; c += d.c; }
  });
  return { t, c, pct: t ? Math.round(c / t * 100) : 0 };
}
