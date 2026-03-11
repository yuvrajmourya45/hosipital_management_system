import React from 'react';
import Header from '../../components/Header';
import SpecialityMenu from '../../components/SpecialityMenu';
import TopDocter from '../../components/TopDocter';
import Banner from '../../components/Banner';

// Home Page - Landing page with all sections
const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <Header />
      
      {/* Speciality Categories */}
      <SpecialityMenu />
      
      {/* Top Doctors List */}
      <TopDocter />
      
      {/* Call to Action Banner */}
      <Banner />
    </div>
  );
};

export default Home;
