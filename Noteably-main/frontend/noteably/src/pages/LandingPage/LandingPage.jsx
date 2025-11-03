import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';
import Header from '../../components/Header';

function LandingPage() {
    return (
        <div className="landing-container">
            <Header />
            <main className="main-content">
                <img src='../ASSETS/mikuu.png' />
                <div className="content-box">
                    <div className="welcome-text">
                        <h1>WELCOME TO</h1>
                        <h1 className='app-name'>
                            <div style={{ color: "#FEBD59" }}>NOTE</div>
                            <div style={{ color: "#F04770" }}>a</div>
                            <div style={{ color: "#F78C6A" }}>b</div>
                            <div style={{ color: "#108AB1" }}>l</div>
                            <div style={{ color: "#40D19A" }}>y</div>
                        </h1>
                        <p>YOUR ALL-IN-ONE PRODUCTIVE PARTNER</p>
                    </div>
                    <Link to="/register">
                        <button className="Lregister-button">Register Now!</button>
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
