import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //to pass between pages
  const navigate = useNavigate();

  //async fanc becouse we wait for server
  async function handleLogin(e) {
        e.preventDefault(); //prevent reload
        const res = await fetch(`http://localhost:3001/users?username=${username}`);
        const data = await res.json();
        console.log(data);
        const user = data.find(u => u.website === password);
        if (user) {
            console.log("login success");
            localStorage.setItem("currentUser", JSON.stringify(user));
            navigate("/home");
        }
        else {console.log("login failed");}
    }
  
  return (
    <div>
      <h2>Welcome Back</h2>
      <p>Please login</p>

      <form onSubmit={handleLogin}>
          <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}