import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .rec-root { padding: 2.5rem; min-height: 100vh; background: #0a0a0f; font-family: 'DM Sans', sans-serif; color: #fff; }
  .rec-title { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -0.03em; margin-bottom: 0.4rem; }
  .rec-title span { background: linear-gradient(135deg, #6366f1, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .rec-subtitle { font-size: 0.9rem; color: rgba(255,255,255,0.4); margin-bottom: 0.9rem; }
  .rec-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 20px; padding: 0.4rem 1rem; font-size: 0.75rem; font-weight: 600; color: #a5b4fc; margin-bottom: 2rem; }
  .rec-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #6366f1; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
  .rec-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; gap: 1.5rem; color: rgba(255,255,255,0.4); }
  .rec-spinner { width: 44px; height: 44px; border: 3px solid rgba(99,102,241,0.15); border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .rec-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 14px; padding: 1.5rem 2rem; color: #fca5a5; font-size: 0.9rem; text-align: center; margin: 2rem 0; }
  .rec-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
  .rec-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 1.5rem; transition: all 0.25s ease; position: relative; overflow: hidden; animation: fadeUp 0.4s ease both; }
  .rec-card:nth-child(1){animation-delay:0.05s} .rec-card:nth-child(2){animation-delay:0.1s} .rec-card:nth-child(3){animation-delay:0.15s} .rec-card:nth-child(4){animation-delay:0.2s} .rec-card:nth-child(5){animation-delay:0.25s} .rec-card:nth-child(6){animation-delay:0.3s}
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .rec-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#6366f1,#10b981); opacity:0; transition:opacity 0.25s ease; }
  .rec-card:hover { background: rgba(99,102,241,0.07); border-color: rgba(99,102,241,0.25); transform: translateY(-3px); box-shadow: 0 12px 40px rgba(99,102,241,0.12); }
  .rec-card:hover::before { opacity: 1; }
  .rec-card-genre { display: inline-block; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); border-radius: 8px; padding: 0.25rem 0.65rem; font-size: 0.7rem; font-weight: 600; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.9rem; }
  .rec-card-title { font-family: 'Syne', sans-serif; font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem; line-height: 1.3; }
  .rec-card-author { font-size: 0.8rem; color: rgba(255,255,255,0.45); margin-bottom: 1.1rem; }
  .rec-card-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.1rem; }
  .rec-meta-chip { display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.04); border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.72rem; color: rgba(255,255,255,0.45); }
  .rec-card-availability { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; }
  .rec-avail-dot { width: 7px; height: 7px; border-radius: 50%; }
  .rec-avail-dot.available { background: #10b981; } .rec-avail-dot.unavailable { background: #ef4444; }
  .rec-avail-text.available { color: #6ee7b7; } .rec-avail-text.unavailable { color: #fca5a5; }
  .rec-shelf { font-size: 0.75rem; color: rgba(255,255,255,0.3); margin-top: 0.5rem; }
  .rec-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; color: rgba(255,255,255,0.35); gap: 1rem; }
  @media (max-width: 768px) { .rec-root{padding:1.5rem} .rec-grid{grid-template-columns:1fr} .rec-title{font-size:1.5rem} }
`;

export default function RecommendedBooks() {
  const [recommendations, setRecommendations] = useState([]);
  const [basedOn, setBasedOn] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userID = localStorage.getItem('userID');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/analytics/recommendations/${userID}`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setBasedOn(data.basedOn || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (userID) fetchRecommendations();
  }, [userID]);

  return (
    <>
      <style>{styles}</style>
      <div className="rec-root">
        <div>
          <h1 className="rec-title">Recommended <span>for You</span></h1>
          <p className="rec-subtitle">Books picked based on your reading history</p>
          <div className="rec-badge">
            <span className="rec-badge-dot" />
            {basedOn.length > 0
              ? `Based on your interest in: ${basedOn.join(' · ')}`
              : 'Showing most popular books in the library'}
          </div>
        </div>

        {loading && (
          <div className="rec-loading">
            <div className="rec-spinner" />
            <span>Finding books for you…</span>
          </div>
        )}

        {error && <div className="rec-error">⚠️ {error}</div>}

        {!loading && !error && recommendations.length === 0 && (
          <div className="rec-empty">
            <div style={{ fontSize: '3rem', opacity: 0.4 }}>📭</div>
            <p>No recommendations available right now.</p>
          </div>
        )}

        {!loading && !error && recommendations.length > 0 && (
          <div className="rec-grid">
            {recommendations.map((book, idx) => {
              const isAvailable = book.AvailableCopies > 0;
              return (
                <div className="rec-card" key={book.BookID || idx}>
                  <div className="rec-card-genre">{book.Genre}</div>
                  <div className="rec-card-title">{book.Title}</div>
                  <div className="rec-card-author">{book.Authors || 'Unknown Author'}</div>
                  <div className="rec-card-meta">
                    {book.PublicationYear && <div className="rec-meta-chip">📅 {book.PublicationYear}</div>}
                    {book.Publisher && <div className="rec-meta-chip">🏢 {book.Publisher}</div>}
                  </div>
                  <div className="rec-card-availability">
                    <span className={`rec-avail-dot ${isAvailable ? 'available' : 'unavailable'}`} />
                    <span className={`rec-avail-text ${isAvailable ? 'available' : 'unavailable'}`}>
                      {isAvailable ? `${book.AvailableCopies} cop${book.AvailableCopies === 1 ? 'y' : 'ies'} available` : 'Currently unavailable'}
                    </span>
                  </div>
                  {book.ShelfLocation && <div className="rec-shelf">📍 Shelf {book.ShelfLocation}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}