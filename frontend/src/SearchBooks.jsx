import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .search-books-container {
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
    margin-bottom: 1.5rem;
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

  .filter-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .filter-select {
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 0.7rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    outline: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .filter-select option {
  background: #111827;
  color: #ffffff;
}

  .filter-select:focus,
  .filter-select:hover {
    border-color: rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.05);
  }

  .books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .book-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 1.5rem;
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    cursor: pointer;
    position: relative;
    height: 100%;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .book-card:hover {
    border-color: rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.05);
    transform: translateY(-4px);
  }

  .book-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: relative;
    gap: 1rem;
  }

  .book-menu-btn {
    background: none;
    border: none;
    color: rgba(255,255,255,0.5);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s;
    z-index: 50;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .book-menu-btn:hover {
    color: rgba(255,255,255,0.8);
  }

  .book-menu {
    position: absolute;
    top: 2rem;
    right: 0;
    background: rgba(0,0,0,0.9);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    overflow: hidden;
    z-index: 100;
    min-width: 140px;
  }

  .menu-item {
    padding: 0.5rem 0.8rem;
    color: rgba(255,255,255,0.7);
    cursor: pointer;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.75rem;
    white-space: nowrap;
    transition: all 0.2s ease;
  }

  .menu-item:last-child {
    border-bottom: none;
  }

  .menu-item:hover {
    background: rgba(99,102,241,0.3);
    color: #a5b4fc;
  }

  .book-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    flex-shrink: 0;
  }

  .book-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
    line-height: 1.4;
    flex: 1;
  }

  .book-author {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.5);
  }

  .book-isbn {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    font-family: 'Courier New', monospace;
  }

  .book-genre {
    display: inline-block;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 20px;
    padding: 0.35rem 0.8rem;
    font-size: 0.7rem;
    color: #a5b4fc;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .book-details {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.07);
  }

  .book-detail-item {
    color: rgba(255,255,255,0.5);
  }

  .availability {
    padding: 0.6rem 1rem;
    border-radius: 10px;
    text-align: center;
    font-weight: 600;
    font-size: 0.85rem;
    margin-top: auto;
  }

  .available {
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.3);
  }

  .unavailable {
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

  .error-message {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 1rem;
    color: #fca5a5;
    font-size: 0.9rem;
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
    animation: fadeIn 0.3s ease;
    padding: 1rem;
  }

  .modal-overlay.active {
    display: flex;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: rgba(10, 10, 15, 0.95);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 2rem;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    backdrop-filter: blur(20px);
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
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

  .detail-row:last-of-type {
    border-bottom: none;
  }

  .detail-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .detail-value {
    font-size: 0.95rem;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 600;
  }

  .borrow-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-input {
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 0.7rem 1rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: all 0.2s ease;
  }

  .form-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
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
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
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

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

  .warning-message {
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: 10px;
    padding: 0.8rem;
    color: #fca5a5;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .info-box {
    padding: 1rem;
    background: rgba(99,102,241,0.08);
    border-radius: 10px;
    margin-bottom: 1rem;
  }

  .info-box p {
    color: rgba(255,255,255,0.7);
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }
`;

function SearchBooks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [genres, setGenres] = useState([]);
  
  // Modal states
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("details");
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowMessage, setBorrowMessage] = useState("");
  const [borrowError, setBorrowError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const userID = localStorage.getItem('userID');

  useEffect(() => {
    loadAllBooks();
  }, []);

  const loadAllBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data.books);
      const uniqueGenres = [...new Set(response.data.books.map(b => b.Genre))];
      setGenres(uniqueGenres);
    } catch (err) {
      setError("Failed to load books. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadAllBooks();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:5000/api/books/search?searchTerm=${searchTerm}`);
      setBooks(response.data.books);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    setModalMode("details");
    setBorrowMessage("");
    setBorrowError("");
    setOpenMenuId(null);
  };

  const handleBorrowClick = (book) => {
    setSelectedBook(book);
    setShowModal(true);
    setModalMode("borrow");
    setBorrowMessage("");
    setBorrowError("");
    setOpenMenuId(null);
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    
    setBorrowLoading(true);
    setBorrowError("");
    setBorrowMessage("");

    try {
      await axios.post("http://localhost:5000/api/borrow-request/request", {
        userID: parseInt(userID),
        bookID: selectedBook.BookID
      });

      setBorrowMessage("✓ Borrow request sent! Admin will review it shortly.");
      setTimeout(() => {
        setShowModal(false);
        loadAllBooks();
      }, 2000);
    } catch (err) {
      setBorrowError(err.response?.data?.message || "Failed to send request");
      console.error(err);
    } finally {
      setBorrowLoading(false);
    }
  };

  const filteredBooks = genreFilter 
    ? books.filter(book => book.Genre === genreFilter)
    : books;

  return (
    <>
      <style>{styles}</style>
      <div className="search-books-container">
        <div className="page-header">
          <h1>🔍 Search Books</h1>
          <p>Explore our library catalog and find your next read</p>
        </div>

        <div className="search-section">
          <form onSubmit={handleSearch} className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, author, ISBN, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-btn">Search</button>
          </form>

          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">Genre</label>
              <select 
                className="filter-select"
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No books found. Try a different search.</div>
          </div>
        ) : (
          <div className="books-grid">
            {filteredBooks.map((book) => (
              <div key={book.BookID} className="book-card">
                <div className="book-card-header">
                  <div className="book-icon">📚</div>
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="book-menu-btn"
                      onClick={() => setOpenMenuId(openMenuId === book.BookID ? null : book.BookID)}
                    >
                      ⋮
                    </button>
                    {openMenuId === book.BookID && (
                      <div className="book-menu">
                        <div className="menu-item" onClick={() => handleViewDetails(book)}>
                          👁️ Details
                        </div>
                        {book.AvailableCopies > 0 && (
                          <div className="menu-item" onClick={() => handleBorrowClick(book)}>
                            📤 Borrow
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="book-title">{book.Title}</div>
                {book.Authors && <div className="book-author">by {book.Authors}</div>}
                <div className="book-isbn">ISBN: {book.ISBN}</div>
                <span className="book-genre">{book.Genre}</span>
                <div className="book-details">
                  <span className="book-detail-item">📅 {book.PublicationYear}</span>
                  <span className="book-detail-item">🏢 {book.Publisher}</span>
                </div>
                <div className={`availability ${book.AvailableCopies > 0 ? 'available' : 'unavailable'}`}>
                  {book.AvailableCopies > 0 
                    ? `${book.AvailableCopies} Available` 
                    : 'Out of Stock'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              {modalMode === "details" ? "📖 Book Details" : "📤 Borrow Book"}
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>

          {selectedBook && modalMode === "details" && (
            <>
              <div className="modal-body">
                <div className="detail-row">
                  <div className="detail-label">Title</div>
                  <div className="detail-value">{selectedBook.Title}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Authors</div>
                  <div className="detail-value">{selectedBook.Authors || "Unknown"}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">ISBN</div>
                  <div className="detail-value">{selectedBook.ISBN}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Genre</div>
                  <div className="detail-value">{selectedBook.Genre}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Publisher</div>
                  <div className="detail-value">{selectedBook.Publisher}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Publication Year</div>
                  <div className="detail-value">{selectedBook.PublicationYear}</div>
                </div>

                <div className="detail-row">
                  <div className="detail-label">Available Copies</div>
                  <div className="detail-value">{selectedBook.AvailableCopies} / {selectedBook.TotalCopies}</div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                {selectedBook.AvailableCopies > 0 && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => setModalMode("borrow")}
                  >
                    Borrow Book
                  </button>
                )}
              </div>
            </>
          )}

          {selectedBook && modalMode === "borrow" && (
            <>
              <div className="modal-body">
                <div className="detail-row">
                  <div className="detail-label">Book Title</div>
                  <div className="detail-value">{selectedBook.Title}</div>
                </div>

                {borrowMessage && <div className="success-message">{borrowMessage}</div>}
                {borrowError && <div className="warning-message">⚠️ {borrowError}</div>}

                <div className="info-box">
                  <p>Your request will be sent to the admin for approval. The admin will set the due date based on the book's lending policy.</p>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setModalMode("details")}
                    disabled={borrowLoading}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={handleBorrow}
                    disabled={borrowLoading}
                  >
                    {borrowLoading ? "Sending..." : "Send Request"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default SearchBooks;