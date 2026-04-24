import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .manage-books-container {
    padding: 2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .page-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.03em;
  }

  .add-btn {
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

  .add-btn:hover {
    opacity: 0.9;
    transform: translateY(-2px);
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

  .action-btns {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn, .delete-btn {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 8px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .edit-btn {
    background: rgba(99,102,241,0.2);
    border: 1px solid rgba(99,102,241,0.3);
    color: #a5b4fc;
  }

  .edit-btn:hover {
    background: rgba(99,102,241,0.3);
  }

  .delete-btn {
    background: rgba(239,68,68,0.2);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
  }

  .delete-btn:hover {
    background: rgba(239,68,68,0.3);
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
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .books-table {
      font-size: 0.85rem;
    }

    .books-table th,
    .books-table td {
      padding: 0.8rem 1rem;
    }

    .action-btns {
      flex-direction: column;
    }
  }
`;

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data.books);
    } catch (err) {
      setError("Failed to load books. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookID) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/books/${bookID}`);
      alert("Book deleted successfully!");
      loadBooks();
    } catch (err) {
      alert("Failed to delete book.");
      console.error(err);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="manage-books-container">
        <div className="page-header">
          <div>
            <h1>📚 Manage Books</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>View, edit, and delete books from the library</p>
          </div>
          <button className="add-btn">➕ Add New Book</button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No books in the library yet.</div>
          </div>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>ISBN</th>
                  <th>Genre</th>
                  <th>Total Copies</th>
                  <th>Available</th>
                  <th>Publisher</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.BookID}>
                    <td className="book-title">{book.Title}</td>
                    <td>{book.ISBN}</td>
                    <td>{book.Genre}</td>
                    <td>{book.TotalCopies}</td>
                    <td>{book.AvailableCopies}</td>
                    <td>{book.Publisher}</td>
                    <td>
                      <div className="action-btns">
                        <button className="edit-btn">Edit</button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(book.BookID)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default ManageBooks;