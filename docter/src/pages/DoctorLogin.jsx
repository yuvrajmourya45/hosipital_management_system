import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/auth/login", { email, password });
      const user = response.data.user;

      if (user.role !== "doctor") {
        toast.error("❌ Not a doctor account");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new CustomEvent("authChange", { detail: { token: response.data.token, user } }));

      toast.success("✅ Doctor logged in successfully!");
      setTimeout(() => navigate("/doctor-dashboard"), 1000);
    } catch (error) {
      console.error(error);
      toast.error("❌ Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg p-8 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Doctor Login</h2>
        <input type="email" placeholder="Email" className="w-full border rounded p-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full border rounded p-2 mb-3" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white w-full py-2 rounded transition-all disabled:opacity-60" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default DoctorLogin;
