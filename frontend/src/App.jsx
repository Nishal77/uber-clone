import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Start from './modules/user/pages/Start'
import UserLogin from './modules/user/pages/UserLogin'
import UserSignup from './modules/user/pages/UserSignup'
import CaptainLogin from './modules/captain/pages/CaptainLogin'
import CaptainSignup from './modules/captain/pages/CaptainSignup'
import CaptainLogout from './modules/captain/pages/CaptainLogout'
import Home from './modules/user/pages/Home'
import CaptainHome from './modules/captain/pages/CaptainHome'
import CaptainRiding from './modules/captain/pages/CaptainRiding'
import UserProtectWrapper from './modules/user/pages/UserProtectWrapper'
import CaptainProtectWrapper from './modules/captain/pages/CaptainProtectWrapper'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-login' element={<CaptainLogin />} />
        <Route path='/captain-signup' element={<CaptainSignup />} />
        <Route path='/captain-logout' element={<CaptainLogout />} />
        <Route path='/home' element={
          <UserProtectWrapper>
            <Home />
          </UserProtectWrapper>
        } />
        <Route path='/captain-home' element={
          <CaptainProtectWrapper>
            <CaptainHome />
          </CaptainProtectWrapper>
        } />
        <Route path='/captain-riding' element={
          <CaptainProtectWrapper>
            <CaptainRiding />
          </CaptainProtectWrapper>
        } />
      </Routes>
    </div>
  )
}

export default App
