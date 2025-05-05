/**
 * App.jsx: Defines the main application component for the frontend.
 * Sets up routing, authentication context, and main layout structure.
 */
import { useState, useEffect } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

// Components
import Header from './components/header/Header';
import Modal from './components/Modal';
import Footer from './components/footer/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home/Home';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Tutorial from './pages/Tutorial';

// Forms
import LoginForm from './components/forms/LoginForm';
import RegisterForm from './components/forms/RegisterForm';
import ForgotPasswordForm from './components/forms/ForgotPasswordForm';

// Auth Context
import { useAuth } from './context/AuthContext';
import { TradingSessionProvider } from './context/TradingSessionContext';

// Styles
import './styles/App.css';

function App() {
    // State for modals
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);    // Get auth context
    const { user, isAuthenticated, logout, login } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
      // Debug log for authentication state
    console.log('App render - Auth state:', { user, isAuthenticated });
      // Effect to respond to auth state changes
    useEffect(() => {
        console.log('App useEffect - Auth state changed:', { user, isAuthenticated });
        // Force update when auth state changes
        setForceUpdate(prev => prev + 1);
    }, [user, isAuthenticated]);
    
    // Listen for auth state changed events
    useEffect(() => {
        const handleAuthStateChanged = (event) => {
            console.log('App: Auth state changed event received:', event.detail);
            // Force rerender
            setForceUpdate(prev => prev + 1);
        };
        
        window.addEventListener('auth-state-changed', handleAuthStateChanged);
        
        return () => {
            window.removeEventListener('auth-state-changed', handleAuthStateChanged);
        };
    }, []);
      // Check for auth message from redirects or URL parameters
    useEffect(() => {
        // Check for auth message in location state
        if (location.state?.authMessage) {
            // Could show a notification here
            console.log(location.state.authMessage);
        }
        
        // Check for Google login success in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('login') && urlParams.get('login') === 'success') {
            console.log('App detected Google login success from URL parameters');
            // Force open the login modal to trigger the Google callback handler
            setShowLoginModal(true);
        }

        // Add event listener for opening login modal after registration
        const openLoginHandler = () => {
            setShowLoginModal(true);
        };
        document.addEventListener('openLoginModal', openLoginHandler);

        // Cleanup
        return () => {
            document.removeEventListener('openLoginModal', openLoginHandler);
        };
    }, [location]);

    // Modal handlers
    const handleOpenLoginModal = () => {
        setShowLoginModal(true);
    };

    const handleOpenRegisterModal = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const handleOpenForgotPasswordModal = () => {
        setShowLoginModal(false);
        setShowForgotPasswordModal(true);
    };

    const handleCloseAllModals = () => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
        setShowForgotPasswordModal(false);
    };    // Define the onLogin function
    const handleLogin = async (userData) => {
        try {
            console.log("App: Login successful, userData received:", userData);
            
            // Close the login modal
            setShowLoginModal(false);
            
            // Force a UI update by setting a state variable
            // This is a common React pattern to force child components to re-render
            setForceUpdate(prev => prev + 1);
        } catch (err) {
            console.error("Login error in App:", err);
        }
    };
    
    // Add a state variable to force re-render when auth state changes
    const [forceUpdate, setForceUpdate] = useState(0);

    return (
        <TradingSessionProvider>
            <div className="App">                <Header 
                    onLoginClick={handleOpenLoginModal} 
                    isLoggedIn={isAuthenticated}
                    userEmail={user?.username || user?.email}
                    onLogoutClick={() => {
                        logout();
                        navigate('/home');
                    }}
                />
                
                {/* Authentication Modals */}
                <Modal isOpen={showLoginModal} onClose={handleCloseAllModals}>
                    <LoginForm 
                        onLogin={handleLogin} // Pass the onLogin function here
                        onRegisterClick={handleOpenRegisterModal}
                        onForgotPasswordClick={handleOpenForgotPasswordModal}
                    />
                </Modal>
                
                <Modal isOpen={showRegisterModal} onClose={handleCloseAllModals}>
                    <RegisterForm onClose={handleCloseAllModals} />
                </Modal>
                
                <Modal isOpen={showForgotPasswordModal} onClose={handleCloseAllModals}>
                    <ForgotPasswordForm onClose={handleCloseAllModals} />
                </Modal>
                
                {/* Routes */}
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/trade" element={<Trade />} />
                        <Route 
                            path="/portfolio" 
                            element={
                                <ProtectedRoute>
                                    <Portfolio />
                                </ProtectedRoute>
                            } 
                        />
                        <Route path="/tutorial" element={<Tutorial />} />
                    </Routes>
                </main>
                
                <Footer />  
            </div>
        </TradingSessionProvider>
    );
}

export default App;
