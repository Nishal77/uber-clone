import React, { useContext } from 'react'
import { CaptainDataContext } from '../../../app/store/CaptainContext'

const CaptainDetails = () => {

    const { captain } = useContext(CaptainDataContext)

    if (!captain) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center justify-start gap-3'>
                    <img className='h-10 w-10 rounded-full object-cover' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdlMd7stpWUCmjpjSo8668VI0k66LJjQ9LFg&s" alt="" />
                    <h4 className='text-lg font-medium capitalize'>{captain.fullname.firstname + " " + captain.fullname.lastname}</h4>
                </div>
                <div>
                    <h4 className='text-xl font-semibold'>₹295.20</h4>
                    <p className='text-sm text-gray-600'>Earned</p>
                </div>
            </div>
            <div className='flex p-3 mt-6 bg-gray-50 rounded-2xl justify-center gap-4 items-start shadow-sm'>
                <div className='text-center w-1/3'>
                    <i className="text-3xl mb-2 font-thin text-gray-800 ri-timer-2-line"></i>
                    <h5 className='text-lg font-semibold'>10.2</h5>
                    <p className='text-xs text-gray-500 font-medium'>Hours Online</p>
                </div>
                <div className='text-center w-1/3 border-x border-gray-200'>
                    <i className="text-3xl mb-2 font-thin text-gray-800 ri-speed-up-line"></i>
                    <h5 className='text-lg font-semibold'>30 KM</h5>
                    <p className='text-xs text-gray-500 font-medium'>Total Distance</p>
                </div>
                <div className='text-center w-1/3'>
                    <i className="text-3xl mb-2 font-thin text-gray-800 ri-booklet-line"></i>
                    <h5 className='text-lg font-semibold'>20</h5>
                    <p className='text-xs text-gray-500 font-medium'>Total Jobs</p>
                </div>
            </div>
        </div>
    )
}

export default CaptainDetails
