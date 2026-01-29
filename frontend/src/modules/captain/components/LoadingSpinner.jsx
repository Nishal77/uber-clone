import React from 'react'

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
            <div className="relative">
                {/* Outer rotating ring */}
                <div className="w-20 h-20 border-4 border-gray-800 border-t-white rounded-full animate-spin"></div>
                {/* Uber logo placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="black">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <p className="mt-6 text-white text-lg font-medium">{message}</p>
        </div>
    )
}

export default LoadingSpinner
