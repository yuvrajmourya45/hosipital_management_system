import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3 } from "lucide-react";

export default function AdminReports() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    appointments: 0
  });

  const loadStats = async () => {
    try {
      const doc = await axios.get("http://localhost:8000/api/doctors");
      const pat = await axios.get("http://localhost:8000/api/patients");
      const app = await axios.get("http://localhost:8000/api/appointments");

      setStats({
        doctors: doc.data.length,
        patients: pat.data.length,
        appointments: app.data.length
      });
    } catch (err) {
      console.log("Error loading reports", err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={28} />
        <h1 className="text-3xl font-bold">Reports & Statistics</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-xl font-semibold">Total Doctors</h2>
          <p className="text-4xl font-bold mt-3 text-blue-600">{stats.doctors}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-xl font-semibold">Total Patients</h2>
          <p className="text-4xl font-bold mt-3 text-green-600">{stats.patients}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-xl text-center">
          <h2 className="text-xl font-semibold">Total Appointments</h2>
          <p className="text-4xl font-bold mt-3 text-purple-600">
            {stats.appointments}
          </p>
        </div>
      </div>
    </div>
  );
}
