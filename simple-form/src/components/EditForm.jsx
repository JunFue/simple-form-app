// src/components/EditForm.jsx

import React, { useState, useEffect } from "react";

function EditForm({ submission, onUpdate, onCancel }) {
  // State to manage the form fields. Initialize with the data from the submission prop.
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // When the 'submission' prop changes (i.e., when a new item is selected for editing),
  // update the form's state to match that item's data.
  useEffect(() => {
    if (submission) {
      setFormData({
        username: submission.username,
        email: submission.email,
        phone: submission.phone,
      });
    }
  }, [submission]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onUpdate function passed from App.jsx,
    // sending the ID and the new form data.
    onUpdate(submission.id, formData);
  };

  // If there's no submission to edit, render nothing (the modal is hidden).
  if (!submission) {
    return null;
  }

  // Render the modal form
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Submission #{submission.id}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-username">Username</label>
            <input
              type="text"
              id="edit-username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-email">Email</label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-phone">Phone</label>
            <input
              type="tel"
              id="edit-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              // *** FIXED: Use the robust regex pattern here as well ***
              pattern="[0-9\(\)\-\s]{7,}"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-update">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditForm;
