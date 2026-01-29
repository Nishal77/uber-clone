import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import LiveTracking from '../../user/components/LiveTracking'
import axios from 'axios'

const CaptainRiding = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const ride = location.state?.ride
    const [finishRidePanel, setFinishRidePanel] = useState(false)

    const finishRide = async () => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/rides/end-ride`,
                {
                    rideId: ride._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            if (response.status === 200) {
                navigate('/captain-home')
            }
        } catch (err) {
            console.error('Error ending ride:', err)
            alert('Failed to end ride. Please try again.')
        }
    }

    if (!ride) {
        return (
            <div className='h-screen flex items-center justify-center bg-white'>
                <div className='text-center'>
                    <p className='text-gray-600 mb-4'>No active ride</p>
                    <Link to='/captain-home' className='text-blue-600 underline'>Go back to home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className='h-screen flex flex-col bg-white'>
            {/* Header */}
            <div className='flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img className='h-6' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                        <span className='text-gray-400 text-sm'>|</span>
                        <span className='text-gray-600 text-sm font-medium'>Navigation</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700'>
                            <span className='inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-blue-500 animate-pulse'></span>
                            Ride in Progress
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />
                
                {/* Navigation Instructions Overlay */}
                <div className='absolute top-4 left-4 right-4 z-[1000]'>
                    <div className='bg-white rounded-xl p-4 border border-gray-200'>
                        <div className='flex items-center gap-3 mb-2'>
                            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                <i className="ri-navigation-line text-blue-600 text-lg"></i>
                            </div>
                            <div className='flex-1'>
                                <p className='text-xs text-gray-500'>Heading to pickup</p>
                                <p className='font-bold text-gray-900'>{ride.pickup}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-xs text-gray-600'>
                            <i className="ri-time-line"></i>
                            <span>5 min</span>
                            <span>•</span>
                            <i className="ri-map-pin-line"></i>
                            <span>2.2 km</span>
                        </div>
                    </div>
                </div>

                {/* Complete Trip Button */}
                <div className='absolute bottom-4 left-4 right-4 z-[1000]'>
                    <button 
                        onClick={() => setFinishRidePanel(true)}
                        className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2'
                    >
                        <i className="ri-checkbox-circle-line text-xl"></i>
                        <span>Complete Trip</span>
                    </button>
                </div>
            </div>

            {/* Bottom Info Panel */}
            <div className='flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4'>
                <div className='max-w-md mx-auto'>
                    {/* Rider Info */}
                    <div className='bg-gray-50 rounded-xl p-4 border border-gray-100 mb-3'>
                        <div className='flex items-center gap-3 mb-3'>
                            <img 
                                className='w-12 h-12 rounded-full object-cover' 
                                src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" 
                                alt="Rider" 
                            />
                            <div className='flex-1'>
                                <h3 className='font-bold text-gray-900'>
                                    {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                                </h3>
                                <div className='flex items-center gap-1 text-xs text-gray-600'>
                                    <i className="ri-star-fill text-yellow-500"></i>
                                    <span>4.9</span>
                                </div>
                            </div>
                            <a 
                                href={`tel:${ride.user?.phone || ''}`}
                                className='w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-colors'
                            >
                                <i className="ri-phone-line text-lg"></i>
                            </a>
                        </div>

                        {/* Trip Route */}
                        <div className='space-y-2'>
                            <div className='flex items-start gap-3'>
                                <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                                    <i className="ri-map-pin-user-fill text-green-600 text-sm"></i>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-xs text-gray-500'>Pickup</p>
                                    <p className='text-sm font-medium text-gray-900'>{ride.pickup}</p>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5'>
                                    <i className="ri-map-pin-2-fill text-red-600 text-sm"></i>
                                </div>
                                <div className='flex-1'>
                                    <p className='text-xs text-gray-500'>Destination</p>
                                    <p className='text-sm font-medium text-gray-900'>{ride.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fare Info */}
                    <div className='flex items-center justify-between bg-green-50 rounded-xl p-3 border border-green-100'>
                        <div className='flex items-center gap-2'>
                            <i className="ri-money-rupee-circle-fill text-green-600 text-xl"></i>
                            <div>
                                <p className='text-xs text-gray-600'>Trip Fare</p>
                                <p className='text-lg font-bold text-gray-900'>₹{ride.fare}</p>
                            </div>
                        </div>
                        <div className='px-3 py-1 bg-white rounded-lg border border-green-200'>
                            <p className='text-xs text-gray-600'>Cash</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Finish Ride Confirmation Panel */}
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-5 py-8 rounded-t-2xl border-t border-gray-200 transition-transform duration-300 ${finishRidePanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className='max-w-md mx-auto'>
                    <h3 className='text-2xl font-bold mb-4 text-center'>Complete This Trip?</h3>
                    <p className='text-center text-gray-600 mb-6'>Make sure you've reached the destination</p>
                    
                    <div className='bg-gray-50 rounded-xl p-4 mb-6'>
                        <div className='flex justify-between items-center mb-2'>
                            <span className='text-gray-600'>Trip Fare:</span>
                            <span className='text-xl font-bold text-gray-900'>₹{ride.fare}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Payment:</span>
                            <span className='text-sm font-medium text-gray-900'>Cash</span>
                        </div>
                    </div>

                    <button 
                        onClick={finishRide}
                        className='w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors mb-3'
                    >
                        Confirm & Complete Trip
                    </button>
                    <button 
                        onClick={() => setFinishRidePanel(false)}
                        className='w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl transition-colors'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CaptainRiding
