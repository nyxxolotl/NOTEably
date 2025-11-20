import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import axios from 'axios';
import './Calendar.css';

const apiUrl = "http://localhost:8080/api/schedules"; 

function Calendar() { 
  const studentId = localStorage.getItem('studentId'); // Get studentId from local storage
  const [schedules, setSchedules] = useState([]);
  const [currentView, setCurrentView] = useState("calendar");

  useEffect(() => {
    if (studentId) {
      fetchSchedules(studentId); // Fetch schedules for the specific student
    }
  }, [studentId]);

  const fetchSchedules = async (studentId) => {
    try {
      const response = await axios.get(`${apiUrl}/getByStudent/${studentId}`);
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  const handleViewChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  return (
    <div className="calendar-wrapper">
      {currentView === "calendar" && (
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev',
              center: 'title',
              right: 'next dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            events={schedules.map((s) => ({
              title: s.title,
              start: s.startDate,
              end: s.endDate || s.startDate,
              color: s.colorCode,
            }))}
            height="500px"
            buttonText={{
              today: 'Today',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              list: 'List'
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Calendar;
