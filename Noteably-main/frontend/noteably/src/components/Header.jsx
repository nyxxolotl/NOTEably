import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../index.css'; // if styles are separate

const Header = () => {
    const location = useLocation();

    const hideSignIn = location.pathname === '/login' || location.pathname === '/register';

    return (
        <header className="header">
        <Link to="/">
            <img src="/ASSETS/Sniglet.png" alt="Noteably Logo" className="logo" />
        </Link>

        {!hideSignIn && (
            <div className="auth-buttons"> 
                <Link to="/login">
                <button className="auth-button login">Sign In</button>
                </Link>
            </div>
        )}
        </header>

    );
};

export default Header;