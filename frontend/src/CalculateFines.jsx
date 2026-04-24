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

  .overdue-days {
    display: inline-block;
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 8px;
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
    color: #fca5a5;
    font-weight: 600;
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

  .action-btn {
    padding: 0.4rem 0.8rem;
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 8px;
    color: #a5b4fc;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(99,102,241,0.3);
    border-color: rgba(99,102,241,0.5);
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

function CalculateFines() {
  const [overdueBooks, setOverdueBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalFines, setTotalFines] = useState(0);

  useEffect(() => {
    loadFines();
  }, []);

  const loadFines = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/fines/calculate");
      const books = response.data.overdueBooks;
      setOverdueBooks(books);

      // Calculate total fines
      const total = books.reduce((sum, book) => sum + book.CalculatedFine, 0);
      setTotalFines(total);
    } catch (err) {
      setError("Failed to calculate fines. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFineRecord = (transactionID, amount) => {
    alert(`Create fine record for Transaction ${transactionID}: Rs. ${amount}`);
    // In real app, would call API to create fine record
  };

  return (
    <>
      <style>{styles}</style>
      <div className="calculate-fines-container">
        <div className="page-header">
          <h1>📊 Calculate Fines</h1>
          <p>Compute fines for overdue books (Rs. 10 per day)</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Calculating fines...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{overdueBooks.length}</div>
                <div className="stat-label">Overdue Books</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">Rs. {totalFines}</div>
                <div className="stat-label">Total Fines</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-value">{overdueBooks.length > 0 ? (totalFines / overdueBooks.length).toFixed(0) : 0}</div>
                <div className="stat-label">Average Fine</div>
              </div>
            </div>

            {overdueBooks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎉</div>
                <div className="empty-text">No overdue books found. All books are on time!</div>
              </div>
            ) : (
              <div className="fines-table-container">
                <table className="fines-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Student ID</th>
                      <th>Due Date</th>
                      <th>Overdue Days</th>
                      <th>Fine Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueBooks.map((book, index) => (
                      <tr key={index}>
                        <td className="book-title">{book.Title}</td>
                        <td>{book.UserID}</td>
                        <td>{new Date(book.DueDate).toLocaleDateString()}</td>
                        <td>
                          <span className="overdue-days">{book.OverdueDays} days</span>
                        </td>
                        <td className="fine-amount">Rs. {book.CalculatedFine}</td>
                        <td>
                          <button 
                            className="action-btn"
                            onClick={() => handleCreateFineRecord(book.TransactionID, book.CalculatedFine)}
                          >
                            Record Fine
                          </button>
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