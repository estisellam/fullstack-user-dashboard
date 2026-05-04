import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 

  //to pass between pages
  const navigate = useNavigate();

  //async func because we wait for server
  async function handleLogin(e) {
    e.preventDefault(); //prevent reload

    const res = await fetch(
      `http://localhost:3001/users?username=${username}`
    );
    const data = await res.json();

    console.log(data);

    const user = data.find((u) => u.website === password);

    if (user) {
      console.log("login success");

      localStorage.setItem("currentUser", JSON.stringify(user));

      navigate("/home");
    } else {
      console.log("login failed");
      setError("Invalid username or password"); 
    }
  }

  return (
    <div className="card"> 
      <h2>Welcome Back</h2>
      <p>Please login</p>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {/* ✔ הודעת שגיאה */}
      {error && <p className="error">{error}</p>}

      {/* ✔ ניווט בלי רענון */}
      <p style={{ marginTop: "15px" }}>
        Don’t have an account?{" "}
        <Link to="/register" style={{ color: "#fbcfe8" }}>
          Register
        </Link>
      </p>
    </div>
  );
}