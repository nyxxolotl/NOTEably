import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { axiosRequest } from '../../services/studentService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import AddIcon from '@mui/icons-material/AddRounded';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import './NoteApp.css';
import '../Folder/FolderApp.css'; // Import FolderApp styles for consistency

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal">
      <div className="confirm-content">
        <div className="dialog-content-with-image">

          <span>{message}</span>
        </div>
        <div className="buttons">
          <button onClick={onCancel} className="cancel-delete-btn">Cancel</button>
          <button onClick={onConfirm} className="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  );
};

function NoteApp() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const url = "http://localhost:8080/api/note";
  const folderUrl = "http://localhost:8080/api/folders";

  const [data, setData] = useState({
    title: "",
    date: new Date().toISOString().split('T')[0],
    note: "",
    folderId: parseInt(folderId),
  });
  const [notes, setNotes] = useState([]);
  const [folderTitle, setFolderTitle] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showRenameConfirm, setShowRenameConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const dropdownRef = useRef(null);
  const colors = ["#EF476F", "#F78C6B", "#FFD166", "#06D6A0", "#118AB2", "#073B4C"];

  useEffect(() => {
    fetchFolderDetails();
    fetchNotes();

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [folderId]);

  const fetchFolderDetails = async () => {
    try {
      const response = await axiosRequest({ method: 'get', url: `${folderUrl}/${folderId}` });
      setFolderTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching folder details:", error);
      alert("Failed to fetch folder details");
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axiosRequest({ method: 'get', url: `${folderUrl}/${folderId}/notes` });
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
      alert("Failed to fetch notes");
    }
  };

  const handleChange = (value) => {
    setData((prevData) => ({ ...prevData, note: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!data.title.trim() || !data.note.trim()) {
      alert("Title and note cannot be empty!");
      return;
    }

    if (editingNoteId) {
      setShowRenameConfirm(true);
      return;
    }

    // Only handle new note creation here
    try {
      await axiosRequest({
        method: "post",
        url: `${url}/postnoterecord`,
        data: {
          ...data,
          folderId: parseInt(folderId),
        },
      });

      fetchNotes();
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error saving note. Please try again.");
    }
  };

  const resetForm = () => {
    setData({
      title: "",
      date: new Date().toISOString().split('T')[0],
      note: "",
      folderId: parseInt(folderId),
    });
    setEditingNoteId(null);
  };

  const handleEdit = (note) => {
    setData({
      title: note.title || "",
      date: new Date(note.date).toISOString().split('T')[0],
      note: note.note || "",
      folderId: parseInt(folderId),
    });
    setEditingNoteId(note.noteId);
    setSelectedNote(note);
    setShowForm(true);
    setShowDropdown(null);
  };

  const handleDelete = (noteId) => {
    setSelectedNote({ noteId });
    setShowDeleteConfirm(true);
    setShowDropdown(null);
  };

  const confirmEdit = async () => {
    try {
      await axiosRequest({
        method: "put",
        url: `${url}/putNoteDetails/${editingNoteId}`,
        data: {
          ...data,
          folderId: parseInt(folderId),
        },
      });

      fetchNotes();
      resetForm();
      setShowForm(false);
      setShowRenameConfirm(false);
      setSelectedNote(null);
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Error saving note. Please try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosRequest({ method: 'delete', url: `${url}/deleteNoteDetails/${selectedNote.noteId}` });
      fetchNotes();
      setShowDeleteConfirm(false);
      setSelectedNote(null);
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note. Please try again.");
    }
  };

  const handleDropdownToggle = (noteId) => {
    setShowDropdown(showDropdown === noteId ? null : noteId);
  };

  const toggleForm = () => {
    setShowForm(!showForm);
    resetForm();
  };

  const goBack = () => {
    navigate('/folders');
  };

  return (
    <div className="notes-container">
      {!showForm && (
        <div className="notes-header">
          <button className="notes-back-button" onClick={goBack}>
            <ArrowBackIcon />
          </button>

          <div className="notes-title-count">
            <div className="notes-title" style={{ fontSize: '23px', fontWeight: 'bold' }}>
              {folderTitle}
            </div>
            <p className="notes-count">{notes.length} note(s)</p>
          </div>

          <div className="folder-actions">
            <button className="notes-add-button" onClick={toggleForm}>
              <AddIcon /> <p>Add Note</p>
            </button>
          </div>
        </div>
      )}


      <ConfirmationDialog
        isOpen={showRenameConfirm}
        message={
          <div className="dialog-content-with-image">
            <img src="/ASSETS/popup-alert.png" alt="Edit" className="dialog-icon" />
            <span>Are you sure you want to edit this?</span>
          </div>
        }
        onConfirm={confirmEdit}
        onCancel={() => {
          setShowRenameConfirm(false);
          setSelectedNote(null);
        }}
      />
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        message={
          <div className="dialog-content-with-image">
            <img src="/ASSETS/popup-delete.png" alt="Delete" className="dialog-icon" />
            <span style={{ fontSize: "20px", color: "var(--darkblue)" }}>Are you sure you want to delete this?</span>
          </div>
        }
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedNote(null);
        }}
      />

      <div className="folder-container">
        {showForm && (
          <form onSubmit={handleSubmit} className="note-form">
            <p className="form-header-title">Add Note</p>
            <div className="form-header">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                required
                className="form-title"
              />
              <input
                type="date"
                name="date"
                value={data.date}
                onChange={(e) => setData({ ...data, date: e.target.value })}
                required
                className="form-date"
              />
            </div>
            <div className="quill-wrapper">
              <ReactQuill
                value={data.note}
                onChange={handleChange}
                placeholder="Write your notes here..."
                theme="snow"
                modules={{
                  toolbar: [
                    [{ font: [] }, { list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline"],
                    [{ color: [] }, { background: [] }],
                    [{ header: "1" }, { header: "2" }],
                    ["link", "image"],
                  ],
                }}
              />
            </div>


            <div className="notes-buttons">
              <button type="cancel" className="notes-cancel-button" onClick={goBack}>
                Cancel
              </button>

              <button type="submit" className="notes-save-button">
                {editingNoteId ? "Save" : "Save"}
              </button>
            </div>
          </form>

        )}

        <div className="notes-list">
          {!showForm && notes.map((note, index) => (
            <div
              className="notes-card"
              style={{ backgroundColor: colors[index % colors.length] }}
              key={note.noteId}
            >
              <div>
                <div className="note-title">{note.title}</div>
                <div
                  className="notes-content"
                  dangerouslySetInnerHTML={{ __html: note.note }}
                />
              </div>

              <div className="notes-time-more">
                <div className="notes-time">
                  {new Date(note.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="menu-icon" onClick={() => handleDropdownToggle(note.noteId)}>
                  <MoreVertIcon />
                </div>
              </div>
              {showDropdown === note.noteId && (
                <div
                  className="dropdown"
                  ref={dropdownRef}
                  style={{ '--note-color': colors[index % colors.length] }}
                >
                  <button className="dropdown-button edit" onClick={() => handleEdit(note)}>Edit</button>
                  <button className="dropdown-button delete" onClick={() => handleDelete(note.noteId)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NoteApp;
