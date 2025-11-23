import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const Register = ({ onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1) Create user
      const res = await axios.post("http://localhost:8000/api/auth/register", {
        name,
        email,
        password,
      });

      toast.success(res.data.message || "✅ Registration Successful!");

      // 2) Immediately login the user (frontend auto-login)
      try {
        const loginRes = await axios.post("http://localhost:8000/api/auth/login", {
          email,
          password,
        });

        if (loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("user", JSON.stringify(loginRes.data.user));

          window.dispatchEvent(
            new CustomEvent("authChange", {
              detail: { user: loginRes.data.user, token: loginRes.data.token },
            })
          );

          setTimeout(() => {
            onClose(); 
            navigate("/"); 
          }, 800);
        } else {
          setTimeout(() => {
            onClose();
            navigate("/");
          }, 800);
        }
      } catch (loginErr) {
        console.error("Auto-login failed:", loginErr);
        toast.info("Registration done. Please login.");
        setTimeout(() => {
          onClose();
          navigate("/login");
        }, 1200);
      }
    } catch (err) {
      console.error("Registration error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "❌ Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Create Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Processing..." : "Register"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 text-sm hover:underline block mx-auto"
        >
          Close
        </button>
        <ToastContainer />
      </div>
    </div>
  );
};

export default Register;
