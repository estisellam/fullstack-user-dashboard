import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verify, setVerify] = useState("");
  const [error, setError] = useState("");
  //move between pages
  const navigate = useNavigate();

  async function handleRegister(e) {
    
    e.preventDefault();

    const user= username;
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
    const res = await fetch(`http://localhost:3001/users?username=${user}`);
    const data = await res.json();

    if (data.length > 0) {
      setError("Username already exists");
      return;
    }

    // create new basic user
    const newUser = {
      name: user,
      username: user,
      website: pass
    };

    const createRes = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    });

    const createdUser = await createRes.json();
    //save to localStorage
    localStorage.setItem("currentUser", JSON.stringify(createdUser));


    navigate("/home");
  }

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
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

        <input
          type="password"
          placeholder="verify password"
          value={verify}
          onChange={(e) => setVerify(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}