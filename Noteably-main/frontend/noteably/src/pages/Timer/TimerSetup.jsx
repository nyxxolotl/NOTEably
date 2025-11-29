import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimerRunning from './TimerRunning';

import {
  TextField, Typography, Grid, Box, List, ListItem, ListItemText, IconButton
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import RefreshIcon from '@mui/icons-material/RotateRightRounded';
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";

import { useNavigate } from 'react-router-dom';
import { axiosRequest } from '../../services/studentService';
import './TimerSetup.css';

import EditDialog from '../../dialogs/EditDialog';
import ConfirmEditDialog from '../../dialogs/ConfirmEditDialog';
import ConfirmDeleteDialog from '../../dialogs/ConfirmDeleteDialog';

function TimerSetup() {
  const url = "http://localhost:8080/api/timer";
  const [timerList, setTimerList] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState(null);
  const [timerToEdit, setTimerToEdit] = useState(null);
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [seconds, setSeconds] = useState('00');
  const navigate = useNavigate();
  const [activeTimer, setActiveTimer] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleMenuOpen = (event, timer) => {
    setMenuAnchor(event.currentTarget);
    setOpenMenuId(timer.timerID);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setOpenMenuId(null);
  };

  // const studentId = localStorage.getItem('studentId');
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

  // CRUD
  const fetchTimers = async () => {
    try {
      const response = await axiosRequest({ method: 'get', url: `${url}/getByStudent/${studentId}` });
      setTimerList(response.data);
    } catch (error) {
      console.error("Error fetching timers:", error);
    }
  };

  const addTimer = async (title, hours, minutes, seconds) => {
    const formattedTimer = {
      title: title.trim(),
      hours: parseInt(hours || '0', 10),
      minutes: parseInt(minutes || '0', 10),
      seconds: parseInt(seconds || '0', 10),
      studentId: studentId
    };
    try {
      const response = await axiosRequest({ method: 'post', url: `${url}/create`, data: formattedTimer });
      setTimerList([...timerList, response.data]);
    } catch (error) {
      console.error("Error adding timer:", error);
    }
  };

  const deleteTimer = async (timerID) => {
    try {
      console.log("Deleting timer:", timerID); // added recently
      await axiosRequest({ method: 'delete', url: `${url}/delete/${timerID}` });
      setTimerList(timerList.filter((timer) => String(timer.timerID) !== String(timerID)));
    } catch (error) {
      console.error("Error deleting timer:", error);
    }
  };

  const updateTimer = async () => {
    if (timerToEdit) {
      const updatedTimer = {
        timerID: timerToEdit.timerID,
        title,
        hours: parseInt(hours || '0', 10),
        minutes: parseInt(minutes || '0', 10),
        seconds: parseInt(seconds || '0', 10),
        studentId: parseInt(studentId, 10)
      };
      try {
        const response = await axiosRequest({ method: 'put', url: `${url}/update/${timerToEdit.timerID}`, data: updatedTimer });
        setTimerList(timerList.map((timer) =>
          timer.timerID === timerToEdit.timerID ? response.data : timer
        ));
        setEditDialogOpen(false);
      } catch (error) {
        console.error("Error updating timer:", error);
      }
    }
  };
  const handlePlayClick = (timer) => {
    const totalSeconds =
      timer.hours * 3600 + timer.minutes * 60 + timer.seconds;

    setActiveTimer({
      title: timer.title,
      initialTime: totalSeconds
    });
  };


  const handleEditClick = (timer) => {
    setTimerToEdit(timer);
    setTitle(timer.title);
    setHours(timer.hours);
    setMinutes(timer.minutes);
    setSeconds(timer.seconds);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (timerID) => {
    setTimerToDelete(timerID);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (timerToDelete) {
      deleteTimer(timerToDelete);
    }
    setConfirmDialogOpen(false);
    setTimerToDelete(null);
  };

  const handleDeleteCancel = () => {
    setConfirmDialogOpen(false);
    setTimerToDelete(null);
  };

  const resetFields = () => {
    setTitle('');
    setHours('00');
    setMinutes('00');
    setSeconds('00');
  };

const handleStart = () => {
  const totalSeconds =
    parseInt(hours || '0', 10) * 3600 +
    parseInt(minutes || '0', 10) * 60 +
    parseInt(seconds || '0', 10);

  if (totalSeconds > 0) {
    // Add the timer to the list
    addTimer(title, hours, minutes, seconds);

    // Set the active timer to show TimerRunning in place
    setActiveTimer({
      title,
      initialTime: totalSeconds
    });
  } else {
    alert('Please enter a valid time.');
  }
};


  useEffect(() => {
    fetchTimers();
  }, []);

  const isStartDisabled =
    (!/^\d+$/.test(hours) || hours === '00' || hours === '0' || hours === '') &&
    (!/^\d+$/.test(minutes) || minutes === '00' || minutes === '0' || minutes === '') &&
    (!/^\d+$/.test(seconds) || seconds === '00' || seconds === '0' || seconds === '');


  const [confirmEditDialogOpen, setConfirmEditDialogOpen] = useState(false);

  const handleEditSaveClick = () => {
    setConfirmEditDialogOpen(true);
  };

  const handleEditConfirm = () => {
    updateTimer();
    setConfirmEditDialogOpen(false);
  };

  const handleEditCancel = () => {
    setConfirmEditDialogOpen(false);
  };

  return (
    <div className="timer-container">
      <div className="timer-header">
        <p className='timer-header-title'>Timer</p>
      </div>

      <div className="timer-second-row"> {/*from dashboard css*/}
        {/* Timer Setup */}
        <div className="timer-box">
          {activeTimer ? (
          <TimerRunning
            title={activeTimer.title}
            initialTime={activeTimer.initialTime}
            onStop={() => setActiveTimer(null)}
          />
          ) : (
          <div className="timer-box-left">
            <div className="timer-input-title">Title</div>
            <TextField
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              inputProps={{ maxLength: 20 }}
              variant="outlined"
              className="timer-title-input"
            />

            <div className="timer-input-row">
              <Grid item>
                <div className="timer-input-subtitle">Hours</div>
                <TextField
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  inputProps={{ maxLength: 2 }}
                  variant="outlined"
                  className="timer-textfield input-hours"
                />
              </Grid>
              <Grid item>
                <div className="timer-input-subtitle">Minutes</div>
                <TextField
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  inputProps={{ maxLength: 2 }}
                  variant="outlined"
                  className="timer-textfield input-minutes"
                />
              </Grid>
              <Grid item>
                <div className="timer-input-subtitle">Seconds</div>
                <TextField
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  inputProps={{ maxLength: 2 }}
                  variant="outlined"
                  className="timer-textfield input-seconds"
                />
              </Grid>
            </div>

            <div className="timer-action-buttons">
              <button
                onClick={handleStart}
                disabled={isStartDisabled}
                className={`timer-button timer-start ${isStartDisabled ? 'disabled' : ''}`}
              >
                <PlayArrowIcon className="timer-icon" /> Start Timer
              </button>

              <button
                onClick={resetFields}
                className="timer-button timer-reset"
              >
                <RefreshIcon className="timer-icon" />
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Timer List */}
        <div className="timer-box">
        <div className="timer-box-right">
          <List>
            {timerList.map((timer, index) => (
              <ListItem
                key={timer.timerID}
                disableGutters
                className={`timer-item-box color-${index % 7}`}
                sx={{ flex: 1 }}
              >
              <div className="timer-list-wrapper">
                <div className="timer-list-texts">
                  <div className="timer-title">{timer.title}</div>
                  <div className="timer-sub">{`${timer.hours}h ${timer.minutes}m ${timer.seconds}s`}</div>
                </div>

                <div className="timer-list-buttons">
                  <div onClick={() => handlePlayClick(timer)} className="timer-icon-button play">
                    <PlayArrowIcon />
                  </div>
                  <div
                    className="timer-icon-button"
                    onClick={(event) => handleMenuOpen(event, timer)}>
                    <MoreVertIcon />
                  </div>

                  <Menu
                    anchorEl={menuAnchor}
                    open={openMenuId === timer.timerID}
                    onClose={handleMenuClose}
                    className="timer-more"
                  >
                    <MenuItem
                      className="menu-edit"
                      onClick={() => { handleEditClick(timer); handleMenuClose(); }}
                    >
                      Edit
                    </MenuItem>

                    <MenuItem
                      className="menu-delete"
                      onClick={() => { handleDeleteClick(timer.timerID); handleMenuClose(); }}
                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </div>
              </div>
              </ListItem>
            ))}
          </List>

        </div>

        {/* Dialog */}
        <EditDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          title={title}
          setTitle={setTitle}
          hours={hours}
          setHours={setHours}
          minutes={minutes}
          setMinutes={setMinutes}
          seconds={seconds}
          setSeconds={setSeconds}
          onSave={handleEditSaveClick}
        />

        <ConfirmEditDialog
          open={confirmEditDialogOpen}
          onConfirm={handleEditConfirm}
          onCancel={handleEditCancel}
        />

        <ConfirmDeleteDialog
          open={confirmDialogOpen}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
        </div>
      </div>
    </div>
  );
}

export default TimerSetup;