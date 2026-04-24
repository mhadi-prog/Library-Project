import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .view-fines-container {
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

  .amount {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #fca5a5;
  }

  .status-badge {
    display: inline-block;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
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

  .pay-btn {
    padding: 0.5rem 1rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pay-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
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

  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .fines-table {
      font-size: 0.85rem;
    }

    .fines-table th,
    .fines-table td {
      padding: 0.8rem 1rem;
    }
  }
`;

function ViewFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalFines, setTotalFines] = useState(0);
  const [paidFines, setPaidFines] = useState(0);

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    setLoading(true);
    setError("");
    try {
      const userID = localStorage.getItem('userID') || 1;
      const response = await axios.get(`http://localhost:5000/api/fines/student/${userID}`);
      setFines(response.data.fines);

      // Calculate stats
      const total = response.data.fines.reduce((sum, fine) => sum + fine.Amount, 0);
      const paid = response.data.fines.filter(f => f.PaidStatus === 'Paid').reduce((sum, fine) => sum + fine.Amount, 0);
      
      setTotalFines(total);
      setPaidFines(paid);
    } catch (err) {
      setError("Failed to load fines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFine = async (fineID, amount) => {
    try {
      await axios.post("http://localhost:5000/api/fines/pay", {
        fineID,
        amount,
        paymentDate: new Date().toISOString().split('T')[0]
      });
      alert("Payment recorded successfully!");
      loadFines();
    } catch (err) {
      alert("Payment failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="view-fines-container">
        <div className="page-header">
          <h1>💰 View Fines</h1>
          <p>Check your overdue book fines and payment status</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

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
                <div className="stat-value">Rs. {totalFines}</div>
                <div className="stat-label">Total Fines</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">Rs. {paidFines}</div>
                <div className="stat-label">Paid</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-value">Rs. {totalFines - paidFines}</div>
                <div className="stat-label">Outstanding</div>
              </div>
            </div>

            {fines.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <div className="empty-text">Great! You have no outstanding fines.</div>
              </div>
            ) : (
              <div className="fines-table-container">
                <table className="fines-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Due Date</th>
                      <th>Fine Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map((fine) => (
                      <tr key={fine.FineID}>
                        <td className="book-title">{fine.Title}</td>
                        <td>{new Date(fine.DueDate).toLocaleDateString()}</td>
                        <td className="amount">Rs. {fine.Amount}</td>
                        <td>
                          <span className={`status-badge ${fine.PaidStatus === 'Paid' ? 'status-paid' : 'status-unpaid'}`}>
                            {fine.PaidStatus}
                          </span>
                        </td>
                        <td>
                          {fine.PaidStatus === 'Unpaid' && (
                            <button 
                              className="pay-btn"
                              onClick={() => handlePayFine(fine.FineID, fine.Amount)}
                            >
                              Pay Now
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

export default ViewFines;