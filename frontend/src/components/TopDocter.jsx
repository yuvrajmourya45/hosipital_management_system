import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const TopDoctor = () => {
  const navigate = useNavigate()
  const { doctors, backendUrl } = useContext(AppContext)

  return (
    <div className='flex flex-col items-center gap-4 my-8 lg:my-16 text-gray-900 px-4 lg:px-10'>
      <h1 className='text-2xl lg:text-3xl font-medium text-center'>Top Doctors to Book</h1>
      <p className='sm:w-1/3 text-center text-sm lg:text-base'>
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5 pt-3 lg:pt-5'>
        {doctors?.slice(0, 10).map((item, index) => (
          <div
            onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }}
            className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-500 bg-white shadow-sm hover:shadow-md'
            key={index}
          >
            <img
              className='bg-blue-50 w-full h-40 lg:h-48 object-cover'
              src={item.image?.startsWith('http') ? item.image.replace('/uploads//uploads/', '/uploads/') : 
                   item.image ? `http://localhost:8000${item.image}` : 
                   'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvY3RvciBJbWFnZTwvdGV4dD48L3N2Zz4='}
              alt={item.name}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRvY3RvciBJbWFnZTwvdGV4dD48L3N2Zz4=';
              }}
            />

            <div className='p-3 lg:p-4'>
              <div className='flex items-center gap-2 text-xs lg:text-sm text-green-500'>
                <p className='w-2 h-2 bg-green-500 rounded-full'></p>
                <p>Available</p>
              </div>
              <p className='font-medium text-base lg:text-lg text-gray-900 truncate'>{item.name}</p>
              <p className='text-gray-600 text-sm truncate'>{item.speciality}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { navigate('/doctors'); window.scrollTo(0, 0) }}
        className='bg-blue-50 text-gray-600 px-8 lg:px-12 py-2 lg:py-3 rounded-full mt-6 lg:mt-10 text-sm lg:text-base hover:bg-blue-100 transition-colors'
      >
        More
      </button>
    </div>
  )
}

export default TopDoctor
