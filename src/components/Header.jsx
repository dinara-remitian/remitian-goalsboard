import './Header.css';

export default function Header({
  weekRange, lastSync, savedAt, loading, logsCount,
  onToggleConfig, onToggleLog, onSync,
}) {
  return (
    <div className="header">
      <div>
        <h1 className="header-title">⚡ Remitian GoalsBoard</h1>
        <p className="header-subtitle">
          <span>{weekRange}{lastSync ? ` · synced ${lastSync}` : ""}</span>
          {savedAt && <span className="header-saved">💾 {savedAt}</span>}
        </p>
      </div>
      <div className="header-actions">
        <button onClick={onToggleConfig} className="header-btn">⚙️</button>
        <button onClick={onToggleLog} className="header-btn">
          📋{logsCount > 0 && <span className="header-log-count">{logsCount}</span>}
        </button>
        <button onClick={onSync} disabled={loading} className="header-btn-primary">
          {loading ? "⏳…" : "🔄 Sync"}
        </button>
      </div>
    </div>
  );
}
