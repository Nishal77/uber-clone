import React, { useContext, useEffect, useState } from 'react'
import { CaptainDataContext } from '../../../app/store/CaptainContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainProtectWrapper = ({
    children
}) => {
    const token = localStorage.getItem('token')
    const navigate = useNavigate()
    const { captain, setCaptain } = useContext(CaptainDataContext)

    useEffect(() => {
        if (!token) {
            navigate('/captain-login')
            return
        }

        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (response.status === 200 && response.data.captain) {
                setCaptain(response.data.captain)
            } else {
                localStorage.removeItem('token')
                navigate('/captain-login')
            }
        })
            .catch(err => {
                console.error('Captain profile fetch error:', err)
                localStorage.removeItem('token')
                navigate('/captain-login')
            })
    }, [ token ])

    return (
        <>
            {children}
        </>
    )
}

export default CaptainProtectWrapper
