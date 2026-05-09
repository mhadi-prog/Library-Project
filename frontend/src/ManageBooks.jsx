import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .manage-books-container {
    padding: 1.2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .page-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 800;
    color: #fff;
  }

  /* .add-btn class removed as it is no longer used */

  .books-table-container {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow-x: auto;
  }

  .books-table {
    width: 100%;
    border-collapse: collapse;
  }

  .books-table thead {
    background: rgba(99,102,241,0.1);
  }

  .books-table th {
    padding: 0.7rem 0.9rem;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-size: 0.75rem;
    color: #a5b4fc;
  }

  .books-table td {
    padding: 0.7rem 0.9rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.75);
    font-size: 0.8rem;
  }

  .books-table tbody tr:hover {
    background: rgba(99,102,241,0.05);
  }

  .book-title {
    color: #fff;
    font-weight: 600;
  }

  .action-btns {
    display: flex;
    gap: 0.4rem;
  }

  .edit-btn,
  .delete-btn,
  .save-btn,
  .cancel-btn {
    padding: 0.3rem 0.6rem;
    border-radius: 7px;
    border: none;
    cursor: pointer;
    font-size: 0.72rem;
    font-weight: 600;
  }

  .edit-btn {
    background: rgba(99,102,241,0.2);
    color: #a5b4fc;
  }

  .delete-btn {
    background: rgba(239,68,68,0.2);
    color: #fca5a5;
  }

  .save-btn {
    background: rgba(16,185,129,0.2);
    color: #6ee7b7;
  }

  .cancel-btn {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .edit-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 6px;
    padding: 0.4rem;
    color: #fff;
    font-size: 0.8rem;
  }

  .loading,
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: rgba(255,255,255,0.5);
  }

  .error-message {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 1rem;
    color: #fca5a5;
    margin-bottom: 1rem;
  }
`;

function ManageBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingBook, setEditingBook] = useState(null);

  const [editForm, setEditForm] = useState({
    Title: "",
    ISBN: "",
    Genre: "",
    TotalCopies: "",
    AvailableCopies: "",
    Publisher: ""
  });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data.books);
    } catch (err) {
      setError("Failed to load books.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookID) => {
    if (!window.confirm("Delete this book?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/books/${bookID}`);
      alert("Book deleted successfully!");
      loadBooks();
    } catch (err) {
      alert("Failed to delete book.");
      console.error(err);
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book.BookID);
    setEditForm({
      Title: book.Title,
      ISBN: book.ISBN,
      Genre: book.Genre,
      TotalCopies: book.TotalCopies,
      AvailableCopies: book.AvailableCopies,
      Publisher: book.Publisher
    });
  };

  const handleUpdate = async (bookID) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${bookID}`, editForm);
      alert("Book updated successfully!");
      setEditingBook(null);
      loadBooks();
    } catch (err) {
      alert("Failed to update book.");
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
          </div>
          {/* Add New Book button removed from here */}
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading ? (
          <div className="loading">
            Loading books...
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            No books available.
          </div>
        ) : (
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>ISBN</th>
                  <th>Genre</th>
                  <th>Total</th>
                  <th>Available</th>
                  <th>Publisher</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {books.map((book) => (
                  <tr key={book.BookID}>
                    <td>
                      {editingBook === book.BookID ? (
                        <input
                          className="edit-input"
                          value={editForm.Title}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              Title: e.target.value
                            })
                          }
                        />
                      ) : (
                        <span className="book-title">
                          {book.Title}
                        </span>
                      )}
                    </td>

                    <td>
                      {editingBook === book.BookID ? (
                        <input
                          className="edit-input"
                          value={editForm.ISBN}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              ISBN: e.target.value
                            })
                          }
                        />
                      ) : (
                        book.ISBN
                      )}
                    </td>

                    <td>{book.Genre}</td>
                    <td>{book.TotalCopies}</td>
                    <td>{book.AvailableCopies}</td>
                    <td>{book.Publisher}</td>

                    <td>
                      <div className="action-btns">
                        {editingBook === book.BookID ? (
                          <>
                            <button
                              className="save-btn"
                              onClick={() => handleUpdate(book.BookID)}
                            >
                              Save
                            </button>

                            <button
                              className="cancel-btn"
                              onClick={() => setEditingBook(null)}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="edit-btn"
                              onClick={() => handleEdit(book)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() => handleDelete(book.BookID)}
                            >
                              Delete
                            </button>
                          </>
                        )}
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