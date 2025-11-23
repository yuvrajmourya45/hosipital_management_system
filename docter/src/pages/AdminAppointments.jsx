import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar } from "lucide-react";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.log("Error loading appointments", err);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Calendar size={28} />
        <h1 className="text-3xl font-bold">All Appointments</h1>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-xl">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">#</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Doctor</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {appointments.length > 0 ? (
              appointments.map((a, i) => (
                <tr key={a._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{a.patientName}</td>
                  <td className="p-3">{a.doctorName}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3 font-semibold text-blue-600">{a.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-5 text-center text-gray-500">
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
