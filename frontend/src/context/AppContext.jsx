import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { doctors as localDoctors } from "../assets/assets_frontend/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [doctors, setDoctors] = useState([]);
  const currencySymbol = "$";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://hosipital-backend.onrender.com";

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctors`);
      console.log('Doctors data from backend:', data);
      if (data && data.length > 0) {
        setDoctors(data);
      } else {
        console.log('No backend data, using local doctors');
        setDoctors(localDoctors);
      }
    } catch (error) {
      console.log('Error fetching doctors:', error);
      setDoctors(localDoctors);
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
