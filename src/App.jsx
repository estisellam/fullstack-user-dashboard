import { BrowserRouter, Routes, Route ,Navigate} from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Register from "./pages/Register";
import RegisterDetails from "./pages/RegisterDetails";
import Info from "./pages/Info";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/details" element={<RegisterDetails />} />
        <Route path="/home/info" element={<Info />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;