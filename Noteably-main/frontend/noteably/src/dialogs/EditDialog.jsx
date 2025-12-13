import React from 'react';
import './Dialog.css';

const EditDialog = ({
  open,
  onClose,
  title,
  setTitle,
  hours,
  setHours,
  minutes,
  setMinutes,
  seconds,
  setSeconds,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="dialog-title">Edit Timer</h2>

        <div className="dialog-content">
          <label className="dialog-label">Title</label>
          <input
            className="dialog-input"
            type="text"
            value={title}
            maxLength={20}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="time-grid">
            {[
              { label: 'Hours', value: hours, set: setHours },
              { label: 'Minutes', value: minutes, set: setMinutes },
              { label: 'Seconds', value: seconds, set: setSeconds },
            ].map(({ label, value, set }) => (
              <div key={label} className="time-field">
                <label className="dialog-label">{label}</label>
                <input
                  className="dialog-input time-input"
                  type="number"
                  maxLength={2}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-bttn" onClick={onClose}>
            Cancel
          </button>
          <button className="save-bttn" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDialog;