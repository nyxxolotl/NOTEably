import React, { useState, useEffect, useCallback } from 'react';
import { getImageUrl, uploadProfilePicture, axiosRequest } from '../../services/studentService';
import { Box, IconButton, Button } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add'; // For plus icon
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/EditRounded';
import './Settings.css';
import { useNavigate, useLocation } from 'react-router-dom';

function SettingsPage() {
  const location = useLocation();
  const [student, setStudent] = useState({
    name: '', course: '', contactNumber: '', email: '',
    currentPassword: '', newPassword: '', confirmPassword: '', profilePicture: '',
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const isSettingsActive = location.pathname === '/settings';
  const isSecuritySettingsActive = location.pathname === '/settings/security';
  const navigate = useNavigate();

  const fetchStudentData = useCallback(async () => {
    try {
      const fullStudentInfo = localStorage.getItem('fullStudentInfo');
      if (!fullStudentInfo) return navigate('/login');
      const { id } = JSON.parse(fullStudentInfo);
      const response = await axiosRequest({ method: 'get', url: `http://localhost:8080/api/students/${id}` });
      const data = response.data;
      setStudent(prev => ({
        ...prev,
        name: data.name || '', course: data.course || '', contactNumber: data.contactNumber || '',
        email: data.email || '', profilePicture: data.profilePicture || '/ASSETS/Cutie.png',
        studentId: data.studentId || '',
      }));
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  }, [navigate]);

  useEffect(() => { fetchStudentData(); }, [fetchStudentData]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setStudent(prev => ({ ...prev, [id]: value }));
  };

  const handleOpenProfileModal = () => {
    setOpenProfileModal(true);
  };

  const handleCloseProfileModal = () => {
    setUploadedFile(null);
    setUploadedImageUrl(null);
    setOpenProfileModal(false);
  };

  const closeInfoModal = () => setOpenInfoModal(false);
  const closePasswordModal = () => {
    setStudent(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    setOpenPasswordModal(false);
  };

  const handleSaveChanges = async () => {
    try {
      if (student.newPassword && student.newPassword !== student.confirmPassword) {
        setAlertMessage("New passwords don't match!");
        setIsAlertVisible(true);
        return;
      }
      const { id } = JSON.parse(localStorage.getItem('fullStudentInfo'));
      await axiosRequest({
        method: 'put',
        url: `http://localhost:8080/api/students/${id}`,
        data: {
          name: student.name,
          studentId: student.studentId,
          course: student.course,
          contactNumber: student.contactNumber,
          email: student.email,
          password: student.newPassword || undefined,
          profilePicture: student.profilePicture,
        },
        headers: { 'Content-Type': 'application/json' },
      });
      setAlertMessage('Changes saved successfully!');
      setIsAlertVisible(true);
    } catch (error) {
      setAlertMessage('Failed to save changes. Please try again.');
      setIsAlertVisible(true);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setAlertMessage('User logged out successfully!');
    setIsAlertVisible(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  const handleUploadFileChange = (e) => {
    setUploadedFile(e.target.files[0]);
  };

  const handleSaveProfilePicture = async () => {
    try {
      if (uploadedFile) {
        const { id } = JSON.parse(localStorage.getItem('fullStudentInfo'));
        const response = await uploadProfilePicture(id, uploadedFile);
        setStudent(prev => ({ ...prev, profilePicture: response.profilePicture }));
      }
      // Otherwise avatar already selected
      await handleSaveChanges();
      setUploadedFile(null);
      setOpenProfileModal(false);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <p className="settings-header-title">Account</p>
      </div>

      <div className="settings-second-row">
        <div className="settings-box nav">
          <div className="settings-nav-list">
            <p className="settings-nav-profile" 
              style={{ 
                backgroundColor: isSettingsActive ? 'var(--orange)' : 'transparent',
                color: isSettingsActive ? 'white' : 'var(--darkblue)',
                border: isSettingsActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}>
                Profile
            </p>
            <p className="settings-nav-security"
              onClick={ () => navigate('/settings/security') }
              style={{ 
                backgroundColor: isSecuritySettingsActive ? 'var(--yellow)' : 'transparent',
                color: isSecuritySettingsActive ? 'white' : 'var(--darkblue)',
                border: isSecuritySettingsActive ? '2px solid var(--darkblue)' : '2px solid transparent',
              }}>
                Security
            </p>
            <p className="settings-nav-logout" onClick={handleLogout}>Log out</p>
          </div>
        </div>

        <div>
          <div className="settings-box profile">
            <div className="settings-divider">
              <img src={getImageUrl(student.profilePicture)} alt="Profile" className="settings-profile-image" />
              <div className="settings-divider2">
                <h2 style={{ color: 'var(--darkblue)' }}>{student.name}</h2>
                <p>ID: {student.studentId}</p>
              </div>
            </div>
          </div>
          <div className="settings-info-box">
            <div className="settings-box-header">
              <p className="settings-header-title">Personal Information</p>
              <button className="edit-profile-btn" onClick={() => setOpenInfoModal(true)} >
                <EditIcon /> Edit Info
              </button>
            </div>
            <div style={{ flex: '1', textAlign: 'center', borderRight: '1px solid lightgray', paddingRight: '2rem' }}>
            </div>

            {/* Right - Info and Buttons */}
            <div className='settings-info-content'>
              <p style={{ color: 'var(--darkblue)', fontSize: "20px" }}><strong style={{ fontWeight: 600 }}>Name:</strong> {student.name}</p>
              <p style={{ color: 'var(--darkblue)', fontSize: "20px" }}><strong style={{ fontWeight: 600 }}>Course:</strong> {student.course}</p>
              <p style={{ color: 'var(--darkblue)', fontSize: "20px" }}><strong style={{ fontWeight: 600 }}>Contact No:</strong> {student.contactNumber}</p>
              <p style={{ color: 'var(--darkblue)', fontSize: "20px" }}><strong style={{ fontWeight: 600 }}>Email:</strong> {student.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {openProfileModal && (
        <div className="modal-overlay" onClick={handleCloseProfileModal}>
          <div
            className="custom-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: 'var(--darkblue)', marginBottom: '30px' }}>
              Change Profile Picture
            </h2>

            {/* Upload */}
            <input
              type="file"
              id="upload-file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setUploadedFile(file);
                  const url = URL.createObjectURL(file);
                  setUploadedImageUrl(url);
                  setStudent(prev => ({ ...prev, profilePicture: url }));
                }
              }}
            />
            <label htmlFor="upload-file" className="upload-btn">
              {uploadedImageUrl ? (
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded preview"
                  className="upload-preview"
                />
              ) : (
                <AddIcon />
              )}
            </label>

            {/* Actions */}
            <div className="modal-actions">
              <button className="cancel-bttn" onClick={handleCloseProfileModal}>
                Cancel
              </button>
              <button
                className='save-bttn'
                onClick={async () => {
                  if (uploadedFile) {
                    const { id } = JSON.parse(localStorage.getItem('fullStudentInfo'));
                    const res = await uploadProfilePicture(id, uploadedFile);
                    setStudent(prev => ({ ...prev, profilePicture: res.profilePicture }));
                  }
                  await handleSaveChanges();
                  handleCloseProfileModal();
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Information Modal */}
      {openInfoModal && (
        <div className="modal-overlay" onClick={closeInfoModal}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: 'var(--darkblue)', marginBottom: '50px' }}>Edit Information</h2>
            <div className='input-group'>
              <div className='name-input-row'>
                <label>Name</label>
                <input
                  id="name"
                  placeholder="Name"
                  value={student.name}
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </div>
              <div className='course-input-row'>
                <label>Course</label>
                <input
                  id="course"
                  placeholder="Course"
                  value={student.course}
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </div>
              <div className='contact-num-input-row'>
                <label>Contact No.</label>
                <input
                  id="contactNumber"
                  placeholder="Contact Number"
                  value={student.contactNumber}
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </div>
              <div className='email-input-row'>
                <label>Email</label>
                <input
                  id="email"
                  placeholder="Email"
                  value={student.email}
                  onChange={handleInputChange}
                  className="custom-input"
                />
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '50px' }}>
              <button className='cancel-bttn' onClick={closeInfoModal}>
                Cancel
              </button>
              <button
                className='save-bttn'
                onClick={() => {
                  handleSaveChanges();
                  closeInfoModal();
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isAlertVisible && (
        <div className="custom-alert">
          <img src="/ASSETS/popup-alert.png" alt="Alert" className="alert-icon" />
          <p>{alertMessage}</p>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
