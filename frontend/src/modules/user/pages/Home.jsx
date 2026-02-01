import React, { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import axios from 'axios'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../components/LocationSearchPanel'
import VehiclePanel from '../components/VehiclePanel'
import ConfirmedRide from '../components/ConfirmedRide'
import LookingForDriver from '../components/LookingForDriver'
import WaitingForDriver from '../components/WaitingForDriver'
import LiveTracking from '../components/LiveTracking'
import { SocketContext } from '../../../context/SocketContext'
import { UserDataContext } from '../../../app/store/UserContext'
import { useContext } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        if (!user || !socket) return

        console.log('🚀 User joining socket room:', user._id)
        socket.emit("join", { userType: "user", userId: user._id })

        // Listen for ride confirmed (captain accepted)
        const handleRideConfirmed = (ride) => {
            console.log('✅ Ride confirmed by captain:', ride)
            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(ride)
        }

        // Listen for ride started (captain entered OTP)
        const handleRideStarted = (ride) => {
            console.log('🚗 Ride started:', ride)
            setWaitingForDriver(false)
            navigate('/riding', { state: { ride } })
        }

        socket.on('ride-confirmed', handleRideConfirmed)
        socket.on('ride-started', handleRideStarted)

        console.log('👂 User listening for ride updates')

        return () => {
            console.log('🧹 Cleaning up user socket listeners')
            socket.off('ride-confirmed', handleRideConfirmed)
            socket.off('ride-started', handleRideStarted)
        }
    }, [user, socket, navigate])


    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)

    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
        if (e.target.value.length < 3) {
            setPickupSuggestions([])
            return
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }

            })
            setPickupSuggestions(response.data.map(item => item.description))
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
        if (e.target.value.length < 3) {
            setDestinationSuggestions([])
            return
        }
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setDestinationSuggestions(response.data.map(item => item.description))
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const submitHandler = (e) => {
        e.preventDefault()
    }

    const findTrip = async () => {
        setVehiclePanel(true)
        setPanelOpen(false)

        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                params: { pickup, destination },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setFare(response.data)
        } catch (error) {
            console.error('Error fetching fare:', error)
        }
    }

    const createRide = async (paymentMethod = 'cash') => {
        try {
            console.log('🚗 Creating ride with payment method:', paymentMethod);
            console.log('📍 Pickup:', pickup);
            console.log('📍 Destination:', destination);
            console.log('🚙 Vehicle type:', vehicleType);

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
                pickup,
                destination,
                vehicleType,
                paymentMethod
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            const createdRide = response.data
            console.log('✅ Ride created:', createdRide);
            console.log('💰 Ride fare:', createdRide.fare);
            setRide(createdRide)

            // Validate ride data
            if (!createdRide._id || !createdRide.fare) {
                throw new Error('Invalid ride data received');
            }

            // If online payment, initiate Razorpay
            if (paymentMethod === 'online') {
                console.log('💳 Initiating online payment for amount:', createdRide.fare);
                await initiateRazorpayPayment(createdRide)
            } else {
                // For cash payment, proceed normally
                console.log('💵 Cash payment selected, proceeding to find driver');
                setVehicleFound(true)
                setConfirmRidePanel(false)
            }
        } catch (error) {
            console.error('❌ Error creating ride:', error);
            console.error('Error details:', error.response?.data);
            alert(`Failed to create ride: ${error.response?.data?.message || error.message}`)
        }
    }

    const initiateRazorpayPayment = async (ride) => {
        try {
            console.log('Initiating Razorpay payment for ride:', ride._id);
            console.log('Ride fare to be paid:', ride.fare);
            console.log('Full ride object:', ride);

            // Validate ride data before creating order
            if (!ride._id) {
                throw new Error('Ride ID is missing');
            }
            if (!ride.fare || ride.fare <= 0) {
                throw new Error(`Invalid fare amount: ${ride.fare}`);
            }

            // Create Razorpay order
            console.log('Sending request to create Razorpay order...');
            const orderResponse = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/payment/create-order`,
                {
                    rideId: ride._id,
                    amount: ride.fare
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            )

            console.log('Order response:', orderResponse.data);

            const { order, key } = orderResponse.data

            // Check if Razorpay is loaded
            if (!window.Razorpay) {
                console.error('Razorpay script not loaded');
                alert('Payment system not loaded. Please refresh the page.');
                return;
            }

            // Razorpay options
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: 'Uber Clone',
                description: `Ride from ${pickup.split(',')[0]} to ${destination.split(',')[0]}`,
                order_id: order.id,
                handler: async function (response) {
                    console.log('Payment successful, verifying...', response);
                    // Verify payment
                    try {
                        const verifyResponse = await axios.post(
                                `${import.meta.env.VITE_BASE_URL}/payment/verify-payment`,
                                {
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    rideId: ride._id
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${localStorage.getItem('token')}`
                                    }
                                }
                        )

                        console.log('✅ Payment verified:', verifyResponse.data);
                        setVehicleFound(true)
                        setConfirmRidePanel(false)
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.')
                    }
                },
                    prefill: {
                        name: user.fullname.firstname + ' ' + user.fullname.lastname,
                        email: user.email,
                        contact: user.phone || '9999999999'
                    },
                    theme: {
                        color: '#10B981'
                    },
                modal: {
                    ondismiss: function() {
                        console.log('Payment cancelled by user');
                        alert('Payment cancelled. You can try again.')
                    }
                }
            }

            console.log('Opening Razorpay checkout...');
            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error) {
            console.error('Error initiating payment:', error);
            console.error('Error details:', error.response?.data);
            alert(`Failed to initiate payment: ${error.response?.data?.message || error.message}`)
        }
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
                // opacity:1
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
                // opacity:0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])

    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ waitingForDriver ])


    return (
        <div className='h-screen relative overflow-hidden'>
            <img className='w-16 absolute left-5 top-5 z-30' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
            <div className='h-screen w-screen absolute top-0 left-0 -z-10'>
                <LiveTracking />
            </div>
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full z-20' style={{ display: vehiclePanel || confirmRidePanel ? 'none' : 'flex' }}>
                <div className='h-[30%] p-6 bg-white relative' style={{ display: vehiclePanel || confirmRidePanel ? 'none' : 'block' }}>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-[50%] left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('pickup')
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('destination')
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                            type="text"
                            placeholder='Enter your destination' />
                    </form>
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>
                <div ref={panelRef} className='bg-white h-0'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>
            <div ref={vehiclePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12 rounded-t-3xl shadow-2xl'>
                <VehiclePanel
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehiclePanel={setVehiclePanel}
                    fare={fare}
                    setVehicleType={setVehicleType}
                />
            </div>
            <div ref={confirmRidePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl h-screen'>
                <ConfirmedRide
                    setConfirmRidePanel={setConfirmRidePanel}
                    setVehicleFound={setVehicleFound}
                    createRide={createRide}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                />
            </div>
            <div ref={vehicleFoundRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl h-screen'>
                <LookingForDriver
                    setVehicleFound={setVehicleFound}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    ride={ride}
                />
            </div>
            <div ref={waitingForDriverRef} className='fixed w-full z-40 bottom-0  bg-white px-3 py-6 pt-12 rounded-t-3xl shadow-2xl h-screen'>
                <WaitingForDriver 
                    setWaitingForDriver={setWaitingForDriver} 
                    ride={ride}
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                />
            </div>
        </div>
    )
}

export default Home
