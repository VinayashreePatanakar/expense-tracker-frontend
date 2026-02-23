import React from "react";

const ConfirmDelete = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="modal animated">
        <h3>Are you sure?</h3>
        <p>This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn-delete" onClick={onConfirm}>
            Yes, Delete
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;