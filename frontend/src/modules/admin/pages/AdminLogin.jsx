import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/admin/login`, {
                email,
                password
            })

            if (response.status === 200) {
                localStorage.setItem('admin-token', response.data.token)
                navigate('/admin/dashboard')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='min-h-screen flex bg-gray-50'>
            {/* Left Side - Branding */}
            <div className='hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden'>
                <div className='absolute inset-0 bg-black'></div>
                <div className='relative z-10 flex flex-col justify-center px-16 xl:px-24'>
                    <div className='mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6'>
                            <i className="ri-admin-line text-4xl text-black"></i>
                        </div>
                        <h1 className='text-5xl font-bold text-white mb-4'>Admin Portal</h1>
                        <p className='text-xl text-gray-400'>Manage your Uber clone platform with ease</p>
                    </div>
                    <div className='space-y-4 mt-12'>
                        {[
                            { icon: 'ri-dashboard-3-line', text: 'Real-time Dashboard' },
                            { icon: 'ri-user-settings-line', text: 'User Management' },
                            { icon: 'ri-car-line', text: 'Driver Control' },
                            { icon: 'ri-bar-chart-box-line', text: 'Analytics & Reports' }
                        ].map((item, idx) => (
                            <div key={idx} className='flex items-center gap-4 text-gray-300'>
                                <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center'>
                                    <i className={`${item.icon} text-white`}></i>
                                </div>
                                <span className='text-lg'>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className='flex-1 flex items-center justify-center p-8'>
                <div className='w-full max-w-md'>
                    {/* Mobile Logo */}
                    <div className='lg:hidden text-center mb-8'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-4'>
                            <i className="ri-admin-line text-3xl text-white"></i>
                        </div>
                        <h1 className='text-3xl font-bold text-gray-900'>Admin Portal</h1>
                    </div>

                    <div className='mb-8'>
                        <h2 className='text-3xl font-bold text-gray-900 mb-2'>Welcome back</h2>
                        <p className='text-gray-600'>Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3'>
                            <i className="ri-error-warning-line text-red-600 text-xl mt-0.5"></i>
                            <div className='flex-1'>
                                <p className='text-sm font-medium text-red-800'>{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-5'>
                        <div>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>
                                Email Address
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <i className="ri-mail-line text-gray-400"></i>
                                </div>
                                <input
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-gray-900'
                                    placeholder='admin@uber.com'
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-semibold text-gray-900 mb-2'>
                                Password
                            </label>
                            <div className='relative'>
                                <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                                    <i className="ri-lock-line text-gray-400"></i>
                                </div>
                                <input
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-gray-900'
                                    placeholder='Enter your password'
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10'
                        >
                            {loading ? (
                                <span className='flex items-center justify-center gap-2'>
                                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                                    Signing in...
                                </span>
                            ) : (
                                <span className='flex items-center justify-center gap-2'>
                                    <i className="ri-login-box-line text-xl"></i>
                                    Sign In to Dashboard
                                </span>
                            )}
                        </button>
                    </form>

                    <div className='mt-8 pt-6 border-t border-gray-200'>
                        <p className='text-center text-sm text-gray-500'>
                            Secured with enterprise-grade encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin
