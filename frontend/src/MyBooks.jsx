import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .my-books-container {
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

  .books-table-container {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .books-table {
    width: 100%;
    border-collapse: collapse;
  }

  .books-table thead {
    background: rgba(99,102,241,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .books-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .books-table td {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
  }

  .books-table tbody tr:hover {
    background: rgba(99,102,241,0.05);
  }

  .book-title {
    font-family: 'Syne', sans-serif;
    font-weight: 600;
    color: #fff;
  }

  .date-cell {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
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

  .status-active {
    background: rgba(99,102,241,0.15);
    color: #a5b4fc;
    border: 1px solid rgba(99,102,241,0.3);
  }

  .status-returned {
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.3);
  }

  .status-overdue {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
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
    .books-table {
      font-size: 0.85rem;
    }

    .books-table th,
    .books-table td {
      padding: 0.8rem 1rem;
    }
  }
`;

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyBooks();
  }, []);

  const loadMyBooks = async () => {
    setLoading(true);
    setError("");
    try {
      // Get userID from localStorage or auth context
      const userID = localStorage.getItem('userID') || 1;
      const response = await axios.get(`http://localhost:5000/api/borrow/student/${userID}`);
      setBooks(response.data.books);
    } catch (err) {
      setError("Failed to load your books. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (book) => {
    if (book.ReturnDate) return "returned";
    const today = new Date();
    const dueDate = new Date(book.DueDate);
    return today > dueDate ? "overdue" : "active";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "returned":
        return "status-returned";
      case "overdue":
        return "status-overdue";
      default:
        return "status-active";
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="my-books-container">
        <div className="page-header">
          <h1>📖 My Books</h1>
          <p>View all your borrowed books and their due dates</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading your books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">You haven't borrowed any books yet.</div>
          </div>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const status = getStatus(book);
                  return (
                    <tr key={book.TransactionID}>
                      <td className="book-title">{book.Title}</td>
                      <td>{book.Authors || "Unknown"}</td>
                      <td className="date-cell">{book.ISBN}</td>
                      <td className="date-cell">{new Date(book.IssueDate).toLocaleDateString()}</td>
                      <td className="date-cell">{new Date(book.DueDate).toLocaleDateString()}</td>
                      <td className="date-cell">{book.ReturnDate ? new Date(book.ReturnDate).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default MyBooks;