import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegisterDetails() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  //we got this from previes page
  const { username, password } = location.state || {};

  async function handleComplete(e) {
    e.preventDefault();

    if (!name || !email || !phone) {
      alert("All fields are required");
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

    //save to localstorge
    localStorage.setItem("currentUser", JSON.stringify(createdUser));

    //move home
    navigate("/home");
  }

  return (
    <div>
      <h2>Complete Registration</h2>

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
    </div>
  );
}