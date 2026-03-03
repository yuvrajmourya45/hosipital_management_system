import React, { useEffect } from "react";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/user/Home";
import Docters from "./pages/user/Docters";
import MyProfile from "./pages/user/MyProfile";
import MyAppointment from "./pages/user/MyAppointment";
import Login from "./pages/user/Login";
import About from "./pages/user/About";
import Contact from "./pages/user/Contact";
import Appointment from "./pages/user/Appointment";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/user/Register";
import AdminLogin from "./pages/admin/AdminLogin";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";

// Admin Protected Route
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // Basic check for token existence. AdminDashboard will do deeper verification.
  if (!token) return <Navigate to="/admin-login" replace />;
  return children;
};

// Doctor Protected Route
const DoctorProtectedRoute = ({ children }) => {
  const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
  const token = localStorage.getItem("token");
  if (!token || !doctor._id) return <Navigate to="/doctor-login" replace />;
  return children;
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const isAdminPage = location.pathname.startsWith("/admin-");
  const isDoctorPage = location.pathname.startsWith("/doctor-");
  const isDedicatedPage = isAdminPage || isDoctorPage;

  // ✅ Auto-redirect Doctor/Admin away from User pages
  useEffect(() => {
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const doctor = JSON.parse(localStorage.getItem("doctor") || "{}");
      
      if (user.role === "admin" && !isAdminPage && location.pathname !== "/admin-login") {
        navigate("/admin-dashboard");
      } else if (doctor._id && !isDoctorPage && location.pathname !== "/doctor-login") {
        navigate("/doctor-dashboard");
      }
    }
  }, [location.pathname, token, navigate]);

  return (
    <div className={isDedicatedPage ? "" : "mx-4 sm:mx-[10%]"}>
      {!isDedicatedPage && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Docters />} />
        <Route path="/doctors/:speciality" element={<Docters />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/doctor-login" element={<DoctorLogin />} />

        {/* Protected User Routes */}
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute>
              <MyAppointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointment/:docId"
          element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          }
        />

        {/* Admin Protected Route */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />

        {/* Doctor Protected Route */}
        <Route
          path="/doctor-dashboard"
          element={
            <DoctorProtectedRoute>
              <DoctorDashboard />
            </DoctorProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isDedicatedPage && <Footer />}
    </div>
  );
};

export default App;

