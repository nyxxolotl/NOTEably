import { Link } from 'react-router-dom';
import '../index.css'; // if styles are separate

const Header = () => {
    return (
        <header className="header">
        <Link to="/">
            <img src="/ASSETS/Sniglet.png" alt="Noteably Logo" className="logo" />
        </Link>
        <div className="auth-buttons"> {/* This wraps both buttons */}
            <Link to="/login">
            <button className="auth-button login">Sign In</button>
            </Link>
        </div>
        </header>

    );
};

export default Header;
