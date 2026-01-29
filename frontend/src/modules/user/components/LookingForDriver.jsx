import React from 'react'

const LookingForDriver = ({ setVehicleFound, pickup, destination, fare, vehicleType, ride }) => {
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                setVehicleFound(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

            {/* OTP Display - Prominent */}
            {ride?.otp && (
                <div className='bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-4 mb-6 text-center'>
                    <p className='text-sm text-gray-600 mb-2'>Share this OTP with your driver</p>
                    <div className='bg-white rounded-xl py-3 px-6 inline-block border-2 border-yellow-500'>
                        <p className='text-4xl font-bold tracking-widest text-gray-900'>{ride.otp}</p>
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>Do not share with anyone else</p>
                </div>
            )}

            <div className='flex gap-2 justify-between flex-col items-center'>
                <img className='h-20' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2'>
                        <i className="text-lg ri-map-pin-2-fill"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destination}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{fare[vehicleType]}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Cash Cash</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LookingForDriver
