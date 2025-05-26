import React, { useState } from 'react';
import './Tutorial.css';
import Modal from '../../components/Modal'; // Import Modal

function Tutorial() {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({
        title: '',
        content: null
    });

    const handleStrategyClick = (strategy) => {
        setModalContent(strategies[strategy]);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const strategies = {
        market: {
            title: "Market Orders",
            content: (
                <div className="strategy-modal-content">
                    <section className="order-section">
                        <h3>Definition</h3>
                        <p>A Market Order is a trade order that is executed immediately at the best available price in the market.</p>
                    </section>
                    <section className="order-section">
                        <h3>Characteristics</h3>
                        <ul>
                            <li>Executed immediately</li>
                            <li>Prioritizes speed of execution</li>
                            <li>Does not guarantee a specific price</li>
                        </ul>
                    </section>
                    <section className="order-section">
                        <h3>When to Use</h3>
                        <ul>
                            <li>When you want to execute a trade immediately</li>
                            <li>For stocks with high liquidity</li>
                            <li>In a stable market</li>
                        </ul>
                    </section>
                </div>
            )
        },
        limit: {
            title: "Limit Orders",
            content: (
                <div className="strategy-modal-content">
                    <section className="order-section">
                        <h3>Definition</h3>
                        <p>A Limit Order is an order to buy or sell at a specific price set by the investor.</p>
                    </section>
                    <section className="order-section">
                        <h3>Characteristics</h3>
                        <ul>
                            <li>Allows control over the trading price</li>
                            <li>May not be executed immediately</li>
                            <li>Protects investors from price fluctuations</li>
                        </ul>
                    </section>
                    <section className="order-section">
                        <h3>When to Use</h3>
                        <ul>
                            <li>When you want to control the buy/sell price</li>
                            <li>In a volatile market</li>
                            <li>When you have a specific price strategy</li>
                        </ul>
                    </section>
                </div>
            )
        },
        portfolio: {
            title: "Portfolio Management",
            content: (
                <div className="strategy-modal-content">
                    <section className="order-section">
                        <h3>Definition</h3>
                        <p>Portfolio Management is the strategy of managing and allocating investment capital across various stocks.</p>
                    </section>
                    <section className="order-section">
                        <h3>Basic Principles</h3>
                        <ul>
                            <li>Diversify your investment portfolio</li>
                            <li>Allocate assets reasonably</li>
                            <li>Balance risk and return</li>
                        </ul>
                    </section>
                    <section className="order-section">
                        <h3>Benefits</h3>
                        <ul>
                            <li>Minimize risk</li>
                            <li>Optimize profits</li>
                            <li>Effectively manage cash flow</li>
                        </ul>
                    </section>
                </div>
            )
        }
    };

    return (
        <div className="tutorial-container">
            <h1 className="tutorial-title">Getting Started with Stock Trading</h1>
            
            <div className="tutorial-sections">
                {/* Basic Section */}
                <section className="tutorial-section">
                    <h2>1. Understanding the Basics</h2>
                    <div className="tutorial-content">
                        <div className="tutorial-card">
                            <h3>What is Stock Trading?</h3>
                            <p>Stock trading involves buying and selling shares of publicly traded companies. When you buy a stock, you're purchasing a small ownership stake in a company.</p>
                        </div>
                        <div className="tutorial-card">
                            <h3>Key Terms to Know</h3>
                            <ul>
                                <li><strong>Stock/Share:</strong> A piece of ownership in a company</li>
                                <li><strong>Buy/Long:</strong> Purchasing shares expecting the price to rise</li>
                                <li><strong>Sell/Short:</strong> Selling shares expecting the price to fall</li>
                                <li><strong>Market Price:</strong> Current trading price of a stock</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* How to Trade Section */}
                <section className="tutorial-section">
                    <h2>2. How to Trade</h2>
                    <div className="tutorial-content">
                        <div className="tutorial-card">
                            <h3>Step-by-Step Guide</h3>
                            <div className="steps-container">
                                <div className="step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h4>Create an Account</h4>
                                        <p>Sign up and get $100,000 in virtual money to start trading</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h4>Research Stocks</h4>
                                        <p>Browse available stocks and analyze their performance</p>
                                    </div>
                                </div>
                                <div className="step">
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <h4>Place Orders</h4>
                                        <p>Choose your stocks and execute trades at your preferred price</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trading Strategies Section */}
                <section className="tutorial-section">
                    <h2>3. Trading Strategies</h2>
                    <div className="strategy-grid">
                        <div
                            className="strategy-card clickable"
                            onClick={() => handleStrategyClick('market')}
                        >
                            <div className="strategy-icon">📈</div>
                            <h3>Market Orders</h3>
                            <p>Buy or sell stocks immediately at the current market price</p>
                            <span className="learn-more">Learn more →</span>
                        </div>

                        <div
                            className="strategy-card clickable"
                            onClick={() => handleStrategyClick('limit')}
                        >
                            <div className="strategy-icon">⏰</div>
                            <h3>Limit Orders</h3>
                            <p>Set a specific price at which you want to buy or sell</p>
                            <span className="learn-more">Learn more →</span>
                        </div>

                        <div
                            className="strategy-card clickable"
                            onClick={() => handleStrategyClick('portfolio')}
                        >
                            <div className="strategy-icon">📊</div>
                            <h3>Portfolio Management</h3>
                            <p>Diversify your investments to manage risk</p>
                            <span className="learn-more">Learn more →</span>
                        </div>
                    </div>
                </section>

                <Modal isOpen={modalOpen} onClose={handleCloseModal}>
                    <h2>{modalContent.title}</h2>
                    {modalContent.content}
                </Modal>
            </div>
        </div>
    );

}

export default Tutorial;