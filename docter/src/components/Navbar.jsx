import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets_admin/assets";
import { hello } from "../assets/assets_frontend/assets";
import RegisterForm from "../pages/Register";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  // ✅ Check login status automatically
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    setToken(storedToken);
    setUser(parsedUser);

    const onAuthChange = (e) => {
      const newToken = e?.detail?.token ?? localStorage.getItem("token");
      const newUser =
        e?.detail?.user ??
        (localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null);
      setToken(newToken);
      setUser(newUser);
    };

    const onStorage = () => {
      const t = localStorage.getItem("token");
      const u = localStorage.getItem("user");
      setToken(t);
      setUser(u ? JSON.parse(u) : null);
    };

    window.addEventListener("authChange", onAuthChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("authChange", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // ✅ Logout function (role-based redirect)
  const handleLogout = () => {
    const userRole = user?.role;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent("authChange"));

    if (userRole === "admin") navigate("/admin-login");
    else if (userRole === "doctor") navigate("/doctor-login");
    else navigate("/login");
  };

  // ✅ Get profile image safely
  const getProfileImage = () => {
    if (user?.profilePic) {
      if (user.profilePic.startsWith("http")) {
        return user.profilePic;
      } else {
        return `http://localhost:8000/${user.profilePic}`;
      }
    }
    return hello.profile_pic;
  };

  return (
    <>
      <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
        {/* Logo */}
        <img
          onClick={() => navigate("/")}
          className="w-44 cursor-pointer"
          src={assets.admin_logo}
          alt="Logo"
        />

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-start gap-5 font-medium">
          <NavLink to="/"><li className="py-1">HOME</li></NavLink>
          <NavLink to="/doctors"><li className="py-1">ALL DOCTORS</li></NavLink>
          <NavLink to="/about"><li className="py-1">ABOUT</li></NavLink>
          <NavLink to="/contact"><li className="py-1">CONTACT</li></NavLink>
        </ul>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Admin/Doctor Panel */}
          {!token && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                className="border border-gray-300 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition"
              >
                Admin Panel
              </button>

              {showAdminDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-50">
                  <button
                    onClick={() => { navigate("/admin-login"); setShowAdminDropdown(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Admin Login
                  </button>
                  <button
                    onClick={() => { navigate("/doctor-login"); setShowAdminDropdown(false); }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Doctor Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Logged-in view */}
          {token && (
            <div className="flex items-center gap-2 cursor-pointer group relative">
              <img
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
                src={getProfileImage()}
                alt="Profile"
                onError={(e) => (e.target.src = hello.profile_pic)}
              />
              <img className="w-2.5" src={hello.dropdown_icon} alt="Dropdown" />

              {/* Dropdown */}
              <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  {user?.role === "user" && (
                    <>
                      <p onClick={() => navigate("/my-profile")} className="hover:text-black cursor-pointer">My Profile</p>
                      <p onClick={() => navigate("/my-appointments")} className="hover:text-black cursor-pointer">My Appointments</p>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <p onClick={() => navigate("/admin-dashboard")} className="hover:text-black cursor-pointer">Admin Dashboard</p>
                  )}
                  {user?.role === "doctor" && (
                    <p onClick={() => navigate("/doctor-dashboard")} className="hover:text-black cursor-pointer">Doctor Dashboard</p>
                  )}
                  <p onClick={handleLogout} className="hover:text-black cursor-pointer">Logout</p>
                </div>
              </div>
            </div>
          )}

          {/* Not logged in */}
          {!token && (
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-light"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="border border-blue-500 text-blue-500 px-6 py-3 rounded-full font-light"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setShowMenu(true)}
            className="w-6 md:hidden cursor-pointer"
            src={hello.menu_icon}
            alt="Menu"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${showMenu ? "fixed w-full" : "h-0 w-0"} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
        <div className="flex justify-between items-center px-5 py-6">
          <img className="w-36" src={hello.logo} alt="Logo" />
          <img onClick={() => setShowMenu(false)} className="w-7 cursor-pointer" src={hello.cross_icon} alt="Close" />
        </div>

        <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
          <NavLink to="/" onClick={() => setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">Home</p></NavLink>
          <NavLink to="/doctors" onClick={() => setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">All Doctors</p></NavLink>
          <NavLink to="/about" onClick={() => setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">About</p></NavLink>
          <NavLink to="/contact" onClick={() => setShowMenu(false)}><p className="px-4 py-2 rounded inline-block">Contact</p></NavLink>

          {/* Admin/Doctor in Mobile Menu */}
          {!token && (
            <div className="flex flex-col gap-1 mt-3 w-full px-5">
              <button onClick={() => { navigate("/admin-login"); setShowMenu(false); }} className="px-4 py-2 border rounded hover:bg-gray-100 text-left">Admin Login</button>
              <button onClick={() => { navigate("/doctor-login"); setShowMenu(false); }} className="px-4 py-2 border rounded hover:bg-gray-100 text-left">Doctor Login</button>
            </div>
          )}

          {!token && (
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowMenu(false); navigate("/login"); }} className="bg-blue-500 text-white px-5 py-2 rounded-full">Login</button>
              <button onClick={() => { setShowMenu(false); setShowRegister(true); }} className="border border-blue-500 text-blue-500 px-5 py-2 rounded-full">Sign Up</button>
            </div>
          )}
        </ul>
      </div>

      {/* Register Popup */}
      {showRegister && <RegisterForm onClose={() => setShowRegister(false)} />}
    </>
  );
};

export default Navbar;
