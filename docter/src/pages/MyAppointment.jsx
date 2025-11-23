import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ show: false, message: "", type: "info" });
  const navigate = useNavigate();

  // 🔒 Check user login
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser && storedUser !== "undefined") setUser(JSON.parse(storedUser));
      else navigate("/login");
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // 🔄 Fetch appointments
  useEffect(() => {
    if (!user?._id) return;

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:8000/api/appointments/${user._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setAppointments(res.data);
      } catch (err) {
        showPopup("Failed to fetch appointments", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  // 🔔 Popup function
  const showPopup = (message, type = "info") => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup({ show: false, message: "", type: "info" }), 2500);
  };

  // ❌ Cancel appointment
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/appointments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setAppointments(prev => prev.filter(a => a._id !== id));
      showPopup("Appointment cancelled successfully!", "success");
    } catch (err) {
      showPopup("Failed to cancel appointment", "error");
    }
  };

  // 💰 Pay appointment
  const handlePay = async (id) => {
    showPopup("Payment successful!", "success");
  };

  if (!user) return <p className="text-center mt-10 text-gray-500">Loading user info...</p>;
  if (loading) return <p className="text-center mt-10 text-gray-500">Fetching your appointments...</p>;

  return (
    <div className="p-5 max-w-5xl mx-auto relative">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-6">My Appointments</h2>

      {appointments.length === 0 ? (
        // ❌ No appointments
        <div className="flex flex-col items-center justify-center mt-20">
          <p className="text-gray-500 mt-6 text-lg text-center">No appointments found!</p>
          <button
            onClick={() => navigate("/doctors")}
            className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <>
          {/* ✅ Appointments grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {appointments.map((item) => {
              const doctorNameRaw = item.doctor?.name || item.doctor || "Unknown";
              const doctorName = doctorNameRaw.startsWith("Dr.") ? doctorNameRaw : `Dr. ${doctorNameRaw}`;
              const speciality = item.doctor?.speciality || item.speciality || "General";
              const image = item.doctor?.image || item.image || "/default-doctor.png";

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer"
                >
                  {/* Doctor Image */}
                  <div className="w-full h-56 flex items-center justify-center bg-gray-50">
                    <img
                      src={image}
                      alt={doctorName}
                      className="max-h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <p className="font-semibold text-lg text-gray-900">{item.title || "Appointment"}</p>
                    <p className="text-gray-600 text-sm mt-1">
                      {doctorName} | {speciality} | {item.date} | {item.time}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handlePay(item._id)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        Pay
                      </button>
                      <button
                        onClick={() => handleCancel(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 📌 Single Book Appointment button below grid */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/doctors")}
              className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Book Appointment
            </button>
          </div>
        </>
      )}

      {/* 🔔 Popup */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className={`relative bg-white rounded-lg p-6 shadow-xl max-w-sm w-full flex flex-col items-center transition transform animate-slide-up`}>
            <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white 
              ${popup.type === "success" ? "bg-green-500" : popup.type === "error" ? "bg-red-500" : "bg-blue-500"}`}>
              {popup.type === "success" ? "✓" : popup.type === "error" ? "✗" : "i"}
            </div>
            <p className="text-center text-gray-800 font-medium">{popup.message}</p>
          </div>
        </div>
      )}

      {/* 🖌 Animation CSS */}
      <style>
        {`
          @keyframes slide-up {
            0% { transform: translateY(50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default MyAppointments;
