import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .an-root { padding: 2.5rem; min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
  .an-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.4rem; }
  .an-title span { background: linear-gradient(135deg, #ef4444, #f97316); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .an-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 2.5rem; }

  .an-stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }
  .an-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 1.25rem; transition: all 0.2s ease; }
  .an-stat-card:hover { background: rgba(239,68,68,0.07); border-color: rgba(239,68,68,0.2); transform: translateY(-2px); }
  .an-stat-icon { font-size: 1.4rem; margin-bottom: 0.75rem; }
  .an-stat-value { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.3rem; }
  .an-stat-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-weight: 500; }
  .an-stat-card.danger .an-stat-value { color: #fca5a5; }
  .an-stat-card.success .an-stat-value { color: #6ee7b7; }
  .an-stat-card.warning .an-stat-value { color: #fcd34d; }

  .an-panels { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
  .an-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; }
  .an-panel-full { grid-column: 1 / -1; }
  .an-panel-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; }

  .an-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
  .an-bar-label { font-size: 0.8rem; color: rgba(255,255,255,0.6); width: 130px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .an-bar-track { flex: 1; background: rgba(255,255,255,0.05); border-radius: 999px; height: 8px; overflow: hidden; }
  .an-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #ef4444, #f97316); transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
  .an-bar-count { font-size: 0.8rem; font-weight: 700; color: #fca5a5; width: 28px; text-align: right; flex-shrink: 0; }

  .an-trend-chart { display: flex; align-items: flex-end; gap: 12px; height: 140px; padding-top: 1rem; }
  .an-trend-col { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 6px; height: 100%; justify-content: flex-end; }
  .an-trend-bar { width: 100%; border-radius: 6px 6px 0 0; background: linear-gradient(180deg, #ef4444, #f97316); transition: height 0.8s cubic-bezier(0.16,1,0.3,1); min-height: 4px; }
  .an-trend-label { font-size: 0.65rem; color: rgba(255,255,255,0.35); text-align: center; white-space: nowrap; }
  .an-trend-count { font-size: 0.7rem; font-weight: 700; color: #fca5a5; }

  .an-genre-grid { display: flex; flex-direction: column; gap: 10px; }
  .an-genre-row { display: flex; align-items: center; gap: 10px; }
  .an-genre-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .an-genre-name { font-size: 0.82rem; color: rgba(255,255,255,0.7); flex: 1; }
  .an-genre-bar-track { flex: 2; background: rgba(255,255,255,0.05); border-radius: 999px; height: 6px; overflow: hidden; }
  .an-genre-bar-fill { height: 100%; border-radius: 999px; transition: width 0.8s cubic-bezier(0.16,1,0.3,1); }
  .an-genre-count { font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.5); width: 24px; text-align: right; }

  .an-loading { display: flex; align-items: center; justify-content: center; padding: 5rem; gap: 1rem; color: rgba(255,255,255,0.4); }
  .an-spinner { width: 40px; height: 40px; border: 3px solid rgba(239,68,68,0.15); border-top-color: #ef4444; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  @media (max-width: 900px) { .an-panels { grid-template-columns: 1fr; } .an-panel-full { grid-column: 1; } }
  @media (max-width: 600px) { .an-root{padding:1.5rem} .an-title{font-size:1.5rem} .an-stats-grid{grid-template-columns:repeat(2,1fr)} }
`;

const GENRE_COLORS = ['#ef4444','#f97316','#f59e0b','#10b981','#6366f1','#8b5cf6','#ec4899'];

export default function LibraryAnalytics() {
  const [stats, setStats] = useState(null);
  const [mostBorrowed, setMostBorrowed] = useState([]);
  const [trend, setTrend] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const BASE = 'http://localhost:5000/api/analytics';
    Promise.all([
      fetch(`${BASE}/overview-stats`).then(r => r.json()),
      fetch(`${BASE}/most-borrowed`).then(r => r.json()),
      fetch(`${BASE}/monthly-trend`).then(r => r.json()),
      fetch(`${BASE}/genre-distribution`).then(r => r.json()),
    ]).then(([s, mb, tr, g]) => {
      setStats(s.data);
      setMostBorrowed(mb.data || []);
      setTrend(tr.data || []);
      setGenres(g.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="an-root">
        <div className="an-loading"><div className="an-spinner" /><span>Loading analytics…</span></div>
      </div>
    </>
  );

  const maxBorrow = Math.max(...mostBorrowed.map(b => b.BorrowCount), 1);
  const maxTrend = Math.max(...trend.map(t => t.BorrowCount), 1);
  const maxGenre = Math.max(...genres.map(g => g.Count), 1);

  const statCards = [
    { icon: '📚', label: 'Total Books', value: stats?.TotalBooks ?? 0, cls: '' },
    { icon: '✅', label: 'Available Copies', value: stats?.AvailableCopies ?? 0, cls: 'success' },
    { icon: '📖', label: 'Active Borrows', value: stats?.ActiveBorrows ?? 0, cls: '' },
    { icon: '⚠️', label: 'Overdue Books', value: stats?.OverdueBooks ?? 0, cls: 'danger' },
    { icon: '🎓', label: 'Active Students', value: stats?.ActiveStudents ?? 0, cls: '' },
    { icon: '💸', label: 'Unpaid Fines', value: stats?.UnpaidFines ?? 0, cls: 'warning' },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="an-root">
        <h1 className="an-title">Library <span>Analytics</span></h1>
        <p className="an-subtitle">Live snapshot of library activity and usage patterns</p>

        {/* Stat Cards */}
        <div className="an-stats-grid">
          {statCards.map((s, i) => (
            <div className={`an-stat-card ${s.cls}`} key={i}>
              <div className="an-stat-icon">{s.icon}</div>
              <div className="an-stat-value">{s.value}</div>
              <div className="an-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="an-panels">
          {/* Most Borrowed Books */}
          <div className="an-panel">
            <div className="an-panel-title">🏆 Most Borrowed Books</div>
            {mostBorrowed.length === 0
              ? <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.85rem'}}>No data yet</p>
              : mostBorrowed.map((book, i) => (
                <div className="an-bar-row" key={i}>
                  <div className="an-bar-label" title={book.Title}>{book.Title}</div>
                  <div className="an-bar-track">
                    <div className="an-bar-fill" style={{ width: `${(book.BorrowCount / maxBorrow) * 100}%` }} />
                  </div>
                  <div className="an-bar-count">{book.BorrowCount}</div>
                </div>
              ))
            }
          </div>

          {/* Genre Distribution */}
          <div className="an-panel">
            <div className="an-panel-title">🎨 Genre Distribution</div>
            {genres.length === 0
              ? <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.85rem'}}>No data yet</p>
              : <div className="an-genre-grid">
                  {genres.map((g, i) => (
                    <div className="an-genre-row" key={i}>
                      <div className="an-genre-dot" style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                      <div className="an-genre-name">{g.Genre}</div>
                      <div className="an-genre-bar-track">
                        <div className="an-genre-bar-fill" style={{ width: `${(g.Count / maxGenre) * 100}%`, background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                      </div>
                      <div className="an-genre-count">{g.Count}</div>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Monthly Trend */}
          <div className="an-panel an-panel-full">
            <div className="an-panel-title">📈 Monthly Borrowing Trend</div>
            {trend.length === 0
              ? <p style={{color:'rgba(255,255,255,0.3)',fontSize:'0.85rem'}}>No data for the last 6 months</p>
              : <div className="an-trend-chart">
                  {trend.map((t, i) => (
                    <div className="an-trend-col" key={i}>
                      <div className="an-trend-count">{t.BorrowCount}</div>
                      <div className="an-trend-bar" style={{ height: `${(t.BorrowCount / maxTrend) * 100}%` }} />
                      <div className="an-trend-label">{t.Month}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </div>
    </>
  );
}