import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .calculate-fines-container {
    padding: 2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  .page-header {
    margin-bottom: 2.5rem;
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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
    text-align: center;
  }

  .stat-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
    margin-bottom: 0.3rem;
  }

  .stat-label {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
  }

  .fines-table-container {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .fines-table {
    width: 100%;
    border-collapse: collapse;
  }

  .fines-table thead {
    background: rgba(99,102,241,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .fines-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .fines-table td {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
  }

  .fines-table tbody tr:hover {
    background: rgba(99,102,241,0.05);
  }

  .book-title {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: #fff;
  }

  .fine-amount {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #fca5a5;
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

  .action-btn {
    padding: 0.5rem 1rem;
    background: rgba(16,185,129,0.15);
    border: 1.5px solid rgba(16,185,129,0.3);
    border-radius: 8px;
    color: #6ee7b7;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover:not(:disabled) {
    background: rgba(16,185,129,0.25);
    border-color: rgba(16,185,129,0.5);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .empty-state {
    text-align: center;
    padding: 3rem;
    border-radius: 16px;
    background: rgba(255,255,255,0.02);
    border: 1.5px dashed rgba(255,255,255,0.1);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-text {
    color: rgba(255,255,255,0.4);
    font-size: 0.95rem;
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
`;

function CalculateFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [markingAsPaid, setMarkingAsPaid] = useState(null);
  const [stats, setStats] = useState({
    totalUnpaid: 0,
    totalPaid: 0,
    unpaidCount: 0
  });

  useEffect(() => {
    loadAllFines();
  }, []);

  const loadAllFines = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/fines/all");
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
    const totalUnpaid = fineList
      .filter(f => f.PaidStatus === 'Unpaid')
      .reduce((sum, fine) => sum + (fine.FineAmount || 0), 0);
    const totalPaid = fineList
      .filter(f => f.PaidStatus === 'Paid')
      .reduce((sum, fine) => sum + (fine.FineAmount || 0), 0);
    const unpaidCount = fineList.filter(f => f.PaidStatus === 'Unpaid').length;

    setStats({
      totalUnpaid: totalUnpaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      unpaidCount
    });
  };

  const handleMarkAsPaid = async (fineID) => {
    if (!window.confirm("Mark this fine as paid?")) return;

    setMarkingAsPaid(fineID);
    setError("");
    setSuccess("");

    try {
      await axios.post("http://localhost:5000/api/fines/mark-paid", {
        fineID: fineID
      });

      setSuccess("✓ Fine marked as paid!");
      setTimeout(() => {
        loadAllFines();
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark fine as paid");
      console.error(err);
    } finally {
      setMarkingAsPaid(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="calculate-fines-container">
        <div className="page-header">
          <h1>💰 Manage Fines</h1>
          <p>View and mark all student fines as paid</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {success && <div className="success-message">{success}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading fines...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{stats.unpaidCount}</div>
                <div className="stat-label">Unpaid Fines</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💸</div>
                <div className="stat-value">PKR {stats.totalUnpaid}</div>
                <div className="stat-label">Total Unpaid</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✓</div>
                <div className="stat-value">PKR {stats.totalPaid}</div>
                <div className="stat-label">Total Paid</div>
              </div>
            </div>

            {fines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <div className="empty-text">No fines found. All students are clear!</div>
              </div>
            ) : (
              <div className="fines-table-container">
                <table className="fines-table">
                  <thead>
                    <tr>
                      <th>Student ID</th>
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
                    {fines.map((fine) => (
                      <tr key={fine.FineID}>
                        <td>{fine.UserID}</td>
                        <td className="book-title">{fine.BookTitle || "Unknown"}</td>
                        <td>{formatDate(fine.DueDate)}</td>
                        <td>{formatDate(fine.ReturnDate)}</td>
                        <td>{fine.DaysOverdue || 0} days</td>
                        <td className="fine-amount">PKR {(fine.FineAmount || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${fine.PaidStatus === 'Paid' ? 'status-paid' : 'status-unpaid'}`}>
                            {fine.PaidStatus}
                          </span>
                        </td>
                        <td>
                          {fine.PaidStatus === 'Unpaid' && (
                            <button
                              className="action-btn"
                              onClick={() => handleMarkAsPaid(fine.FineID)}
                              disabled={markingAsPaid === fine.FineID}
                            >
                              {markingAsPaid === fine.FineID ? "Processing..." : "✓ Mark Paid"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CalculateFines;