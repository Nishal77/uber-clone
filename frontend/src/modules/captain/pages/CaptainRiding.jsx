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
            <div className='h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center bg-white p-10 rounded-2xl border-2 border-gray-200'>
                    <div className='w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6'>
                        <i className="ri-car-line text-4xl text-gray-400"></i>
                    </div>
                    <p className='text-gray-600 mb-4 text-lg font-medium'>No active ride</p>
                    <Link to='/captain-home' className='inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors'>
                        Go to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className='h-screen flex flex-col bg-gray-50'>
            {/* Clean Header */}
            <div className='flex-shrink-0 bg-white border-b-2 border-gray-200 px-6 py-4 z-10'>
                <div className='flex items-center justify-between max-w-md mx-auto'>
                    <div className='flex items-center gap-4'>
                        <img className='h-6' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                        <div className='h-5 w-px bg-gray-300'></div>
                        <span className='text-gray-700 text-sm font-bold tracking-wide uppercase'>Navigation</span>
                    </div>
                    <div className='px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white'>
                        <span className='inline-block w-2 h-2 rounded-full mr-2 bg-white animate-pulse'></span>
                        ACTIVE RIDE
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />
                
                {/* Navigation Card - Flat Design */}
                <div className='absolute top-6 left-4 right-4 z-[1000]'>
                    <div className='bg-white rounded-3xl p-6 border-2 border-gray-200 max-w-md mx-auto'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center'>
                                <i className="ri-navigation-fill text-white text-2xl"></i>
                            </div>
                            <div className='flex-1'>
                                <p className='text-xs text-blue-600 uppercase tracking-wider font-bold mb-1'>Heading to Pickup</p>
                                <p className='font-bold text-gray-900 text-base line-clamp-1'>{ride.pickup}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-4 pt-3 border-t-2 border-gray-100'>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                                <div className='w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center'>
                                    <i className="ri-time-line text-orange-600"></i>
                                </div>
                                <span className='font-bold text-gray-900'>5 min</span>
                            </div>
                            <div className='h-4 w-px bg-gray-200'></div>
                            <div className='flex items-center gap-2 text-sm font-medium'>
                                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center'>
                                    <i className="ri-map-pin-line text-green-600"></i>
                                </div>
                                <span className='font-bold text-gray-900'>2.2 km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Complete Button - Flat Design */}
                <div className='absolute bottom-6 left-4 right-4 z-[1000]'>
                    <div className='max-w-md mx-auto'>
                        <button 
                            onClick={() => setFinishRidePanel(true)}
                            className='w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-5 rounded-2xl transition-colors flex items-center justify-center gap-3'
                        >
                            <i className="ri-checkbox-circle-fill text-2xl"></i>
                            <span className='text-lg tracking-wide'>Complete Trip</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Panel - Clean Design */}
            <div className='flex-shrink-0 bg-white border-t-2 border-gray-200 px-4 py-6'>
                <div className='max-w-md mx-auto space-y-4'>
                    {/* Rider Card - Flat */}
                    <div className='bg-gray-50 rounded-3xl p-5 border-2 border-gray-200'>
                        <div className='flex items-center gap-4 mb-5'>
                            <div className='relative'>
                                <img 
                                    className='w-16 h-16 rounded-2xl object-cover border-4 border-white' 
                                    src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" 
                                    alt="Rider" 
                                />
                                <div className='absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center'>
                                    <i className="ri-shield-check-fill text-white text-xs"></i>
                                </div>
                            </div>
                            <div className='flex-1'>
                                <h3 className='font-bold text-gray-900 text-lg mb-1'>
                                    {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                                </h3>
                                <div className='flex items-center gap-2'>
                                    <div className='flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-lg border border-orange-200'>
                                        <i className="ri-star-fill text-orange-500 text-sm"></i>
                                        <span className='text-sm font-bold text-orange-900'>4.9</span>
                                    </div>
                                    <span className='text-xs text-gray-500'>• Verified</span>
                                </div>
                            </div>
                            <a 
                                href={`tel:${ride.user?.phone || ''}`}
                                className='w-14 h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-2xl flex items-center justify-center text-white transition-colors'
                            >
                                <i className="ri-phone-fill text-xl"></i>
                            </a>
                        </div>

                        {/* Route Display - Clean */}
                        <div className='bg-white rounded-2xl p-4 space-y-4 border-2 border-gray-200'>
                            <div className='flex items-start gap-3'>
                                <div className='flex flex-col items-center gap-2 pt-1'>
                                    <div className='w-4 h-4 bg-green-600 rounded-full'></div>
                                    <div className='w-0.5 h-8 bg-gray-300'></div>
                                    <div className='w-4 h-4 bg-orange-500 rounded-full'></div>
                                </div>
                                <div className='flex-1 space-y-5'>
                                    <div>
                                        <p className='text-xs text-green-600 font-bold mb-1 uppercase tracking-wider'>Pickup Location</p>
                                        <p className='text-sm font-semibold text-gray-900 line-clamp-2'>{ride.pickup}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-orange-600 font-bold mb-1 uppercase tracking-wider'>Drop Location</p>
                                        <p className='text-sm font-semibold text-gray-900 line-clamp-2'>{ride.destination}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fare Display - Simple & Clean */}
                    <div className='bg-blue-600 rounded-3xl p-6 border-2 border-blue-700'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center'>
                                    <i className="ri-money-rupee-circle-fill text-white text-2xl"></i>
                                </div>
                                <div>
                                    <p className='text-xs text-blue-200 font-bold uppercase tracking-wider mb-1'>Trip Earnings</p>
                                    <p className='text-3xl font-bold text-white'>₹{ride.fare}</p>
                                </div>
                            </div>
                            <div className='px-4 py-2 bg-white rounded-xl border-2 border-blue-700'>
                                <p className='text-sm text-blue-600 font-bold'>
                                    {ride.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal - Flat & Clean */}
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-6 py-8 rounded-t-3xl border-t-2 border-gray-200 transition-transform duration-500 ${finishRidePanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className='max-w-md mx-auto'>
                    {/* Modal Handle */}
                    <div className='w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-8'></div>
                    
                    <div className='text-center mb-8'>
                        <div className='w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-green-200'>
                            <i className="ri-checkbox-circle-line text-4xl text-green-600"></i>
                        </div>
                        <h3 className='text-2xl font-bold mb-2 text-gray-900'>Complete This Trip?</h3>
                        <p className='text-gray-600'>Confirm that you've reached the destination</p>
                    </div>
                    
                    <div className='bg-gray-50 rounded-2xl p-6 mb-6 border-2 border-gray-200'>
                        <div className='flex justify-between items-center mb-4 pb-4 border-b-2 border-gray-200'>
                            <span className='text-gray-600 font-medium'>Trip Fare</span>
                            <span className='text-2xl font-bold text-gray-900'>₹{ride.fare}</span>
                        </div>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600 font-medium'>Payment Method</span>
                            <div className='flex items-center gap-2'>
                                <div className='w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center border border-green-200'>
                                    <i className="ri-money-rupee-circle-fill text-green-600"></i>
                                </div>
                                <span className='font-bold text-gray-900'>
                                    {ride.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-3'>
                        <button 
                            onClick={finishRide}
                            className='w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-5 rounded-2xl transition-colors'
                        >
                            Confirm & Complete Trip
                        </button>
                        <button 
                            onClick={() => setFinishRidePanel(false)}
                            className='w-full bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold py-4 rounded-2xl transition-colors'
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay when modal is open */}
            {finishRidePanel && (
                <div 
                    className='fixed inset-0 bg-black/40 z-[9998]'
                    onClick={() => setFinishRidePanel(false)}
                ></div>
            )}
        </div>
    )
}

export default CaptainRiding
