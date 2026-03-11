import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { doctors as localDoctors } from "../assets/assets_frontend/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://hosipital-management-system-backend.onrender.com";

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      console.log('Doctors data from backend:', data);
      if (data && data.length > 0) {
        setDoctors(data);
        console.log('✅ Using backend doctors:', data.length);
      } else {
        console.log('❌ No doctors found in backend');
        setDoctors([]);
      }
    } catch (error) {
      console.log('❌ Error fetching doctors:', error);
      setDoctors([]);
    }
  };

  useEffect(() => {
    getDoctorsData();
  }, []);

  const value = {
    doctors,
    currencySymbol,
    getDoctorsData,
    backendUrl
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
