import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  .history-container { padding: 2rem; background: #0a0a0f; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
  .page-header h1 { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
  .page-header p { color: rgba(255,255,255,0.4); margin-bottom: 2rem; }
  .search-section { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; }
  .search-wrapper { display: flex; gap: 1rem; }
  .search-input { flex: 1; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 0.85rem 1.2rem; color: #fff; outline: none; }
  .search-btn { padding: 0.85rem 1.5rem; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border: none; border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; }
  .no-record-state { text-align: center; padding: 4rem 2rem; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; color: rgba(255,255,255,0.5); }
  .no-record-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
  .no-record-text { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 600; color: #fff; }
  .history-table { width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px; overflow: hidden; }
  .history-table th { padding: 1rem; text-align: left; font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; background: rgba(255,255,255,0.05); }
  .history-table td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
  .status-badge { padding: 0.4rem 0.8rem; border-radius: 6px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
  .status-active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
  .status-returned { background: rgba(16,185,129,0.15); color: #6ee7b7; }
  .status-overdue { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .return-btn { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; transition: 0.2s ease; }
  .return-btn:hover { background: #059669; }
`;

function BorrowingHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/user/history?searchTerm=${searchTerm}`);
      setHistory(response.data.history || []);
      setSearchPerformed(true);
    } catch (err) {
      setHistory([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReturn = async (id) => {
    if (!window.confirm("Confirm return?")) return;
    try {
      // Use standard ISO string for database compatibility
      await axios.put(`http://localhost:5000/api/borrow/return`, {
        transactionID: id,
        returnDate: new Date().toISOString()
      });
      alert("Book returned and stock updated!");
      handleSearch(); // Refresh data to show 'Returned' status
    } catch (err) { 
      alert(err.response?.data?.message || "Return failed"); 
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="history-container">
        <div className="page-header">
          <h1>📚 Borrowing History</h1>
          <p>Search by Student ID to manage returns</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-wrapper">
            <input 
              className="search-input" 
              placeholder="Enter Student ID (e.g. 101)..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="no-record-state"><p>Processing...</p></div>
        ) : history.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.TransactionID}>
                  <td>{record.Title}</td>
                  <td>{new Date(record.DueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${record.ReturnDate ? 'status-returned' : (new Date(record.DueDate) < new Date() ? 'status-overdue' : 'status-active')}`}>
                      {record.ReturnDate ? 'Returned' : (new Date(record.DueDate) < new Date() ? 'Overdue' : 'Active')}
                    </span>
                  </td>
                  <td>
                    {!record.ReturnDate && (
                      <button className="return-btn" onClick={() => handleProcessReturn(record.TransactionID)}>Return</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : searchPerformed ? (
          <div className="no-record-state">
            <span className="no-record-icon">🔍</span>
            <p className="no-record-text">No borrowing records exist for this ID</p>
          </div>
        ) : (
          <div className="no-record-state">
            <p>Enter a Student ID above to view history</p>
          </div>
        )}
      </div>
    </>
  );
}

export default BorrowingHistory;