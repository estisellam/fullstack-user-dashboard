import { useNavigate, Navigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  // prevent access of non user
  if (!user) {
    return <Navigate to="/login" />;
  }

  function handleLogout() {
    localStorage.removeItem("currentUser");
    navigate("/login");
  }

  return (
    <div className="layout">
      
      <div className="sidebar">
        <h3 className="logo">Hi {user.name}</h3>

        <button>Info</button>
        <button>Todos</button>
        <button>Posts</button>
        <button>Albums</button>

        <div className="spacer"></div>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main">
        <h1>Dashboard</h1>
      </div>
    </div>
  );
}