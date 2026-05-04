import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verify, setVerify] = useState("");
  const [error, setError] = useState("");

  //move between pages
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    const user = username;
    const pass = password;
    const ver = verify;

    // check if all filed full
    if (!user || !pass || !ver) {
      setError("All fields are required");
      return;
    }

    //check passwords
    if (pass !== ver) {
      setError("Passwords do not match");
      return;
    }

    //check if user already exist
    const res = await fetch(
      `http://localhost:3001/users?username=${user}`
    );
    const data = await res.json();

    if (data.length > 0) {
      setError("Username already exists");
      return;
    }

    navigate("/register/details", {
      state: { username: user, password: pass }
    });
  }

  return (
    <div className="card"> 
      <h2>Create Account</h2>
      <p>Start your journey</p>

      <form onSubmit={handleRegister}>
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

        <input
          type="password"
          placeholder="Verify Password"
          value={verify}
          onChange={(e) => setVerify(e.target.value)}
        />

        <button type="submit">Continue</button>
      </form>


      {error && <p className="error">{error}</p>}

      <p style={{ marginTop: "15px" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#fbcfe8" }}>
          Login
        </Link>
      </p>
    </div>
  );
}