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
    const [username, setUsername] = useState('')
    const [showLoginSuccess, setShowLoginSuccess] = useState(false) // Thêm state cho thông báo

    const handleLogin = (userData) => {
        console.log('User logged in:', userData)
        setIsLoggedIn(true)
        setUserEmail(userData.email)
        setUsername(userData.username)
        setShowLoginModal(false)
        setShowLoginSuccess(true) // Hiện thông báo
        setTimeout(() => {
            setShowLoginSuccess(false) // Ẩn thông báo sau 3 giây
        }, 3000)
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
            {showLoginSuccess && (
                <div className="login-success-message">
                    Logging in...
                </div>
            )}
            <Header 
                onLoginClick={() => setShowLoginModal(true)} 
                isLoggedIn={isLoggedIn}
                userEmail={userEmail}
                username={username} // Truyền username xuống Header
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
                <RegisterForm 
                    onRegister={handleRegister} 
                    onClose={() => setShowRegisterModal(false)} 
                    onBackToLogin={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }} 
                />
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
