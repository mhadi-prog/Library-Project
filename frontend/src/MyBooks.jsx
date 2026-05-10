import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  .my-books-container { padding: 2rem; background: #0a0a0f; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
  .page-header h1 { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
  .page-header p { color: rgba(255,255,255,0.4); margin-bottom: 2rem; }
  .books-table-container { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; backdrop-filter: blur(20px); }
  .books-table { width: 100%; border-collapse: collapse; }
  .books-table th { padding: 1rem; text-align: left; color: #a5b4fc; background: rgba(99,102,241,0.1); font-size: 0.85rem; text-transform: uppercase; }
  .books-table td { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); font-size: 0.9rem; }
  .status-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
  .status-active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
  .status-returned { background: rgba(16,185,129,0.15); color: #6ee7b7; }
  .status-overdue { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .days-left { display: block; font-size: 0.7rem; margin-top: 5px; opacity: 0.6; }
  
  .return-btn { 
    background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
    color: white; 
    border: none; 
    padding: 0.5rem 1rem; 
    border-radius: 8px; 
    font-weight: 700; 
    cursor: pointer; 
    font-size: 0.8rem;
    transition: all 0.2s ease;
  }
  .return-btn:hover { opacity: 0.9; transform: translateY(-2px); }
  .return-btn:disabled { opacity: 0.5; cursor: not-allowed; }

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
    max-width: 500px;
    width: 100%;
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
    font-size: 1.3rem;
    font-weight: 700;
    color: #fff;
  }

  .modal-close {
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s;
    padding: 0;
  }

  .modal-close:hover {
    color: #fff;
  }

  .modal-body {
    margin-bottom: 1.5rem;
  }

  .detail-row {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .detail-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .detail-value {
    font-size: 0.95rem;
    color: #fff;
    font-weight: 600;
  }

  .info-box {
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .info-box p {
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
  }

  .warning-box {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .warning-box p {
    color: #fca5a5;
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
  }

  .btn {
    flex: 1;
    padding: 0.8rem;
    border: none;
    border-radius: 10px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: rgba(255,255,255,0.08);
    border: 1.5px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.7);
  }

  .btn-secondary:hover:not(:disabled) {
    background: rgba(255,255,255,0.12);
    color: #fff;
  }

  .success-message {
    background: rgba(16,185,129,0.15);
    border: 1px solid rgba(16,185,129,0.3);
    border-radius: 10px;
    padding: 0.8rem;
    color: #6ee7b7;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .error-message {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 0.8rem;
    color: #fca5a5;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
`;

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnMessage, setReturnMessage] = useState("");
  const [returnError, setReturnError] = useState("");

  const userID = localStorage.getItem('userID');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const id = userID || 1;
      const res = await axios.get(`http://localhost:5000/api/borrow/student/${id}`);
      setBooks(res.data.books || []);
    } catch (err) {
      console.error("Error loading books:", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (book) => {
    if (book.ReturnDate) return { label: "Returned", class: "status-returned" };
    const diff = new Date(book.DueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Overdue", class: "status-overdue", sub: "Return immediately" };
    return { label: "Active", class: "status-active", sub: `${days} days left` };
  };

  const handleReturnClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    setReturnMessage("");
    setReturnError("");
  };

  const handleConfirmReturn = async () => {
    if (!selectedBook) return;

    setReturnLoading(true);
    setReturnError("");
    setReturnMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/borrow-request/return", {
        transactionID: selectedBook.TransactionID,
        returnDate: new Date().toISOString()
      });

      setReturnMessage("✓ Book returned successfully! Fines will be calculated automatically.");
      setTimeout(() => {
        setShowModal(false);
        loadBooks(); // Refresh the books list
      }, 2000);
    } catch (err) {
      setReturnError(err.response?.data?.message || "Failed to return book");
      console.error("Return error:", err);
    } finally {
      setReturnLoading(false);
    }
  };

  const isOverdue = (book) => {
    if (book.ReturnDate) return false;
    return new Date(book.DueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="my-books-container">
        <div className="page-header"><h1>📖 My Books</h1></div>
        <p style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', paddingTop: '2rem' }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="my-books-container">
        <div className="page-header">
          <h1>📖 My Books</h1>
          <p>Manage your borrowed books and deadlines</p>
        </div>

        {books.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.4)' }}>
            <p style={{ fontSize: '1.1rem' }}>📚 No borrowed books at the moment</p>
          </div>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => {
                  const status = getStatusInfo(book);
                  const isReturned = book.ReturnDate;

                  return (
                    <tr key={book.TransactionID}>
                      <td style={{ color: '#fff', fontWeight: '600' }}>{book.Title}</td>
                      <td>{new Date(book.IssueDate).toLocaleDateString()}</td>
                      <td>{new Date(book.DueDate).toLocaleDateString()}</td>
                      <td>{isReturned ? new Date(book.ReturnDate).toLocaleDateString() : "—"}</td>
                      <td>
                        <span className={`status-badge ${status.class}`}>{status.label}</span>
                        {status.sub && <span className="days-left">{status.sub}</span>}
                      </td>
                      <td>
                        {!isReturned && (
                          <button 
                            className="return-btn"
                            onClick={() => handleReturnClick(book)}
                          >
                            Return Book
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RETURN CONFIRMATION MODAL */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">📤 Return Book</div>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>

          {selectedBook && (
            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-label">Book Title</div>
                <div className="detail-value">{selectedBook.Title}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Due Date</div>
                <div className="detail-value">{new Date(selectedBook.DueDate).toLocaleDateString()}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Return Date</div>
                <div className="detail-value">{new Date().toLocaleDateString()}</div>
              </div>

              {isOverdue(selectedBook) ? (
                <div className="warning-box">
                  <p>⚠️ This book is overdue. A fine will be calculated based on the number of days late.</p>
                </div>
              ) : (
                <div className="info-box">
                  <p>✓ Book is being returned on time. No fines will be charged.</p>
                </div>
              )}

              {returnMessage && <div className="success-message">{returnMessage}</div>}
              {returnError && <div className="error-message">{returnError}</div>}

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={returnLoading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleConfirmReturn}
                  disabled={returnLoading}
                >
                  {returnLoading ? "Processing..." : "Confirm Return"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyBooks;