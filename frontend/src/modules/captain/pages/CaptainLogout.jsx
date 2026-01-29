import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CaptainLogout = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')

        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            if (response.status === 200) {
                localStorage.removeItem('token')
                navigate('/captain-login')
            }
        })
    }, [navigate])

    return (
        <div className='h-screen flex items-center justify-center bg-white'>
            <div className='text-center'>
                <div className='w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4'></div>
                <p className='text-gray-600'>Logging out...</p>
            </div>
        </div>
    )
}

export default CaptainLogout
