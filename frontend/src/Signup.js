import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
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

  .auth-root::before {
    content: '';
    position: fixed;
    top: -30%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .auth-root::after {
    content: '';
    position: fixed;
    bottom: -20%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
    pointer-events: none;
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
    animation: cardIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .auth-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2rem;
  }

  .auth-brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #10b981);
  }

  .auth-brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .auth-heading {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.75rem;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 0.35rem;
  }

  .auth-subtext {
    font-size: 0.875rem;
    color: rgba(255,255,255,0.4);
    margin-bottom: 2rem;
    font-weight: 300;
  }

  .role-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 1.5rem;
  }

  .role-option {
    position: relative;
    cursor: pointer;
  }

  .role-option input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .role-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 1rem;
    border-radius: 14px;
    border: 1.5px solid rgba(255,255,255,0.07);
    background: rgba(255,255,255,0.02);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .role-label:hover {
    border-color: rgba(99,102,241,0.4);
    background: rgba(99,102,241,0.05);
  }

  .role-option input:checked + .role-label {
    border-color: #6366f1;
    background: rgba(99,102,241,0.1);
  }

  .role-icon { font-size: 1.5rem; }

  .role-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.02em;
  }

  .role-option input:checked + .role-label .role-name {
    color: #a5b4fc;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 1.5rem;
  }

  .field-label {
    font-size: 0.72rem;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
  }

  .field-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1.5px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }

  .field-input::placeholder { color: rgba(255,255,255,0.2); }

  .field-input:focus {
    border-color: rgba(99,102,241,0.6);
    background: rgba(99,102,241,0.05);
  }

  .auth-btn {
    width: 100%;
    padding: 0.9rem;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    margin-bottom: 1.5rem;
  }

  .auth-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .auth-btn:active:not(:disabled) { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .auth-btn-loader {
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

  @keyframes spin { to { transform: rotate(360deg); } }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1.5rem;
  }

  .auth-divider-line {
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.07);
  }

  .auth-divider-text {
    font-size: 0.75rem;
    color: rgba(255,255,255,0.25);
  }

  .auth-footer {
    text-align: center;
    font-size: 0.85rem;
    color: rgba(255,255,255,0.35);
  }

  .auth-footer a {
    color: #a5b4fc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .auth-footer a:hover { color: #c7d2fe; }

  .auth-error {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 10px;
    padding: 0.7rem 1rem;
    font-size: 0.82rem;
    color: #fca5a5;
    margin-bottom: 1rem;
  }
`;

function Signup() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "Student" });
    const [errors, setErrors] = useState({}); // store per-field errors
    const [loading, setLoading] = useState(false);

    // Regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Live validation function for a single field
    const validateField = (field, value) => {
        switch (field) {
            case "name":
                if (!value.trim()) return "Name is required";
                return "";
            case "email":
                if (!value.trim()) return "Email is required";
                if (!emailRegex.test(value)) return "Invalid email address";
                return "";
            case "password":
                if (!value) return "Password is required";
                if (value.length < 8) return "Password must be at least 8 characters";
                return "";
            case "role":
                if (!value) return "Role is required";
                return "";
            default:
                return "";
        }
    };

    // Handle input changes
    const update = (field) => (e) => {
        const value = e.target.value;
        setForm({ ...form, [field]: value });

        // Validate live
        setErrors({ ...errors, [field]: validateField(field, value) });
    };

    // Validate whole form before submit
    const validateForm = () => {
        const newErrors = {};
        Object.keys(form).forEach((field) => {
            const error = validateField(field, form[field]);
            if (error) newErrors[field] = error;
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // prevent submit if errors exist
        setLoading(true);
        try {
            
            const res = await axios.post("http://localhost:5000/api/auth/signup", form);
            alert(res.data?.message || "Signup successful");
            navigate("/dashboard");
        } catch (err) {
            // Show server error at the top
            setErrors({ ...errors, server: err.response?.data?.message || "Server not responding" });
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

                    <h1 className="auth-heading">Create account</h1>
                    <p className="auth-subtext">Join us — pick your role to get started.</p>

                    <div className="role-selector">
                        {[
                            { value: "Student", icon: "🎓", label: "Student" },
                            { value: "Admin", icon: "🛡️", label: "Admin" },
                        ].map(({ value, icon, label }) => (
                            <label className="role-option" key={value}>
                                <input
                                    type="radio"
                                    name="role"
                                    value={value}
                                    checked={form.role === value}
                                    onChange={update("role")}
                                />
                                <span className="role-label">
                                    <span className="role-icon">{icon}</span>
                                    <span className="role-name">{label}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.role && <div className="auth-error">{errors.role}</div>}

                    <form onSubmit={handleSubmit}>
                        {errors.server && <div className="auth-error">{errors.server}</div>}

                        <div className="field-group">
                            <div>
                                <label className="field-label">Full Name</label>
                                <input
                                    className="field-input"
                                    placeholder="Jane Doe"
                                    value={form.name}
                                    onChange={update("name")}
                                />
                                {errors.name && <div className="auth-error">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="field-label">Email</label>
                                <input
                                    className="field-input"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={form.email}
                                    onChange={update("email")}
                                />
                                {errors.email && <div className="auth-error">{errors.email}</div>}
                            </div>
                            <div>
                                <label className="field-label">Password</label>
                                <input
                                    className="field-input"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={form.password}
                                    onChange={update("password")}
                                />
                                {errors.password && <div className="auth-error">{errors.password}</div>}
                            </div>
                        </div>

                        <button className="auth-btn" type="submit" disabled={loading}>
                            {loading && <span className="auth-btn-loader" />}
                            {loading ? "Creating account…" : "Sign Up"}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <div className="auth-divider-line" />
                        <span className="auth-divider-text">or</span>
                        <div className="auth-divider-line" />
                    </div>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Log in</Link>
                    </p>
                </div>
            </div>
        </>
    );
  
}

export default Signup;