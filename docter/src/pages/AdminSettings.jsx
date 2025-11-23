import React, { useState } from "react";
import axios from "axios";
import { Settings } from "lucide-react";

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: "",
    password: ""
  });

  const updateAdmin = async () => {
    try {
      await axios.put("http://localhost:8000/api/admin/update", form);
      alert("Settings updated successfully!");
    } catch (err) {
      console.log("Error updating settings", err);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={28} />
        <h1 className="text-3xl font-bold">Admin Settings</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-xl w-1/2">
        <label className="block mb-3">
          <p className="font-medium mb-1">Admin Name</p>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>

        <label className="block mb-3">
          <p className="font-medium mb-1">New Password</p>
          <input
            type="password"
            className="w-full border p-2 rounded"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>

        <button
          onClick={updateAdmin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg mt-4"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
