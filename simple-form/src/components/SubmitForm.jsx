// src/components/SubmitForm.jsx

import React, { useState } from "react";

// 'onFormSubmit' is a function passed down from the App component
// This function will now handle the API call in App.jsx
function SubmitForm({ onFormSubmit }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Local submitting state for button

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !email || !phone) {
      alert("Please fill out all fields.");
      return;
    }

    const newSubmissionData = {
      username: username,
      email: email,
      phone: phone,
    };

    setIsSubmitting(true);
    try {
      // Call the function passed from App.jsx to handle the submission (API call)
      await onFormSubmit(newSubmissionData);
      // Clear the form fields only if submission was successful (or let App.jsx handle this logic)
      setUsername("");
      setEmail("");
      setPhone("");
    } catch (error) {
      // Error handling can be done in App.jsx, or display a local message here
      console.error("Submission error in form component:", error);
      // Optionally alert('Failed to submit data.'); if App.jsx doesn't show a global error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Add New Entry</h2>
      <form onSubmit={handleSubmit} className="entry-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="e.g., john_doe"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="e.g., john.doe@example.com"
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="e.g., (123) 456-7890"
            // *** FINAL FIX: Explicitly escape all potentially special characters ***
            pattern="[0-9\(\)\-\s]{7,}"
            disabled={isSubmitting}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Add to Table"}
        </button>
      </form>
    </div>
  );
}

export default SubmitForm;
