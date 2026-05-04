import { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

export default function RegisterDetails() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); 

  const navigate = useNavigate();
  const location = useLocation();

  //we got this from previous page
  const { username, password } = location.state || {};


  if (!username || !password) {
    return <Navigate to="/register" />;
  }

  async function handleComplete(e) {
    e.preventDefault();

    if (!name || !email || !phone) {
      setError("All fields are required");
      return;
    }

    const newUser = {
      name,
      username,
      email,
      phone,
      website: password
    };

    const res = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newUser)
    });

    const createdUser = await res.json();

    //save to localstorage
    localStorage.setItem("currentUser", JSON.stringify(createdUser));

    //move home
    navigate("/home");
  }

  return (
    <div className="card">
      <h2>Complete Registration</h2>
      <p>Tell us more about you</p>

      <form onSubmit={handleComplete}>
        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="submit">Finish</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}