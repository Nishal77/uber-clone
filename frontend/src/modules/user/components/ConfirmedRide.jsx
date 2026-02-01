import React, { useState } from 'react'
import PaymentMethodSelector from './PaymentMethodSelector'

const ConfirmedRide = ({ setConfirmRidePanel, setVehicleFound, createRide, pickup, destination, fare, vehicleType }) => {
    const [paymentMethod, setPaymentMethod] = useState('cash')

    const handleConfirmRide = () => {
        createRide(paymentMethod)
    }

    return (
        <div>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                setConfirmRidePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-bold mb-5 text-gray-800'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center pb-5'>
                <img className='h-28 animate-bounce' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                
                <div className='w-full mt-5 space-y-4'>
                    {/* Trip Details */}
                    <div className='bg-gray-50 rounded-xl p-1'>
                        <div className='flex items-center gap-5 p-3 border-b border-gray-200'>
                            <i className="ri-map-pin-user-fill text-xl text-green-500"></i>
                            <div className='flex-1'>
                                <p className='text-xs text-gray-500'>Pickup</p>
                                <h3 className='text-sm font-bold text-gray-800 line-clamp-1'>{pickup}</h3>
                            </div>
                        </div>
                        <div className='flex items-center gap-5 p-3'>
                            <i className="text-xl ri-map-pin-2-fill text-red-500"></i>
                            <div className='flex-1'>
                                <p className='text-xs text-gray-500'>Destination</p>
                                <h3 className='text-sm font-bold text-gray-800 line-clamp-1'>{destination}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <PaymentMethodSelector 
                        selectedMethod={paymentMethod}
                        onMethodChange={setPaymentMethod}
                        fare={fare[vehicleType]}
                    />
                </div>
                
                <button onClick={handleConfirmRide} className='w-full mt-5 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg p-4 rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all transform active:scale-95'>
                    <div className='flex items-center justify-center gap-2'>
                        <span>Confirm Ride</span>
                        <i className="ri-arrow-right-line text-xl"></i>
                    </div>
                </button>
            </div>
        </div>
    )
}

export default ConfirmedRide
