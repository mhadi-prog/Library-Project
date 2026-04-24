import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Dashboard from "./Dashboard";
import SearchBooks from "./SearchBooks"; // ✅ ADD THIS

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* ✅ NEW ROUTE */}
        <Route path="/search-books" element={<SearchBooks />} />
      </Routes>
    </Router>
  );
}

export default App;