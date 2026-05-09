import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .rs-root { padding: 2.5rem; min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
  .rs-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.4rem; }
  .rs-title span { background: linear-gradient(135deg, #6366f1, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .rs-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 2.5rem; }

  .rs-hero { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; margin-bottom: 2.5rem; }
  .rs-hero-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 1.75rem; display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.2s ease; }
  .rs-hero-card:hover { transform: translateY(-3px); }
  .rs-hero-card.streak { background: rgba(99,102,241,0.08); border-color: rgba(99,102,241,0.25); }
  .rs-hero-card.longest { background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.25); }
  .rs-hero-card.total { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.25); }
  .rs-hero-icon { font-size: 2.2rem; margin-bottom: 0.75rem; }
  .rs-hero-value { font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800; letter-spacing: -0.04em; line-height: 1; margin-bottom: 0.4rem; }
  .rs-hero-card.streak .rs-hero-value { color: #a5b4fc; }
  .rs-hero-card.longest .rs-hero-value { color: #6ee7b7; }
  .rs-hero-card.total .rs-hero-value { color: #fcd34d; }
  .rs-hero-label { font-size: 0.8rem; color: rgba(255,255,255,0.4); font-weight: 500; }
  .rs-hero-sub { font-size: 0.72rem; color: rgba(255,255,255,0.25); margin-top: 0.3rem; }

  .rs-section-title { font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: #fff; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 8px; }

  .rs-badges-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; }
  .rs-badges-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
  .rs-badge-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 1.1rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; transition: all 0.2s ease; animation: popIn 0.4s ease both; }
  .rs-badge-card:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
  .rs-badge-icon { font-size: 2rem; }
  .rs-badge-label { font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; color: #fff; }
  .rs-badge-desc { font-size: 0.7rem; color: rgba(255,255,255,0.35); }
  @keyframes popIn { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
  .rs-badge-card:nth-child(1){animation-delay:0.05s} .rs-badge-card:nth-child(2){animation-delay:0.1s}
  .rs-badge-card:nth-child(3){animation-delay:0.15s} .rs-badge-card:nth-child(4){animation-delay:0.2s}
  .rs-badge-card:nth-child(5){animation-delay:0.25s} .rs-badge-card:nth-child(6){animation-delay:0.3s}

  .rs-locked-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; }
  .rs-locked-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
  .rs-locked-card { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.08); border-radius: 14px; padding: 1.1rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.5rem; opacity: 0.45; }
  .rs-locked-icon { font-size: 2rem; filter: grayscale(1); }
  .rs-locked-label { font-family: 'Syne', sans-serif; font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.5); }
  .rs-locked-desc { font-size: 0.7rem; color: rgba(255,255,255,0.25); }
  .rs-lock { font-size: 0.9rem; }

  .rs-no-streak { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 14px; padding: 2rem; text-align: center; color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-bottom: 1.5rem; }

  .rs-loading { display: flex; align-items: center; justify-content: center; padding: 5rem; gap: 1rem; color: rgba(255,255,255,0.4); }
  .rs-spinner { width: 40px; height: 40px; border: 3px solid rgba(99,102,241,0.15); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }

  .rs-last-activity { font-size: 0.78rem; color: rgba(255,255,255,0.3); text-align: center; margin-top: 1.5rem; }

  @media (max-width: 700px) { .rs-root{padding:1.5rem} .rs-hero{grid-template-columns:1fr} .rs-title{font-size:1.5rem} }
`;

const ALL_BADGES = [
  { id: 'curious',  label: 'Curious Reader',  icon: '👀', desc: '2-week streak'      },
  { id: 'bookworm', label: 'Bookworm',         icon: '🐛', desc: '4-week streak'      },
  { id: 'devoted',  label: 'Devoted Reader',   icon: '📖', desc: '8-week streak'      },
  { id: 'scholar',  label: 'Scholar',          icon: '🎓', desc: '12-week streak'     },
  { id: 'legend',   label: 'Library Legend',   icon: '🏆', desc: '20-week streak'     },
  { id: 'reader5',  label: 'Avid Reader',      icon: '⭐', desc: '5 books borrowed'   },
  { id: 'reader10', label: 'Book Enthusiast',  icon: '🌟', desc: '10 books borrowed'  },
  { id: 'reader25', label: 'Bibliophile',      icon: '💫', desc: '25 books borrowed'  },
];

export default function ReadingStreak() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userID = localStorage.getItem('userID');

  useEffect(() => {
    fetch(`http://localhost:5000/api/analytics/reading-streak/${userID}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [userID]);

  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="rs-root"><div className="rs-loading"><div className="rs-spinner" /><span>Loading your streak…</span></div></div>
    </>
  );

  if (error) return (
    <>
      <style>{styles}</style>
      <div className="rs-root"><div className="rs-no-streak">⚠️ {error}</div></div>
    </>
  );

  const earnedIds = new Set((data.badges || []).map(b => b.id));
  const lockedBadges = ALL_BADGES.filter(b => !earnedIds.has(b.id));

  return (
    <>
      <style>{styles}</style>
      <div className="rs-root">
        <h1 className="rs-title">Reading <span>Streak</span></h1>
        <p className="rs-subtitle">Keep borrowing every week to grow your streak and unlock badges</p>

        <div className="rs-hero">
          <div className="rs-hero-card streak">
            <div className="rs-hero-icon">🔥</div>
            <div className="rs-hero-value">{data.currentStreak}</div>
            <div className="rs-hero-label">Current Streak</div>
            <div className="rs-hero-sub">weeks in a row</div>
          </div>
          <div className="rs-hero-card longest">
            <div className="rs-hero-icon">⚡</div>
            <div className="rs-hero-value">{data.longestStreak}</div>
            <div className="rs-hero-label">Longest Streak</div>
            <div className="rs-hero-sub">personal best</div>
          </div>
          <div className="rs-hero-card total">
            <div className="rs-hero-icon">📚</div>
            <div className="rs-hero-value">{data.totalBorrows}</div>
            <div className="rs-hero-label">Total Borrows</div>
            <div className="rs-hero-sub">all time</div>
          </div>
        </div>

        {data.currentStreak === 0 && (
          <div className="rs-no-streak">
            🌱 No active streak — borrow a book this week to start one!
          </div>
        )}

        {data.badges && data.badges.length > 0 && (
          <div className="rs-badges-panel">
            <div className="rs-section-title">🏅 Earned Badges</div>
            <div className="rs-badges-grid">
              {data.badges.map((badge, i) => (
                <div className="rs-badge-card" key={badge.id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="rs-badge-icon">{badge.icon}</div>
                  <div className="rs-badge-label">{badge.label}</div>
                  <div className="rs-badge-desc">{badge.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lockedBadges.length > 0 && (
          <div className="rs-locked-panel">
            <div className="rs-section-title">🔒 Locked Badges</div>
            <div className="rs-locked-grid">
              {lockedBadges.map(badge => (
                <div className="rs-locked-card" key={badge.id}>
                  <div className="rs-locked-icon">{badge.icon}</div>
                  <div className="rs-locked-label">{badge.label}</div>
                  <div className="rs-locked-desc">{badge.desc}</div>
                  <div className="rs-lock">🔒</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.lastActivity && (
          <div className="rs-last-activity">Last activity: {data.lastActivity}</div>
        )}
      </div>
    </>
  );
}