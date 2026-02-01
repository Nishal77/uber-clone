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
            
            setTimeout(() => {
                navigate('/home')
            }, 4000)
        }

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

    const getStatusInfo = () => {
        switch (rideStatus) {
            case 'accepted':
                return {
                    text: 'Driver Assigned',
                    subtext: 'Driver is on the way to pick you up',
                    icon: 'ri-car-line',
                    progress: 33
                }
            case 'ongoing':
                return {
                    text: 'Trip in Progress',
                    subtext: 'Heading to your destination',
                    icon: 'ri-navigation-line',
                    progress: 66
                }
            case 'completed':
                return {
                    text: 'Trip Completed',
                    subtext: 'You have reached your destination',
                    icon: 'ri-checkbox-circle-line',
                    progress: 100
                }
            default:
                return {
                    text: 'Ride Status',
                    subtext: 'Please wait...',
                    icon: 'ri-time-line',
                    progress: 0
                }
        }
    }

    const statusInfo = getStatusInfo()

    // Completion screen
    if (showCompletionScreen) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 p-6'>
                <div className='text-center max-w-md w-full'>
                    {/* Success Icon */}
                    <div className='w-28 h-28 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 border-4 border-green-700'>
                        <i className="ri-checkbox-circle-fill text-white text-6xl"></i>
                    </div>
                    
                    <h2 className='text-4xl font-bold text-gray-900 mb-2 tracking-tight'>Trip Completed</h2>
                    <p className='text-gray-600 mb-10'>Thank you for choosing us</p>
                    
                    {/* Fare Display */}
                    <div className='bg-white rounded-3xl p-8 mb-6 border-2 border-gray-200'>
                        <div className='mb-6'>
                            <p className='text-sm text-gray-600 mb-2 uppercase tracking-wider font-bold'>Total Fare</p>
                            <p className='text-6xl font-bold text-gray-900'>₹{ride.fare}</p>
                        </div>
                        
                        <div className='pt-6 border-t-2 border-gray-200'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm text-gray-600 font-medium'>Payment Method</span>
                                <span className='font-bold text-gray-900'>
                                    {ride.paymentMethod === 'cash' ? 'Cash' : 'Card'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className='bg-white rounded-3xl p-6 border-2 border-gray-200'>
                        <p className='text-sm text-gray-600 mb-4 font-medium'>Rate Your Experience</p>
                        <div className='flex justify-center gap-3'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star} 
                                    className='hover:scale-110 transition-transform active:scale-95'
                                >
                                    <i className="ri-star-line text-gray-300 hover:text-orange-500 text-4xl"></i>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className='text-sm text-gray-400 mt-8'>Redirecting to home...</p>
                </div>
            </div>
        )
    }

    // Active ride screen
    return (
        <div className='h-screen flex flex-col bg-gray-50'>
            {/* Clean Header */}
            <div className='flex-shrink-0 bg-white border-b-2 border-gray-200 px-6 py-4 z-10'>
                <div className='flex items-center justify-between max-w-md mx-auto'>
                    <div className='flex items-center gap-3'>
                        <img className='h-5' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                    </div>
                    <div className='px-4 py-2 bg-blue-600 rounded-xl'>
                        <span className='font-bold text-xs text-white flex items-center gap-2'>
                            <span className='w-2 h-2 rounded-full bg-white animate-pulse'></span>
                            {statusInfo.text}
                        </span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />

                {/* Status Card */}
                <div className='absolute top-6 left-4 right-4 z-[1000]'>
                    <div className='bg-white rounded-3xl p-5 border-2 border-gray-200 max-w-md mx-auto'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center'>
                                <i className={`${statusInfo.icon} text-2xl text-white`}></i>
                            </div>
                            <div className='flex-1'>
                                <p className='font-bold text-gray-900 text-lg'>{statusInfo.text}</p>
                                <p className='text-sm text-gray-600'>{statusInfo.subtext}</p>
                            </div>
                            {rideStatus !== 'completed' && (
                                <div className='text-right'>
                                    <p className='text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold'>ETA</p>
                                    <p className='font-bold text-gray-900 text-lg'>5 min</p>
                                </div>
                            )}
                        </div>

                        {/* Progress Bar */}
                        <div className='relative h-2 bg-gray-200 rounded-full overflow-hidden mb-3'>
                            <div 
                                className='absolute top-0 left-0 h-full bg-blue-600 rounded-full transition-all duration-1000'
                                style={{ width: `${statusInfo.progress}%` }}
                            ></div>
                        </div>

                        {/* Progress Labels */}
                        <div className='flex justify-between text-[11px] font-medium'>
                            <span className={rideStatus === 'accepted' || rideStatus === 'ongoing' || rideStatus === 'completed' ? 'text-blue-600 font-bold' : 'text-gray-400'}>
                                Assigned
                            </span>
                            <span className={rideStatus === 'ongoing' || rideStatus === 'completed' ? 'text-blue-600 font-bold' : 'text-gray-400'}>
                                In Progress
                            </span>
                            <span className={rideStatus === 'completed' ? 'text-green-600 font-bold' : 'text-gray-400'}>
                                Completed
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Panel - Clean */}
            <div className='flex-shrink-0 bg-white border-t-2 border-gray-200 px-4 py-6'>
                <div className='max-w-md mx-auto space-y-4'>
                    {/* Driver Card - Flat */}
                    <div className='bg-gray-50 rounded-3xl p-5 border-2 border-gray-200'>
                        <div className='flex items-center gap-4 mb-4'>
                            <div className='w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-700'>
                                {ride.captain?.fullname?.firstname?.[0] || 'D'}
                            </div>
                            <div className='flex-1'>
                                <p className='font-bold text-gray-900 text-lg mb-0.5'>
                                    {ride.captain?.fullname?.firstname || 'Driver'} {ride.captain?.fullname?.lastname || ''}
                                </p>
                                <p className='text-sm text-gray-600 mb-1'>
                                    {ride.captain?.vehicle?.plate || 'Vehicle'} • {ride.captain?.vehicle?.vehicleType || 'Car'}
                                </p>
                                <div className='flex items-center gap-1.5 px-2 py-1 bg-orange-50 rounded-lg border border-orange-200 inline-flex'>
                                    <i className="ri-star-fill text-orange-500 text-sm"></i>
                                    <span className='text-sm font-bold text-orange-900'>4.9</span>
                                </div>
                            </div>
                            <a 
                                href={`tel:${ride.captain?.phone || ''}`}
                                className='w-14 h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 rounded-2xl flex items-center justify-center text-white transition-colors'
                            >
                                <i className="ri-phone-line text-xl"></i>
                            </a>
                        </div>

                        {/* Route - Clean */}
                        <div className='bg-white rounded-2xl p-4 border-2 border-gray-200'>
                            <div className='flex items-start gap-4'>
                                <div className='flex flex-col items-center gap-1.5 pt-1'>
                                    <div className='w-4 h-4 bg-green-600 rounded-full'></div>
                                    <div className='w-0.5 h-12 bg-gray-300'></div>
                                    <div className='w-4 h-4 bg-orange-500 rounded-full'></div>
                                </div>
                                <div className='flex-1 space-y-6'>
                                    <div>
                                        <p className='text-xs text-green-600 font-bold mb-1.5 uppercase tracking-wider'>Pickup</p>
                                        <p className='text-sm font-semibold text-gray-900 line-clamp-1'>{ride.pickup}</p>
                                    </div>
                                    <div>
                                        <p className='text-xs text-orange-600 font-bold mb-1.5 uppercase tracking-wider'>Destination</p>
                                        <p className='text-sm font-semibold text-gray-900 line-clamp-1'>{ride.destination}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fare - Clean */}
                    <div className='bg-blue-600 rounded-3xl p-6 border-2 border-blue-700'>
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4'>
                                <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                                    <i className={`${ride.paymentMethod === 'cash' ? 'ri-money-rupee-circle-line' : 'ri-bank-card-line'} text-white text-2xl`}></i>
                                </div>
                                <div>
                                    <p className='text-xs text-blue-200 uppercase tracking-wider mb-1 font-bold'>Trip Fare</p>
                                    <p className='font-bold text-white text-2xl'>₹{ride.fare}</p>
                                </div>
                            </div>
                            <div>
                                <span className='text-sm px-4 py-2 rounded-xl font-bold bg-white text-blue-600 border-2 border-blue-700'>
                                    {ride.paymentMethod === 'cash' ? 'Cash' : 'Paid'}
                                </span>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    )
}

export default Riding
