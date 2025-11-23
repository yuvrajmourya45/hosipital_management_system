import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Stethoscope,
} from "lucide-react";

import AdminAppointments from "./AdminAppointments";
import AdminPatients from "./AdminPatients";
import AdminReports from "./AdminReports";
import AdminSettings from "./AdminSettings";

// Doctors page
const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/doctors")
      .then((res) => setDoctors(res.data || []))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Doctors List</h1>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3">#</th>
            <th className="p-3">Name</th>
            <th className="p-3">Speciality</th>
            <th className="p-3">Email</th>
            <th className="p-3">Phone</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((d, i) => (
              <tr key={d._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{d.name}</td>
                <td className="p-3">{d.speciality}</td>
                <td className="p-3">{d.email}</td>
                <td className="p-3">{d.phone || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-5 text-center text-gray-500">
                No doctors found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({ doctors: 0, patients: 0, today: 0 });
  const [appointments, setAppointments] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const loadData = async () => {
      try {
        // admin info
        const adminData = await axios.get(
          "http://localhost:8000/api/admin/me",
          config
        );
        setAdmin(adminData.data);

        // stats
        const statsRes = await axios.get(
          "http://localhost:8000/api/admin/stats",
          config
        );

        setStats({
          doctors: statsRes.data?.totalDoctors || 0,
          patients: statsRes.data?.totalUsers || 0,
          today: statsRes.data?.totalAppointments || 0,
        });

        // appointments
        const apRes = await axios.get(
          "http://localhost:8000/api/admin/appointments",
          config
        );

        // backend return format fix
        if (Array.isArray(apRes.data.appointments))
          setAppointments(apRes.data.appointments);
        else if (Array.isArray(apRes.data)) setAppointments(apRes.data);
        else setAppointments([]);

      } catch (err) {
        console.log("ERROR:", err);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/admin-login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-8">
            Clinic<span className="text-blue-500">Pro</span>
          </h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActivePage("dashboard")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "dashboard"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => setActivePage("doctors")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "doctors"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <Stethoscope size={18} /> Doctors
            </button>

            <button
              onClick={() => setActivePage("patients")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "patients"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <Users size={18} /> Patients
            </button>

            <button
              onClick={() => setActivePage("appointments")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "appointments"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <Calendar size={18} /> Appointments
            </button>

            <button
              onClick={() => setActivePage("reports")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "reports"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <BarChart3 size={18} /> Reports
            </button>

            <button
              onClick={() => setActivePage("settings")}
              className={`flex items-center gap-3 p-3 w-full rounded-lg ${
                activePage === "settings"
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200"
              }`}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 p-3 w-full rounded-lg text-red-600 hover:bg-red-100"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-semibold">
              Hello, {admin?.name || "Admin"} 👋
            </h2>
            <p className="text-gray-600">Welcome to your dashboard</p>
          </div>

          <div className="flex items-center gap-4">
            <Bell size={22} className="text-gray-700" />
            <User size={22} className="text-gray-700" />
          </div>
        </header>

        {/* Dashboard */}
        {activePage === "dashboard" && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="bg-white shadow-md p-6 rounded-xl">
                <p className="text-gray-600">Total Doctors</p>
                <h3 className="text-3xl font-bold text-blue-600">
                  {stats.doctors}
                </h3>
              </div>

              <div className="bg-white shadow-md p-6 rounded-xl">
                <p className="text-gray-600">Total Patients</p>
                <h3 className="text-3xl font-bold text-green-600">
                  {stats.patients}
                </h3>
              </div>

              <div className="bg-white shadow-md p-6 rounded-xl">
                <p className="text-gray-600">Appointments Today</p>
                <h3 className="text-3xl font-bold text-purple-600">
                  {stats.today}
                </h3>
              </div>
            </div>

            {/* Recent appointments */}
            <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>

            <div className="bg-white shadow-md rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Time</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((a) => (
                      <tr key={a._id} className="border-b">
                        <td className="p-3">{a.user?.name || "-"}</td>
                        <td className="p-3">{a.doctor?.name || "-"}</td>
                        <td className="p-3">{a.date || "-"}</td>
                        <td className="p-3">{a.time || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`px-3 py-1 rounded-full text-white text-sm ${
                              a.status === "pending"
                                ? "bg-yellow-500"
                                : a.status === "completed"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="p-5 text-center text-gray-500"
                      >
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activePage === "doctors" && <AdminDoctors />}
        {activePage === "patients" && <AdminPatients />}
        {activePage === "appointments" && <AdminAppointments />}
        {activePage === "reports" && <AdminReports />}
        {activePage === "settings" && <AdminSettings />}
      </main>
    </div>
  );
}
