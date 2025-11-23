import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyProfile = () => {
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUserData(JSON.parse(storedUser));
    else navigate("/login");
    setLoading(false);
  }, [navigate]);

  const handleSave = async () => {
    if (!userData) return;

    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("phone", userData.phone || "");
    formData.append("gender", userData.gender || "");
    if (profilePic) formData.append("profilePic", profilePic);

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await axios.put(
        `http://localhost:8000/api/auth/profile/${userData._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(res.data.message);
      setUserData(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setIsEdit(false);
    } catch (err) {
      console.error(err.response ? err.response.data : err);
      alert("❌ Error updating profile. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!userData) return <p className="text-center mt-10">Please login first.</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 flex flex-col gap-4 text-sm">
      <h1 className="text-2xl font-semibold text-center">My Profile</h1>
      <div className="flex flex-col items-center gap-3">
        <img
          src={
            profilePic
              ? URL.createObjectURL(profilePic)
              : userData.profilePic
              ? `http://localhost:8000${userData.profilePic}`
              : "https://via.placeholder.com/100"
          }
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border"
        />
        {isEdit && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfilePic(e.target.files[0])}
          />
        )}
      </div>

      <div>
        <p className="font-medium">Name:</p>
        {isEdit ? (
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
            className="border px-3 py-2 rounded w-full"
          />
        ) : <p>{userData.name}</p>}
      </div>

      <div>
        <p className="font-medium">Email:</p>
        <p className="text-gray-600">{userData.email}</p>
      </div>

      <div>
        <p className="font-medium">Phone:</p>
        {isEdit ? (
          <input
            type="text"
            value={userData.phone || ""}
            onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))}
            className="border px-3 py-2 rounded w-full"
          />
        ) : <p>{userData.phone || "Not set"}</p>}
      </div>

      <div>
        <p className="font-medium">Gender:</p>
        {isEdit ? (
          <select
            value={userData.gender || ""}
            onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        ) : <p>{userData.gender || "Not set"}</p>}
      </div>

      <div className="mt-5 flex gap-2 justify-center">
        {isEdit ? (
          <>
            <button onClick={handleSave} className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">Save</button>
            <button onClick={() => setIsEdit(false)} className="border border-gray-400 px-5 py-2 rounded hover:bg-gray-200">Cancel</button>
          </>
        ) : (
          <button onClick={() => setIsEdit(true)} className="border border-blue-600 px-5 py-2 rounded hover:bg-blue-600 hover:text-white">Edit</button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
