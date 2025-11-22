import React, { useEffect, useState } from 'react';
import FolderWidget from './FolderWidget';
import ToDoListWidget from './ToDoListWidget';
import TimerListWidget from './TimerListWidget';
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
          <div className="todolist-tasks-list">
            <ToDoListWidget />
          </div>
        </div>
      </div>
      <div className='third-row'>
        <div className="folder-widget">
          <div className="folder-widget-header">
            <div className="dashboard-icon-div orange-bg">
              <FolderIcon sx={{ color: 'white' }} />
            </div>
            <h1 className='folderlist-title'>Folders</h1>
          </div>
          <div className="folders-list">
            <FolderWidget />
          </div>
        </div>
        <div className="dashboard-widget compact-widget">
          <div className="timer-widget-header">
            <div className="dashboard-icon-div blue-bg">
              <TimerIcon sx={{ color: 'white' }} />
            </div>
            <h1 className='timers-title'>Timers</h1>
          </div>
          <div className="timers-list">
            <TimerListWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
