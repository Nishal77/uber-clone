import React from 'react'
import LiveTracking from './LiveTracking'

const WaitingForDriver = ({ setWaitingForDriver, ride, pickup, destination, fare, vehicleType }) => {
  console.log('WaitingForDriver - ride data:', ride)
  
  return (
    <div className='h-full flex flex-col'>
      <h5 className='p-1 text-center w-[93%] absolute top-0 z-10' onClick={() => {
        setWaitingForDriver(false)
      }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>

      {/* Map Section */}
      <div className='h-1/2 relative'>
        <LiveTracking />
        <div className='absolute top-4 left-4 right-4 bg-white rounded-xl px-4 py-2 shadow-lg'>
          <p className='text-sm text-gray-600'>Driver is on the way</p>
          <p className='font-bold text-gray-900'>Arriving in ~5 mins</p>
        </div>
      </div>

      {/* Driver Details Section */}
      <div className='flex-1 bg-white px-4 py-4 overflow-y-auto'>
        {/* OTP Display */}
        {ride?.otp && (
          <div className='bg-green-50 border-2 border-green-400 rounded-xl p-3 mb-4 text-center'>
            <p className='text-xs text-gray-600 mb-1'>Your OTP</p>
            <p className='text-3xl font-bold tracking-widest text-gray-900'>{ride.otp}</p>
            <p className='text-xs text-gray-500 mt-1'>Share with driver to start ride</p>
          </div>
        )}

        {/* Driver Info */}
        <div className='flex items-center justify-between mb-4 bg-gray-50 p-4 rounded-xl'>
          <div className='flex items-center gap-3'>
            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl'>
              {ride?.captain?.fullname?.firstname?.[0] || 'D'}
            </div>
            <div>
              <h2 className='text-lg font-bold capitalize'>
                {ride?.captain?.fullname?.firstname || 'Driver'} {ride?.captain?.fullname?.lastname || ''}
              </h2>
              <p className='text-sm text-gray-600'>
                {ride?.captain?.vehicle?.plate || 'Vehicle'} • {ride?.captain?.vehicle?.vehicleType || 'Car'}
              </p>
              <div className='flex items-center gap-1 mt-1'>
                <i className="ri-star-fill text-yellow-500 text-sm"></i>
                <span className='text-sm font-semibold'>4.9</span>
              </div>
            </div>
          </div>
          <a 
            href={`tel:${ride?.captain?.phone || ''}`}
            className='w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors'
          >
            <i className="ri-phone-line text-xl"></i>
          </a>
        </div>

        {/* Trip Details */}
        <div className='space-y-3'>
          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
              <i className="ri-map-pin-user-fill text-green-600"></i>
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-500'>Pickup</p>
              <p className='text-sm font-medium text-gray-900'>{pickup || ride?.pickup}</p>
            </div>
          </div>

          <div className='flex items-start gap-3'>
            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1'>
              <i className="ri-map-pin-2-fill text-red-600"></i>
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-500'>Destination</p>
              <p className='text-sm font-medium text-gray-900'>{destination || ride?.destination}</p>
            </div>
          </div>

          <div className='flex items-center gap-3 bg-blue-50 p-3 rounded-xl'>
            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
              <i className="ri-money-rupee-circle-fill text-white"></i>
            </div>
            <div className='flex-1'>
              <p className='text-xs text-gray-600'>Trip Fare</p>
              <p className='text-lg font-bold text-gray-900'>₹{fare[vehicleType] || ride?.fare}</p>
            </div>
            <span className='text-xs bg-white px-3 py-1 rounded-lg text-gray-600'>Cash</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitingForDriver
