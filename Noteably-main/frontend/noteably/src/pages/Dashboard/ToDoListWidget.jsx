import React, { useState, useEffect } from "react";
import { Checkbox } from "@mui/material";
import { axiosRequest } from "../../services/studentService";
import "./ToDoListWidget.css";

const apiUrl = "http://localhost:8080/api/TodoList";

const ToDoListWidget = () => {
  const [toDoItems, setToDoItems] = useState([]);

  const fetchToDoItems = async () => {
    const fullStudentInfo = localStorage.getItem("fullStudentInfo");
    if (!fullStudentInfo) return;

    const studentId = JSON.parse(fullStudentInfo).id;

    const res = await axiosRequest({
      method: "get",
      url: `${apiUrl}/getByStudent/${studentId}`,
    });

    setToDoItems(res.data || []);
  };

  useEffect(() => {
    fetchToDoItems();
  }, []);

  const handleCheckboxToggle = async (taskId) => {
    const item = toDoItems.find(i => i.toDoListID === taskId);
    if (!item) return;

    // optimistic UI
    setToDoItems(prev =>
      prev.map(i =>
        i.toDoListID === taskId
          ? { ...i, completed: !i.completed }
          : i
      )
    );

    await axiosRequest({
      method: "put",
      url: `${apiUrl}/putList/${taskId}`,
      data: {
        title: item.title,
        description: item.description,
        completed: !item.completed,
        schedule: item.schedule ?? null,
      },
    });
  };

  const noteablyColors = ["#FEBD59", "#F04770", "#F78C6A", "#40D19A", "#108AB1"];

  return (
    <div className="todolist-container">
      {toDoItems.length === 0 ? (
        <p className="no-tasks-text">No tasks added yet.</p>
      ) : (
        toDoItems.slice(0, 5).map((item, index) => (
          <div
            key={item.toDoListID}
            className={`todo-item ${item.completed ? "completed" : ""}`}
            style={{
              backgroundColor: item.completed ? "#D3D3D3" : noteablyColors[index % noteablyColors.length],
            }}
          >
            <div className="todo-left">
              <Checkbox
                checked={item.completed}
                onChange={() => handleCheckboxToggle(item.toDoListID)}
                className="todo-checkbox"
              />
              <p className={`todo-widget-title ${item.completed ? "done" : ""}`}>
                {item.title}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ToDoListWidget;
