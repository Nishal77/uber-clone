import React from 'react'

const ConfirmedRide = ({ setConfirmRidePanel, setVehicleFound, createRide, pickup, destination, fare, vehicleType }) => {
    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                setConfirmRidePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-bold mb-5 text-gray-800'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center pb-5'>
                <img className='h-28 animate-bounce' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 p-3 border-b-2 border-gray-100'>
                        <i className="ri-map-pin-user-fill text-xl text-gray-500"></i>
                        <div>
                            <h3 className='text-lg font-bold text-gray-800 line-clamp-1'>{pickup}</h3>
                            <p className='text-sm text-gray-500'>Pickup Location</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3 border-b-2 border-gray-100'>
                        <i className="text-xl ri-map-pin-2-fill text-gray-500"></i>
                        <div>
                            <h3 className='text-lg font-bold text-gray-800 line-clamp-1'>{destination}</h3>
                            <p className='text-sm text-gray-500'>Destination</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl text-gray-500"></i>
                        <div>
                            <h3 className='text-lg font-bold text-gray-800'>₹{fare[ vehicleType ]}</h3>
                            <p className='text-sm text-gray-500'>Cash Payment</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => {
                    createRide()

                }} className='w-full mt-5 bg-green-600 text-white font-bold text-lg p-3 rounded-xl shadow-lg hover:bg-green-700 transition-colors'>Confirm Ride</button>
            </div>
        </div>
    )
}

export default ConfirmedRide
