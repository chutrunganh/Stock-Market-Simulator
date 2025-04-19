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
import ForgotPasswordForm from './components/ForgotPasswordForm'

function App() {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
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

    const handleForgotPassword = async (email) => {
        console.log('Reset password for:', email)
        // Gửi yêu cầu đến API backend
        // Ví dụ: await fetch('/api/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
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
                <LoginForm 
                    onLogin={handleLogin} 
                    onRegisterClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                    }}
                    onForgotPasswordClick={() => {
                        setShowLoginModal(false);
                        setShowForgotPasswordModal(true);
                    }}
                />
            </Modal>
            <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
                <RegisterForm onRegister={handleRegister} onClose={() => setShowRegisterModal(false)} />
            </Modal>
            <Modal isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)}>
                <ForgotPasswordForm
                    onReset={handleForgotPassword}
                    onClose={() => setShowForgotPasswordModal(false)}
                />
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
