import { useState } from 'react';
import { TEAMS } from '../data/statusDefs';
import './SyncPanel.css';

export function ConfigPanel({ channelId, setChannelId, onClose, onSync, onPasteSync, onReset }) {
  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  return (
    <div className="mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <p className="text-sm font-semibold text-slate-700 mb-2">Sync Options</p>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { onClose(); onSync(); }}
          className="text-xs px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
        >
          🔄 Auto Sync
        </button>
        <button
          onClick={() => setShowPaste(!showPaste)}
          className="text-xs px-4 py-2 rounded-lg bg-white border border-indigo-300 text-indigo-600 font-semibold hover:bg-indigo-50"
        >
          📋 Paste from Slack
        </button>
      </div>

      {showPaste && (
        <div className="mb-3">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-indigo-400 font-mono"
            rows={6}
            placeholder="Paste Slack messages from #goalboard-sync here...&#10;&#10;e.g.:&#10;:clipboard: *Weekly Goals from @Aaron*&#10;1. Goal one&#10;2. Goal two"
          />
          <button
            onClick={() => {
              if (pasteText.trim()) {
                onPasteSync(pasteText);
                setPasteText("");
                setShowPaste(false);
                onClose();
              }
            }}
            disabled={!pasteText.trim()}
            className="mt-1 text-xs px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            Apply Sync
          </button>
        </div>
      )}

      <div className="flex gap-2 items-center mb-2">
        <input
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
          className="flex-1 text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 outline-none focus:border-indigo-400"
          placeholder="Channel ID"
        />
      </div>
      <p className="text-xs text-slate-400 mb-3">#goalboard-sync (C0AL1NFB6MA)</p>

      <div className="flex gap-2">
        <button onClick={onReset} className="text-xs px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 font-semibold">
          🗑️ Reset Board Data
        </button>
        <span className="text-xs text-slate-400 self-center">Clears storage, reloads initial data</span>
      </div>
    </div>
  );
}

export function SyncLogModal({ logs, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-slate-800">🔍 Sync Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5">
          {logs.map((l, i) => (
            <div
              key={i}
              className={`text-xs px-3 py-2 rounded-lg border ${
                l.type === "error" ? "bg-red-50 border-red-200 text-red-700"
                : l.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : l.type === "warn" ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <span className="font-mono">{l.time}</span> — {l.msg}
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No logs yet. Hit "🔄 Sync" to start.</p>
          )}
        </div>
        <button onClick={onClose} className="mt-3 w-full text-sm bg-slate-100 rounded-lg py-2 text-slate-600 hover:bg-slate-200">
          Close
        </button>
      </div>
    </div>
  );
}

export function AddHeroModal({ addName, setAddName, addTeam, setAddTeam, addGoals, setAddGoals, onClose, onAdd }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-bold text-slate-800">➕ Add Hero</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Name</label>
            <input
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Team</label>
            <select
              value={addTeam}
              onChange={(e) => setAddTeam(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400"
            >
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Goals</label>
            {addGoals.map((g, i) => (
              <input
                key={i}
                value={g}
                onChange={(e) => {
                  const n = [...addGoals];
                  n[i] = e.target.value;
                  setAddGoals(n);
                }}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-400 mb-1.5"
                placeholder={`Goal ${i + 1}`}
              />
            ))}
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 text-sm border border-slate-200 rounded-lg py-2 text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onAdd} className="flex-1 text-sm bg-indigo-600 text-white rounded-lg py-2 font-semibold hover:bg-indigo-700">Add Hero</button>
        </div>
      </div>
    </div>
  );
}
