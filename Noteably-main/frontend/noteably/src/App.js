import React, { Suspense } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Folder, Timer as TimerIcon, Assignment as ToDoIcon, Event as CalendarIcon } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import './App.css';
import Dashboard from './pages/Dashboard/Dashboard';
import Schedule from './pages/Calendar/Schedule';
import FolderApp from './pages/Folder/FolderApp';
import NoteApp from './pages/Notes/NoteApp';
import TimerSetup from './pages/Timer/TimerSetup';
import TimerRunning from './pages/Timer/TimerRunning';
// import ToDoList from './pages/Dashboard/ToDoListWidget';
import ToDoList from './pages/ToDo/ToDoList';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import SettingsPage from './pages/Setting/Setting';
import SecuritySettingsPage from './pages/Setting/SecuritySettings';
import PrivateRoute from './PrivateRoute';

const LandingPage = React.lazy(() => import('./pages/LandingPage/LandingPage'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isFullScreenPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register';

  const themeColors = {
    primary: "#F04770",
    secondary: "#F78C6A",
    accent: "#FEBD59",
    green: "#40D19A",
    blue: "#108AB1",
    dark: "#073B4C"
  };

  const isDashboardActive = location.pathname === '/dashboard';
  const isFolderActive = location.pathname === '/folders';
  const isToDoActive = location.pathname === '/todo';
  //const isCalendarActive = location.pathname === '/schedule';
  const isTimerActive = location.pathname === '/timer';
  const isSettingsActive = location.pathname === '/settings' || location.pathname === '/settings/security';

  React.useEffect(() => {
    document.querySelector('link[rel="icon"]').href = '/ASSETS/Sniglet.png';
  }, []);

  return (
    <div className="dashboard-wrapper">
      {!isFullScreenPage && (
        <div className='sidebar-container'>
          <div>
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <img
                src="/ASSETS/Sniglet.png"
                alt="Logo"
                style={{
                  width: '100%',
                  cursor: 'pointer',
                }}
              />
            </Link>
          </div>
          <div className='sidebar-list'>
            <span 
              className='dashboard-nav'
              style={{ 
                backgroundColor: isDashboardActive ? themeColors.primary : 'transparent',
                color: isDashboardActive ? 'white' : 'var(--darkblue)',
                border: isDashboardActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/dashboard')}
            >
              <HomeIcon />Dashboard
            </span>
            <span 
              className='folder-nav'
              style={{ 
                backgroundColor: isFolderActive ? themeColors.secondary : 'transparent',
                color: isFolderActive ? 'white' : 'var(--darkblue)',
                border: isFolderActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/folders')}
            >
              <Folder />Folders
            </span>
            <span 
              className='todo-nav'
              style={{ 
                backgroundColor: isToDoActive ? themeColors.accent : 'transparent',
                color: isToDoActive ? 'white' : 'var(--darkblue)',
                border: isToDoActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/todo')}
            >
              <ToDoIcon />To-Do
            </span>
            {/*<span 
              className='calendar-nav'
              style={{ 
                backgroundColor: isCalendarActive ? themeColors.green : 'transparent',
                color: isCalendarActive ? 'white' : 'var(--darkblue)',
                border: isCalendarActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/schedule')}
            >
              <CalendarIcon />Schedule
            </span>*/}
            <span 
              className='timer-nav'
              style={{ 
                backgroundColor: isTimerActive ? themeColors.blue : 'transparent',
                color: isTimerActive ? 'white' : 'var(--darkblue)',
                border: isTimerActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/timer')}
            >
              <TimerIcon />Timer
            </span>
            <span 
              className='settings-nav'
              style={{ 
                backgroundColor: isSettingsActive ? themeColors.green : 'transparent',
                color: isSettingsActive ? 'white' : 'var(--darkblue)',
                border: isSettingsActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}
              onClick={() => navigate('/settings')}
            >
              <AccountCircleIcon />Account
            </span>
          </div>
        </div>
      )}
      <div component="main" sx={{ flexGrow: 1, p: 3}}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/folders" element={
              <PrivateRoute>
                <FolderApp />
              </PrivateRoute>
            } />
            <Route path="/todo" element={
              <PrivateRoute>
                <ToDoList />
              </PrivateRoute>
            } />
            <Route path="/schedule" element={
              <PrivateRoute>
                <Schedule />
              </PrivateRoute>
            } />
            <Route path="/timer" element={
              <PrivateRoute>
                <TimerSetup />
              </PrivateRoute>
            } />
            <Route path="/running" element={<TimerRunning />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/security" element={<SecuritySettingsPage />} />
            <Route path="/noteApp/:folderId" element={<NoteApp />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
