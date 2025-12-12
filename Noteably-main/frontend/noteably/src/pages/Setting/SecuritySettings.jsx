import React, { useState, useEffect, useCallback } from 'react';
import { getImageUrl, uploadProfilePicture, axiosRequest } from '../../services/studentService';
import { Box, Modal, IconButton, Button } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add'; // For plus icon
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/EditRounded';
import './Settings.css';
import { useNavigate, useLocation } from 'react-router-dom';

const AVATAR_OPTIONS = [
  { name: 'Red', path: '/ASSETS/Profile_red.png' },
  { name: 'Orange', path: '/ASSETS/Profile_orange.png' },
  { name: 'Yellow', path: '/ASSETS/Profile_yellow.png' },
  { name: 'Green', path: '/ASSETS/Profile_green.png' },
  { name: 'Blue', path: '/ASSETS/Profile_blue.png' },
];

function SecuritySettings() {
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


  const handleLogout = (isError = false) => {
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
                onClick={ () => navigate('/settings') }
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
              <IconButton onClick={() => setOpenProfileModal(true)} className="update-profile-bttn"><PhotoCamera /></IconButton>
            </div>
            </div>
          </div>
          <div className="settings-info-box">
            <div className="settings-box-header">
              <p className="settings-header-title">Security</p>
            </div>
            <div style={{ flex: '1', textAlign: 'center', borderRight: '1px solid lightgray', paddingRight: '2rem' }}>
            </div>

            {/* Right - Info and Buttons */}
            <div className='settings-info-content'>
                <p className="password-display"><strong style={{ fontWeight: 600 }}>Password:</strong> <p style={{ fontSize: "30px", color: "grey"}}>{'••••••••'}</p></p>
                <IconButton onClick={() => setOpenPasswordModal(true)} className='change-pass-bttn'><LockIcon /> Change Password</IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal open={openProfileModal} onClose={() => setOpenProfileModal(false)}>
        <Box sx={{
          background: 'white', padding: '2rem', borderRadius: '20px',
          margin: 'auto', marginTop: '10vh', maxWidth: '500px', boxShadow: 24, textAlign: 'center'
        }}>
          <h2 style={{ color: '#118AB2' }}>Change Profile Picture</h2>

          {/* Avatars */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {AVATAR_OPTIONS.map((avatar) => (
              <div
                key={avatar.name}
                onClick={() => {
                  setStudent(prev => ({ ...prev, profilePicture: avatar.path }));
                  setUploadedFile(null);
                  setUploadedImageUrl(null);
                }}
                style={{
                  borderRadius: '50%', padding: '5px',
                  border: student.profilePicture === avatar.path ? '3px solid #118AB2' : '2px solid lightgray',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                <img src={avatar.path} alt={avatar.name} style={{ width: '70px', height: '70px', borderRadius: '50%' }} />
              </div>
            ))}

            {/* Uploaded Image (if exists) */}
            {uploadedImageUrl && (
              <div
                onClick={() => {
                  setStudent(prev => ({ ...prev, profilePicture: uploadedImageUrl }));
                }}
                style={{
                  borderRadius: '50%', padding: '5px',
                  border: student.profilePicture === uploadedImageUrl ? '3px solid #118AB2' : '2px solid lightgray',
                  cursor: 'pointer', position: 'relative'
                }}
              >
                <img src={uploadedImageUrl} alt="Uploaded" style={{ width: '70px', height: '70px', borderRadius: '50%' }} />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    setUploadedImageUrl(null);
                  }}
                  sx={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    backgroundColor: 'red', color: 'white', width: '20px', height: '20px'
                  }}
                >
                  ×
                </IconButton>
              </div>
            )}
          </div>

          {/* Plus upload button */}
          <input type="file" id="upload-file" hidden accept="image/*" onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setUploadedFile(file);
              const url = URL.createObjectURL(file);
              setUploadedImageUrl(url);
              setStudent(prev => ({ ...prev, profilePicture: url })); // select uploaded
            }
          }} />
          <label htmlFor="upload-file">
            <IconButton component="span" style={{ backgroundColor: '#06D6A0', color: 'white', marginBottom: '1rem' }}>
              <AddIcon />
            </IconButton>
          </label>
          <p style={{ fontSize: '0.8rem', color: '#666' }}>Upload your own picture</p>

          {/* Save and Cancel */}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                try {
                  if (uploadedFile) {
                    const { id } = JSON.parse(localStorage.getItem('fullStudentInfo'));
                    const response = await uploadProfilePicture(id, uploadedFile);
                    setStudent(prev => ({ ...prev, profilePicture: response.profilePicture }));
                  }
                  await handleSaveChanges(); // save changes
                  setUploadedFile(null);
                  setUploadedImageUrl(null);
                  setOpenProfileModal(false);
                } catch (error) {
                  console.error('Error saving profile picture:', error);
                }
              }}
            >
              Save
            </Button>
            <Button variant="outlined" color="error" onClick={() => {
              setUploadedFile(null);
              setUploadedImageUrl(null);
              setOpenProfileModal(false);
            }}>
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>


      {/* Password Modal */}
      <Modal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)}>
        <Box sx={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '20px',
          margin: 'auto',
          marginTop: '10vh',
          maxWidth: '420px',
          width: '90%',
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          <h2 style={{ color: '#118AB2', marginBottom: '0.5rem' }}>🔐 Change Password</h2>

          <Box sx={{ width: '100%', position: 'relative' }}>
            <input
              id="newPassword"
              placeholder="New Password"
              type={showNewPassword ? 'text' : 'password'}
              value={student.newPassword}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />
            <IconButton
              onClick={() => setShowNewPassword(!showNewPassword)}
              sx={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {showNewPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Box>

          <Box sx={{ width: '100%', position: 'relative' }}>
            <input
              id="confirmPassword"
              placeholder="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={student.confirmPassword}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '10px 40px 10px 12px',
                borderRadius: '10px',
                border: '1px solid #ccc',
                fontSize: '14px',
              }}
            />
            <IconButton
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              sx={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}
            >
              {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', width: '100%' }}>
            <Button
              onClick={() => { handleSaveChanges(); setOpenPasswordModal(false); }}
              variant="contained"
              sx={{ backgroundColor: '#06D6A0', '&:hover': { backgroundColor: '#04b886' }, borderRadius: '10px', minWidth: '100px' }}
            >
              Save
            </Button>
            <Button
              onClick={() => setOpenPasswordModal(false)}
              variant="outlined"
              sx={{ color: '#EF476F', borderColor: '#EF476F', '&:hover': { borderColor: '#d03a5a', backgroundColor: '#fce8ec' }, borderRadius: '10px', minWidth: '100px' }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>


      {isAlertVisible && (
        <div className="custom-alert">
          <img src="/ASSETS/popup-alert.png" alt="Alert" className="alert-icon" />
          <p>{alertMessage}</p>
        </div>
      )}
    </div>
  );
}

export default SecuritySettings;