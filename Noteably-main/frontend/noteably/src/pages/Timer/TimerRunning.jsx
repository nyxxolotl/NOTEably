import React, { useState, useEffect, useRef } from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from '@mui/icons-material/PauseRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import './TimerSetup.css';

function TimerRunning({ title, initialTime, onStop }) {
  const audioRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(initialTime || 0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio('/ASSETS/TimerSound.mp3');
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            audioRef.current?.play().catch(console.error);
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <div className="timer-running-wrapper">
      <div className="timer-running-title">{title}</div>
      <div className="timer-running-subtitle">
        {`${Math.floor(initialTime/3600)}h ${Math.floor((initialTime%3600)/60)}m ${initialTime%60}s`}
      </div>

      <div
        className="timer-outer-circle"
        style={{
          background: `conic-gradient(
            white ${(1 - timeLeft / (initialTime || 1)) * 360}deg,
            #EF476F ${(1 - timeLeft / (initialTime || 1)) * 360}deg,
            #F78C6B 72deg,
            #FFD166 144deg,
            #06D6A0 216deg,
            #118AB2 288deg,
            #073B4C 360deg
          )`
        }}
      >
        <div className="timer-inner-circle">
          {timeLeft === 0 ? (
            <img
              src="/ASSETS/popup-timer.png"
              alt="Time's Up"
              style={{ width: '320px', height: '320px', marginBottom: '20px' }}
            />
          ) : (
            <span className="timer-text">{formatTime(timeLeft)}</span>
          )}
        </div>
      </div>

      <div className="timer-running-buttons">
        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={timeLeft === 0}
          className={`timer-running-play ${timeLeft === 0 ? "disabled" : "active"}`}
        >
          {isRunning ? <PauseIcon /> : <PlayArrowIcon />}
        </button>

        <button onClick={onStop} className="timer-running-stop">
          <StopIcon />
        </button>
      </div>
    </div>
  );
}


export default TimerRunning;
