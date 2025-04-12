import { useState } from 'react'
import Header from './components/Header'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './components/pages/Home'
import Trade from './components/pages/Trade'
import Portfolio from './components/pages/Portfolio'
import Tutorial from './components/pages/Tutorial'
import Footer from './components/Footer'

function App() {
  

  return (
    <div className="App">
      <Header />
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
