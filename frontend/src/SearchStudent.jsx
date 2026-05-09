import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .search-student-container {
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

  .search-section {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    margin-bottom: 2rem;
  }

  .search-wrapper {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .search-input {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 0.85rem 1.2rem;
    font-size: 0.9rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s ease;
  }

  .search-input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .search-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
  }

  .search-btn {
    padding: 0.85rem 1.5rem;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border: none;
    border-radius: 12px;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .search-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  .students-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .student-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.5rem;
    backdrop-filter: blur(20px);
    transition: all 0.3s ease;
    animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .student-card:hover {
    border-color: rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.05);
    transform: translateY(-4px);
  }

  .student-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .student-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .student-info {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.6);
    margin-bottom: 1rem;
  }

  .student-info-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    padding: 0.7rem;
    background: rgba(99,102,241,0.15);
    border: 1.5px solid rgba(99,102,241,0.3);
    border-radius: 10px;
    color: #a5b4fc;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(99,102,241,0.2);
    border-color: rgba(99,102,241,0.5);
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

  /* MODAL STYLES */
  .modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .modal-overlay.active {
    display: flex;
  }

  .modal-content {
    background: rgba(10, 10, 15, 0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 2rem;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    backdrop-filter: blur(20px);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding-bottom: 1rem;
  }

  .modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
  }

  .modal-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
  }

  .modal-close:hover {
    color: #fff;
  }

  .history-table {
    width: 100%;
    border-collapse: collapse;
  }

  .history-table thead {
    background: rgba(255,255,255,0.05);
  }

  .history-table th {
    padding: 0.8rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .history-table td {
    padding: 0.8rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    font-size: 0.85rem;
    color: rgba(255,255,255,0.8);
  }

  .status-badge {
    display: inline-block;
    border-radius: 4px;
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .status-active {
    background: rgba(99,102,241,0.15);
    color: #a5b4fc;
  }

  .status-returned {
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
  }

  .status-overdue {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
  }

  .modal-loading {
    text-align: center;
    padding: 2rem;
    color: rgba(255,255,255,0.5);
  }

  .modal-empty {
    text-align: center;
    padding: 2rem;
    color: rgba(255,255,255,0.4);
  }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-item {
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 8px;
    padding: 0.8rem;
    text-align: center;
  }

  .stat-label {
    font-size: 0.7rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #a5b4fc;
  }
`;

function SearchStudent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyStats, setHistoryStats] = useState({
    total: 0,
    returned: 0,
    active: 0
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/search/students?searchTerm=${searchTerm}`
      );
      setStudents(response.data.students);
    } catch (err) {
      setError("Failed to search students. Please try again.");
      console.error(err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (student) => {
    setSelectedStudent(student);
    setShowModal(true);
    setHistory([]);
    setHistoryError("");
    setHistoryLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/user/history/${student.UserID}`
      );
      
      if (response.data.books && response.data.books.length > 0) {
        setHistory(response.data.books);
        calculateStats(response.data.books);
      } else {
        setHistory([]);
        setHistoryError("No borrowing history found");
      }
    } catch (err) {
      setHistoryError(err.response?.data?.message || "Failed to load history");
      setHistory([]);
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const calculateStats = (historyData) => {
    const total = historyData.length;
    const returned = historyData.filter(h => h.ReturnDate).length;
    const active = total - returned;

    setHistoryStats({
      total,
      returned,
      active
    });
  };

  const getStatusBadge = (record) => {
    if (record.ReturnDate) {
      return <span className="status-badge status-returned">Returned</span>;
    } else if (new Date(record.DueDate) < new Date()) {
      return <span className="status-badge status-overdue">Overdue</span>;
    } else {
      return <span className="status-badge status-active">Active</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="search-student-container">
        <div className="page-header">
          <h1>🔎 Search Student</h1>
          <p>Look up student details and borrowing history</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Searching students...</p>
          </div>
        ) : hasSearched && students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔭</div>
            <div className="empty-text">No students found matching your search.</div>
          </div>
        ) : hasSearched ? (
          <div className="students-grid">
            {students.map((student) => (
              <div key={student.UserID} className="student-card">
                <div className="student-icon">👤</div>
                <div className="student-name">{student.Name}</div>
                <div className="student-info">
                  <div className="student-info-item">
                    <span>📧</span>
                    <span>{student.Email}</span>
                  </div>
                  <div className="student-info-item">
                    <span>🏢</span>
                    <span>{student.Department || "N/A"}</span>
                  </div>
                  <div className="student-info-item">
                    <span>📅</span>
                    <span>Batch {student.BatchYear || "N/A"}</span>
                  </div>
                </div>
                <button 
                  className="action-btn"
                  onClick={() => handleViewHistory(student)}
                >
                  View History →
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* HISTORY MODAL */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <div className="modal-title">📚 Borrowing History</div>
              {selectedStudent && <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.3rem' }}>{selectedStudent.Name}</p>}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>

          {historyLoading ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : historyError ? (
            <div className="modal-empty">⚠️ {historyError}</div>
          ) : history.length === 0 ? (
            <div className="modal-empty">No borrowing history found</div>
          ) : (
            <>
              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-label">Total Borrowed</div>
                  <div className="stat-value">{historyStats.total}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Returned</div>
                  <div className="stat-value">{historyStats.returned}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Active</div>
                  <div className="stat-value">{historyStats.active}</div>
                </div>
              </div>

              <table className="history-table">
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Authors</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((record, index) => (
                    <tr key={index}>
                      <td>{record.Title}</td>
                      <td>{record.Authors || "Unknown"}</td>
                      <td>{formatDate(record.IssueDate)}</td>
                      <td>{formatDate(record.DueDate)}</td>
                      <td>{formatDate(record.ReturnDate)}</td>
                      <td>{getStatusBadge(record)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchStudent;