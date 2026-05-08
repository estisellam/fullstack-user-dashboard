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

        <button onClick={() => navigate("/home/info")}>Info</button>
        <button onClick={() => navigate("/home/todos")}>Todos</button>
        <button onClick={() => navigate("/home/posts")}>Posts</button>
        <button onClick={() => navigate("/home/albums")}>Albums</button>

        <div className="spacer"></div>

        <button className="logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="main">
        <div className="dashboard-content">
          <h1 className="dashboard-title">Dashboard</h1>

          <p className="dashboard-subtitle">
            Welcome, {user.name}. Choose what you want to manage.
          </p>

          <div className="dashboard-grid">

            <div className="dashboard-card" onClick={() => navigate("/home/todos")}>
              <h3>Todos</h3>
              <p>Manage your personal tasks: add, update, delete and search.</p>
            </div>

            <div className="dashboard-card" onClick={() => navigate("/home/posts")}>
              <h3>Posts</h3>
              <p>View posts, create your own posts and comment on others.</p>
            </div>

            <div className="dashboard-card" onClick={() => navigate("/home/albums")}>
              <h3>Albums</h3>
              <p>Manage your albums and photos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}