import React from 'react'
import { assets } from "../assets/assets_admin/assets";
import {hello} from "../assets/assets_frontend/assets" 
const Header = () => {
  return (
    <div className='flex flex-col md:flex-row bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg px-6 md:px-10 lg:px-20 my-6 mx-4 lg:mx-0 overflow-hidden'>
       {/* Left Side */}
       <div className='md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 md:py-16 lg:py-20'>
            <p className='text-3xl md:text-4xl lg:text-5xl text-white font-bold leading-tight'>
                Book Appointment <br /> With Trusted Doctors
            </p>
            <div className='flex flex-col md:flex-row items-start md:items-center gap-4 text-white text-sm font-light'>
                <img className='w-24 md:w-28' src={hello.group_profiles} alt="Group profiles" />
                <p className='text-left md:text-left leading-relaxed'>Simply browse through our extensive list of trusted doctors, <br className='hidden sm:block' /> schedule your appointment hassle-free</p>
            </div>
            <a href="#speciality" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-700 text-sm font-medium hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-lg'>
                Book appointment <img className='w-3' src={hello.arrow_icon} alt="Arrow" />
            </a>
       </div>

       {/* Right Side */}
       <div className='md:w-1/2 relative flex items-end justify-end'>
            <img className='w-full h-auto max-w-md md:max-w-lg object-contain' src={hello.header_img} alt="Doctors" />
       </div>
    </div>
  )
}

export default Header
