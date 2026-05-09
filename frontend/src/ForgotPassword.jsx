import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  .auth-root {
    min-height: 100vh;
    background: #0a0a0f;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 2rem 1rem;
    position: relative;
    overflow: hidden;
  }
  .auth-card {
    width: 100%;
    max-width: 440px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 24px;
    padding: 2.5rem;
    backdrop-filter: blur(20px);
    position: relative;
    z-index: 1;
  }
  .auth-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 2rem; }
  .auth-brand-dot { width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #10b981); }
  .auth-brand-name { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.1rem; color: #fff; }
  .auth-heading { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.75rem; color: #fff; margin-bottom: 0.35rem; }
  .auth-subtext { font-size: 0.875rem; color: rgba(255,255,255,0.4); margin-bottom: 2rem; }
  
  .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
  .role-option { position: relative; cursor: pointer; }
  .role-option input { position: absolute; opacity: 0; }
  .role-label {
    display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 1rem;
    border-radius: 14px; border: 1.5px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.02);
    transition: all 0.2s ease;
  }
  .role-option input:checked + .role-label { border-color: #6366f1; background: rgba(99,102,241,0.1); }
  .role-name { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.6); }

  .field-label { font-size: 0.72rem; font-weight: 500; color: rgba(255,255,255,0.4); text-transform: uppercase; margin-bottom: 6px; display: block; }
  .field-input {
    width: 100%; background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 0.8rem 1rem; font-size: 0.9rem; color: #fff; outline: none; margin-bottom: 1rem; box-sizing: border-box;
  }
  .auth-btn {
    width: 100%; padding: 0.9rem; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #fff;
    font-weight: 700; cursor: pointer; margin-top: 0.5rem; margin-bottom: 1.5rem;
  }
  .auth-error { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 0.7rem 1rem; color: #fca5a5; margin-bottom: 1rem; font-size: 0.82rem; }
  .auth-footer a { color: #a5b4fc; text-decoration: none; }
`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [batchYear, setBatchYear] = useState('');
  const [adminName, setAdminName] = useState(''); // NEW: For Admin verification
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userID, setUserID] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = { 
        email, 
        role, 
        department: role === 'Student' ? department : null, 
        batchYear: role === 'Student' ? batchYear : null,
        name: role === 'Admin' ? adminName : null 
      };
      
      const res = await axios.post('http://localhost:5000/api/auth/verify-identity', payload);
      setUserID(res.data.userID);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError('');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/reset-password', { userID, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-dot" />
            <span className="auth-brand-name">Booked</span>
          </div>

          {step === 1 && (
            <>
              <h1 className="auth-heading">Forgot Password</h1>
              <p className="auth-subtext">Verify your identity to reset.</p>
              
              <div className="role-selector">
                {['Student', 'Admin'].map(r => (
                  <label className="role-option" key={r}>
                    <input type="radio" checked={role === r} onChange={() => setRole(r)} />
                    <span className="role-label">
                        <span className="role-name">{r}</span>
                    </span>
                  </label>
                ))}
              </div>

              {error && <div className="auth-error">{error}</div>}

              <label className="field-label">Email</label>
              <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />

              {role === 'Student' ? (
                <>
                  <label className="field-label">Department</label>
                  <input className="field-input" type="text" value={department} onChange={e => setDepartment(e.target.value)} placeholder="Computer Science" />
                  <label className="field-label">Batch Year</label>
                  <input className="field-input" type="number" value={batchYear} onChange={e => setBatchYear(e.target.value)} placeholder="2023" />
                </>
              ) : (
                <>
                  <label className="field-label">Your Full Name</label>
                  <input className="field-input" type="text" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="As registered in system" />
                </>
              )}

              <button className="auth-btn" onClick={handleVerify} disabled={loading}>
                {loading ? 'Verifying...' : 'Continue'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="auth-heading">New Password</h1>
              {error && <div className="auth-error">{error}</div>}
              <label className="field-label">New Password</label>
              <input className="field-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <label className="field-label">Confirm Password</label>
              <input className="field-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <button className="auth-btn" onClick={handleReset} disabled={loading}>Reset Password</button>
            </>
          )}

          {step === 3 && (
            <div style={{textAlign: 'center'}}>
              <h1 className="auth-heading">Success!</h1>
              <p className="auth-subtext">Password updated successfully.</p>
              <button className="auth-btn" onClick={() => navigate('/login')}>Login Now</button>
            </div>
          )}
          
          
        </div>
      </div>
    </>
  );
}