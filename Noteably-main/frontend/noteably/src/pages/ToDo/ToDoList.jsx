import React, { useEffect, useState, useCallback } from "react";
import { Checkbox } from '@mui/material';
import { axiosRequest } from "../../services/studentService";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem } from "@mui/material";


import "./ToDoList.css";

function ToDoList() {
  const fullStudentInfo = localStorage.getItem("fullStudentInfo");
  let studentId = null;

  const apiUrl = "http://localhost:8080/api/TodoList";
  const [openMenuId, setOpenMenuId] = useState(null);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleMenuOpen = (event, id) => {
    setMenuAnchor(event.currentTarget);
    setOpenMenuId(id);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setOpenMenuId(null);
  };


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

  const handleCheckboxToggle = async (taskId) => {
    const updatedItems = toDoItems.map(item =>
      item.toDoListID === taskId ? { ...item, completed: !item.completed } : item
    );

    setToDoItems(updatedItems);

    const itemToUpdate = toDoItems.find(item => item.toDoListID === taskId);

    if (itemToUpdate) {
      await axiosRequest({
        method: "put",
        url: `${apiUrl}/updateList/${taskId}`,
        data: { ...itemToUpdate, completed: !itemToUpdate.completed },
      });
    }
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [selectedItem, setSelectedItem] = useState(null);

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditData({ title: item.title, description: item.description });
    setEditModalOpen(true);
  };

  const confirmUpdateTask = async () => {
    await axiosRequest({
      method: "put",
      url: `${apiUrl}/updateList/${selectedItem.toDoListID}`,
      data: { ...editData, studentId, completed: selectedItem.completed },
    });

    setEditModalOpen(false);
    fetchToDoItems();
  };



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
          filteredItems.map((item, index) => {
            const noteablyColors = ["#FEBD59", "#F04770", "#F78C6A", "#40D19A", "#108AB1"];
            const randomColor = noteablyColors[index % noteablyColors.length];

            return (
              <div
                key={item.toDoListID}
                className={`todo-item ${item.completed ? "completed" : ""}`}
                style={{
                  backgroundColor: item.completed ? "#D3D3D3" : randomColor,
                }}
              >
                <div className="todo-left">
                  <Checkbox
                    checked={item.completed}
                    onChange={() => handleCheckboxToggle(item.toDoListID)}
                    className="todo-checkbox"
                  />

                  <div className="todo-text-wrapper">
                    <p className={`todo-title ${item.completed ? "done" : ""}`}>
                      {item.title}
                    </p>
                    <p className={`todo-desc ${item.completed ? "done" : ""}`}>
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="todo-actions">
                  <button
                    className="todo-more-btn"
                    onClick={(e) => handleMenuOpen(e, item.toDoListID)}
                  >
                    <MoreVertIcon />
                  </button>

                  <Menu
                    anchorEl={menuAnchor}
                    open={openMenuId === item.toDoListID}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                      className: "options-dropdown todo"
                    }}
                  >
                    <MenuItem
                      className="edit-item"
                      onClick={() => {
                        openEditModal(item);
                        setOpenMenuId(null);
                      }}                    >
                      Edit
                    </MenuItem>

                    <MenuItem
                      className="delete-item"
                      onClick={() => {
                        setConfirmDelete(item);
                        setOpenMenuId(null);
                      }}                    >
                      Delete
                    </MenuItem>
                  </Menu>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Task</h3>

            <input
              type="text"
              value={editData.title}
              onChange={(e) =>
                setEditData({ ...editData, title: e.target.value })
              }
            />

            <textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setEditModalOpen(false)}>Cancel</button>
              <button onClick={confirmUpdateTask}>Update</button>
            </div>
          </div>
        </div>
      )}


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
