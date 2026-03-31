const VALID_STATUSES = [
  "complete", "almost_complete", "in_progress", "behind",
  "not_started", "galavanting", "pending",
];

const STATUS_MAP = {
  complete: "complete", crushed: "complete", done: "complete",
  almost_complete: "almost_complete", almost: "almost_complete",
  in_progress: "in_progress", progress: "in_progress", working: "in_progress",
  behind: "behind", hurdles: "behind", blocked: "behind",
  not_started: "not_started",
  galavanting: "galavanting", ooo: "galavanting", vacation: "galavanting",
};

const EMOJI_MAP = {
  "\u2705": "complete",
  "\uD83D\uDD25": "almost_complete",
  "\uD83D\uDE80": "in_progress",
  "\u26A0\uFE0F": "behind",
  "\u26A0": "behind",
  "\uD83C\uDF0D": "galavanting",
};

const SHORTCODE_MAP = {
  ":white_check_mark:": "complete",
  ":fire:": "almost_complete",
  ":rocket:": "in_progress",
  ":warning:": "behind",
  ":earth_americas:": "galavanting",
  ":earth_africa:": "galavanting",
};

export function parseGoalsBotMessages(rawText) {
  const pGoals = {}, pStatuses = {}, pOverall = {};

  const blocks = rawText.split(/(?=:clipboard:|:bar_chart:)/);
  for (const block of blocks) {
    const gm = block.match(
      /(?::clipboard:)\s*\*?Weekly Goals from\s*<?@?\w*\|?([^>*\n]+?)>?\*?\s*\n/
    );
    if (gm) {
      const name = gm[1].trim();
      const gl = [];
      const lm = block.matchAll(/^\s*(\d+)\.\s+(.+)$/gm);
      for (const l of lm) {
        const t = l[2].trim();
        let isSt = false;
        for (const e of Object.keys(EMOJI_MAP))
          if (t.indexOf(e) !== -1) { isSt = true; break; }
        for (const s of Object.keys(SHORTCODE_MAP))
          if (t.indexOf(s) !== -1) { isSt = true; break; }
        if (!isSt && t.length > 1 && !t.startsWith("Posted:") && !t.startsWith("_Posted"))
          gl.push(t);
      }
      if (gl.length > 0) {
        const k = name.toLowerCase();
        if (!pGoals[k]) pGoals[k] = { name, goals: gl };
      }
      continue;
    }

    const sm = block.match(
      /(?::bar_chart:)\s*\*?STATUS UPDATE from\s*<?@?\w*\|?([^>*\n]+?)>?\*?\s*\n/
    );
    if (sm) {
      const name = sm[1].trim();
      const gs = [];
      const lm = block.matchAll(/^\s*(\d+)\.\s+(.+)$/gm);
      for (const l of lm) {
        const t = l[2].trim();
        let found = null;
        for (const [e, s] of Object.entries(EMOJI_MAP))
          if (t.indexOf(e) !== -1) { found = s; break; }
        if (!found)
          for (const [sc, s] of Object.entries(SHORTCODE_MAP))
            if (t.indexOf(sc) !== -1) { found = s; break; }
        if (!found) {
          const lo = t.toLowerCase();
          if (lo.includes("complete") && !lo.includes("almost")) found = "complete";
          else if (lo.includes("almost")) found = "almost_complete";
          else if (lo.includes("progress")) found = "in_progress";
          else if (lo.includes("behind")) found = "behind";
          else if (lo.includes("galavanting")) found = "galavanting";
        }
        if (found) gs.push(found);
      }
      const om = block.match(/Overall:\s*(\w+)/i);
      const ov = om ? (STATUS_MAP[om[1].toLowerCase()] || "in_progress") : "in_progress";
      if (gs.length > 0) {
        const k = name.toLowerCase();
        if (!pStatuses[k]) pStatuses[k] = { name, statuses: gs, overall: ov };
      }
      continue;
    }

    const lines = block.split("\n");
    for (const line of lines) {
      let name = null, status = null;
      const am = line.match(/STATUS\s*\|\s*(.+?)\s*\|\s*(\w+)/i);
      if (am) {
        name = am[1].replace(/<@\w+\|([^>]+)>/g, "$1").trim();
        status = am[2].trim().toLowerCase();
      }
      if (!name) {
        const pm = line.match(/STATUS.*?<@\w+\|([^>]+)>\s*(?:→|->|—)\s*(\w+)/i);
        if (pm) { name = pm[1].trim(); status = pm[2].trim().toLowerCase(); }
      }
      if (!name || !status || status === "undefined" || name === "undefined") continue;
      const mapped = STATUS_MAP[status] || (VALID_STATUSES.includes(status) ? status : null);
      if (!mapped) continue;
      const k = name.toLowerCase();
      if (!pOverall[k]) pOverall[k] = { name, status: mapped };
    }
  }
  return { goals: pGoals, statuses: pStatuses, overall: pOverall };
}
