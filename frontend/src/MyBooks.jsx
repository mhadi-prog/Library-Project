import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  .my-books-container { padding: 2rem; background: #0a0a0f; min-height: 100vh; font-family: 'DM Sans', sans-serif; }
  .page-header h1 { font-family: 'Syne', sans-serif; font-size: 2rem; font-weight: 800; color: #fff; margin-bottom: 0.5rem; }
  .books-table-container { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; backdrop-filter: blur(20px); }
  .books-table { width: 100%; border-collapse: collapse; }
  .books-table th { padding: 1rem; text-align: left; color: #a5b4fc; background: rgba(99,102,241,0.1); font-size: 0.85rem; text-transform: uppercase; }
  .books-table td { padding: 1.2rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); font-size: 0.9rem; }
  .status-badge { padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
  .status-active { background: rgba(99,102,241,0.15); color: #a5b4fc; }
  .status-returned { background: rgba(16,185,129,0.15); color: #6ee7b7; }
  .status-overdue { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .days-left { display: block; font-size: 0.7rem; margin-top: 5px; opacity: 0.6; }
`;

function MyBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userID = localStorage.getItem('userID') || 1;
        const res = await axios.get(`http://localhost:5000/api/borrow/student/${userID}`);
        setBooks(res.data.books);
      } catch (err) { console.error("Error loading books"); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const getStatusInfo = (book) => {
    if (book.ReturnDate) return { label: "Returned", class: "status-returned" };
    const diff = new Date(book.DueDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Overdue", class: "status-overdue", sub: "Return immediately" };
    return { label: "Active", class: "status-active", sub: `${days} days left` };
  };

  return (
    <>
      <style>{styles}</style>
      <div className="my-books-container">
        <div className="page-header"><h1>📖 My Books</h1><p>Deadlines and History</p></div>
        <div className="books-table-container">
          <table className="books-table">
            <thead>
              <tr><th>Title</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {books.map((book) => {
                const status = getStatusInfo(book);
                return (
                  <tr key={book.TransactionID}>
                    <td style={{color: '#fff', fontWeight: '600'}}>{book.Title}</td>
                    <td>{new Date(book.IssueDate).toLocaleDateString()}</td>
                    <td>{new Date(book.DueDate).toLocaleDateString()}</td>
                    <td>{book.ReturnDate ? new Date(book.ReturnDate).toLocaleDateString() : "—"}</td>
                    <td>
                      <span className={`status-badge ${status.class}`}>{status.label}</span>
                      {status.sub && <span className="days-left">{status.sub}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default MyBooks;