import React from 'react';
import { Link } from 'react-router-dom';
import  '../styles/Portfolio.css';




function Portfolio() {
    
    


    return(
        <div className="portfolio-container">
            <div className="portfolio-content">
                <h1>Portfolio</h1>
                <p>Your portfolio details will be displayed here.</p>
                {/* <Link to="/trade" className="trade-link">Go to Trade</Link> */}
                
                <div className='grid-container'>
                    <div className = 'overview'>
                        <p>OVERVIEW</p>
                        <div className='white-container'>
                            <p>ACCOUNT VALUE</p>
                            <p className='big-number'>${/*Account value of the portfolio */}100,000.00</p>
                            <div className='smaller-grid'>
                                <div classname = 'left'>
                                    <p>TODAY'S CHANGE</p>
                                    <p className='big-number2'>$90</p>
                                </div>

                                <div className='right'>
                                    <p>ANNUAL RETURN</p>
                                    <p className='big-number2 green'>0%</p>
                                </div> 
                            </div>
                            

                            <div className='smaller-grid'>
                                <div classname = 'left'>
                                    <p>BUYING'S POWER</p>
                                    <p className='big-number2'>$90</p>
                                </div>

                                <div className='right'>
                                    <p>CASH</p>
                                    <p className='big-number2'>$90.5</p>
                                </div> 
                            </div>
                        </div>
                    </div>

                    <div className='game-info'>
                        <p>GAME INFO</p>
                        <div className='white-container'>
                            <div className='smaller-grid'>
                                <div className='left'>
                                    <p>CURRENT RANK</p>
                                    <p className = 'big-number'>{/* Rank of the user (portfolio) */}1</p>
                                </div>

                                <div className='right centered-div big-number3'>
                                    <p>of {/* number of users */}2 Players</p>
                                </div>
                            </div> 
                            <div style={{marginTop: '70px'}}>                              
                                <p>TOP PLAYER</p>
                                <div className='smaller-grid'>
                                    <a className='big-number3' href = "">ml7ru3</a>
                                    <a className='big-number3 centered-div'>${/*cash_balance of that user */}100,000,000.00</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='holdings'>
                        <p>HOLDINGS</p>
                        <div className='topnav'>
                            <a class = 'active' href = "">STOCKS & ETFS</a>
                            <a href = "">OPTIONS</a>
                            <a href = "">SHORTS</a>
                            <div className='market'>✅ Market is open. Closes in 1hr, 30m</div>

                        </div>
                        
                        <div className='white-container'>
                            <div className='block'>
                                <p>TOTAL VALUE</p>
                                <p className='big-number3'>$1040.78</p>
                            </div>

                            <div className='block'>
                                <p>TODAY'S CHANGE</p>
                                <p className='big-number3 red'>-$6.20</p>
                            </div>

                            <div className='block'>
                                <p>TOTAL GAIN/LOSS</p>
                                <p className='big-number3 green'>$34.50</p>
                            </div>

                            <div style = {{marginTop: '15px'}}>
                                <table id = "holdings-table">
                                    <colgroup>
                                        <col></col>
                                        <col className='even-collumn'></col>
                                        <col></col>
                                        <col className='even-collumn'></col>
                                    </colgroup>

                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Quantity</th>
                                        <th>Average Cost</th>
                                    </tr>

                                    <tr>
                                        <td>1</td>
                                        <td>NVDA</td> 
                                        <td>10</td>
                                        <td>$10000</td>
                                    </tr>

                                    <tr>
                                        <td>2</td>
                                        <td>TSLA</td>
                                        <td>5</td>
                                        <td>$5000</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
    
}

export default Portfolio;