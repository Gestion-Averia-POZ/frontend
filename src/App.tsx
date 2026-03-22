import { Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Metrics from "./pages/Metrics";
import Privacy from "./pages/Privacy";
import RecoverPassword from "./pages/Auth/RecoverPassword";
import Register from "./pages/Auth/Register";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recover-password" element={<RecoverPassword />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
