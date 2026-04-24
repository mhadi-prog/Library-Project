import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // go back to signup
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>📚 Library Dashboard</h1>

      <div style={{
        marginTop: "20px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "300px"
      }}>
        <h3>Welcome!</h3>
        <p>You have successfully logged in.</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Dashboard;