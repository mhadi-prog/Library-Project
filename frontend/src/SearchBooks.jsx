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

  .book-icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .book-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
    line-height: 1.4;
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
`;

function SearchBooks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [genres, setGenres] = useState([]);

  // Load all books on component mount
  useEffect(() => {
    loadAllBooks();
  }, []);

  const loadAllBooks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data.books);
      
      // Extract unique genres
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
                <div className="book-icon">📚</div>
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
    </>
  );
}

export default SearchBooks;