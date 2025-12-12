import React, { useState, useEffect } from 'react';
import { axiosRequest } from '../../services/studentService';
import { Checkbox } from '@mui/material';
import ConfirmEditDialog from '../../dialogs/ConfirmEditDialog';
import "./ToDoListWidget.css";

const apiUrl = "http://localhost:8080/api/TodoList";

const ToDoListWidget = () => {
  const [toDoItems, setToDoItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ title: "", description: "" });
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [confirmEditOpen, setConfirmEditOpen] = useState(false);

  const fetchToDoItems = async () => {
    const fullStudentInfo = localStorage.getItem("fullStudentInfo");
    let studentId = null;

    if (fullStudentInfo) {
      try {
        const studentObj = JSON.parse(fullStudentInfo);
        studentId = studentObj.id;
      } catch (error) {
        console.error("Error parsing fullStudentInfo", error);
      }
    }

    if (!studentId) return;

    try {
      const response = await axiosRequest({
        method: "get",
        url: `${apiUrl}/getByStudent/${studentId}`,
      });

      setToDoItems(response.data);
    } catch (error) {
      console.error("Error fetching ToDo items", error);
    }
  };

  const saveToDoItem = async () => {
    if (editMode && selectedItem) {
      setConfirmEditOpen(true);
    } else {
      await createNewTask();
    }
  };

  const createNewTask = async () => {
    const fullStudentInfo = localStorage.getItem("fullStudentInfo");
    const studentObj = JSON.parse(fullStudentInfo);
    const studentId = studentObj.id;

    if (!newItem.title.trim()) {
      alert("Title is required.");
      return;
    }

    try {
      await axiosRequest({
        method: "post",
        url: `${apiUrl}/postListRecord`,
        data: { ...newItem, studentId, completed: false },
      });

      setNewItem({ title: "", description: "" });
      setModalOpen(false);
      fetchToDoItems();
    } catch (error) {
      console.error("Error creating task", error);
    }
  };

  const confirmUpdateTask = async () => {
    const fullStudentInfo = localStorage.getItem("fullStudentInfo");
    const studentObj = JSON.parse(fullStudentInfo);
    const studentId = studentObj.id;

    if (!newItem.title.trim()) {
      alert("Title is required.");
      return;
    }

    try {
      await axiosRequest({
        method: "put",
        url: `${apiUrl}/updateList/${selectedItem.toDoListID}`,
        data: { ...newItem, studentId, completed: selectedItem.completed },
      });

      setNewItem({ title: "", description: "" });
      setSelectedItem(null);
      setEditMode(false);
      setModalOpen(false);
      setConfirmEditOpen(false);
      fetchToDoItems();
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const deleteToDoItem = async (id) => {
    try {
      await axiosRequest({
        method: "delete",
        url: `${apiUrl}/deleteList/${id}`,
      });

      fetchToDoItems();
    } catch (error) {
      console.error("Error deleting ToDo item", error);
    }
  };

  const handleCheckboxToggle = async (taskId) => {
    const updatedItems = toDoItems.map(item =>
      item.toDoListID === taskId ? { ...item, completed: !item.completed } : item
    );

    setToDoItems(updatedItems);

    const itemToUpdate = toDoItems.find(item => item.toDoListID === taskId);

    if (itemToUpdate) {
      try {
        await axiosRequest({
          method: "put",
          url: `${apiUrl}/updateList/${taskId}`,
          data: { ...itemToUpdate, completed: !itemToUpdate.completed },
        });
      } catch (error) {
        console.error("Error updating completion status", error);
      }
    }
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setNewItem({ title: item.title, description: item.description });
    setEditMode(true);
    setModalOpen(true);
  };

  useEffect(() => {
    fetchToDoItems();
  }, []);

  const noteablyColors = ["#FEBD59", "#F04770", "#F78C6A", "#40D19A", "#108AB1"];

  return (
    <div>
      <div className="todolist-container">
        {toDoItems.length === 0 ? (
          <p className="no-tasks-text">No tasks added yet.</p>
        ) : (
          toDoItems.map((item, index) => {
            const randomColor = noteablyColors[index % noteablyColors.length];

            return (
              <div
                key={item.toDoListID}
                className={`todo-item ${item.completed ? "completed" : ""}`}
                style={{ backgroundColor: item.completed ? "#D3D3D3" : randomColor }}
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
{/* 
                <div className="todo-actions">
                  <button onClick={() => openEditModal(item)} className="edit-btn">✏️</button>
                  <button onClick={() => deleteToDoItem(item.toDoListID)} className="delete-btn">🗑️</button>
                </div> */}
              </div>
            );
          })
        )}
      </div>

      {/* CUSTOM MODAL */}
      {modalOpen && (
        <div className="custom-modal-backdrop">
          <div className="custom-modal">
            <h3>{editMode ? "Edit Task" : "Create New Task"}</h3>

            <input
              type="text"
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="modal-input"
            />

            <textarea
              placeholder="Description"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              className="modal-textarea"
            />

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setModalOpen(false)}>
                Cancel
              </button>

              <button className="modal-save" onClick={saveToDoItem}>
                {editMode ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmEditDialog
        open={confirmEditOpen}
        onConfirm={confirmUpdateTask}
        onCancel={() => setConfirmEditOpen(false)}
      />
    </div>
  );
};

export default ToDoListWidget;
