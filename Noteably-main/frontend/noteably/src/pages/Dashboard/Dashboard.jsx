import React, { useEffect, useState } from 'react';
import FolderWidget from './FolderWidget';
import ToDoListWidget from './ToDoListWidget';
import TimerListWidget from './TimerListWidget';
import { Grid, Typography, Paper } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Calendar from '../Calendar/Calendar';
import { API_ENDPOINTS, axiosConfig } from '../../config/api';
import { getImageUrl, axiosRequest } from '../../services/studentService';
import '../../antioverflow.css';
import './Dashboard.css';

function Dashboard() {
  const [studentData, setStudentData] = useState({ studentId: '', studentName: '' });

  useEffect(() => {
    const fetchStudentData = async () => {
      const fullStudentInfo = localStorage.getItem('fullStudentInfo');
      let studentId = null;
      if (fullStudentInfo) {
        try {
          const studentObj = JSON.parse(fullStudentInfo);
          studentId = studentObj.id;
        } catch (error) {
          console.error("Error parsing fullStudentInfo from localStorage", error);
        }
      }
      if (!studentId) {
        console.error("No student ID found in localStorage.");
        return;
      }
      try {
        const response = await axiosRequest({ method: 'get', url: API_ENDPOINTS.STUDENT.GET_BY_ID(studentId), ...axiosConfig });
        const { studentId: apiStudentId, name, profilePicture } = response.data;
        setStudentData({ 
          studentId: apiStudentId, 
          studentName: name,
          profilePicture: profilePicture || '/ASSETS/Profile_blue.png',
        });
      } catch (error) {
        console.error('Error fetching student data:', error.response?.data || error.message);
      }
    };
    fetchStudentData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-profile">
          <img src={getImageUrl(studentData.profilePicture)} alt="Profile" />
        </div>
        <div>
          <p className='dashboard-profile-name'>Hello, {studentData.studentName || 'Student'}!</p>
          <p className='dashboard-profile-student-id'>Student ID: {studentData.studentId || 'Unknown ID'}</p>
          <p className='dashboard-profile-motto'>Stay organized, stay ahead!</p>
        </div>
      </div>

      <div className='second-row'>
        <Calendar />
        <div className="dashboard-widget">
          <div className="dashboard-widget-header">
            <div className="dashboard-icon-div yellow-bg">
              <CheckCircleIcon sx={{ color: 'white' }} />
            </div>
            <h1 className='todolist-title'>Tasks</h1>
          </div>
          {/*<div className="dashboard-widget-content no-scroll-x">
            <ToDoListWidget />
          </div>*/}
        </div>
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper className="dashboard-widget compact-widget" sx={{ border: '2px solid var(--blue)' }}>
            <div className="dashboard-widget-header">
              <div className="dashboard-icon-div blue-bg">
                <TimerIcon sx={{ color: 'white' }} />
              </div>
              <Typography variant="h6" sx={{ color: 'var(--blue)', ml: 1 }}>
                Timer
              </Typography>
            </div>
            <div className="dashboard-widget-content no-scroll-x">
              <TimerListWidget />
            </div>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper className="dashboard-widget compact-widget" sx={{ border: '2px solid var(--orange)' }}>
            <div className="dashboard-widget-header">
              <div className="dashboard-icon-div orange-bg">
                <FolderIcon sx={{ color: 'white' }} />
              </div>
              <Typography variant="h6" sx={{ color: 'var(--orange)', ml: 1 }}>
                Folders
              </Typography>
            </div>
            <div className="dashboard-widget-content no-scroll-x">
              <FolderWidget />
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
