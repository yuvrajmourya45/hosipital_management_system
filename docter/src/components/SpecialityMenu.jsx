import React from 'react'
import { specialityData } from '../assets/assets_frontend/assets'
import {Link} from 'react-router-dom'
const SpecialityMenu = () => {
  return (
    <div className='flex flex-col items-center gap-4 py-8 lg:py-16 text-gray-800 px-4' id='speciality'>
       <h1 className='text-2xl lg:text-3xl font-medium text-center'>Find by speciality</h1>
       <p className='sm:w-1/3 text-center text-sm lg:text-base'>Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.</p>
       <div className='flex sm:justify-center gap-3 lg:gap-4 pt-3 lg:pt-5 w-full overflow-x-auto pb-2'>
         {specialityData.map((item, index)=>(
            <Link onClick={() =>scrollTo(0,0)} className='flex flex-col items-center text-xs lg:text-sm cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 min-w-[60px] lg:min-w-[80px]' key={index} to={`/doctors/${item.speciality}`}>
                  <img className='w-12 h-12 sm:w-16 sm:h-16 lg:w-24 lg:h-24 mb-2 object-contain' src={item.image} alt="" />
                  <p className='text-center leading-tight'>{item.speciality}</p>
            </Link>
         ))}
       </div>
    </div>
  )
}

export default SpecialityMenu
