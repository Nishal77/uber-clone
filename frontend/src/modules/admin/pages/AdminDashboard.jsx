import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [users, setUsers] = useState([])
    const [captains, setCaptains] = useState([])
    const [rides, setRides] = useState([])
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchDashboardStats()
    }, [])

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers()
        } else if (activeTab === 'captains') {
            fetchCaptains()
        } else if (activeTab === 'rides') {
            fetchRides()
        }
    }, [activeTab])

    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/dashboard/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setStats(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching stats:', error)
            if (error.response?.status === 401) {
                navigate('/admin/login')
            }
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/users`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setUsers(response.data.users)
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const fetchCaptains = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/captains`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setCaptains(response.data.captains)
        } catch (error) {
            console.error('Error fetching captains:', error)
        }
    }

    const fetchRides = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/admin/rides`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setRides(response.data.rides)
        } catch (error) {
            console.error('Error fetching rides:', error)
        }
    }

    const handleDeleteUser = async (userId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setDeleteConfirm(null)
            fetchUsers()
            fetchDashboardStats()
        } catch (error) {
            console.error('Error deleting user:', error)
            alert('Failed to delete user')
        }
    }

    const handleDeleteCaptain = async (captainId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BASE_URL}/admin/captains/${captainId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('admin-token')}`
                }
            })
            setDeleteConfirm(null)
            fetchCaptains()
            fetchDashboardStats()
        } catch (error) {
            console.error('Error deleting captain:', error)
            alert('Failed to delete driver')
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin-token')
        navigate('/admin/login')
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setSidebarOpen(false)
    }

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-white'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-900 font-medium'>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-white'>
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
                    <div className='bg-white rounded-2xl p-6 max-w-md w-full border-2 border-gray-200'>
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>Confirm Delete</h3>
                        <p className='text-gray-600 mb-6'>
                            Are you sure you want to delete {deleteConfirm.type === 'user' ? 'this user' : 'this driver'}? This action cannot be undone.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className='flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-900 hover:bg-gray-100 transition-colors'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deleteConfirm.type === 'user') {
                                        handleDeleteUser(deleteConfirm.id)
                                    } else {
                                        handleDeleteCaptain(deleteConfirm.id)
                                    }
                                }}
                                className='flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors'
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Header */}
            <div className='lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-300 px-4 py-3 z-40 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center'>
                        <i className="ri-admin-line text-xl text-white"></i>
                    </div>
                    <div>
                        <h1 className='text-lg font-bold text-gray-900'>Admin Panel</h1>
                        <p className='text-xs text-gray-600'>Uber Clone</p>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className='w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors'
                >
                    <i className="ri-menu-line text-2xl text-gray-900"></i>
                </button>
            </div>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className='fixed inset-0 bg-black/30 z-40 lg:hidden'
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className='lg:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg border border-white/20 hover:bg-white/10 transition-colors'
                >
                    <i className="ri-close-line text-2xl text-white"></i>
                </button>

                <div className='mb-10'>
                    <div className='flex items-center gap-3 mb-2'>
                        <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center'>
                            <i className="ri-admin-line text-2xl text-gray-900"></i>
                        </div>
                        <div>
                            <h1 className='text-lg font-bold'>Admin Panel</h1>
                        </div>
                    </div>
                    <p className='text-sm text-gray-400 ml-13'>Uber Clone</p>
                </div>

                <nav className='flex-1 space-y-2'>
                    {[
                        { id: 'overview', label: 'Overview', icon: 'ri-dashboard-3-line' },
                        { id: 'users', label: 'Users', icon: 'ri-user-line', badge: stats?.users.total },
                        { id: 'captains', label: 'Drivers', icon: 'ri-car-line', badge: stats?.captains.total },
                        { id: 'rides', label: 'Rides', icon: 'ri-map-pin-line', badge: stats?.rides.total }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                activeTab === tab.id
                                    ? 'bg-white text-gray-900 font-semibold'
                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <div className='flex items-center gap-3'>
                                <i className={`${tab.icon} text-xl`}></i>
                                <span>{tab.label}</span>
                            </div>
                            {tab.badge && (
                                <span className={`text-xs px-2 py-1 rounded-lg border ${
                                    activeTab === tab.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/10 border-white/20'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className='w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/10 border border-white/20 rounded-xl transition-all'
                >
                    <i className="ri-logout-box-line text-xl"></i>
                    <span className='font-medium'>Logout</span>
                </button>
            </div>

            {/* Main Content */}
            <div className='lg:ml-64 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8'>
                <div className='mb-6 lg:mb-8'>
                    <h2 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>
                        {activeTab === 'overview' ? 'Dashboard Overview' : 
                         activeTab.charAt(0).toUpperCase() + activeTab.slice(1) + ' Management'}
                    </h2>
                    <p className='text-sm lg:text-base text-gray-600'>
                        {activeTab === 'overview' ? 'Monitor your platform performance' : 
                         `Manage all ${activeTab} in your platform`}
                    </p>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className='space-y-6 lg:space-y-8'>
                        {/* Stats Grid */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
                            <div className='bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-lg transition-shadow'>
                                <div className='mb-6'>
                                    <h3 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-2'>{stats.users.total}</h3>
                                    <p className='text-sm lg:text-base font-medium text-gray-600'>Total Users</p>
                                </div>
                                <div className='flex items-center gap-2 text-xs lg:text-sm'>
                                    <span className='inline-flex items-center gap-1.5 text-gray-700 font-medium'>
                                        <span className='w-2 h-2 bg-gray-900 rounded-full'></span>
                                        {stats.users.active} Active
                                    </span>
                                </div>
                            </div>

                            <div className='bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-lg transition-shadow'>
                                <div className='mb-6'>
                                    <h3 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-2'>{stats.captains.total}</h3>
                                    <p className='text-sm lg:text-base font-medium text-gray-600'>Total Drivers</p>
                                </div>
                                <div className='flex items-center gap-2 text-xs lg:text-sm'>
                                    <span className='inline-flex items-center gap-1.5 text-gray-700 font-medium'>
                                        <span className='w-2 h-2 bg-gray-900 rounded-full'></span>
                                        {stats.captains.active} Online
                                    </span>
                                </div>
                            </div>

                            <div className='bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-lg transition-shadow'>
                                <div className='mb-6'>
                                    <h3 className='text-4xl lg:text-5xl font-bold text-gray-900 mb-2'>{stats.rides.total}</h3>
                                    <p className='text-sm lg:text-base font-medium text-gray-600'>Total Rides</p>
                                </div>
                                <div className='flex items-center gap-2 text-xs lg:text-sm'>
                                    <span className='inline-flex items-center gap-1.5 text-gray-700 font-medium'>
                                        <span className='w-2 h-2 bg-gray-900 rounded-full'></span>
                                        {stats.rides.ongoing} Active
                                    </span>
                                </div>
                            </div>

                            <div className='bg-gray-900 text-white border-2 border-gray-900 rounded-2xl p-6 lg:p-7 hover:shadow-lg transition-shadow'>
                                <div className='mb-6'>
                                    <h3 className='text-4xl lg:text-5xl font-bold mb-2'>₹{stats.revenue.toLocaleString()}</h3>
                                    <p className='text-sm lg:text-base font-medium text-gray-400'>Total Revenue</p>
                                </div>
                                <div className='flex items-center gap-2 text-xs lg:text-sm'>
                                    <span className='text-gray-400 font-medium'>
                                        From completed rides
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Ride Status */}
                        <div className='bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-8'>
                            <h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-6 lg:mb-8'>Ride Status Breakdown</h3>
                            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5'>
                                <div className='text-center p-6 lg:p-8 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-md transition-shadow'>
                                    <div className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>{stats.rides.pending}</div>
                                    <div className='text-sm lg:text-base font-medium text-gray-600'>Pending</div>
                                </div>
                                <div className='text-center p-6 lg:p-8 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-md transition-shadow'>
                                    <div className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>{stats.rides.ongoing}</div>
                                    <div className='text-sm lg:text-base font-medium text-gray-600'>Ongoing</div>
                                </div>
                                <div className='text-center p-6 lg:p-8 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-md transition-shadow'>
                                    <div className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>{stats.rides.completed}</div>
                                    <div className='text-sm lg:text-base font-medium text-gray-600'>Completed</div>
                                </div>
                                <div className='text-center p-6 lg:p-8 bg-white border-2 border-gray-300 rounded-2xl hover:shadow-md transition-shadow'>
                                    <div className='text-3xl lg:text-4xl font-bold text-gray-900 mb-2'>{stats.rides.cancelled}</div>
                                    <div className='text-sm lg:text-base font-medium text-gray-600'>Cancelled</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Rides Table */}
                        <div className='bg-white border-2 border-gray-200 rounded-2xl overflow-hidden'>
                            <div className='px-5 lg:px-8 py-4 lg:py-6 border-b-2 border-gray-200'>
                                <h3 className='text-lg lg:text-xl font-bold text-gray-900'>Recent Rides</h3>
                                <p className='text-xs lg:text-sm text-gray-600 mt-1'>Latest ride activities on your platform</p>
                            </div>
                            <div className='overflow-x-auto'>
                                <table className='w-full'>
                                    <thead>
                                        <tr className='bg-gray-100 border-b-2 border-gray-200'>
                                            <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>User</th>
                                            <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden md:table-cell'>Driver</th>
                                            <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Status</th>
                                            <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Fare</th>
                                            <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden sm:table-cell'>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentRides.map((ride, index) => (
                                            <tr key={index} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex items-center gap-2 lg:gap-3'>
                                                        <div className='w-9 h-9 lg:w-10 lg:h-10 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                                                            <span className='text-xs lg:text-sm font-bold text-gray-900'>
                                                                {ride.user?.fullname?.firstname?.[0]}{ride.user?.fullname?.lastname?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <div className='font-semibold text-sm lg:text-base text-gray-900 truncate'>
                                                                {ride.user?.fullname?.firstname}
                                                            </div>
                                                            <div className='text-xs text-gray-600 truncate'>{ride.user?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden md:table-cell'>
                                                    <div className='font-medium text-sm lg:text-base text-gray-900'>
                                                        {ride.captain?.fullname?.firstname || 'Not Assigned'}
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-900 border border-gray-300'>
                                                        {ride.status}
                                                    </span>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <span className='font-bold text-sm lg:text-base text-gray-900'>₹{ride.fare}</span>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 text-xs lg:text-sm text-gray-600 hidden sm:table-cell'>
                                                    {new Date(ride.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Management Tab */}
                {activeTab === 'users' && (
                    <div className='bg-white border-2 border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='px-5 lg:px-8 py-4 lg:py-6 border-b-2 border-gray-200'>
                            <h3 className='text-lg lg:text-xl font-bold text-gray-900'>All Users</h3>
                            <p className='text-xs lg:text-sm text-gray-600 mt-1'>Manage and monitor all users</p>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-100 border-b-2 border-gray-200'>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Name</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden md:table-cell'>Email</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden sm:table-cell'>Joined</th>
                                        <th className='text-right py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className='py-12 text-center text-gray-600'>
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user._id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex items-center gap-2 lg:gap-3'>
                                                        <div className='w-9 h-9 lg:w-10 lg:h-10 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                                                            <span className='text-xs lg:text-sm font-bold text-gray-900'>
                                                                {user.fullname?.firstname?.[0]}{user.fullname?.lastname?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <div className='font-semibold text-sm lg:text-base text-gray-900'>
                                                                {user.fullname?.firstname} {user.fullname?.lastname}
                                                            </div>
                                                            <div className='text-xs text-gray-600 md:hidden'>{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden md:table-cell'>
                                                    <div className='text-sm lg:text-base text-gray-900'>{user.email}</div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 text-xs lg:text-sm text-gray-600 hidden sm:table-cell'>
                                                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex justify-end'>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ id: user._id, type: 'user' })}
                                                            className='px-3 lg:px-4 py-2 border-2 border-gray-300 rounded-lg text-xs lg:text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors'
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Captains Management Tab */}
                {activeTab === 'captains' && (
                    <div className='bg-white border-2 border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='px-5 lg:px-8 py-4 lg:py-6 border-b-2 border-gray-200'>
                            <h3 className='text-lg lg:text-xl font-bold text-gray-900'>All Drivers</h3>
                            <p className='text-xs lg:text-sm text-gray-600 mt-1'>Manage and monitor all drivers</p>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-100 border-b-2 border-gray-200'>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Name</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden md:table-cell'>Email</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden lg:table-cell'>Vehicle</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden sm:table-cell'>Status</th>
                                        <th className='text-right py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {captains.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className='py-12 text-center text-gray-600'>
                                                No drivers found
                                            </td>
                                        </tr>
                                    ) : (
                                        captains.map((captain) => (
                                            <tr key={captain._id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex items-center gap-2 lg:gap-3'>
                                                        <div className='w-9 h-9 lg:w-10 lg:h-10 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                                                            <span className='text-xs lg:text-sm font-bold text-gray-900'>
                                                                {captain.fullname?.firstname?.[0]}{captain.fullname?.lastname?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <div className='font-semibold text-sm lg:text-base text-gray-900'>
                                                                {captain.fullname?.firstname} {captain.fullname?.lastname}
                                                            </div>
                                                            <div className='text-xs text-gray-600 md:hidden'>{captain.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden md:table-cell'>
                                                    <div className='text-sm lg:text-base text-gray-900'>{captain.email}</div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden lg:table-cell'>
                                                    <div className='text-sm text-gray-900'>
                                                        {captain.vehicle?.vehicleType} - {captain.vehicle?.plate}
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden sm:table-cell'>
                                                    <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-900 border border-gray-300'>
                                                        {captain.status || 'inactive'}
                                                    </span>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex justify-end'>
                                                        <button
                                                            onClick={() => setDeleteConfirm({ id: captain._id, type: 'captain' })}
                                                            className='px-3 lg:px-4 py-2 border-2 border-gray-300 rounded-lg text-xs lg:text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors'
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Rides Tab */}
                {activeTab === 'rides' && (
                    <div className='bg-white border-2 border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='px-5 lg:px-8 py-4 lg:py-6 border-b-2 border-gray-200'>
                            <h3 className='text-lg lg:text-xl font-bold text-gray-900'>All Rides</h3>
                            <p className='text-xs lg:text-sm text-gray-600 mt-1'>View and monitor all rides in the platform</p>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gray-100 border-b-2 border-gray-200'>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>User</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden md:table-cell'>Driver</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden lg:table-cell'>Pickup</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden lg:table-cell'>Destination</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Status</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase'>Fare</th>
                                        <th className='text-left py-3 lg:py-4 px-4 lg:px-8 text-xs font-bold text-gray-900 uppercase hidden sm:table-cell'>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rides.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className='py-12 text-center text-gray-600'>
                                                No rides found
                                            </td>
                                        </tr>
                                    ) : (
                                        rides.map((ride) => (
                                            <tr key={ride._id} className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <div className='flex items-center gap-2 lg:gap-3'>
                                                        <div className='w-9 h-9 lg:w-10 lg:h-10 bg-gray-200 border border-gray-300 rounded-xl flex items-center justify-center flex-shrink-0'>
                                                            <span className='text-xs lg:text-sm font-bold text-gray-900'>
                                                                {ride.user?.fullname?.firstname?.[0]}{ride.user?.fullname?.lastname?.[0]}
                                                            </span>
                                                        </div>
                                                        <div className='min-w-0'>
                                                            <div className='font-semibold text-sm lg:text-base text-gray-900 truncate'>
                                                                {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}
                                                            </div>
                                                            <div className='text-xs text-gray-600 truncate'>{ride.user?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden md:table-cell'>
                                                    <div className='text-sm lg:text-base text-gray-900 font-medium'>
                                                        {ride.captain?.fullname?.firstname ? 
                                                            `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname || ''}` : 
                                                            'Not Assigned'
                                                        }
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden lg:table-cell'>
                                                    <div className='text-sm text-gray-900 max-w-xs truncate'>
                                                        {ride.pickup || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 hidden lg:table-cell'>
                                                    <div className='text-sm text-gray-900 max-w-xs truncate'>
                                                        {ride.destination || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <span className='inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-900 border border-gray-300 capitalize'>
                                                        {ride.status}
                                                    </span>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8'>
                                                    <span className='font-bold text-sm lg:text-base text-gray-900'>₹{ride.fare}</span>
                                                </td>
                                                <td className='py-3 lg:py-5 px-4 lg:px-8 text-xs lg:text-sm text-gray-600 hidden sm:table-cell'>
                                                    {new Date(ride.createdAt || ride.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminDashboard
