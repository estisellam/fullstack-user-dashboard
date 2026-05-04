import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));

  //provent accses of non user
  if (!user) {return <Navigate to="/login" />;}

  function handleLogout() {
    localStorage.removeItem("currentUser");
    navigate("/login");
  }

  return (
    <div>
      <h1>Welcome {user?.name}</h1>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}