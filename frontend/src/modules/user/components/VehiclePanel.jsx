import React from 'react'

const VehiclePanel = ({ setConfirmRidePanel, setVehiclePanel, fare, setVehicleType }) => {

    const [ activeVehicle, setActiveVehicle ] = React.useState(null)
    
    const clickHandler = () => {
        if (!activeVehicle) return
        setVehicleType(activeVehicle)
        setConfirmRidePanel(true)
    }

    return (
        <div className='flex flex-col gap-3'>
            <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
                setVehiclePanel(false)
            }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-3xl font-bold mb-5 text-gray-800 translate-y-2'>Choose a Vehicle</h3>
            
            <div onClick={() => setActiveVehicle('car')} className={`${activeVehicle === 'car' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-transparent bg-white'} flex border-2 active:scale-95 mb-2 rounded-2xl w-full p-3 items-center justify-between cursor-pointer transition-all duration-200`}>
                <img className='h-16 mix-blend-multiply' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-bold text-lg text-gray-800'>UberGo <span><i className="ri-user-3-fill text-sm"></i>4</span></h4>
                    <h5 className='font-medium text-sm text-gray-800'>2 mins away </h5>
                    <p className='font-normal text-xs text-gray-500'>Affordable, compact rides</p>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>₹{fare.car}</h2>
            </div>
            
            <div onClick={() => setActiveVehicle('moto')} className={`${activeVehicle === 'moto' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-transparent bg-white'} flex border-2 active:scale-95 mb-2 rounded-2xl w-full p-3 items-center justify-between cursor-pointer transition-all duration-200`}>
                <img className='h-14 mix-blend-multiply' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-bold text-lg text-gray-800'>Moto <span><i className="ri-user-3-fill text-sm"></i>1</span></h4>
                    <h5 className='font-medium text-sm text-gray-800'>3 mins away </h5>
                    <p className='font-normal text-xs text-gray-500'>Affordable motorcycle rides</p>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>₹{fare.moto}</h2>
            </div>
            
            <div onClick={() => setActiveVehicle('auto')} className={`${activeVehicle === 'auto' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-transparent bg-white'} flex border-2 active:scale-95 mb-2 rounded-2xl w-full p-3 items-center justify-between cursor-pointer transition-all duration-200`}>
                <img className='h-14 mix-blend-multiply' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648159130/assets/34/1322a4-d20e-4e28-8610-efc1365b9055/original/Uber_Moto_558x372_pixels_Desktop.png" alt="" />
                <div className='ml-2 w-1/2'>
                    <h4 className='font-bold text-lg text-gray-800'>UberAuto <span><i className="ri-user-3-fill text-sm"></i>3</span></h4>
                    <h5 className='font-medium text-sm text-gray-800'>3 mins away </h5>
                    <p className='font-normal text-xs text-gray-500'>Affordable Auto rides</p>
                </div>
                <h2 className='text-2xl font-bold text-gray-800'>₹{fare.auto}</h2>
            </div>
 
             <button disabled={!activeVehicle} onClick={clickHandler} className={`${!activeVehicle ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800' } w-full py-3 rounded-xl mt-5 font-bold text-lg transition-all shadow-lg`}>
                 Confirm Vehicle
             </button>
         </div>
    )
}

export default VehiclePanel
