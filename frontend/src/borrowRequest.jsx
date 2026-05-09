import { useState, useEffect } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .borrow-requests-container {
    padding: 2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
  }

  .page-header {
    margin-bottom: 2.5rem;
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

  .requests-table {
    width: 100%;
    border-collapse: collapse;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px;
    overflow: hidden;
  }

  .requests-table thead {
    background: rgba(255,255,255,0.05);
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .requests-table th {
    padding: 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .requests-table td {
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    font-size: 0.9rem;
    color: rgba(255,255,255,0.8);
  }

  .requests-table tbody tr:hover {
    background: rgba(99,102,241,0.08);
  }

  .request-badge {
    display: inline-block;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    font-size: 0.7rem;
    color: #a5b4fc;
    font-weight: 600;
    text-transform: uppercase;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .btn-small {
    padding: 0.5rem 0.8rem;
    border: none;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-approve {
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
    border: 1px solid rgba(16,185,129,0.3);
  }

  .btn-approve:hover {
    background: rgba(16,185,129,0.25);
  }

  .btn-reject {
    background: rgba(239,68,68,0.15);
    color: #fca5a5;
    border: 1px solid rgba(239,68,68,0.3);
  }

  .btn-reject:hover {
    background: rgba(239,68,68,0.25);
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    background: rgba(255,255,255,0.02);
    border: 1.5px dashed rgba(255,255,255,0.1);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-text {
    color: rgba(255,255,255,0.4);
    font-size: 0.95rem;
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
    margin-bottom: 1.5rem;
  }

  /* MODAL */
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

  .detail-row {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
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
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
    display: block;
  }

  .form-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 10px;
    padding: 0.7rem 1rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
  }

  .modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
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
`;

function BorrowRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueError, setIssueError] = useState("");
  const [issueMessage, setIssueMessage] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("http://localhost:5000/api/borrow-request/pending");
      setRequests(response.data.requests);
    } catch (err) {
      setError("Failed to load borrow requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setIssueDate("");
    setDueDate("");
    setIssueError("");
    setIssueMessage("");
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();

    if (!issueDate || !dueDate) {
      setIssueError("Please fill in all fields");
      return;
    }

    if (new Date(issueDate) >= new Date(dueDate)) {
      setIssueError("Due date must be after issue date");
      return;
    }

    setIssueLoading(true);
    setIssueError("");

    try {
      await axios.post("http://localhost:5000/api/borrow-request/issue", {
        transactionID: selectedRequest.TransactionID,
        issueDate: issueDate,
        dueDate: dueDate
      });

      setIssueMessage("✓ Book issued successfully!");
      setTimeout(() => {
        setShowModal(false);
        loadRequests();
      }, 1500);
    } catch (err) {
      setIssueError(err.response?.data?.message || "Failed to issue book");
      console.error(err);
    } finally {
      setIssueLoading(false);
    }
  };

  const handleReject = async (transactionID) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;

    try {
      await axios.post("http://localhost:5000/api/borrow-request/reject", {
        transactionID: transactionID
      });
      loadRequests();
    } catch (err) {
      setError("Failed to reject request");
      console.error(err);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="borrow-requests-container">
        <div className="page-header">
          <h1>📋 Borrow Requests</h1>
          <p>Review and approve student borrow requests</p>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No pending borrow requests</div>
          </div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Email</th>
                <th>Book Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.TransactionID}>
                  <td>{request.UserName}</td>
                  <td>{request.Email}</td>
                  <td>{request.Title}</td>
                  <td>
                    <span className="request-badge">{request.Status}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-small btn-approve"
                        onClick={() => handleApprove(request)}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn-small btn-reject"
                        onClick={() => handleReject(request.TransactionID)}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ISSUE BOOK MODAL */}
      <div className={`modal-overlay ${showModal ? 'active' : ''}`} onClick={() => setShowModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">📖 Issue Book</div>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
          </div>

          {selectedRequest && (
            <>
              <div className="detail-row">
                <div className="detail-label">Student</div>
                <div className="detail-value">{selectedRequest.UserName}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Email</div>
                <div className="detail-value">{selectedRequest.Email}</div>
              </div>

              <div className="detail-row">
                <div className="detail-label">Book</div>
                <div className="detail-value">{selectedRequest.Title}</div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '1.5rem 0' }} />

              {issueMessage && <div className="success-message">{issueMessage}</div>}
              {issueError && <div className="warning-message">⚠️ {issueError}</div>}

              <form onSubmit={handleIssueBook}>
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    disabled={issueLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={issueLoading}
                  />
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={issueLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={issueLoading}
                  >
                    {issueLoading ? "Processing..." : "Issue Book"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default BorrowRequests;