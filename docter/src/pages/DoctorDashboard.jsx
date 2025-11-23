// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Fetch doctor info
  const fetchDoctor = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`http://localhost:8000/api/admin/doctor/${user.id}`, {
        headers: { atoken: token },
      });
      setDoctor(res.data);
      setAvailable(res.data.avilable);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch doctor info");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      const res = await axios.get(`http://localhost:8000/api/appointments/doctor/${user.id}`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctor();
    fetchAppointments();
  }, []);

  // ✅ Update availability
  const toggleAvailability = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.put(
        `http://localhost:8000/api/admin/doctor/${user.id}/availability`,
        { avilable: !available },
        { headers: { atoken: token } }
      );
      setAvailable(!available);
      toast.success("Availability updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update availability");
    }
  };

  if (loading || !doctor) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Doctor Dashboard</h2>

      {/* Doctor Info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold">Profile</h3>
        <p><strong>Name:</strong> {doctor.name}</p>
        <p><strong>Email:</strong> {doctor.email}</p>
        <p><strong>Speciality:</strong> {doctor.speciality}</p>
        <p><strong>Experience:</strong> {doctor.experience}</p>
        <p>
          <strong>Availability:</strong>{" "}
          <span className={available ? "text-green-600" : "text-red-600"}>
            {available ? "Available" : "Not Available"}
          </span>
        </p>
        <button
          onClick={toggleAvailability}
          className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Toggle Availability
        </button>
      </div>

      {/* Appointments List */}
      <div className="p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments yet.</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="border-b">
                <th className="p-2">Patient</th>
                <th>Date</th>
                <th>Time</th>
                <th>Speciality</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id} className="border-b text-center">
                  <td>{appt.patientName || "Anonymous"}</td>
                  <td>{appt.date}</td>
                  <td>{appt.time}</td>
                  <td>{appt.speciality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default DoctorDashboard;
