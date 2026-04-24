import { useNavigate } from "react-router-dom";
import { useState } from "react";





const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dashboard-root {
    min-height: 100vh;
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow-x: hidden;
  }

  .dashboard-root::before {
    content: '';
    position: fixed;
    top: -30%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .dashboard-root::after {
    content: '';
    position: fixed;
    bottom: -20%;
    left: -10%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  .dashboard-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    min-height: 100vh;
    position: relative;
    z-index: 1;
  }

  /* SIDEBAR */
  .sidebar {
    background: rgba(255,255,255,0.03);
    border-right: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(20px);
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .sidebar-brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #10b981);
  }

  .sidebar-brand-name {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 1.1rem;
    color: #fff;
    letter-spacing: -0.02em;
  }

  .sidebar-role-badge {
    display: inline-block;
    background: rgba(99,102,241,0.15);
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 20px;
    padding: 0.35rem 0.85rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: #a5b4fc;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 2rem;
  }

  .sidebar-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
    margin-top: 1.5rem;
  }

  .sidebar-section-title:first-of-type {
    margin-top: 0;
  }

  .sidebar-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0.9rem 1rem;
    border-radius: 12px;
    background: rgba(255,255,255,0.02);
    border: 1.5px solid transparent;
    color: rgba(255,255,255,0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.9rem;
    font-weight: 500;
    user-select: none;
  }

  .menu-item:hover {
    background: rgba(99,102,241,0.1);
    border-color: rgba(99,102,241,0.3);
    color: #a5b4fc;
  }

  .menu-item.active {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.5);
    color: #c7d2fe;
  }

  .menu-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .sidebar-footer {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: auto;
  }

  .logout-btn {
    width: 100%;
    padding: 0.85rem;
    border: 1.5px solid rgba(239,68,68,0.3);
    background: rgba(239,68,68,0.08);
    border-radius: 12px;
    color: #fca5a5;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-btn:hover {
    background: rgba(239,68,68,0.15);
    border-color: rgba(239,68,68,0.5);
  }

  /* MAIN CONTENT */
  .main-content {
    display: flex;
    flex-direction: column;
    padding: 3rem;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3rem;
    animation: slideDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .header-left h1 {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 2.2rem;
    color: #fff;
    letter-spacing: -0.03em;
    margin-bottom: 0.5rem;
  }

  .header-left p {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.4);
  }

  .header-user {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  .user-name {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
  }

  .user-email {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.4);
  }

  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px;
    padding: 1.5rem;
    backdrop-filter: blur(20px);
    animation: cardIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
    transition: all 0.2s ease;
  }

  .card:nth-child(1) { animation-delay: 0.1s; }
  .card:nth-child(2) { animation-delay: 0.2s; }
  .card:nth-child(3) { animation-delay: 0.3s; }
  .card:nth-child(4) { animation-delay: 0.4s; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card:hover {
    border-color: rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.05);
    transform: translateY(-4px);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 1rem;
  }

  .card-icon {
    font-size: 2rem;
  }

  .card-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
  }

  .card-description {
    font-size: 0.85rem;
    color: rgba(255,255,255,0.5);
    margin-bottom: 1rem;
    line-height: 1.5;
  }

  .card-btn {
    width: 100%;
    padding: 0.75rem;
    border: 1.5px solid rgba(99,102,241,0.3);
    background: rgba(99,102,241,0.08);
    border-radius: 10px;
    color: #a5b4fc;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .card-btn:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.5);
    color: #c7d2fe;
  }

  .welcome-card {
    grid-column: 1 / -1;
    background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(16,185,129,0.08) 100%);
    border: 1.5px solid rgba(99,102,241,0.2);
  }

  .welcome-card h2 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.5rem;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .welcome-card p {
    font-size: 0.95rem;
    color: rgba(255,255,255,0.6);
    line-height: 1.6;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    border-radius: 16px;
    background: rgba(255,255,255,0.02);
    border: 1.5px dashed rgba(255,255,255,0.1);
  }

  .empty-state-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 1.3rem;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    font-size: 0.9rem;
    color: rgba(255,255,255,0.4);
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .dashboard-container {
      grid-template-columns: 1fr;
    }

    .sidebar {
      grid-column: 1 / -1;
      height: auto;
      flex-direction: row;
      overflow-x: auto;
      overflow-y: visible;
      padding: 1rem;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    .sidebar-menu {
      flex-direction: row;
      gap: 1rem;
      overflow-x: auto;
      flex: 1;
    }

    .sidebar-section-title {
      display: none;
    }

    .main-content {
      padding: 2rem 1rem;
    }

    .header {
      flex-direction: column;
      gap: 1rem;
    }

    .header-user {
      align-items: flex-start;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }
  }
