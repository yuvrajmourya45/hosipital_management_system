import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { hello } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDocters";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol } = useContext(AppContext);
  const navigate = useNavigate();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(null);
  const [slotTime, setSlotTime] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const doc = doctors.find((d) => d._id === docId);
    setDocInfo(doc);
  }, [doctors, docId]);

  useEffect(() => {
    if (!docInfo) return;
    const times = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM",
      "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
      "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
      "05:30 PM", "06:00 PM",
    ];

    const today = new Date();
    const slots = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      slots.push({
        day: daysOfWeek[currentDate.getDay()],
        date: currentDate.getDate(),
        times,
        fullDate: currentDate.toISOString().split("T")[0],
      });
    }

    setDocSlots(slots);
  }, [docInfo]);

  const handleBookAppointment = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    if (slotIndex === null || !slotTime) return alert("Select date & time");

    const selectedSlot = docSlots[slotIndex];

    const appointmentData = {
      doctor: docInfo._id,   // <-- FIX 100%
      speciality: docInfo.speciality,
      date: selectedSlot.fullDate,
      time: slotTime,
      image: docInfo.image,
    };

    try {
      const res = await fetch("http://localhost:8000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");

      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate("/my-appointments");
      }, 1000);
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  if (!docInfo) return <p>Loading...</p>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img className="bg-blue-500 w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={hello.verified_icon} alt="" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>{docInfo.degree} - {docInfo.speciality}</p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={hello.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee: <span className="text-gray-600">{currencySymbol}{docInfo.fees}</span>
          </p>
        </div>
      </div>

      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking slots</p>

        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.map((slot, index) => (
            <div key={index}
              onClick={() => { setSlotIndex(index); setSlotTime(null); }}
              className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                slotIndex === index ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-700"
              }`}>
              <p className="font-semibold">{slot.day}</p>
              <p>{slot.date}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {slotIndex !== null && docSlots[slotIndex].times.map((time, index) => (
            <p key={index}
              onClick={() => setSlotTime(time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                slotTime === time ? "bg-blue-500 text-white" : "text-gray-400 border border-gray-300"
              }`}>
              {time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          onClick={handleBookAppointment}
          className="bg-blue-500 text-white text-sm font-light px-14 py-3 rounded-full mt-3.5"
        >
          Book an appointment
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center animate-popupSlideIn">
            <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl mb-3">✓</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Appointment Confirmed!</h2>
            <p className="text-gray-500 text-sm mb-3 text-center">
              Your appointment has been successfully booked.
            </p>
            <div className="w-40 h-[4px] bg-green-500 animate-progressBar rounded-full"></div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes popupSlideIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-popupSlideIn { animation: popupSlideIn 0.4s ease; }
        @keyframes progressBar { from { width: 100%; } to { width: 0%; } }
        .animate-progressBar { animation: progressBar 2s linear forwards; }
      `}</style>

      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  );
};

export default Appointment;
