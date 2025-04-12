import React from 'react';
import { Link } from 'react-router-dom';
import Tables from './HomeCom/Tables';
import CardGraph from './HomeCom/CardGraph';
import './Home.css';


function Home(props) {
    return(
        <div className="home">
            <CardGraph />
            <Tables />
            
        </div>
        
    );

}

export default Home;