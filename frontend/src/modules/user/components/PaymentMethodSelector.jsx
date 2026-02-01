import React, { useState } from 'react'

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, fare }) => {
  const [method, setMethod] = useState(selectedMethod || 'cash')

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod)
    onMethodChange(newMethod)
  }

  return (
    <div className='bg-white rounded-xl p-4 border border-gray-200'>
      <h3 className='text-lg font-bold text-gray-900 mb-3'>Choose Payment Method</h3>
      
      <div className='space-y-3'>
        {/* Cash Option */}
        <div
          onClick={() => handleMethodChange('cash')}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            method === 'cash'
              ? 'bg-blue-50 border-2 border-blue-500'
              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center gap-3'>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              method === 'cash' ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              <i className="ri-money-rupee-circle-line text-white text-2xl"></i>
            </div>
            <div>
              <p className='font-semibold text-gray-900'>Cash</p>
              <p className='text-xs text-gray-500'>Pay with cash after ride</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            method === 'cash' ? 'border-blue-500' : 'border-gray-300'
          }`}>
            {method === 'cash' && (
              <div className='w-3 h-3 rounded-full bg-blue-500'></div>
            )}
          </div>
        </div>

        {/* Online Payment Option */}
        <div
          onClick={() => handleMethodChange('online')}
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
            method === 'online'
              ? 'bg-green-50 border-2 border-green-500'
              : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className='flex items-center gap-3'>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              method === 'online' ? 'bg-green-500' : 'bg-gray-300'
            }`}>
              <i className="ri-bank-card-line text-white text-2xl"></i>
            </div>
            <div>
              <p className='font-semibold text-gray-900'>Online Payment</p>
              <p className='text-xs text-gray-500'>Pay via UPI, Card, Wallet</p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            method === 'online' ? 'border-green-500' : 'border-gray-300'
          }`}>
            {method === 'online' && (
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
            )}
          </div>
        </div>
      </div>

      {/* Fare Display */}
      <div className='mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl'>
        <div className='flex items-center justify-between'>
          <p className='text-gray-600'>Total Fare:</p>
          <p className='text-2xl font-bold text-gray-900'>₹{fare}</p>
        </div>
        {method === 'online' && (
          <div className='mt-2 flex items-center gap-2'>
            <i className="ri-shield-check-line text-green-600"></i>
            <p className='text-xs text-gray-600'>Secure payment powered by Razorpay</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentMethodSelector
