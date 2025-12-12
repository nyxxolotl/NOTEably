import React, { useEffect, useState, useCallback } from "react";
import { Delete } from "@mui/icons-material";
import { axiosRequest } from "../../services/studentService";
import "./ToDoList.css";

const apiUrl = "http://localhost:8080/api/TodoList";

function ToDoList() {
  const fullStudentInfo = localStorage.getItem("fullStudentInfo");
  let studentId = null;

  if (fullStudentInfo) {
    try {
      studentId = JSON.parse(fullStudentInfo).id;
    } catch {
      console.error("Invalid student info");
    }
  }

  const [toDoItems, setToDoItems] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduleId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchToDoItems = useCallback(async () => {
    if (!studentId) return;
    const res = await axiosRequest({
      method: "get",
      url: `${apiUrl}/getByStudent/${studentId}`,
    });
    setToDoItems(res.data || []);
  }, [studentId]);

  const fetchSchedules = async () => {
    if (!studentId) return;
    const res = await axiosRequest({
      method: "get",
      url: `https://noteably-final.onrender.com/api/schedules/getByStudent/${studentId}`,
    });
    setSchedules(res.data || []);
  };

  useEffect(() => {
    fetchToDoItems();
    fetchSchedules();
  }, [fetchToDoItems]);

  const addTask = async () => {
    await axiosRequest({
      method: "post",
      url: `${apiUrl}/postListRecord`,
      data: { ...formData, studentId, completed: false },
    });
    setFormData({ title: "", description: "", scheduleId: "" });
    setModalOpen(false);
    fetchToDoItems();
  };

  const deleteTask = async (id) => {
    await axiosRequest({
      method: "delete",
      url: `${apiUrl}/deleteList/${id}`,
    });
    fetchToDoItems();
    setConfirmDelete(null);
  };

  const filteredItems = toDoItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="todo-app">
      <div className="todo-header">
        <p className='todo-header-title'>Tasks</p>

        <button
          className="add-task-btn"
          onClick={() => setModalOpen(true)}
        >
          + Add Task
        </button>
      </div>

      {/* Task List */}
      <div className="todo-list">
        {filteredItems.length === 0 ? (
          <p className="empty-text">No tasks added yet</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.toDoListID} className="todo-item">
              <div>
                <p className="todo-title">{item.title}</p>
                <p className="todo-desc">{item.description}</p>
              </div>
              <button
                className="delete-btn"
                onClick={() => setConfirmDelete(item)}
              >
                <Delete />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create Task</h3>

            <input
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <select
              value={formData.scheduleId}
              onChange={(e) =>
                setFormData({ ...formData, scheduleId: e.target.value })
              }
            >
              <option value="">No schedule</option>
              {schedules.map((s) => (
                <option key={s.scheduleID} value={s.scheduleID}>
                  {s.title}
                </option>
              ))}
            </select>

            <div className="modal-actions">
              <button onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button onClick={addTask}>Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Delete this task?</p>
            <div className="modal-actions">
              <button
                className="danger"
                onClick={() =>
                  deleteTask(confirmDelete.toDoListID)
                }
              >
                Delete
              </button>
              <button onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ToDoList;
