import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .add-book-container {
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

  .form-container {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    max-width: 700px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
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
    letter-spacing: 0.08em;
  }

  .form-input, .form-textarea {
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: all 0.2s ease;
  }

  .form-input::placeholder, .form-textarea::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .form-input:focus, .form-textarea:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
  }

  .form-textarea {
    resize: vertical;
    min-height: 80px;
    grid-column: 1 / -1;
  }

  .form-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .submit-btn, .cancel-btn {
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
  }

  .submit-btn {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #fff;
  }

  .submit-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-btn {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
  }

  .cancel-btn:hover {
    background: rgba(255,255,255,0.08);
    color: #fff;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 8px;
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
    margin-bottom: 1.5rem;
  }

  .success-message {
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 12px;
    padding: 1rem;
    color: #6ee7b7;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .form-container {
      padding: 1.5rem;
    }

    .form-buttons {
      flex-direction: column;
    }
  }
`;

function AddBook() {
  const [formData, setFormData] = useState({
    title: "",
    isbn: "",
    genre: "",
    publisher: "",
    edition: "1st",
    publicationYear: new Date().getFullYear(),
    totalCopies: 1,
    shelfLocation: "A1",
    authors: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'totalCopies' || name === 'publicationYear' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const authorArray = formData.authors
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const submitData = {
        ...formData,
        authors: authorArray
      };

      const response = await axios.post("http://localhost:5000/api/books", submitData);
      
      setSuccess("Book added successfully!");
      setFormData({
        title: "",
        isbn: "",
        genre: "",
        publisher: "",
        edition: "1st",
        publicationYear: new Date().getFullYear(),
        totalCopies: 1,
        shelfLocation: "A1",
        authors: ""
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to add book. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="add-book-container">
        <div className="page-header">
          <h1>➕ Add New Book</h1>
          <p>Register a new book in the library system</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {success && <div className="success-message">✓ {success}</div>}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Book Title *</label>
                <input
                  type="text"
                  className="form-input"
                  name="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">ISBN *</label>
                <input
                  type="text"
                  className="form-input"
                  name="isbn"
                  placeholder="978-0-123456-78-9"
                  value={formData.isbn}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Genre *</label>
                <input
                  type="text"
                  className="form-input"
                  name="genre"
                  placeholder="e.g., Fiction, Science"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Publisher *</label>
                <input
                  type="text"
                  className="form-input"
                  name="publisher"
                  placeholder="Publisher name"
                  value={formData.publisher}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Edition</label>
                <input
                  type="text"
                  className="form-input"
                  name="edition"
                  placeholder="1st, 2nd, etc."
                  value={formData.edition}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Publication Year</label>
                <input
                  type="number"
                  className="form-input"
                  name="publicationYear"
                  value={formData.publicationYear}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Copies *</label>
                <input
                  type="number"
                  className="form-input"
                  name="totalCopies"
                  min="1"
                  value={formData.totalCopies}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shelf Location</label>
                <input
                  type="text"
                  className="form-input"
                  name="shelfLocation"
                  placeholder="A1, B2, etc."
                  value={formData.shelfLocation}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Authors</label>
                <input
                  type="text"
                  className="form-input"
                  name="authors"
                  placeholder="Separate multiple authors with commas"
                  value={formData.authors}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Adding Book..." : "Add Book"}
              </button>
              <button type="button" className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AddBook;