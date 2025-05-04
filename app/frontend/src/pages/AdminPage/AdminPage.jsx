import React, { useState } from 'react';
import './AdminPage.css'; 

function AdminPage() {
  const [startMessage, setStartMessage] = useState('');
  const [stopMessage, setStopMessage] = useState('');
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingStop, setIsLoadingStop] = useState(false);

  const handleStartTrading = async () => {
    setIsLoadingStart(true);
    setStartMessage('Starting session...');
    setStopMessage(''); 
    try {
      const response = await fetch('/api/startTrading', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg; 
        } catch (e) {
        }
        throw new Error(errorMsg);
      }
      setStartMessage('Trading session started successfully!');
    } catch (error) {
      console.error('Error starting trading session:', error);
      setStartMessage(`Error: ${error.message}`);
    } finally {
      setIsLoadingStart(false);
    }
  };

  const handleStopTrading = async () => {
    setIsLoadingStop(true);
    setStopMessage('Stopping session...');
    setStartMessage(''); 
    try {
      const response = await fetch('/api/stopTrading', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
        }
        throw new Error(errorMsg);
      }
      setStopMessage('Trading session stopped successfully!');

    } catch (error) {
      console.error('Error stopping trading session:', error);
      setStopMessage(`Error: ${error.message}`);
    } finally {
      setIsLoadingStop(false);
    }
  };

  return (
    <div className="admin-page">
      <h2>Admin Controls</h2>
      <p>Control the simulated trading session.</p>

      <div className="admin-actions">
        <div className="action-group">
          <button
            onClick={handleStartTrading}
            disabled={isLoadingStart || isLoadingStop}
            className="admin-button start-button"
          >
            {isLoadingStart ? 'Starting...' : 'Start Trading Session'}
          </button>
          {startMessage && <p className={`message ${startMessage.startsWith('Error') ? 'error' : 'success'}`}>{startMessage}</p>}
        </div>

        <div className="action-group">
          <button
            onClick={handleStopTrading}
            disabled={isLoadingStart || isLoadingStop}
            className="admin-button stop-button"
          >
            {isLoadingStop ? 'Stopping...' : 'Stop Trading Session'}
          </button>
          {stopMessage && <p className={`message ${stopMessage.startsWith('Error') ? 'error' : 'success'}`}>{stopMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default AdminPage;