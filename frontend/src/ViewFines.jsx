import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .fines-container {
    padding: 2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  .page-header {
    margin-bottom: 2.5rem;
  }

  .page-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.5rem;
    letter-spacing: -0.03em;
  }

  .page-header p {
    color: rgba(255,255,255,0.4);
    font-size: 0.95rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.5rem;
    backdrop-filter: blur(20px);
  }

  .stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.8rem;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .stat-subtitle {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.5);
  }

  .fines-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 2rem;
  }

  .fines-table thead {
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .fines-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .fines-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.9rem;
    color: rgba(255,255,255,0.8);
  }

  .fines-table tbody tr:hover {
    background: rgba(99,102,241,0.08);
  }

  .status-badge {
    display: inline-block;
    border-radius: 6px;
    padding: 0.4rem 0.8rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-paid {
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.3);
  }

  .status-unpaid {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
  }

  .amount-badge {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    padding: 0.4rem 0.8rem;
    background: rgba(251,146,60,0.15);
    color: #fb923c;
    border: 1px solid rgba(251,146,60,0.3);
    border-radius: 6px;
    display: inline-block;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: rgba(255,255,255,0.5);
  }

  .spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255,255,255,0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-message {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 1rem;
    color: #fca5a5;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .success-message {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 12px;
    padding: 1rem;
    color: #6ee7b7;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background: rgba(255,255,255,0.02);
    border: 1.5px dashed rgba(255,255,255,0.1);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-text {
    color: rgba(255,255,255,0.4);
    font-size: 0.95rem;
  }

  .action-btn {
    padding: 0.5rem 1rem;
    background: rgba(99,102,241,0.15);
    border: 1.5px solid rgba(99,102,241,0.3);
    border-radius: 8px;
    color: #a5b4fc;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(99,102,241,0.25);
    border-color: rgba(99,102,241,0.5);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
    margin: 2rem 0 1rem 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(99,102,241,0.3);
  }

  .calculation-info {
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px;
    padding: 1.2rem;
    margin-bottom: 2rem;
  }

  .calculation-info h3 {
    color: #a5b4fc;
    font-size: 0.9rem;
    margin: 0 0 0.8rem 0;
    font-weight: 700;
  }

  .calculation-info p {
    color: rgba(255,255,255,0.6);
    font-size: 0.85rem;
    margin: 0.5rem 0;
    line-height: 1.5;
  }
`;

function ViewFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalFines: 0,
    totalUnpaid: 0,
    totalPaid: 0,
    unpaidCount: 0
  });
  const [recalculateLoading, setRecalculateLoading] = useState(false);
  const [recalculateSuccess, setRecalculateSuccess] = useState(false);

  const userID = localStorage.getItem('userID');

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/fines/student/${userID}`);
      setFines(response.data.fines || []);
      calculateStats(response.data.fines || []);
    } catch (err) {
      setError("Failed to load fines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (fineList) => {
    const totalFines = fineList.reduce((sum, fine) => sum + (fine.FineAmount || 0), 0);
    const totalUnpaid = fineList
      .filter(f => f.PaidStatus === 'Unpaid')
      .reduce((sum, fine) => sum + (fine.FineAmount || 0), 0);
    const totalPaid = fineList
      .filter(f => f.PaidStatus === 'Paid')
      .reduce((sum, fine) => sum + (fine.FineAmount || 0), 0);
    const unpaidCount = fineList.filter(f => f.PaidStatus === 'Unpaid').length;

    setStats({
      totalFines: totalFines.toFixed(2),
      totalUnpaid: totalUnpaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      unpaidCount
    });
  };

  const handleRecalculateFines = async () => {
    setRecalculateLoading(true);
    setRecalculateSuccess(false);
    setError("");
    try {
      await axios.get("http://localhost:5000/api/fines/calculate");
      setRecalculateSuccess(true);
      setTimeout(() => {
        loadFines();
        setRecalculateSuccess(false);
      }, 1500);
    } catch (err) {
      setError("Failed to recalculate fines. Please try again.");
      console.error(err);
    } finally {
      setRecalculateLoading(false);
    }
  };

  const handlePayFine = async (fineID) => {
    if (!window.confirm("Pay this fine?")) return;

    try {
      await axios.post("http://localhost:5000/api/fines/pay", {
        fineID: fineID
      });
      loadFines();
    } catch (err) {
      setError("Failed to process payment. Please try again.");
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="fines-container">
        <div className="page-header">
          <h1>💰 My Fines</h1>
          <p>View and manage your library fines</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {recalculateSuccess && <div className="success-message">✓ Fines recalculated successfully!</div>}

        <div className="calculation-info">
          <h3>📋 How Fines are Calculated</h3>
          <p>• Fine Amount: PKR 10 per day</p>
          <p>• Calculated from: Due Date until book is returned</p>
          <p>• Status: Shows whether fine is paid or unpaid</p>
          <p>• You can request admin to recalculate if dates have changed</p>
        </div>

        {!loading && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Fines</div>
              <div className="stat-value">PKR {stats.totalFines}</div>
              <div className="stat-subtitle">All time</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Unpaid Fines</div>
              <div className="stat-value">PKR {stats.totalUnpaid}</div>
              <div className="stat-subtitle">{stats.unpaidCount} record(s)</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Paid Fines</div>
              <div className="stat-value">PKR {stats.totalPaid}</div>
              <div className="stat-subtitle">Completed</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            className="action-btn"
            onClick={handleRecalculateFines}
            disabled={recalculateLoading}
            style={{ padding: '0.7rem 1.5rem', fontSize: '0.9rem' }}
          >
            {recalculateLoading ? "Recalculating..." : "🔄 Recalculate Fines"}
          </button>
        </div>

        <div className="section-title">📊 Your Fines History</div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading fines...</p>
          </div>
        ) : fines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <div className="empty-text">No fines! You're all clear!</div>
          </div>
        ) : (
          <table className="fines-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Days Overdue</th>
                <th>Fine Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => {
                const daysOverdue = fine.DaysOverdue || 0;
                return (
                  <tr key={fine.FineID}>
                    <td>{fine.BookTitle || "Unknown"}</td>
                    <td>{formatDate(fine.DueDate)}</td>
                    <td>{formatDate(fine.ReturnDate)}</td>
                    <td>
                      {daysOverdue > 0 ? (
                        <span style={{ color: '#fca5a5', fontWeight: '600' }}>{daysOverdue} days</span>
                      ) : (
                        <span style={{ color: '#6ee7b7' }}>On time</span>
                      )}
                    </td>
                    <td>
                      <span className="amount-badge">PKR {(fine.FineAmount || 0).toFixed(2)}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${fine.PaidStatus === 'Paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {fine.PaidStatus}
                      </span>
                    </td>
                    <td>
                      {fine.PaidStatus === 'Unpaid' && (
                        <button 
                          className="action-btn"
                          onClick={() => handlePayFine(fine.FineID)}
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default ViewFines;