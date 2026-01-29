import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SocketContext } from '../../../context/SocketContext'
import { CaptainDataContext } from '../../../app/store/CaptainContext'
import axios from 'axios'
import RidePopUp from '../components/RidePopUp'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import LiveTracking from '../../user/components/LiveTracking'

const CaptainHome = () => {

    const [ ridePopupPanel, setRidePopupPanel ] = useState(false)
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false)
    const [ ride, setRide ] = useState(null)
    const [socketConnected, setSocketConnected] = useState(false)
    const [rideCount, setRideCount] = useState(0) // Track number of rides received

    const { socket } = useContext(SocketContext)
    const { captain, setCaptain } = useContext(CaptainDataContext)
    const navigate = useNavigate()

    // Separate effect for socket setup - runs once when captain is available
    useEffect(() => {
        if (!captain || !socket) {
            console.log('⚠️ Waiting for captain or socket...')
            return
        }

        console.log('🚀 Setting up socket for captain:', captain._id)
        console.log('📡 Socket ID:', socket.id)

        // Join room
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })
        console.log('✅ Sent join event')
        setSocketConnected(true)

        // Listen for new rides
        const handleNewRide = (data) => {
            console.log('🚗🚗🚗 NEW RIDE RECEIVED 🚗🚗🚗')
            console.log('Ride data:', data)
            setRide(data)
            setRidePopupPanel(true)
            setRideCount(prev => prev + 1)
            
            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification('New Ride Request!', {
                    body: `Pickup: ${data.pickup}`,
                    icon: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png'
                })
            }
        }

        socket.on('new-ride', handleNewRide)
        console.log('👂 Listening for new-ride events...')

        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission()
        }

        // Cleanup
        return () => {
            console.log('🧹 Removing new-ride listener')
            socket.off('new-ride', handleNewRide)
        }
    }, [captain?._id, socket])

    // Separate effect for location updates
    useEffect(() => {
        if (!captain || !socket || !socketConnected) return

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const locationData = {
                            userId: captain._id,
                            location: {
                                ltd: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                        }
                        console.log('📍 Sending location update:', locationData)
                        socket.emit('update-location-captain', locationData)
                    },
                    error => {
                        console.error('❌ Geolocation error:', error)
                        // Use fallback location (Acchada location from the map)
                        const fallbackLocation = {
                            userId: captain._id,
                            location: {
                                ltd: 13.274282,
                                lng: 74.759498
                            }
                        }
                        console.log('📍 Using fallback location (Acchada):', fallbackLocation)
                        socket.emit('update-location-captain', fallbackLocation)
                    }
                )
            } else {
                console.error('❌ Geolocation not supported')
                // Use fallback location
                const fallbackLocation = {
                    userId: captain._id,
                    location: {
                        ltd: 13.274282,
                        lng: 74.759498
                    }
                }
                socket.emit('update-location-captain', fallbackLocation)
            }
        }

        // Update location immediately
        updateLocation()
        
        // Then update every 10 seconds
        const locationInterval = setInterval(updateLocation, 10000)

        return () => {
            console.log('🧹 Clearing location interval')
            clearInterval(locationInterval)
        }
    }, [captain?._id, socket, socketConnected])

    async function confirmRide() {
        try {
            console.log('📝 Confirming ride:', ride._id)
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id,
                captainId: captain._id,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log('✅ Ride confirmed:', response.data)
            setRidePopupPanel(false)
            setConfirmRidePopupPanel(true)
        } catch (err) {
            console.error('❌ Error confirming ride:', err)
            alert('Failed to confirm ride. Please try again.')
        }
    }

    async function ignoreRide() {
        console.log('❌ Ride ignored by captain')
        setRidePopupPanel(false)
        setRide(null)
    }

    async function toggleAvailability() {
        try {
            console.log('🔄 Toggling availability...')
            
            const response = await axios.patch(
                `${import.meta.env.VITE_BASE_URL}/captains/toggle-availability`, 
                {}, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )
            
            console.log('✅ Toggle response:', response.data)
            
            if (response.status === 200) {
                setCaptain(response.data.captain)
                console.log('✅ Status updated to:', response.data.captain.status)
            }
        } catch (err) {
            console.error('❌ Toggle error:', err.response?.data || err.message)
            alert(`Failed to toggle availability. ${err.response?.data?.message || 'Please try again.'}`)
        }
    }

    if (!captain) {
        return null
    }

    const isOnline = captain.status === 'active'

    return (
        <div className='h-screen flex flex-col bg-white'>
            {/* Header */}
            <div className='flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <img className='h-6' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                        <span className='text-gray-400 text-sm'>|</span>
                        <span className='text-gray-600 text-sm font-medium'>Driver</span>
                        {rideCount > 0 && (
                            <span className='px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full'>
                                {rideCount} request{rideCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isOnline ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                        <Link to='/captain-logout' className='h-8 w-8 bg-gray-50 hover:bg-gray-100 flex items-center justify-center rounded-full'>
                            <i className="ri-logout-box-r-line text-gray-700"></i>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />
                
                {/* Debug Panel */}
                <div className='absolute top-4 right-4 z-[1000] bg-black/90 text-white text-xs p-3 rounded-lg space-y-1 max-w-[200px]'>
                    <p className='font-bold mb-2'>🔧 Debug:</p>
                    <p>Socket: {socket?.connected ? '✅' : '❌'}</p>
                    <p>Captain: {captain?.status}</p>
                    <p>Listener: {socketConnected ? '✅' : '⏳'}</p>
                    <p>Rides: {rideCount}</p>
                    <p className='text-yellow-300 mt-2 pt-2 border-t border-gray-600 text-[10px]'>
                        {isOnline ? 'Waiting for rides...' : 'Go online first'}
                    </p>
                </div>

                {/* Status Badge Overlay */}
                {ride && ridePopupPanel && (
                    <div className='absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-green-500 text-white px-6 py-3 rounded-full font-bold animate-bounce'>
                        🚗 New Ride Request!
                    </div>
                )}
            </div>

            {/* Bottom Panel - Stats & Actions */}
            <div className='flex-shrink-0 bg-white border-t border-gray-200 px-4 py-5'>
                <div className='max-w-md mx-auto space-y-4'>
                    {/* Driver Info */}
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold'>
                                {captain.fullname?.firstname?.[0] || 'C'}
                            </div>
                            <div>
                                <h3 className='font-bold text-gray-900'>{captain.fullname?.firstname} {captain.fullname?.lastname}</h3>
                                <p className='text-xs text-gray-500'>{captain.vehicle?.vehicleType} • {captain.vehicle?.plate}</p>
                            </div>
                        </div>
                        <button 
                            onClick={toggleAvailability}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                                isOnline 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-black hover:bg-gray-800 text-white'
                            }`}
                        >
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className='grid grid-cols-3 gap-3'>
                        <div className='bg-gray-50 rounded-xl p-3 text-center border border-gray-100'>
                            <div className='w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center'>
                                <i className="ri-money-rupee-circle-line text-white text-base"></i>
                            </div>
                            <p className='text-xl font-bold text-gray-900'>₹{captain.earnings || '0'}</p>
                            <p className='text-xs text-gray-500 mt-0.5'>Earnings</p>
                        </div>

                        <div className='bg-gray-50 rounded-xl p-3 text-center border border-gray-100'>
                            <div className='w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg mx-auto mb-2 flex items-center justify-center'>
                                <i className="ri-steering-2-line text-white text-base"></i>
                            </div>
                            <p className='text-xl font-bold text-gray-900'>{captain.totalRides || '0'}</p>
                            <p className='text-xs text-gray-500 mt-0.5'>Trips</p>
                        </div>

                        <div className='bg-gray-50 rounded-xl p-3 text-center border border-gray-100'>
                            <div className='w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center'>
                                <i className="ri-star-fill text-white text-base"></i>
                            </div>
                            <p className='text-xl font-bold text-gray-900'>{captain.rating || '5.0'}</p>
                            <p className='text-xs text-gray-500 mt-0.5'>Rating</p>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='bg-blue-50 rounded-lg p-3 border border-blue-100'>
                            <div className='flex items-start gap-2'>
                                <i className="ri-time-line text-blue-600 text-lg flex-shrink-0"></i>
                                <div>
                                    <p className='font-semibold text-gray-900 text-xs'>Peak Hours</p>
                                    <p className='text-xs text-gray-600 mt-0.5'>8-10 AM, 5-9 PM</p>
                                </div>
                            </div>
                        </div>
                        <div className='bg-purple-50 rounded-lg p-3 border border-purple-100'>
                            <div className='flex items-start gap-2'>
                                <i className="ri-gift-line text-purple-600 text-lg flex-shrink-0"></i>
                                <div>
                                    <p className='font-semibold text-gray-900 text-xs'>Bonus Today</p>
                                    <p className='text-xs text-gray-600 mt-0.5'>5 trips = ₹100</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ride Popups */}
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-5 py-8 rounded-t-2xl border-t border-gray-200 transition-transform duration-300 ${ridePopupPanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-5 py-8 rounded-t-2xl h-screen transition-transform duration-300 ${confirmRidePopupPanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel} 
                />
            </div>
        </div>
    )
}

export default CaptainHome
