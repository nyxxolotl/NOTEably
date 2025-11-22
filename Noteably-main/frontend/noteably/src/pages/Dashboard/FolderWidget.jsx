import React, { useEffect, useState } from 'react';
import { axiosRequest } from '../../services/studentService';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './FolderWidget.css';

const FolderWidget = () => {
    const navigate = useNavigate();
    
    const openFolder = (folderId) => {
        navigate(`/noteApp/${folderId}`);
    };

    const url = "http://localhost:8080/api/folders";
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

    const [folders, setFolders] = useState([]);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const res = await axiosRequest({ method: 'get', url: `${url}/getByStudent/${studentId}` });
                setFolders(res.data);
            } catch (error) {
                console.error("Error fetching folders:", error);
            }
        };

        fetchFolders();
    }, [studentId]);

    return (
        <div className='folders-wrapper'>
            {folders.length === 0 ? (
                <p style={{ color: "grey" }}>No folders added yet.</p>
            ) : (
                <div>
                    {folders.map((folder, index) => (
                        <div
                            key={folder.folderId}
                            className="folder-item"
                            sx={{ width: '120px', textAlign: 'center', cursor: 'pointer' }}
                            onClick={() => openFolder(folder.folderId)}
                        >
                            <img
                                src={`./ASSETS/folder-${['orange', 'blue', 'green', 'red', 'yellow'][index % 5]}.png`}
                                alt="Folder Icon"
                                className="folder-icon"
                            />
                            <p style={{ color: "var(--darkblue)" }}>{folder.title}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FolderWidget;
