import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit3, Trash2, X } from "lucide-react";

/**
 * DoctorsPage.jsx
 * - List doctors
 * - Add doctor (modal)
 * - Edit doctor (modal, reuses same form)
 * - Delete doctor (confirm)
 *
 * NOTE: This file expects:
 *  - Admin token saved in localStorage under "token"
 *  - Backend endpoints:
 *     GET  /api/admin/doctors          -> { doctors: [...] }
 *     POST /api/admin/doctors          -> { message, doctor }
 *     PUT  /api/admin/doctors/:id      -> { message, doctor }
 *     DELETE /api/admin/doctors/:id    -> { message }
 *
 * Replace logo path below with your real logo if needed.
 */

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // doctor object when editing
  const [form, setForm] = useState({
    name: "",
    email: "",
    speciality: "",
    degree: "",
    experience: "",
    fees: "",
    about: "",
    address: ""
  });
  const [error, setError] = useState("");

  // helper: axios config with token
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/api/admin/doctors", config);
      // backend returns { doctors: [...] }
      setDoctors(res.data.doctors || res.data);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      speciality: "",
      degree: "",
      experience: "",
      fees: "",
      about: "",
      address: ""
    });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (doc) => {
    setEditing(doc);
    setForm({
      name: doc.name || "",
      email: doc.email || "",
      speciality: doc.speciality || "",
      degree: doc.degree || "",
      experience: doc.experience || "",
      fees: doc.fees || "",
      about: doc.about || "",
      address: doc.address ? JSON.stringify(doc.address) : ""
    });
    setError("");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/admin/doctors/${id}`, config);
      setDoctors((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    // basic validation
    if (!form.name || !form.email || !form.speciality) {
      setError("Name, email and speciality are required.");
      return;
    }

    try {
      if (editing) {
        // Edit
        const res = await axios.put(
          `http://localhost:5000/api/admin/doctors/${editing._id}`,
          {
            name: form.name,
            email: form.email,
            speciality: form.speciality,
            degree: form.degree,
            experience: form.experience,
            about: form.about,
            fees: form.fees,
            address: form.address ? JSON.parseSafe?.(form.address) ?? form.address : form.address
          },
          config
        );
        // update list
        setDoctors((prev) => prev.map((d) => (d._id === editing._id ? res.data.doctor || res.data : d)));
      } else {
        // Add
        // Note: If backend expects multipart/form-data for image upload, adjust accordingly. Here we send JSON.
        const res = await axios.post(
          "http://localhost:8000/api/admin/doctors",
          {
            name: form.name,
            email: form.email,
            speciality: form.speciality,
            degree: form.degree,
            experience: form.experience,
            about: form.about,
            fees: form.fees,
            address: form.address
          },
          config
        );
        const newDoctor = res.data.doctor || res.data;
        // add to list
        setDoctors((prev) => [newDoctor, ...prev]);
      }

      setModalOpen(false);
    } catch (err) {
      console.error("Save failed", err);
      // try to extract message
      const msg = err?.response?.data?.message || err?.message || "Save failed";
      setError(msg);
    }
  };

  // safe JSON parse helper (to avoid crash on invalid json)
  const parseAddress = (addr) => {
    try {
      return JSON.parse(addr);
    } catch {
      return addr;
    }
  };

  return (
    <div className="p-6">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/mnt/data/d6df0c7d-9b68-4dce-b4d5-ccd05e5fb65b.png" alt="logo" className="w-12 h-12 rounded-md" />
          <div>
            <h2 className="text-2xl font-semibold">Manage Doctors</h2>
            <p className="text-gray-500 text-sm">Add, edit or remove doctors from your clinic.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      </div>

      {/* list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-600">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Speciality</th>
              <th className="p-3">Experience</th>
              <th className="p-3">Fees</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
            ) : doctors.length === 0 ? (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">No doctors yet</td></tr>
            ) : (
              doctors.map((d) => (
                <tr key={d._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* doctor.image or placeholder */}
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm text-gray-600">
                        {d.name?.slice(0,1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.degree || "-"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="p-3 text-sm">{d.email}</td>
                  <td className="p-3 text-sm">{d.speciality}</td>
                  <td className="p-3 text-sm">{d.experience || "-"}</td>
                  <td className="p-3 text-sm">{d.fees || "-"}</td>

                  <td className="p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(d)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-100 text-yellow-700">
                        <Edit3 size={14} /> Edit
                      </button>

                      <button onClick={() => handleDelete(d._id)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-100 text-red-700">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-600">
              <X size={18} />
            </button>

            <h3 className="text-xl font-semibold mb-4">{editing ? "Edit Doctor" : "Add Doctor"}</h3>

            {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Name *</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email *</label>
                <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Speciality *</label>
                <input value={form.speciality} onChange={(e) => setForm({...form, speciality: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Degree</label>
                <input value={form.degree} onChange={(e) => setForm({...form, degree: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Experience (years)</label>
                <input value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="text-sm text-gray-600">Fees</label>
                <input value={form.fees} onChange={(e) => setForm({...form, fees: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-600">About</label>
                <textarea value={form.about} onChange={(e) => setForm({...form, about: e.target.value})}
                          className="mt-1 w-full border rounded px-3 py-2 text-sm" rows={3} />
              </div>

              <div className="col-span-2">
                <label className="text-sm text-gray-600">Address (JSON or plain)</label>
                <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                       className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder='{"city":"X","street":"Y"} or plain text' />
              </div>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {editing ? "Update Doctor" : "Add Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
