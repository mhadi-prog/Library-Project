import { useState } from "react";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .change-password-container {
    padding: 2rem;
    background: #0a0a0f;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .form-wrapper {
    width: 100%;
    max-width: 500px;
  }

  .page-header {
    margin-bottom: 2rem;
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .page-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
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
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .form-label {
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .form-input {
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

  .form-input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .form-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
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

  .password-requirement {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.3);
    margin-top: 0.3rem;
  }

  .requirement-met {
    color: #6ee7b7;
  }
`;

function ChangePassword() {
  const [formData, setFormData] = useState({
    userID: localStorage.getItem('userID') || 1,
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setError("New password must be at least 8 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.oldPassword === formData.newPassword) {
      setError("New password must be different from old password");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:5000/api/user/change-password", {
        userID: formData.userID,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      setSuccess("Password changed successfully!");
      setFormData({
        userID: formData.userID,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to change password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.newPassword.length >= 8 ? "strong" : "weak";

  return (
    <>
      <style>{styles}</style>
      <div className="change-password-container">
        <div className="form-wrapper">
          <div className="page-header">
            <h1>🔐 Change Password</h1>
            <p>Update your account password for security</p>
          </div>

          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Current Password *</label>
                <input
                  type="password"
                  className="form-input"
                  name="oldPassword"
                  placeholder="Enter your current password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password *</label>
                <input
                  type="password"
                  className="form-input"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <div className="password-requirement">
                  {formData.newPassword.length >= 8 ? (
                    <span className="requirement-met">✓ At least 8 characters</span>
                  ) : (
                    <span>⊘ At least 8 characters</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  className="form-input"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                  <div className="password-requirement requirement-met">✓ Passwords match</div>
                )}
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading && <span className="spinner"></span>}
                  {loading ? "Changing..." : "Change Password"}
                </button>
                <button type="button" className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;