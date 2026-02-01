import React, { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../../../context/SocketContext'

const Riding = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const initialRide = location.state?.ride
    const { socket } = useContext(SocketContext)

    const [ride, setRide] = useState(initialRide)
    const [rideStatus, setRideStatus] = useState(initialRide?.status || 'accepted')
    const [showCompletionScreen, setShowCompletionScreen] = useState(false)

    useEffect(() => {
        if (!initialRide) {
            navigate('/home')
        }
    }, [initialRide, navigate])

    useEffect(() => {
        if (!socket || !ride) return

        const handleRideEnded = (data) => {
            console.log('🎉 Ride completed:', data)
            setRide(data)
            setRideStatus('completed')
            setShowCompletionScreen(true)
            
            // Auto-redirect to home after 4 seconds
            setTimeout(() => {
                navigate('/home')
            }, 4000)
        }

        // Listen for any ride updates
        const handleRideUpdate = (data) => {
            console.log('📱 Ride update received:', data)
            setRide(data)
            setRideStatus(data.status)
        }

        socket.on('ride-ended', handleRideEnded)
        socket.on('ride-updated', handleRideUpdate)

        return () => {
            socket.off('ride-ended', handleRideEnded)
            socket.off('ride-updated', handleRideUpdate)
        }
    }, [socket, navigate, ride])

    if (!ride) {
        return null
    }

    // Get status info based on current ride status
    const getStatusInfo = () => {
        switch (rideStatus) {
            case 'accepted':
                return {
                    text: 'Driver Assigned',
                    subtext: 'Driver is on the way to pick you up',
                    icon: 'ri-car-line',
                    color: 'blue',
                    progress: 33
                }
            case 'ongoing':
                return {
                    text: 'Trip in Progress',
                    subtext: 'Heading to your destination',
                    icon: 'ri-navigation-line',
                    color: 'green',
                    progress: 66
                }
            case 'completed':
                return {
                    text: 'Trip Completed',
                    subtext: 'You have reached your destination',
                    icon: 'ri-checkbox-circle-line',
                    color: 'green',
                    progress: 100
                }
            default:
                return {
                    text: 'Ride Status',
                    subtext: 'Please wait...',
                    icon: 'ri-time-line',
                    color: 'gray',
                    progress: 0
                }
        }
    }

    const statusInfo = getStatusInfo()

    // Completion screen
    if (showCompletionScreen) {
        return (
            <div className='h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4'>
                <div className='text-center max-w-md w-full'>
                    <div className='relative'>
                        <div className='w-32 h-32 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-2xl'>
                            <i className="ri-checkbox-circle-fill text-white text-7xl"></i>
                        </div>
                        <div className='absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-400 rounded-full opacity-50 animate-ping'></div>
                    </div>
                    
                    <h2 className='text-4xl font-bold text-gray-900 mb-3'>Trip Completed!</h2>
                    <p className='text-lg text-gray-600 mb-8'>Thank you for riding with us</p>
                    
                    <div className='bg-white rounded-3xl p-8 shadow-2xl mb-6'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='text-left'>
                                <p className='text-sm text-gray-500 mb-1'>Total Fare</p>
                                <p className='text-5xl font-bold text-green-600'>₹{ride.fare}</p>
                            </div>
                            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center'>
                                <i className="ri-money-rupee-circle-fill text-green-600 text-3xl"></i>
                            </div>
                        </div>
                        <div className='pt-4 border-t border-gray-200'>
                            <div className='flex items-center justify-between text-sm'>
                                <span className='text-gray-600'>Payment Method</span>
                                <span className='font-semibold text-gray-900'>
                                    {ride.paymentMethod === 'cash' ? '💵 Cash' : '💳 Paid Online'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rating section (placeholder) */}
                    <div className='bg-white rounded-3xl p-6 shadow-xl'>
                        <p className='text-sm text-gray-600 mb-3'>How was your ride?</p>
                        <div className='flex justify-center gap-2 mb-2'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} className='hover:scale-110 transition-transform'>
                                    <i className="ri-star-fill text-yellow-400 text-3xl"></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className='text-sm text-gray-500 mt-6'>Redirecting to home...</p>
                </div>
            </div>
        )
    }

    // Active ride screen
    return (
        <div className='h-screen flex flex-col bg-white'>
            {/* Header */}
            <div className='flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-10'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img className='h-6' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className={`px-3 py-1 rounded-full ${
                            statusInfo.color === 'green' ? 'bg-green-50' : 
                            statusInfo.color === 'blue' ? 'bg-blue-50' : 'bg-gray-50'
                        }`}>
                            <span className={`font-semibold text-xs flex items-center gap-1 ${
                                statusInfo.color === 'green' ? 'text-green-700' : 
                                statusInfo.color === 'blue' ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                                <span className={`w-2 h-2 rounded-full animate-pulse ${
                                    statusInfo.color === 'green' ? 'bg-green-500' : 
                                    statusInfo.color === 'blue' ? 'bg-blue-500' : 'bg-gray-500'
                                }`}></span>
                                {statusInfo.text}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />

                {/* Status Card Overlay */}
                <div className='absolute top-4 left-4 right-4 z-[1000]'>
                    <div className='bg-white rounded-2xl shadow-2xl p-4 border-2 border-gray-100'>
                        <div className='flex items-center gap-3 mb-3'>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                statusInfo.color === 'green' ? 'bg-green-100' : 
                                statusInfo.color === 'blue' ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                                <i className={`${statusInfo.icon} text-2xl ${
                                    statusInfo.color === 'green' ? 'text-green-600' : 
                                    statusInfo.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
                                }`}></i>
                            </div>
                            <div className='flex-1'>
                                <p className='font-bold text-gray-900'>{statusInfo.text}</p>
                                <p className='text-xs text-gray-600'>{statusInfo.subtext}</p>
                            </div>
                            {rideStatus !== 'completed' && (
                                <div className='text-right'>
                                    <p className='text-xs text-gray-500'>ETA</p>
                                    <p className='font-bold text-blue-600'>~5 min</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className='relative h-2 bg-gray-200 rounded-full overflow-hidden'>
                            <div 
                                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${
                                    statusInfo.color === 'green' ? 'bg-green-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${statusInfo.progress}%` }}
                            ></div>
                        </div>

                        {/* Progress Steps */}
                        <div className='flex justify-between mt-2 text-xs'>
                            <span className={`${rideStatus === 'accepted' || rideStatus === 'ongoing' || rideStatus === 'completed' ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>
                                Assigned
                            </span>
                            <span className={`${rideStatus === 'ongoing' || rideStatus === 'completed' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                In Progress
                            </span>
                            <span className={`${rideStatus === 'completed' ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                                Completed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Panel */}
            <div className='flex-shrink-0 bg-white border-t border-gray-200 px-4 py-5 shadow-2xl'>
                <div className='max-w-md mx-auto space-y-4'>
                    {/* Driver Info */}
                    <div className='flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-100'>
                        <div className='flex items-center gap-3'>
                            <div className='w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg'>
                                {ride.captain?.fullname?.firstname?.[0] || 'D'}
                            </div>
                            <div>
                                <p className='font-bold text-gray-900'>
                                    {ride.captain?.fullname?.firstname || 'Driver'} {ride.captain?.fullname?.lastname || ''}
                                </p>
                                <p className='text-xs text-gray-600'>
                                    {ride.captain?.vehicle?.plate || 'Vehicle'} • {ride.captain?.vehicle?.vehicleType || 'Car'}
                                </p>
                                <div className='flex items-center gap-1 mt-1'>
                                    <i className="ri-star-fill text-yellow-500 text-xs"></i>
                                    <span className='text-xs font-semibold text-gray-700'>4.9</span>
                                </div>
                            </div>
                        </div>
                        <a 
                            href={`tel:${ride.captain?.phone || ''}`}
                            className='w-12 h-12 bg-green-500 hover:bg-green-600 active:scale-95 rounded-full flex items-center justify-center text-white shadow-lg transition-all'
                        >
                            <i className="ri-phone-line text-xl"></i>
                        </a>
                    </div>

                    {/* Trip Route */}
                    <div className='bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-200'>
                        <div className='flex items-start gap-3'>
                            <div className='flex flex-col items-center gap-1 mt-1'>
                                <div className='w-3 h-3 bg-green-500 rounded-full ring-4 ring-green-100'></div>
                                <div className='w-0.5 h-10 bg-gradient-to-b from-green-300 to-red-300'></div>
                                <div className='w-3 h-3 bg-red-500 rounded-full ring-4 ring-red-100'></div>
                            </div>
                            <div className='flex-1 space-y-5'>
                                <div>
                                    <p className='text-xs text-gray-500 mb-1'>Pickup</p>
                                    <p className='text-sm font-semibold text-gray-900 line-clamp-1'>{ride.pickup}</p>
                                </div>
                                <div>
                                    <p className='text-xs text-gray-500 mb-1'>Destination</p>
                                    <p className='text-sm font-semibold text-gray-900 line-clamp-1'>{ride.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className='flex items-center justify-between bg-white border-2 border-gray-200 p-4 rounded-2xl'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                <i className={`${ride.paymentMethod === 'cash' ? 'ri-money-rupee-circle-line' : 'ri-bank-card-line'} text-blue-600 text-xl`}></i>
                            </div>
                            <div>
                                <p className='text-xs text-gray-500'>Trip Fare</p>
                                <p className='font-bold text-gray-900'>₹{ride.fare}</p>
                            </div>
                        </div>
                        <div className='text-right'>
                            <span className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                                ride.paymentMethod === 'cash' 
                                    ? 'bg-green-100 text-green-700 border border-green-200' 
                                    : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                                {ride.paymentMethod === 'cash' ? 'Cash' : 'Paid'}
                            </span>
                        </div>
                    </div>

                    {/* Safety & Support */}
                    <div className='grid grid-cols-2 gap-2'>
                        <button className='flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 active:scale-95 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all'>
                            <i className="ri-shield-check-line text-lg"></i>
                            <span className='text-sm'>Safety</span>
                        </button>
                        <button className='flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 active:scale-95 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all'>
                            <i className="ri-customer-service-2-line text-lg"></i>
                            <span className='text-sm'>Support</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Riding
