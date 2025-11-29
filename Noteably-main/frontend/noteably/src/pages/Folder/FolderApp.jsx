import React, { useState, useEffect, useRef } from 'react';
import Axios from 'axios';
import { axiosRequest, getAuthToken } from '../../services/studentService';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import './FolderApp.css';
import SearchIcon from '@mui/icons-material/Search';

function FolderApp() {
    const url = "http://localhost:8080/api/folders";
    const navigate = useNavigate();

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

    const [data, setData] = useState({ folderId: "", title: "", dashboardId: 1 });
    const [folders, setFolders] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);
    const [showRenameConfirm, setShowRenameConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);

    useEffect(() => { fetchFolders(); }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchFolders = async () => {
        try {
            const res = await axiosRequest({ method: 'get', url: `${url}/getByStudent/${studentId}` });
            setFolders(res.data);
        } catch (error) {
            console.error("Error fetching folders:", error);
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            const folderData = { ...data, studentId };
            await axiosRequest({ method: 'post', url: `${url}/postFolderRecord`, data: folderData });
            setData({ folderId: "", title: "", dashboardId: 1 });
            setIsModalOpen(false);
            fetchFolders();
        } catch (error) {
            console.error("Error details:", error.response?.data || error.message);
            alert("Failed to create folder.");
        }
    };

    const handleConfirmedUpdate = async () => {
        try {
            const folderData = { ...data, studentId };
            await axiosRequest({ method: 'put', url: `${url}/putFolderDetails/${data.folderId}`, data: folderData });
            setData({ folderId: "", title: "", dashboardId: 1 });
            setShowRenameConfirm(false);
            setIsModalOpen(false);
            fetchFolders();
        } catch (error) {
            console.error("Error details:", error.response?.data || error.message);
            alert("Failed to update folder.");
        }
    };

    const handle = (e) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
    };

    const editFolder = (folder) => {
        setSelectedFolder(folder);
        setData({ folderId: folder.folderId, title: folder.title, dashboardId: folder.dashboardId || 1 });
        setIsModalOpen(true);
    };

    const confirmDelete = (folder) => {
        setSelectedFolder(folder);
        setShowDeleteConfirm(true);
        setOpenDropdown(null);
    };

    const handleDelete = async () => {
        try {
            const token = getAuthToken();
            await Axios.delete(`${url}/deleteFolder/${selectedFolder.folderId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setShowDeleteConfirm(false);
            fetchFolders();
        } catch (error) {
            console.error("Error deleting folder:", error);
        }
    };

    const filteredFolders = folders.filter(folder =>
        folder.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const closeModal = () => setIsModalOpen(false);
    const toggleDropdown = (id) => setOpenDropdown(prev => prev === id ? null : id);
    const openFolder = (id) => navigate(`/noteApp/${id}`, { state: { folderId: id } });

    return (
        <div className='folder-app'>
            <div className="top-section">
                <div className="folder-search-container">
                    <SearchIcon style={{ color: "var(--darkblue)"}}/>
                    <input
                        type="text"
                        placeholder="look for a folder"
                        className="folder-search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={() => setIsModalOpen(true)} className="add-folder-btn">+ Add Folder</button>
            </div>

            <div className="folder-grid">
                {filteredFolders.map((folder, index) => (
                    <div key={folder.folderId} className="folder-item" onClick={(e) => {
                        if (!e.target.closest('.options-dropdown') && !e.target.closest('.options-icon')) {
                            openFolder(folder.folderId);
                        }
                    }}>
                        <img
                            src={`./ASSETS/folder-${['orange', 'red', 'yellow','blue', 'green'][index % 5]}.png`}
                            alt="Folder Icon"
                            className="folder-icon"
                        />
                        <div className="folder-title">
                            <span>{folder.title}</span>
                            <MoreVertIcon
                                className="options-icon"
                                style={{ marginLeft: 'auto' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDropdown(folder.folderId);
                                }}
                            />
                        </div>
                        {openDropdown === folder.folderId && (
                            <div ref={dropdownRef} className="options-dropdown">
                                <button onClick={(e) => { e.stopPropagation(); editFolder(folder); }} className='rename-item'>Rename</button>
                                <button onClick={(e) => { e.stopPropagation(); confirmDelete(folder); }} className="delete-item">Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ✅ THEME-ALIGNED MODAL BELOW */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '30px', color: 'var(--darkblue)', fontWeight: 600, fontSize: '28px' }}>
                            {data.folderId ? 'Rename Folder' : 'Add Folder'}
                        </h2>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (data.folderId) {
                                setShowRenameConfirm(true);
                                setIsModalOpen(false);
                            } else {
                                submit(e);
                            }
                        }}>
                            <div className='input-label'>
                                <p style={{ color: "var(--darkblue)", fontSize: "20px" }}>Title</p>
                                <input
                                    type="hidden"
                                    id="folderId"
                                    value={data.folderId}
                                />
                                <input
                                    type="text"
                                    id="title"
                                    value={data.title}
                                    onChange={handle}
                                    required
                                />
                            </div>
                            <div className='buttons'>
                                <button
                                    className='cancel-button'
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className='submit-button'
                                >
                                    {data.folderId ? 'Save' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation modals (optional cleanup later) */}
            {showRenameConfirm && (
                <div className="confirm-modal">
                    <div className="confirm-content">
                        <img src="./ASSETS/popup-alert.png" alt="Edit Icon" />
                        <div className="confirm-text">
                            <h3>Are you sure you want to rename this?</h3>
                            <div className="confirm-buttons">
                                <button onClick={handleConfirmedUpdate} className="ok-btn">Ok</button>
                                <button onClick={() => {
                                    setShowRenameConfirm(false);
                                    setIsModalOpen(true);
                                }} className="cancel-btn">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <div className="confirm-modal">
                    <div className="confirm-content">
                        <div className="dialog-content-with-image">
                            <img src="./ASSETS/popup-delete.png" alt="Delete Icon" className="dialog-icon" />
                            <span 
                                style={{
                                    color: "var(--darkblue)",
                                    fontSize: "20px",
                                }}
                            >
                                Are you sure you want to delete this folder?
                            </span>
                        </div>
                        <div className="buttons">
                            <button onClick={() => setShowDeleteConfirm(false)} className="cancel-delete-btn">Cancel</button>
                            <button onClick={handleDelete} className="delete-btn">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FolderApp;
