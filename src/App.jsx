import { useState, useEffect } from 'react';
import { INIT } from './data/team';
import { DATA_VERSION, MONTH_WEEKS } from './data/config';
import { STATUS, TC, TEAMS } from './data/statusDefs';
import { rankFromPct } from './data/ranks';
import { computeCompletionPct, getCurrentWeekRange, getWeekLabel } from './utils/xpCalculator';
import { matchMember } from './utils/statusHelpers';
import { parseGoalsBotMessages } from './utils/syncParser';
import { computePM } from './data/history';
import dataService from './services/dataService';
import storageService from './services/storageService';

import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import HeroCard from './components/HeroCard';
import TeamCard from './components/TeamCard';
import Leaderboard from './components/Leaderboard';
import MonthlyView from './components/MonthlyView';
import { ConfigPanel, SyncLogModal, AddHeroModal } from './components/SyncPanel';
import Bar from './components/Bar';

import './App.css';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState("heroes");
  const [teamFilter, setTeamFilter] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [members, setMembers] = useState(INIT);
  const [channelId, setChannelId] = useState("C0AL1NFB6MA");
  const [showConfig, setShowConfig] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [ready, setReady] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [step, setStep] = useState("");
  const [addName, setAddName] = useState("");
  const [addTeam, setAddTeam] = useState("Engineering");
  const [addGoals, setAddGoals] = useState(["", "", ""]);

  // Load saved data on mount, then auto-sync from sync.json
  // Load saved data on mount (no auto-sync — sync is manual via the Sync button)
  useEffect(() => {
    (async () => {
      const saved = await dataService.loadSavedTeamData();
      if (saved) setMembers(saved);
      setReady(true);
    })();
  }, []);

  // Auto-save on changes
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(async () => {
      await dataService.saveTeamData(members);
      setSavedAt(new Date().toLocaleTimeString());
    }, 800);
    return () => clearTimeout(t);
  }, [members, ready]);

  async function resetStorage() {
    if (!confirm("Reset GoalsBoard to initial data? This clears all synced changes.")) return;
    await dataService.resetData();
    setMembers(INIT);
    setSavedAt(null);
    setStatusMsg("🗑️ Board reset to initial data.");
  }

  async function closeWeek() {
    const weekLbl = getWeekLabel();
    if (!confirm(`Close week "${weekLbl}" and save to history? This will reset all statuses to pending for the new week.`)) return;
    // Load existing saved history
    const raw = await storageService.get('remitian-week-history');
    const hist = raw?.value ? JSON.parse(raw.value) : {};
    // Snapshot each member's current goals/statuses/notes into history
    const snapshot = members.map((m) => ({
      name: m.name,
      goals: [...m.goals],
      statuses: [...m.statuses],
      notes: m.notes || "",
      eow: m.statuses.every((s) => s === "pending") ? "pending"
        : m.statuses.every((s) => s === "complete") ? "complete"
        : m.statuses.some((s) => s === "behind") ? "behind"
        : m.statuses.some((s) => s === "complete") ? "almost_complete"
        : m.statuses.some((s) => s === "in_progress") ? "in_progress"
        : "not_started",
    }));
    hist[weekLbl] = snapshot;
    await storageService.set('remitian-week-history', JSON.stringify(hist));
    // Reset statuses to pending, update prevStatus, clear notes
    setMembers((prev) =>
      prev.map((m) => {
        const snap = snapshot.find((s) => s.name === m.name);
        return {
          ...m,
          prevStatus: snap?.eow || m.prevStatus,
          statuses: m.goals.map(() => "pending"),
          notes: "",
        };
      })
    );
    setStatusMsg(`✅ Week "${weekLbl}" saved to history. Ready for new week!`);
    setTimeout(() => setStatusMsg(""), 5000);
  }

  const wk = getCurrentWeekRange();
  const fil = members
    .filter((m) => !teamFilter || m.team === teamFilter)
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = tab === "leaderboard"
    ? [...fil].sort((a, b) => computeCompletionPct(b.statuses, b.goals) - computeCompletionPct(a.statuses, a.goals))
    : fil;
  const tGoals = members.reduce((s, m) => s + m.goals.filter(Boolean).length, 0);
  const tEarned = members.reduce(
    (s, m) => s + m.statuses.reduce((a, st, i) => (m.goals[i] ? a + (STATUS[st]?.xp ?? 0) : a), 0),
    0
  );
  const tPow = tGoals ? Math.round((tEarned / (tGoals * 100)) * 100) : 0;
  const mvp = [...members].sort((a, b) => {
    const pa = computePM(a.name, MONTH_WEEKS["Mar 2026"] || []);
    const pb = computePM(b.name, MONTH_WEEKS["Mar 2026"] || []);
    return pb.pct - pa.pct;
  })[0];

  function handleEdit(id, gi, ns) {
    if (gi === "add") {
      setMembers((p) =>
        p.map((m) => {
          if (m.id !== id) return m;
          const t = prompt("Enter new goal:");
          if (!t) return m;
          return { ...m, goals: [...m.goals, t], statuses: [...m.statuses, "not_started"] };
        })
      );
    } else {
      setMembers((p) =>
        p.map((m) => {
          if (m.id !== id) return m;
          const s = [...m.statuses];
          s[gi] = ns;
          return { ...m, statuses: s };
        })
      );
    }
  }

  function doAdd() {
    if (!addName.trim()) return;
    const nid = Math.max(...members.map((m) => m.id)) + 1;
    setMembers((p) => [
      ...p,
      {
        id: nid, hero: nid, streak: 0, name: addName.trim(), team: addTeam,
        goals: addGoals.map((g) => g.trim()),
        statuses: addGoals.map((g) => (g.trim() ? "not_started" : "pending")),
        notes: "",
      },
    ]);
    setShowAdd(false);
    setAddName("");
    setAddGoals(["", "", ""]);
  }

  function applySync(rawText) {
    const log = (msg, type = "info") => {
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLogs((p) => [...p, { time: t, msg, type }]);
    };
    log(`Raw text: ${rawText.length} chars`);
    const parsed = parseGoalsBotMessages(rawText);
    const { goals: goalsData, statuses: statusData, overall: overallData, notes: notesData } = parsed;
    const gc = Object.keys(goalsData).length;
    const sc = Object.keys(statusData).length;
    const oc = Object.keys(overallData).length;
    log(`Parsed: ${gc} goal sets, ${sc} per-goal statuses, ${oc} overall statuses`, "success");
    if (gc === 0 && sc === 0 && oc === 0) {
      log("No valid updates parsed.", "warn");
      setStatusMsg("ℹ️ No valid updates found. Check 📋 log.");
      return;
    }
    Object.values(goalsData).forEach((g) => log(`  📋 ${g.name}: ${g.goals.length} goals`, "info"));
    Object.values(statusData).forEach((s) => log(`  📊 ${s.name}: ${s.statuses.join(", ")}`, "success"));
    Object.values(overallData).forEach((o) => log(`  🔄 ${o.name} → ${o.status} (legacy)`, "info"));

    let updateCount = 0;
    const unmatchedNames = [];
    setMembers((prev) =>
      prev.map((m) => {
        let updated = { ...m };
        let matched = false;
        // Goals come from team.js — sync only updates statuses and notes
        // This prevents the parser from cross-contaminating goals between people
        const gMatch = Object.values(goalsData).find((g) => matchMember(g.name, [m]) !== null);
        if (gMatch) {
          matched = true;
          log(`📋 "${gMatch.name}" → ${m.name}: goals preserved from team.js (sync skips goal overwrite)`, "info");
        }
        const sMatch = Object.values(statusData).find((s) => matchMember(s.name, [m]) !== null);
        if (sMatch) {
          const ns = [...updated.statuses];
          for (let i = 0; i < sMatch.statuses.length && i < ns.length; i++) {
            if (updated.goals[i]) ns[i] = sMatch.statuses[i];
          }
          updated = { ...updated, statuses: ns };
          matched = true;
          updateCount++;
          log(`📊 "${sMatch.name}" → ${m.name}: per-goal statuses applied`, "success");
        }
        if (!sMatch) {
          const oMatch = Object.values(overallData).find((o) => matchMember(o.name, [m]) !== null);
          if (oMatch) {
            const ns = updated.goals.map((g) => (g ? oMatch.status : "pending"));
            updated = { ...updated, statuses: ns };
            matched = true;
            updateCount++;
            log(`🔄 "${oMatch.name}" → ${m.name} = ${oMatch.status} (legacy)`, "success");
          }
        }
        const nMatch = Object.values(notesData || {}).find((n) => matchMember(n.name, [m]) !== null);
        if (nMatch) {
          updated = { ...updated, notes: nMatch.notes };
          matched = true;
          log(`📝 "${nMatch.name}" → ${m.name}: notes applied`, "success");
        }
        return matched ? updated : m;
      })
    );
    const allNames = [
      ...Object.values(goalsData).map((g) => g.name),
      ...Object.values(statusData).map((s) => s.name),
      ...Object.values(overallData).map((o) => o.name),
    ];
    [...new Set(allNames)].forEach((name) => {
      if (!matchMember(name, members)) {
        unmatchedNames.push(name);
        log(`⚠️ No match for "${name}"`, "warn");
      }
    });
    setLastSync(new Date().toLocaleTimeString());
    if (updateCount > 0 || gc > 0) {
      const note = unmatchedNames.length ? ` (${unmatchedNames.length} unmatched)` : "";
      const parts = [];
      if (gc > 0) parts.push(`${gc} goal sets`);
      if (updateCount > 0) parts.push(`${updateCount} statuses`);
      setStatusMsg(`✅ Synced ${parts.join(" + ")}!${note}`);
      log(`Done: ${parts.join(", ")}, ${unmatchedNames.length} unmatched`, "success");
    } else {
      setStatusMsg("ℹ️ Found messages but no hero matches.");
      log("No matches.", "warn");
    }
  }

  async function syncFromSlack() {
    setLoading(true);
    setLogs([]);
    setStep("Fetching sync data...");
    setStatusMsg("🔍 Checking for sync updates...");
    try {
      // Fetch sync.json directly from GitHub raw (instant, no deploy wait)
      const syncUrl = `https://raw.githubusercontent.com/dinara-remitian/remitian-goalsboard/main/public/sync.json?t=${Date.now()}`;
      const res = await fetch(syncUrl);
      if (res.ok) {
        const data = await res.json();
        if (data.raw) {
          setStep("Applying sync data...");
          applySync(data.raw);
        } else if (data.members) {
          // Direct member data format from n8n
          setMembers((prev) =>
            prev.map((m) => {
              const updated = data.members.find((u) => u.name === m.name || u.id === m.id);
              return updated ? { ...m, ...updated } : m;
            })
          );
          setLastSync(new Date().toLocaleTimeString());
          setStatusMsg(`✅ Synced ${data.members.length} heroes from sync.json`);
        }
      } else {
        setStatusMsg("ℹ️ No sync.json found. Use paste sync (⚙️) or ask Claude Code to sync.");
        setLogs((p) => [...p, {
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          msg: "No sync.json found. To sync: paste Slack messages in Settings, or run 'sync from slack' in Claude Code.",
          type: "info",
        }]);
      }
    } catch (e) {
      console.error(e);
      setStatusMsg(`⚠️ Sync failed — ${e.message}`);
      setLogs((p) => [...p, {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        msg: `Error: ${e.message}`,
        type: "error",
      }]);
    }
    setLoading(false);
    setStep("");
    setTimeout(() => setStatusMsg(""), 8000);
  }

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-container">
      <div className="max-w-2xl mx-auto">
        <Header
          weekRange={wk}
          lastSync={lastSync}
          savedAt={savedAt}
          loading={loading}
          logsCount={logs.length}
          onToggleConfig={() => setShowConfig(!showConfig)}
          onToggleLog={() => setShowLog(true)}
          onSync={syncFromSlack}
        />

        {loading && step && (
          <div className="mb-3 flex items-center gap-2 text-sm bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-indigo-700 font-medium">{step}</span>
          </div>
        )}

        {showConfig && (
          <ConfigPanel
            channelId={channelId}
            setChannelId={setChannelId}
            onClose={() => setShowConfig(false)}
            onSync={syncFromSlack}
            onPasteSync={(text) => { setLogs([]); applySync(text); }}
            onReset={resetStorage}
            onCloseWeek={closeWeek}
          />
        )}

        {statusMsg && (
          <div className="mb-3 text-sm text-center text-slate-700 bg-white/90 rounded-lg px-3 py-2 border border-slate-200 shadow-sm">
            {statusMsg}
          </div>
        )}

        {/* Team Power summary */}
        <div className="rounded-2xl bg-white/90 border border-white shadow-sm p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Team Power — This Week</p>
              <p className="text-4xl font-black text-slate-800">{tPow}<span className="text-xl text-slate-400">%</span></p>
              <p className={`text-sm font-bold mt-0.5 ${rankFromPct(tPow).color}`}>{rankFromPct(tPow).name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-0.5">March MVP</p>
              <p className="text-base font-bold text-amber-500">🏆 {mvp?.name.split(" ")[0]}</p>
            </div>
          </div>
          <div className="w-full h-3 rounded-full bg-blue-100 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-1000" style={{ width: `${tPow}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{tPow}% progress · {members.length} heroes</span>
            <span>{tGoals} goals</span>
          </div>
        </div>

        {/* Team cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {TEAMS.map((t) => (
            <TeamCard
              key={t}
              name={t}
              members={members.filter((m) => m.team === t)}
              active={teamFilter === t}
              onClick={() => setTeamFilter(teamFilter === t ? null : t)}
            />
          ))}
          {teamFilter && (
            <button
              onClick={() => setTeamFilter(null)}
              className="rounded-xl border-2 border-dashed border-slate-300 text-slate-400 text-xs hover:border-slate-400 p-3"
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          {[["heroes", `🦸 Week of ${getWeekLabel()}`], ["leaderboard", "🏆 Leaderboard"], ["monthly", "📊 Monthly"]].map(([id, l]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border shadow-sm ${
                tab === id ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
              }`}
            >
              {l}
            </button>
          ))}
          <button
            onClick={() => setShowAdd(true)}
            className="ml-auto px-3 py-2 rounded-lg text-sm font-semibold border border-dashed border-indigo-300 text-indigo-600 bg-white/70 hover:bg-indigo-50 shadow-sm"
          >
            ➕ Hero
          </button>
        </div>

        {/* Search */}
        {(tab === "heroes" || tab === "leaderboard") && (
          <div className="mb-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search heroes..."
              className="w-full text-sm bg-white/80 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 focus:bg-white transition-colors"
            />
          </div>
        )}

        {/* Content */}
        {tab === "heroes" && (
          <div className="space-y-2">
            {sorted.map((m) => (
              <HeroCard
                key={m.id}
                m={m}
                expanded={expanded === m.id}
                onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                onEdit={handleEdit}
              />
            ))}
            {sorted.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">No heroes match.</div>
            )}
          </div>
        )}

        {tab === "leaderboard" && <Leaderboard members={sorted} />}
        {tab === "monthly" && <MonthlyView allMembers={members} />}

        <p className="text-center text-xs text-slate-400 mt-4 pb-2">
          {members.length} heroes · v{DATA_VERSION}
        </p>
      </div>

      {showAdd && (
        <AddHeroModal
          addName={addName}
          setAddName={setAddName}
          addTeam={addTeam}
          setAddTeam={setAddTeam}
          addGoals={addGoals}
          setAddGoals={setAddGoals}
          onClose={() => setShowAdd(false)}
          onAdd={doAdd}
        />
      )}

      {showLog && <SyncLogModal logs={logs} onClose={() => setShowLog(false)} />}
    </div>
  );
}
