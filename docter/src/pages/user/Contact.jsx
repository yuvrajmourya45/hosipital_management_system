import React from 'react'
import { hello } from "../../assets/assets_frontend/assets";
const Context = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className='text-center text-xl sm:text-2xl pt-6 sm:pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-6 sm:my-10 flex flex-col justify-center md:flex-row gap-6 sm:gap-10 mb-16 sm:mb-28 text-sm'>

        <img className='w-full md:max-w-[360px] rounded-lg' src={hello.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-4 sm:gap-6'>
          <p className='font-semibold text-base sm:text-lg text-gray-600'>OUR OFFICE</p>
          <p className='text-gray-500'>54709 Willms Station <br /> Suite 000, Washington, USA</p>
          <p className='text-gray-500'>Tel: (415) 555-0132 <br /> Email: greatstackdev@gmail.com</p>
          <p className='font-semibold text-base sm:text-lg text-gray-600'>CAREERS AT PRESCRIPTO</p>
          <p className='text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='border border-black px-6 sm:px-8 py-3 sm:py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
        </div>

      </div>
    </div>
  )
}

export default Context
