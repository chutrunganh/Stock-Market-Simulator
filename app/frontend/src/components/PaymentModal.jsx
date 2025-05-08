import React, { useState, useEffect } from 'react';
import { verifyPayment, getPaymentStatus } from '../api/payment';
import './PaymentModal.css';

function PaymentModal({ isOpen, onClose }) {
    const [transactionId, setTransactionId] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Reset states when modal opens
        if (isOpen) {
            setTransactionId('');
            setVerifying(false);
            setError(null);
            setSuccess(false);
        }
    }, [isOpen]);

    const handleVerifyPayment = async () => {
        if (!transactionId.trim()) {
            setError('Please enter the transaction ID');
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            const result = await verifyPayment(transactionId);
            if (result.success) {
                setSuccess(true);
                // Close modal after 3 seconds on success
                setTimeout(() => {
                    onClose();
                    // Refresh the page to update balance
                    window.location.reload();
                }, 3000);
            } else {
                setError(result.message || 'Payment verification failed');
            }
        } catch (err) {
            setError(err.message || 'Failed to verify payment');
        } finally {
            setVerifying(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Add Funds to Your Account</h2>
                <div className="payment-info">
                    <p>Transfer money to add virtual funds to your portfolio:</p>
                    <ul>
                        <li>1,000 VND = 1,000 USD in virtual money</li>
                        <li>Minimum transfer: 10,000 VND</li>
                        <li>Maximum transfer: 1,000,000 VND</li>
                    </ul>
                </div>
                <div className="qr-container">
                    <img 
                        src="https://qr.sepay.vn/img?acc=VQRQACJBQ9436&bank=MBBank" 
                        alt="Payment QR Code"
                        className="qr-code"
                    />
                    <p className="bank-info">MBBank - Account: VQRQACJBQ9436</p>
                </div>
                <div className="payment-instructions">
                    <h3>How to pay:</h3>
                    <ol>
                        <li>Open your MBBank app</li>
                        <li>Scan the QR code above</li>
                        <li>Enter the amount you want to transfer</li>
                        <li>Complete the transfer</li>
                        <li>After transfer, go to "Transaction History" in your MBBank app</li>
                        <li>Find your recent transfer and copy the "Mã giao dịch" (Transaction ID)</li>
                        <li>Paste the Transaction ID below</li>
                    </ol>
                </div>

                {!success ? (
                    <div className="verification-section">
                        <input
                            type="text"
                            placeholder="Enter Mã giao dịch (Transaction ID) from MBBank app"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="transaction-input"
                        />
                        {error && <p className="error-message">{error}</p>}
                        <button 
                            className="verify-button"
                            onClick={handleVerifyPayment}
                            disabled={verifying}
                        >
                            {verifying ? 'Verifying...' : 'Verify Payment'}
                        </button>
                    </div>
                ) : (
                    <div className="success-message">
                        Payment verified successfully! Your balance will be updated shortly.
                    </div>
                )}

                <button className="close-button" onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default PaymentModal; 