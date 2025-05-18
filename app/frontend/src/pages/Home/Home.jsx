import React from 'react';
import { Link } from 'react-router-dom';
import Tables from './HomeComponents/Tables';
import CardGraph from './HomeComponents/CardGraph';
import TradingStatus from './HomeComponents/TradingStatus';
import ChartExample from './HomeComponents/ChartExample';
import './Home.css';

function Home(props) {
    return(
        <div className="home">
            <CardGraph />
            <TradingStatus />
            <Tables />
            <ChartExample />
        </div>
    );
}

export default Home;