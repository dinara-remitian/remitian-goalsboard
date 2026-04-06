import { SLACK_MAP } from '../data/config';

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

// Resolve Slack user reference to a display name
// Handles both <@USERID|name> and <@USERID> formats
function resolveSlackName(block) {
  // Try <@USERID|name> format first
  const withName = block.match(/from\s*<@(\w+)\|([^>]+)>/i);
  if (withName) return withName[2].trim();
  // Try <@USERID> format and look up in SLACK_MAP
  const idOnly = block.match(/from\s*<@(\w+)>/i);
  if (idOnly) return SLACK_MAP[idOnly[1]] || null;
  // Try plain name format (no Slack mention)
  const plain = block.match(/from\s+\*?([^*\n<>]+?)\*?\s*\n/i);
  if (plain) return plain[1].trim();
  return null;
}

export function parseGoalsBotMessages(rawText) {
  const validSt = ["complete","almost_complete","in_progress","behind","not_started","galavanting","pending"];
  const sMap = { complete:"complete", crushed:"complete", done:"complete", almost_complete:"almost_complete", almost:"almost_complete", in_progress:"in_progress", progress:"in_progress", working:"in_progress", behind:"behind", hurdles:"behind", blocked:"behind", not_started:"not_started", galavanting:"galavanting", ooo:"galavanting", vacation:"galavanting" };
  const emojiMap = { "\u2705":"complete", "\uD83D\uDD25":"almost_complete", "\uD83D\uDE80":"in_progress", "\u26A0\uFE0F":"behind", "\u26A0":"behind", "\uD83C\uDF0D":"galavanting" };
  const scMap = { ":white_check_mark:":"complete", ":fire:":"almost_complete", ":rocket:":"in_progress", ":warning:":"behind", ":earth_americas:":"galavanting", ":earth_africa:":"galavanting" };
  const pGoals = {}, pStatuses = {}, pOverall = {}, pNotes = {};
  const blocks = rawText.split(/(?=:clipboard:|:bar_chart:|:memo:)/);
  for (const block of blocks) {
    // Notes blocks
    if (block.startsWith(":memo:")) {
      const name = resolveSlackName(block);
      if (name) {
        const noteText = block.replace(/^:memo:.*?\n/, "").replace(/_Updated[\s\S]*/i,"").replace(/_Posted[\s\S]*/i,"").trim();
        if (noteText) { const k = name.toLowerCase(); if (!pNotes[k]) pNotes[k] = { name, notes: noteText }; }
      }
      continue;
    }
    // Goals blocks
    if (block.startsWith(":clipboard:")) {
      const name = resolveSlackName(block);
      if (name) {
        const gl = [];
        const lm = block.matchAll(/^\s*(\d+)\.\s+(.+)$/gm);
        for (const l of lm) {
          const t = l[2].trim();
          let isSt = false;
          for (const e of Object.keys(emojiMap)) if (t.indexOf(e) !== -1) { isSt = true; break; }
          for (const s of Object.keys(scMap)) if (t.indexOf(s) !== -1) { isSt = true; break; }
          if (!isSt && t.length > 1 && !t.startsWith("Posted:") && !t.startsWith("_Posted")) gl.push(t);
        }
        if (gl.length > 0) { const k = name.toLowerCase(); if (!pGoals[k]) pGoals[k] = { name, goals: gl }; }
      }
      continue;
    }
    // Status blocks
    if (block.startsWith(":bar_chart:")) {
      const name = resolveSlackName(block);
      if (name) {
        const gs = [];
        const lm = block.matchAll(/^\s*(\d+)\.\s+(.+)$/gm);
        for (const l of lm) {
          const t = l[2].trim();
          let found = null;
          for (const [e, s] of Object.entries(emojiMap)) if (t.indexOf(e) !== -1) { found = s; break; }
          if (!found) for (const [sc, s] of Object.entries(scMap)) if (t.indexOf(sc) !== -1) { found = s; break; }
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
        const ov = om ? (sMap[om[1].toLowerCase()] || "in_progress") : "in_progress";
        if (gs.length > 0) { const k = name.toLowerCase(); if (!pStatuses[k]) pStatuses[k] = { name, statuses: gs, overall: ov }; }
      }
      continue;
    }
    // Legacy overall status lines
    const lines = block.split("\n");
    for (const line of lines) {
      let name = null, status = null;
      const am = line.match(/STATUS\s*\|\s*(.+?)\s*\|\s*(\w+)/i);
      if (am) { name = am[1].replace(/<@\w+\|([^>]+)>/g, "$1").replace(/<@(\w+)>/g, (_, id) => SLACK_MAP[id] || id).trim(); status = am[2].trim().toLowerCase(); }
      if (!name) { const pm2 = line.match(/STATUS.*?<@(\w+)(?:\|([^>]+))?>\s*(?:→|->|—)\s*(\w+)/i); if (pm2) { name = (pm2[2] || SLACK_MAP[pm2[1]] || pm2[1]).trim(); status = pm2[3].trim().toLowerCase(); } }
      if (!name || !status || status === "undefined" || name === "undefined") continue;
      const mapped = sMap[status] || (validSt.includes(status) ? status : null);
      if (!mapped) continue;
      const k = name.toLowerCase();
      if (!pOverall[k]) pOverall[k] = { name, status: mapped };
    }
  }
  return { goals: pGoals, statuses: pStatuses, overall: pOverall, notes: pNotes };
}
