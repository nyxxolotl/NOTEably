import React from 'react';
import './Dialog.css';

const ConfirmDeleteDialog = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="confirm-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-content-with-image">
          <img
            src="/ASSETS/popup-delete.png"
            alt="Delete Icon"
            className="confirm-icon"
          />

          <p className="confirm-text" 
            style={{
              color: "var(--darkblue)",
              fontSize: "20px",
            }}
          >
            Are you sure you want to delete this?
          </p>
        </div>
        <div className="buttons">
          <button className="cancel-delete-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-btn" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;