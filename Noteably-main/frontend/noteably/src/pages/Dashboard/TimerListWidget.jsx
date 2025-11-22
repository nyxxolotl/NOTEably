import React, { useState, useEffect } from 'react';
import { axiosRequest } from '../../services/studentService';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import './TimerListWidget.css';

const apiUrl = "http://localhost:8080/api/timer";

const TimerListWidget = () => {
    const [timerList, setTimerList] = useState([]);
    const navigate = useNavigate();

    // Fetch Timer List
    const fetchTimers = async () => {
        const fullStudentInfo = localStorage.getItem('fullStudentInfo');
        if (!fullStudentInfo) {
            console.error("Full student info is not available.");
            return;
        }
        const studentObj = JSON.parse(fullStudentInfo);
        const studentId = studentObj.id; // numeric ID expected by backend
        if (!studentId) {
            console.error("Numeric student ID is not available.");
            return;
        }
        try {
            const response = await axiosRequest({ method: 'get', url: `${apiUrl}/getByStudent/${studentId}` });
            setTimerList(response.data);
        } catch (error) {
            console.error("Error fetching timers:", error);
        }
    };

    useEffect(() => {
        fetchTimers();
    }, []);

    return (
        <div>
            {timerList.length === 0 ? (
                <p style={{ color: "grey" }}>No timers added yet.</p>
            ) : (
                <div>
                    {timerList.map((timer) => (
                        <div className="timer-item" key={timer.timerID}>
                            <div className='timer-item-title'>
                                <p style={{ fontWeight: 600, color: 'white' }}>{timer.title}</p>
                                <p style={{ color: 'white' }}>{`${timer.hours}h ${timer.minutes}m ${timer.seconds}s`}</p>       
                            </div>
                            <div className="timer-play-icon" onClick={() => navigate('/running', { state: { initialTime: timer.hours * 3600 + timer.minutes * 60 + timer.seconds, title: timer.title } })}>
                                <PlayArrowIcon />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimerListWidget;
