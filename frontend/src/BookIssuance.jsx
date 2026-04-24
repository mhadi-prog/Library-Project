import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .book-issuance-container {
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
    margin-bottom: 2rem;
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

  .form-input, .form-select {
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

  .form-input::placeholder, .form-select::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .form-input:focus, .form-select:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
  }

  .form-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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

  .cancel-btn {
    background: rgba(255,255,255,0.05);
    border: 1.5px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.6);
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

  .transactions-table-container {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(20px);
  }

  .transactions-table {
    width: 100%;
    border-collapse: collapse;
  }

  .transactions-table thead {
    background: rgba(99,102,241,0.1);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .transactions-table th {
    padding: 1rem 1.5rem;
    text-align: left;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .transactions-table td {
    padding: 1.2rem 1.5rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
  }

  .transactions-table tbody tr:hover {
    background: rgba(99,102,241,0.05);
  }

  .return-btn {
    padding: 0.4rem 0.8rem;
    background: rgba(16,185,129,0.2);
    border: 1px solid rgba(16,185,129,0.3);
    border-radius: 8px;
    color: #6ee7b7;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .return-btn:hover {
    background: rgba(16,185,129,0.3);
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: rgba(255,255,255,0.5);
  }
`;

function BookIssuance() {
  const [formData, setFormData] = useState({
    userID: "",
    bookID: "",
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: ""
  });

  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadBooks();
    loadStudents();
  }, []);

  const loadBooks = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/books");
      setBooks(response.data.books.filter(b => b.AvailableCopies > 0));
    } catch (err) {
      console.error("Failed to load books", err);
    }
  };

  const loadStudents = async () => {
    try {
      // You'll need to create an endpoint to get all students
      // For now, using mock data - replace with actual API call
      setStudents([
        { UserID: 1, Name: "Ali Khan", Email: "ali@lms.com" },
        { UserID: 2, Name: "Sara Ahmed", Email: "sara@lms.com" },
        { UserID: 3, Name: "Usman Tariq", Email: "usman@lms.com" }
      ]);
    } catch (err) {
      console.error("Failed to load students", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!formData.userID || !formData.bookID || !formData.issueDate || !formData.dueDate) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/borrow/issue", formData);
      setSuccess("Book issued successfully!");
      setFormData({
        userID: "",
        bookID: "",
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: ""
      });
      loadBooks();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to issue book";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="book-issuance-container">
        <div className="page-header">
          <h1>📤 Book Issuance</h1>
          <p>Issue books to students and track borrowing</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {success && <div className="success-message">✓ {success}</div>}

        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select
                  className="form-input"
                  name="userID"
                  value={formData.userID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map(student => (
                    <option key={student.UserID} value={student.UserID}>
                      {student.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Book *</label>
                <select
                  className="form-input"
                  name="bookID"
                  value={formData.bookID}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a book</option>
                  {books.map(book => (
                    <option key={book.BookID} value={book.BookID}>
                      {book.Title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input
                  type="date"
                  className="form-input"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading && <span className="spinner"></span>}
                {loading ? "Issuing Book..." : "Issue Book"}
              </button>
              <button type="button" className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BookIssuance;