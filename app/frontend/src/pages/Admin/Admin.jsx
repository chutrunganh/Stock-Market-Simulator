import React, { useState, useEffect } from 'react';
import './Admin.css';
import { startTradingSession, stopTradingSession, getTradingSessionStatus } from '../../api/sessionTrading';
import { startArtificialOrders, stopArtificialOrders, getArtificialOrdersStatus } from '../../api/artificialOrders';

function AdminPage() {
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingStop, setIsLoadingStop] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Artificial Orders states
  const [isArtificialOrdersActive, setIsArtificialOrdersActive] = useState(false);
  const [isLoadingArtificialStart, setIsLoadingArtificialStart] = useState(false);
  const [isLoadingArtificialStop, setIsLoadingArtificialStop] = useState(false);
  const [artificialOrdersConfig, setArtificialOrdersConfig] = useState({
    intervalMs: 5000,
    ordersPerCycle: 5,
    baseTrend: 'neutral'
  });

  const fetchSessionStatus = async () => {
    try {
      const response = await getTradingSessionStatus();
      setIsSessionActive(response.isActive);
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  const fetchArtificialOrdersStatus = async () => {
    try {
      const response = await getArtificialOrdersStatus();
      setIsArtificialOrdersActive(response.data.isActive);
      setArtificialOrdersConfig(response.data.config);
    } catch (error) {
      console.error('Error fetching artificial orders status:', error);
    }
  };

  useEffect(() => {
    fetchSessionStatus();
    fetchArtificialOrdersStatus();
    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      fetchSessionStatus();
      fetchArtificialOrdersStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStartTrading = async () => {
    setIsLoadingStart(true);
    try {
      await startTradingSession();
      setIsSessionActive(true);
    } catch (error) {
      console.error('Error starting trading session:', error);
    } finally {
      setIsLoadingStart(false);
    }
  };

  const handleStopTrading = async () => {
    setIsLoadingStop(true);
    try {
      await stopTradingSession();
      setIsSessionActive(false);
    } catch (error) {
      console.error('Error stopping trading session:', error);
    } finally {
      setIsLoadingStop(false);
    }
  };

  const handleStartArtificialOrders = async () => {
    setIsLoadingArtificialStart(true);
    try {
      await startArtificialOrders(artificialOrdersConfig);
      setIsArtificialOrdersActive(true);
    } catch (error) {
      console.error('Error starting artificial orders:', error);
    } finally {
      setIsLoadingArtificialStart(false);
    }
  };

  const handleStopArtificialOrders = async () => {
    setIsLoadingArtificialStop(true);
    try {
      await stopArtificialOrders();
      setIsArtificialOrdersActive(false);
    } catch (error) {
      console.error('Error stopping artificial orders:', error);
    } finally {
      setIsLoadingArtificialStop(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setArtificialOrdersConfig(prev => ({
      ...prev,
      [name]: name === 'baseTrend' ? value : parseInt(value)
    }));
  };

  return (
    <div className="admin-page">
      
      {/* Trading Session Section */}
      <section className="trading-session-section">
        <h3>Trading Session Control</h3>
        <p>Control the simulated trading session.</p>

        <div className="admin-actions">
          <div className="action-group">
            <button
              onClick={handleStartTrading}
              disabled={isLoadingStart || isLoadingStop || isSessionActive}
              className={`admin-button start-button ${isSessionActive ? 'disabled' : ''}`}
            >
              {isLoadingStart ? 'Starting...' : 'Start Trading Session'}
            </button>
          </div>

          <div className="action-group">
            <button
              onClick={handleStopTrading}
              disabled={isLoadingStart || isLoadingStop || !isSessionActive}
              className={`admin-button stop-button ${!isSessionActive ? 'disabled' : ''}`}
            >
              {isLoadingStop ? 'Stopping...' : 'Stop Trading Session'}
            </button>
          </div>
        </div>

        <div className="session-status">
          <p className={`status-indicator ${isSessionActive ? 'active' : 'inactive'}`}>
            Current Status: {isSessionActive ? 'Trading Session Active' : 'Trading Session Inactive'}
          </p>
        </div>
      </section>

      {/* Artificial Orders Section */}
      <section className="artificial-orders-section">
        <h3>Artificial Orders Control</h3>
        <p>Configure and control the artificial orders generation.</p>

        <div className="config-form">
          <div className="form-group">
            <label>Interval (ms):</label>
            <input
              type="number"
              name="intervalMs"
              value={artificialOrdersConfig.intervalMs}
              onChange={handleConfigChange}
              min="1000"
              step="1000"
              disabled={isArtificialOrdersActive}
            />
          </div>

          <div className="form-group">
            <label>Orders per Cycle:</label>
            <input
              type="number"
              name="ordersPerCycle"
              value={artificialOrdersConfig.ordersPerCycle}
              onChange={handleConfigChange}
              min="1"
              max="10"
              disabled={isArtificialOrdersActive}
            />
          </div>

          <div className="form-group">
            <label>Base Trend:</label>
            <select
              name="baseTrend"
              value={artificialOrdersConfig.baseTrend}
              onChange={handleConfigChange}
              disabled={isArtificialOrdersActive}
            >
              <option value="neutral">Neutral</option>
              <option value="buy-dominant">Buy Dominant</option>
              <option value="sell-dominant">Sell Dominant</option>
            </select>
          </div>
        </div>

        <div className="admin-actions">
          <div className="action-group">
            <button
              onClick={handleStartArtificialOrders}
              disabled={isLoadingArtificialStart || isLoadingArtificialStop || isArtificialOrdersActive}
              className={`admin-button start-button ${isArtificialOrdersActive ? 'disabled' : ''}`}
            >
              {isLoadingArtificialStart ? 'Starting...' : 'Start Artificial Orders'}
            </button>
          </div>

          <div className="action-group">
            <button
              onClick={handleStopArtificialOrders}
              disabled={isLoadingArtificialStart || isLoadingArtificialStop || !isArtificialOrdersActive}
              className={`admin-button stop-button ${!isArtificialOrdersActive ? 'disabled' : ''}`}
            >
              {isLoadingArtificialStop ? 'Stopping...' : 'Stop Artificial Orders'}
            </button>
          </div>
        </div>

        <div className="session-status">
          <p className={`status-indicator ${isArtificialOrdersActive ? 'active' : 'inactive'}`}>
            Current Status: {isArtificialOrdersActive ? 'Artificial Orders Active' : 'Artificial Orders Inactive'}
          </p>
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
