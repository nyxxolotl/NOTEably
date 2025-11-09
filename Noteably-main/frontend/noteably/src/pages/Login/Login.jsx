import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { getStudentByStudentId } from '../../services/studentService';
import './Login.css';
import Visibility from '@mui/icons-material/Visibility'; 
import VisibilityOff from '@mui/icons-material/VisibilityOff'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [animationPhase, setAnimationPhase] = useState('pass-hide'); // Starting frame
    const [customAlertMessage, setCustomAlertMessage] = useState(''); // Custom alert message
    const [isAlertVisible, setIsAlertVisible] = useState(false); // Visibility of custom alert
    const [alertColor, setAlertColor] = useState(''); // new state for alert color
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Clear localStorage before login to avoid stale tokens
            localStorage.clear();

            const response = await axios.post(API_ENDPOINTS.STUDENT.LOGIN, {
                email: email,
                password: password,
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                console.log('Login response:', response.data);
                if (response.data.student) {
                    const studentId = response.data.student.studentId;
                    localStorage.setItem('studentId', studentId);
                    localStorage.setItem('studentName', response.data.student.name);
                    localStorage.setItem('token', response.data.token);
                    console.log('Stored token:', localStorage.getItem('token'));

                    // Fetch full student info after login
                    const fullStudentInfo = await getStudentByStudentId(studentId);
                    console.log('Full student info:', fullStudentInfo);
                    localStorage.setItem('fullStudentInfo', JSON.stringify(fullStudentInfo));

                    showAlert('Login successful!', false); 
                    setTimeout(() => navigate('/dashboard'), 1500); // Navigate after a delay
                } else if (response.data.studentId) {
                    // Handle flat student object response
                    const studentId = response.data.studentId;
                    localStorage.setItem('studentId', studentId);
                    localStorage.setItem('studentName', response.data.name);
                    // No token in this response structure
                    showAlert('Login successful!', false); 
                    setTimeout(() => navigate('/dashboard'), 1500); // Navigate after a delay
                } else {
                    setMessage('Invalid login response structure.');
                }
            } else {
                setMessage('Invalid credentials. Please try again.');
            }
            } catch (error) {
                console.error('Error during login:', error);

                let errorMessage = 'Error logging in. Please check your credentials.';

                if (error.response) {
                    if (error.response.status === 401) {
                        errorMessage = 'Unauthorized: Invalid email or password.';
                    } else if (error.response.status === 403) {
                        errorMessage = 'Forbidden: Access denied.';
                    } else if (error.response.data && error.response.data.message) {
                        errorMessage = `Error: ${error.response.data.message}`;
                    }
                }

                setMessage(errorMessage);
                showAlert(errorMessage, true); 
            }
    };

    const handleTogglePassword = () => {
        if (showPassword) {
            setAnimationPhase('pass-inbetween');
            setTimeout(() => setAnimationPhase('pass-hide-transition'), 200);
            setTimeout(() => {
                setAnimationPhase('pass-hide');
                setShowPassword(false);
            }, 400);
        } else {
            setAnimationPhase('pass-inbetween');
            setTimeout(() => setAnimationPhase('pass-show-transition'), 200);
            setTimeout(() => {
                setAnimationPhase('pass-show');
                setShowPassword(true);
            }, 400);
        }
    };

    const showAlert = (message, isError = false) => {
        setCustomAlertMessage(message);
        setAlertColor(isError ? 'var(--red)' : 'var(--green)'); 
        setIsAlertVisible(true);
        setTimeout(() => setIsAlertVisible(false), 2000);
    };

    const imageUrl = {
        'pass-hide': '/ASSETS/pass-hide.png',
        'pass-hide-transition': '/ASSETS/pass-hide-transition.png',
        'pass-inbetween': '/ASSETS/pass-inbetween.png',
        'pass-show-transition': '/ASSETS/pass-show-transition.png',
        'pass-show': '/ASSETS/pass-show.png',
    }[animationPhase];

    return (
        <div className="login-page">
            <div className="login-container">
                <header className="login-header">
                    <Link to="/">
                        <img src="/ASSETS/Sniglet.png" alt="Noteably Logo" className="logo" />
                    </Link>
                </header>
                <img
                    src={imageUrl}
                    alt="Password visibility status"
                    className={`password-image ${animationPhase}`}
                />
                <div className="login-card">
                    <h1>Welcome back~!</h1>
                    <p>No account? <Link to="/register">Sign up</Link></p>
                    <form onSubmit={handleLogin} className="login-form">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <div className="password-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {showPassword ? (
                                <Visibility onClick={handleTogglePassword} className="toggle-password-icon" style={{ color: 'gray', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: "pointer" }} />
                            ) : (
                                <VisibilityOff onClick={handleTogglePassword} className="toggle-password-icon" style={{ color: 'gray', position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: "pointer" }} />
                            )}
                        </div>
                        <button type="submit" className="login-button">Log in</button>
                    </form>
                </div>
            </div>

            {isAlertVisible && (
                <div className="custom-alert">
                    <img src="/ASSETS/popup-alert.png" alt="Success Icon" className="alert-icon" />
                    <p style={{ color: alertColor }}>{customAlertMessage}</p>
                </div>
            )}

        </div>
    );
};

export default Login;
