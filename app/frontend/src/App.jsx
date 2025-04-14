import { useState } from 'react'
import Header from './components/Header'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Trade from './components/pages/Trade'
import Portfolio from './components/pages/Portfolio'
import Tutorial from './components/pages/Tutorial'
import Footer from './components/Footer'
import LoginForm from './components/LoginForm'
import Modal from './components/Modal'
import RegisterForm from './components/RegisterForm'

function App() {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    const handleLogin = (userData) => {
        console.log('User logged in:', userData)
        setIsLoggedIn(true)
        setUserEmail(userData.username)
        setShowLoginModal(false)
    }

    const handleRegister = (userData) => {
        console.log('User registered:', userData)
        setShowRegisterModal(false)
    }

    const handleLogout = () => {
        setIsLoggedIn(false)
        setUserEmail('')
    }

    return (
        <div className="App">
            <Header 
                onLoginClick={() => setShowLoginModal(true)} 
                isLoggedIn={isLoggedIn}
                userEmail={userEmail}
                onLogoutClick={handleLogout}
            />
            <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
                <LoginForm onLogin={handleLogin} />
            </Modal>
            <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
                <RegisterForm onRegister={handleRegister} onClose={() => setShowRegisterModal(false)} />
            </Modal>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/trade" element={<Trade />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/tutorial" element={<Tutorial />} />
            </Routes>
            
            <Footer />  
            
        </div>
    )
}

export default App
