import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .df-root { padding: 2.5rem; min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
  .df-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.4rem; }
  .df-title span { background: linear-gradient(135deg, #ef4444, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .df-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 2.5rem; }

  .df-summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .df-sum-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; text-align: center; }
  .df-sum-value { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.3rem; }
  .df-sum-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
  .df-sum-card.critical .df-sum-value { color: #fca5a5; }
  .df-sum-card.high .df-sum-value { color: #fdba74; }
  .df-sum-card.medium .df-sum-value { color: #fcd34d; }
  .df-sum-card.low .df-sum-value { color: #6ee7b7; }

  .df-filter-row { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .df-filter-btn { padding: 0.45rem 1rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.5); font-size: 0.78rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: 'DM Sans', sans-serif; }
  .df-filter-btn:hover { background: rgba(255,255,255,0.07); color: #fff; }
  .df-filter-btn.active { color: #fff; }
  .df-filter-btn.all.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
  .df-filter-btn.critical.active { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
  .df-filter-btn.high.active { background: rgba(249,115,22,0.15); border-color: rgba(249,115,22,0.4); color: #fdba74; }
  .df-filter-btn.medium.active { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.4); color: #fcd34d; }
  .df-filter-btn.low.active { background: rgba(16,185,129,0.15); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }

  .df-table-wrap { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
  .df-table { width: 100%; border-collapse: collapse; }
  .df-table th { padding: 1rem 1.25rem; text-align: left; font-size: 0.72rem; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.06em; border-bottom: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
  .df-table td { padding: 1rem 1.25rem; font-size: 0.85rem; color: rgba(255,255,255,0.8); border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
  .df-table tr:last-child td { border-bottom: none; }
  .df-table tr { transition: background 0.15s ease; }
  .df-table tr:hover td { background: rgba(255,255,255,0.02); }

  .df-book-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.9rem; color: #fff; margin-bottom: 0.2rem; }
  .df-book-author { font-size: 0.75rem; color: rgba(255,255,255,0.35); }

  .df-risk-badge { display: inline-block; padding: 0.3rem 0.75rem; border-radius: 20px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.03em; }
  .df-risk-badge.critical { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }
  .df-risk-badge.high { background: rgba(249,115,22,0.15); color: #fdba74; border: 1px solid rgba(249,115,22,0.3); }
  .df-risk-badge.medium { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
  .df-risk-badge.low { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }

  .df-copies-bar { display: flex; align-items: center; gap: 8px; }
  .df-copies-track { width: 60px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden; }
  .df-copies-fill { height: 100%; border-radius: 999px; transition: width 0.6s ease; }
  .df-copies-text { font-size: 0.8rem; color: rgba(255,255,255,0.6); white-space: nowrap; }

  .df-rec { font-size: 0.78rem; color: rgba(255,255,255,0.45); font-style: italic; }
  .df-days { font-size: 0.82rem; font-weight: 600; }
  .df-days.critical { color: #fca5a5; }
  .df-days.high { color: #fdba74; }
  .df-days.medium { color: #fcd34d; }
  .df-days.low { color: #6ee7b7; }

  .df-empty { padding: 3rem; text-align: center; color: rgba(255,255,255,0.3); font-size: 0.9rem; }
  .df-loading { display: flex; align-items: center; justify-content: center; padding: 5rem; gap: 1rem; color: rgba(255,255,255,0.4); }
  .df-spinner { width: 40px; height: 40px; border: 3px solid rgba(239,68,68,0.15); border-top-color: #ef4444; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  @media (max-width: 900px) {
    .df-root { padding: 1.5rem; }
    .df-title { font-size: 1.5rem; }
    .df-table th:nth-child(4), .df-table td:nth-child(4),
    .df-table th:nth-child(5), .df-table td:nth-child(5) { display: none; }
  }
`;

export default function DemandForecast() {
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:5000/api/analytics/demand-forecast')
      .then(r => r.json())
      .then(d => setForecast(d.forecast || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    critical: forecast.filter(f => f.riskColor === 'critical').length,
    high:     forecast.filter(f => f.riskColor === 'high').length,
    medium:   forecast.filter(f => f.riskColor === 'medium').length,
    low:      forecast.filter(f => f.riskColor === 'low').length,
  };

  const filtered = filter === 'all' ? forecast : forecast.filter(f => f.riskColor === filter);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="df-root"><div className="df-loading"><div className="df-spinner" /><span>Analysing demand…</span></div></div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="df-root">
        <h1 className="df-title">Demand <span>Forecast</span></h1>
        <p className="df-subtitle">Predicted book shortages over the next 30 days based on borrowing patterns</p>

        <div className="df-summary">
          {[
            { key: 'critical', label: 'Critical Risk',  icon: '🚨' },
            { key: 'high',     label: 'High Risk',      icon: '⚠️' },
            { key: 'medium',   label: 'Medium Risk',    icon: '📊' },
            { key: 'low',      label: 'Low Risk',       icon: '✅' },
          ].map(s => (
            <div className={`df-sum-card ${s.key}`} key={s.key}>
              <div style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{s.icon}</div>
              <div className="df-sum-value">{counts[s.key]}</div>
              <div className="df-sum-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="df-filter-row">
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              className={`df-filter-btn ${f} ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${counts[f]})`}
            </button>
          ))}
        </div>

        <div className="df-table-wrap">
          {filtered.length === 0 ? (
            <div className="df-empty">No books match this filter.</div>
          ) : (
            <table className="df-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Risk</th>
                  <th>Available Copies</th>
                  <th>Borrows (30d)</th>
                  <th>Days Until Empty</th>
                  <th>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book, i) => {
                  const fillPct = Math.round((book.AvailableCopies / book.TotalCopies) * 100);
                  const fillColor = book.riskColor === 'critical' ? '#ef4444'
                    : book.riskColor === 'high' ? '#f97316'
                    : book.riskColor === 'medium' ? '#f59e0b' : '#10b981';
                  return (
                    <tr key={i}>
                      <td>
                        <div className="df-book-title">{book.Title}</div>
                        <div className="df-book-author">{book.Authors || '—'}</div>
                      </td>
                      <td>
                        <span className={`df-risk-badge ${book.riskColor}`}>{book.riskLevel}</span>
                      </td>
                      <td>
                        <div className="df-copies-bar">
                          <div className="df-copies-track">
                            <div className="df-copies-fill" style={{ width: `${fillPct}%`, background: fillColor }} />
                          </div>
                          <span className="df-copies-text">{book.AvailableCopies} / {book.TotalCopies}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                        {book.BorrowsLast30Days}
                      </td>
                      <td>
                        <span className={`df-days ${book.riskColor}`}>
                          {book.daysUntilEmpty !== null ? `~${book.daysUntilEmpty}d` : '30d+'}
                        </span>
                      </td>
                      <td><div className="df-rec">{book.recommendation}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}