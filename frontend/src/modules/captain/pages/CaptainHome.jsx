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
    const [recentRides, setRecentRides] = useState([]) // Recent completed rides
    const [loadingRides, setLoadingRides] = useState(false)

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

    // Fetch recent rides
    useEffect(() => {
        if (!captain) return

        const fetchRecentRides = async () => {
            setLoadingRides(true)
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/rides/captain-rides?limit=3`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                )
                
                if (response.data.success) {
                    setRecentRides(response.data.rides)
                }
            } catch (err) {
                console.error('Error fetching recent rides:', err)
            } finally {
                setLoadingRides(false)
            }
        }

        fetchRecentRides()
    }, [captain])

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
        <div className='h-screen flex flex-col bg-gray-50'>
            {/* Clean Header */}
            <div className='flex-shrink-0 bg-white border-b-2 border-gray-200 px-6 py-4'>
                <div className='flex items-center justify-between max-w-md mx-auto'>
                    <div className='flex items-center gap-4'>
                        <img className='h-6' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                        <div className='h-5 w-px bg-gray-300'></div>
                        <span className='text-gray-700 text-sm font-bold uppercase tracking-wide'>Driver</span>
                        {rideCount > 0 && (
                            <span className='px-2.5 py-1 bg-blue-600 text-white text-xs rounded-lg font-bold'>
                                {rideCount}
                            </span>
                        )}
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className={`px-4 py-2 rounded-xl text-xs font-bold border-2 ${isOnline ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-600' : 'bg-gray-400'} animate-pulse`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                        <Link to='/captain-logout' className='h-10 w-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 flex items-center justify-center rounded-xl border-2 border-gray-200 transition-colors'>
                            <i className="ri-logout-box-r-line text-gray-700 text-lg"></i>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className='flex-1 relative'>
                <LiveTracking />
                
                {/* Debug Panel - Hidden in Production */}
                {process.env.NODE_ENV === 'development' && (
                    <div className='absolute top-4 right-4 z-[1000] bg-gray-900 text-white text-xs p-3 rounded-2xl border-2 border-gray-700 space-y-1 max-w-[200px]'>
                        <p className='font-bold mb-2'>🔧 Debug</p>
                        <p>Socket: {socket?.connected ? '✅' : '❌'}</p>
                        <p>Captain: {captain?.status}</p>
                        <p>Listener: {socketConnected ? '✅' : '⏳'}</p>
                        <p>Rides: {rideCount}</p>
                        <p className='text-yellow-300 mt-2 pt-2 border-t border-gray-700 text-[10px]'>
                            {isOnline ? 'Waiting for rides...' : 'Go online first'}
                        </p>
                    </div>
                )}

                {/* New Ride Alert */}
                {ride && ridePopupPanel && (
                    <div className='absolute top-6 left-4 right-4 z-[1000] max-w-md mx-auto'>
                        <div className='bg-green-600 text-white px-6 py-4 rounded-2xl font-bold text-center border-2 border-green-700 animate-pulse'>
                            <i className="ri-notification-3-line text-2xl mr-2"></i>
                            New Ride Request!
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel - Clean Stats */}
            <div className='flex-shrink-0 bg-white border-t-2 border-gray-200 px-4 py-6'>
                <div className='max-w-md mx-auto space-y-4'>
                    {/* Driver Profile */}
                    <div className='flex items-center justify-between bg-gray-50 rounded-3xl p-4 border-2 border-gray-200'>
                        <div className='flex items-center gap-4'>
                            <div className='w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl border-2 border-blue-700'>
                                {captain.fullname?.firstname?.[0] || 'C'}
                            </div>
                            <div>
                                <h3 className='font-bold text-gray-900 text-lg'>{captain.fullname?.firstname} {captain.fullname?.lastname}</h3>
                                <p className='text-sm text-gray-600'>{captain.vehicle?.vehicleType} • {captain.vehicle?.plate}</p>
                            </div>
                        </div>
                        <button 
                            onClick={toggleAvailability}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors border-2 ${
                                isOnline 
                                    ? 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-red-700' 
                                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white border-green-700'
                            }`}
                        >
                            {isOnline ? 'Go Offline' : 'Go Online'}
                        </button>
                    </div>

                    {/* Stats Grid - Flat Design */}
                    <div className='grid grid-cols-3 gap-3'>
                        <div className='bg-white rounded-2xl p-4 text-center border-2 border-gray-200'>
                            <div className='w-10 h-10 bg-green-100 rounded-xl mx-auto mb-3 flex items-center justify-center border border-green-200'>
                                <i className="ri-money-rupee-circle-line text-green-600 text-xl"></i>
                            </div>
                            <p className='text-2xl font-bold text-gray-900'>₹{captain.earnings || '0'}</p>
                            <p className='text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider'>Earnings</p>
                        </div>

                        <div className='bg-white rounded-2xl p-4 text-center border-2 border-gray-200'>
                            <div className='w-10 h-10 bg-blue-100 rounded-xl mx-auto mb-3 flex items-center justify-center border border-blue-200'>
                                <i className="ri-steering-2-line text-blue-600 text-xl"></i>
                            </div>
                            <p className='text-2xl font-bold text-gray-900'>{captain.totalRides || '0'}</p>
                            <p className='text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider'>Trips</p>
                        </div>

                        <div className='bg-white rounded-2xl p-4 text-center border-2 border-gray-200'>
                            <div className='w-10 h-10 bg-orange-100 rounded-xl mx-auto mb-3 flex items-center justify-center border border-orange-200'>
                                <i className="ri-star-fill text-orange-500 text-xl"></i>
                            </div>
                            <p className='text-2xl font-bold text-gray-900'>{captain.rating || '5.0'}</p>
                            <p className='text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider'>Rating</p>
                        </div>
                    </div>

                    {/* Recent Rides - Dynamic */}
                    <div className='bg-white rounded-3xl p-5 border-2 border-gray-200'>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='font-bold text-gray-900 text-lg'>Recent Rides</h3>
                            <i className="ri-history-line text-gray-400 text-xl"></i>
                        </div>
                        
                        {loadingRides ? (
                            <div className='py-8 text-center'>
                                <div className='inline-block animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full'></div>
                                <p className='text-sm text-gray-500 mt-2'>Loading rides...</p>
                            </div>
                        ) : recentRides.length > 0 ? (
                            <div className='space-y-3'>
                                {recentRides.map((rideItem, index) => (
                                    <div key={rideItem._id} className='bg-gray-50 rounded-2xl p-4 border border-gray-200'>
                                        <div className='flex items-start gap-3 mb-3'>
                                            <div className='flex flex-col items-center gap-1.5 pt-1'>
                                                <div className='w-2.5 h-2.5 bg-green-600 rounded-full'></div>
                                                <div className='w-0.5 h-6 bg-gray-300'></div>
                                                <div className='w-2.5 h-2.5 bg-orange-500 rounded-full'></div>
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-xs text-gray-500 mb-1'>
                                                    {new Date(rideItem.createdAt).toLocaleDateString('en-IN', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className='text-sm font-semibold text-gray-900 truncate mb-1'>
                                                    {rideItem.pickup.split(',')[0]}
                                                </p>
                                                <p className='text-sm font-semibold text-gray-900 truncate'>
                                                    {rideItem.destination.split(',')[0]}
                                                </p>
                                            </div>
                                            <div className='text-right flex-shrink-0'>
                                                <p className='text-lg font-bold text-green-600'>₹{rideItem.fare}</p>
                                                <p className='text-xs text-gray-500 mt-1'>
                                                    {rideItem.paymentMethod === 'cash' ? 'Cash' : 'Online'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='py-8 text-center'>
                                <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3'>
                                    <i className="ri-car-line text-gray-400 text-3xl"></i>
                                </div>
                                <p className='text-sm text-gray-500'>No completed rides yet</p>
                                <p className='text-xs text-gray-400 mt-1'>Start accepting rides to see your history</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Ride Popups */}
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-5 py-8 rounded-t-3xl border-t-2 border-gray-200 transition-transform duration-300 ${ridePopupPanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>
            <div className={`fixed w-full z-[9999] bottom-0 bg-white px-5 py-8 rounded-t-3xl h-screen transition-transform duration-300 ${confirmRidePopupPanel ? 'translate-y-0' : 'translate-y-full'}`}>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    setRidePopupPanel={setRidePopupPanel} 
                />
            </div>

            {/* Overlay when popup is open */}
            {(ridePopupPanel || confirmRidePopupPanel) && (
                <div className='fixed inset-0 bg-black/40 z-[9998]'></div>
            )}
        </div>
    )
}

export default CaptainHome
