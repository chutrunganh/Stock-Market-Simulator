/**
 * App.jsx: Defines the main application component for the frontend, setup router and wraps the app with necessary providers.
 */
import { useState } from 'react'
import './styles/App.css'
import Header from './components/header/Header'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Trade from './pages/Trade'
import Portfolio from './pages/Portfolio'
import Tutorial from './pages/Tutorial'
import Footer from './components/footer/Footer'
import LoginForm from './components/forms/LoginForm'
import Modal from './components/Modal'
import RegisterForm from './components/forms/RegisterForm'
import ForgotPasswordForm from './components/forms/ForgotPasswordForm'
import { registerUser, loginUser } from './api/user';

function App() {
    const [showLoginModal, setShowLoginModal] = useState(false)
    const [showRegisterModal, setShowRegisterModal] = useState(false)
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    const handleLogin = async (userData) => {
        try {
            const response = await loginUser(userData);
            console.log('User logged in:', response);
            setIsLoggedIn(true);
            setUserEmail(response.username);
            setShowLoginModal(false);
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
        }
    };

    const handleRegister = async (userData) => {
        try {
            const response = await registerUser(userData);
            console.log('User registered:', response);
            setShowRegisterModal(false);
            alert('Registration successful! You can now log in.');
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        }
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