`;

// Menu items for different roles
const menuConfig = {
  Student: [
    { id: "search-books", label: "Search Books", icon: "🔍", category: "Library" },
    { id: "my-books", label: "My Books", icon: "📖", category: "Library" },
    { id: "view-fines", label: "View Fines", icon: "💰", category: "Account" },
    { id: "change-password", label: "Change Password", icon: "🔐", category: "Account" },
  ],
  Admin: [
    { id: "manage-books", label: "Manage Books", icon: "📚", category: "Library" },
    { id: "add-book", label: "Add Book", icon: "➕", category: "Library" },
    { id: "book-issuance", label: "Book Issuance", icon: "📤", category: "Operations" },
    { id: "search-student", label: "Search Student", icon: "🔎", category: "Operations" },
    { id: "calculate-fines", label: "Calculate Fines", icon: "📊", category: "Operations" },
    { id: "change-password", label: "Change Password", icon: "🔐", category: "Account" },
  ],
};

// Feature descriptions
const featureDescriptions = {
  "search-books": "Find books in the library catalog by title, author, or genre.",
  "my-books": "View all books you have borrowed and their due dates.",
  "view-fines": "Check any overdue fines on your account.",
  "change-password": "Update your account password for security.",
  "manage-books": "Add, edit, or delete books from the library collection.",
  "add-book": "Register a new book in the system.",
  "book-issuance": "Issue books to students and track borrowing.",
  "search-student": "Look up student details and borrowing history.",
  "calculate-fines": "Compute fines for overdue books.",
};

function Dashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("search-books"); // Default menu
  const [userRole] = useState("Student"); // In a real app, get from auth context
  const [userName] = useState("Jane Doe"); // In a real app, get from auth context
  const [userEmail] = useState("jane@example.com"); // In a real app, get from auth context

  const menuItems = menuConfig[userRole] || [];
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const handleLogout = () => {
    // Clear auth data and navigate
    navigate("/");
  };

  const renderContent = () => {
    return (
      <div className="content-grid">
        <div className="card welcome-card">
          <h2>Welcome back, {userName}! 👋</h2>
          <p>You're logged in as a {userRole}. Explore the menu on the left to manage library resources and access your account.</p>
        </div>

        {menuItems.map((item) => (
          <div
            key={item.id}
            className="card"
            onClick={() => setActiveMenu(item.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="card-header">
              <span className="card-icon">{item.icon}</span>
              <span className="card-title">{item.label}</span>
            </div>
            <p className="card-description">
              {featureDescriptions[item.id] || "Manage library resources."}
            </p>
            <button className="card-btn">Open →</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        <div className="dashboard-container">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <div className="sidebar-brand-dot" />
              <span className="sidebar-brand-name">Booked</span>
            </div>

            <div className="sidebar-role-badge">{userRole}</div>

            <div className="sidebar-menu">
              {categories.map((category) => (
                <div key={category}>
                  <div className="sidebar-section-title">{category}</div>
                  {menuItems
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
                        onClick={() => setActiveMenu(item.id)}
                      >
                        <span className="menu-icon">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            <div className="sidebar-footer">
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">
            <div className="header">
              <div className="header-left">
                <h1>📚 Library Dashboard</h1>
                <p>Manage and explore library resources effortlessly</p>
              </div>
              <div className="header-user">
                <div className="user-name">{userName}</div>
                <div className="user-email">{userEmail}</div>
              </div>
            </div>

            {renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

export default Dashboard;