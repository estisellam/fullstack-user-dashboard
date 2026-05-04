import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function Info() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) return <Navigate to="/login" />;

  return (
    
    <div className="info-card">
        <button className="back-btn" onClick={() => navigate("/home")}>
           Back Home
        </button>
      <h2>User Info</h2>

      <div className="info-row">
        <span>Full Name</span>
        <strong>{user.name}</strong>
      </div>

      <div className="info-row">
        <span>Username</span>
        <strong>{user.username}</strong>
      </div>

      <div className="info-row">
        <span>Email</span>
        <strong>{user.email || "-"}</strong>
      </div>

      <div className="info-row">
        <span>Phone</span>
        <strong>{user.phone || "-"}</strong>
      </div>
    </div>
  );
}