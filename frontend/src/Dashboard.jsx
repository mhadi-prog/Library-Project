import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SearchBooks from "./SearchBooks.jsx";
import MyBooks from "./MyBooks.jsx";
import ViewFines from "./ViewFines.jsx";
import ManageBooks from "./ManageBooks.jsx";
import AddBooks from "./AddBooks.jsx";
import BookIssuance from "./BookIssuance.jsx";
import SearchStudent from "./SearchStudent.jsx";
import CalculateFines from "./CalculateFines.jsx";
import ChangePassword from "./ChangePassword.jsx";
import BorrowRequests from "./borrowRequest.jsx";
import BorrowingHistory from "./borrowingHistory.jsx";
import RecommendedBooks from "./RecommendedBooks.jsx";
import LibraryAnalytics from "./LibraryAnalytics.jsx"
import ReadingStreak from "./ReadingStreak.jsx";
import DemandForecast from "./DemandForecast.jsx";
// STUDENT DASHBOARD
function StudentDashboard({ userName, userEmail, activeMenu, setActiveMenu, handleLogout, handleMenuClick, mobileMenuOpen, setMobileMenuOpen }) {
  const studentMenuItems = [
    { id: "search-books", label: "Search Books", icon: "🔍", category: "Library" },
    { id: "my-books", label: "My Books", icon: "📖", category: "Library" },
    { id: "view-fines", label: "View Fines", icon: "💰", category: "Account" },
    { id: "change-password", label: "Change Password", icon: "🔐", category: "Account" },
    { id: "recommended", label: "Recommended Books", icon: "✨", category: "Library" },
    { id: "reading-streak", label: "Reading Streak", icon: "🔥", category: "Account" },
  ];

  const componentMap = {
    "search-books": SearchBooks,
    "my-books": MyBooks,
    "view-fines": ViewFines,
    "change-password": ChangePassword,
    "recommended": RecommendedBooks,
    "reading-streak": ReadingStreak,
  };

  const categories = Array.from(new Set(studentMenuItems.map(item => item.category)));
  const CurrentComponent = componentMap[activeMenu] || SearchBooks;

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
    .user-info {
      padding: 1rem;
      background: rgba(99,102,241,0.08);
      border-radius: 10px;
      border: 1px solid rgba(99,102,241,0.2);
      margin-bottom: 1rem;
    }
    .user-name {
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      color: #fff;
      margin-bottom: 0.3rem;
    }
    .user-email {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.4);
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
    .main-content {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #0a0a0f;
    }
    .mobile-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .mobile-menu-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .mobile-sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999;
    }
    .mobile-sidebar-overlay.active {
      display: block;
    }
    .mobile-sidebar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: rgba(255,255,255,0.03);
      border-right: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(20px);
      padding: 2rem 1.5rem;
      z-index: 1000;
      overflow-y: auto;
      flex-direction: column;
    }
    .mobile-sidebar.active {
      display: flex;
    }
    .component-container {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @media (max-width: 768px) {
      .dashboard-container {
        grid-template-columns: 1fr;
      }
      .sidebar {
        display: none;
      }
      .mobile-header {
        display: flex;
      }
      .mobile-sidebar-overlay.active {
        display: block;
      }
      .mobile-sidebar.active {
        display: flex;
      }
    }
  `;

  const SidebarContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-brand-dot" />
        <span className="sidebar-brand-name">Booked</span>
      </div>
      <div className="sidebar-role-badge">👨‍🎓 Student</div>
      <div className="sidebar-menu">
        {categories.map((category) => (
          <div key={category}>
            <div className="sidebar-section-title">{category}</div>
            {studentMenuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-email">{userEmail}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        <div className="dashboard-container">
          <aside className="sidebar">
            <SidebarContent />
          </aside>
          <div 
            className={`mobile-sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className={`mobile-sidebar ${mobileMenuOpen ? "active" : ""}`}>
            <SidebarContent />
          </aside>
          <main className="main-content">
            <div className="mobile-header">
              <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
              <div className="sidebar-brand-name">Booked</div>
              <div style={{ width: "40px" }} />
            </div>
            <div className="component-container">
              <CurrentComponent />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// ADMIN DASHBOARD
function AdminDashboard({ userName, userEmail, activeMenu, setActiveMenu, handleLogout, handleMenuClick, mobileMenuOpen, setMobileMenuOpen }) {
const adminMenuItems = [
  { id: "manage-books", label: "Manage Books", icon: "📚", category: "Library" },
  { id: "add-book", label: "Add Book", icon: "➕", category: "Library" },
  { id: "borrow-requests", label: "Borrow Requests", icon: "📋", category: "Library" },
  { id: "borrowing-history", label: "Borrowing History", icon: "📖", category: "Library" },  // ADD THIS
  { id: "search-student", label: "Search Student", icon: "🔎", category: "Operations" },
  { id: "calculate-fines", label: "Calculate Fines", icon: "📊", category: "Operations" },
  { id: "change-password", label: "Change Password", icon: "🔐", category: "Account" },
  { id: "analytics", label: "Library Analytics", icon: "📊", category: "Operations" },
  { id: "demand-forecast", label: "Demand Forecast", icon: "🔮", category: "Operations" },
];

const componentMap = {
  "manage-books": ManageBooks,
  "add-book": AddBooks,
  "borrow-requests": BorrowRequests,
  "borrowing-history": BorrowingHistory, 
  "search-student": SearchStudent,
  "calculate-fines": CalculateFines,
  "change-password": ChangePassword,
  "analytics": LibraryAnalytics,
  "demand-forecast": DemandForecast,
};

  const categories = Array.from(new Set(adminMenuItems.map(item => item.category)));
  const CurrentComponent = componentMap[activeMenu] || ManageBooks;

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
      background: radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%);
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
      background: radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%);
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
      background: linear-gradient(135deg, #ef4444, #f97316);
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
      background: rgba(239,68,68,0.15);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 20px;
      padding: 0.35rem 0.85rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: #fca5a5;
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
      background: rgba(239,68,68,0.1);
      border-color: rgba(239,68,68,0.3);
      color: #fca5a5;
    }
    .menu-item.active {
      background: rgba(239,68,68,0.15);
      border-color: rgba(239,68,68,0.5);
      color: #fecaca;
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
    .user-info {
      padding: 1rem;
      background: rgba(239,68,68,0.08);
      border-radius: 10px;
      border: 1px solid rgba(239,68,68,0.2);
      margin-bottom: 1rem;
    }
    .user-name {
      font-family: 'Syne', sans-serif;
      font-weight: 600;
      font-size: 0.85rem;
      color: #fff;
      margin-bottom: 0.3rem;
    }
    .user-email {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.4);
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
    .main-content {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: #0a0a0f;
    }
    .mobile-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .mobile-menu-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .mobile-sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999;
    }
    .mobile-sidebar-overlay.active {
      display: block;
    }
    .mobile-sidebar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: rgba(255,255,255,0.03);
      border-right: 1px solid rgba(255,255,255,0.07);
      backdrop-filter: blur(20px);
      padding: 2rem 1.5rem;
      z-index: 1000;
      overflow-y: auto;
      flex-direction: column;
    }
    .mobile-sidebar.active {
      display: flex;
    }
    .component-container {
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @media (max-width: 768px) {
      .dashboard-container {
        grid-template-columns: 1fr;
      }
      .sidebar {
        display: none;
      }
      .mobile-header {
        display: flex;
      }
      .mobile-sidebar-overlay.active {
        display: block;
      }
      .mobile-sidebar.active {
        display: flex;
      }
    }
  `;

  const SidebarContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-brand-dot" />
        <span className="sidebar-brand-name">Booked</span>
      </div>
      <div className="sidebar-role-badge">🛡️ Admin</div>
      <div className="sidebar-menu">
        {categories.map((category) => (
          <div key={category}>
            <div className="sidebar-section-title">{category}</div>
            {adminMenuItems
              .filter((item) => item.category === category)
              .map((item) => (
                <div
                  key={item.id}
                  className={`menu-item ${activeMenu === item.id ? "active" : ""}`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-name">{userName}</div>
          <div className="user-email">{userEmail}</div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="dashboard-root">
        <div className="dashboard-container">
          <aside className="sidebar">
            <SidebarContent />
          </aside>
          <div 
            className={`mobile-sidebar-overlay ${mobileMenuOpen ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className={`mobile-sidebar ${mobileMenuOpen ? "active" : ""}`}>
            <SidebarContent />
          </aside>
          <main className="main-content">
            <div className="mobile-header">
              <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                ☰
              </button>
              <div className="sidebar-brand-name">Booked</div>
              <div style={{ width: "40px" }} />
            </div>
            <div className="component-container">
              <CurrentComponent />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// MAIN DASHBOARD - ROUTES TO STUDENT OR ADMIN
function Dashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const userRole = (localStorage.getItem('userRole') || "Student").toLowerCase();
  const userName = localStorage.getItem('userName') || "User";
  const userEmail = localStorage.getItem('userEmail') || "user@example.com";

  useEffect(() => {
    if (userRole === "student") {
      setActiveMenu("search-books");
    } else {
      setActiveMenu("manage-books");
    }
  }, [userRole]);

  const handleLogout = () => {
    localStorage.removeItem('userID');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isAuthenticated');
    navigate("/login");
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setMobileMenuOpen(false);
  };

  if (userRole === "admin") {
    return (
      <AdminDashboard 
        userName={userName}
        userEmail={userEmail}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        handleLogout={handleLogout}
        handleMenuClick={handleMenuClick}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    );
  } else {
    return (
      <StudentDashboard 
        userName={userName}
        userEmail={userEmail}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        handleLogout={handleLogout}
        handleMenuClick={handleMenuClick}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    );
  }
}

export default Dashboard;