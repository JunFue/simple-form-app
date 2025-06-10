// src/App.jsx

import React, { useState, useCallback } from "react";
import SubmitForm from "./components/SubmitForm";
import DataTable from "./components/DataTable";
import EditForm from "./components/EditForm";
import "./App.css";

const API_URL = "https://simple-form-api.onrender.com/api/submissions";

function App() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingSubmission, setEditingSubmission] = useState(null);

  // Helper function to handle parsing errors from the backend
  const getErrorFromResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    let errorMessage = `HTTP error! status: ${response.status}`;

    if (contentType && contentType.indexOf("application/json") !== -1) {
      // If the response is JSON, we can try to get a specific message
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    }
    // If it's not JSON (e.g., HTML error page), we'll stick with the generic HTTP status error.

    return errorMessage;
  };

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setSubmissions(data);
    } catch (e) {
      setError(e.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFormSubmit = async (formData) => {
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      console.log("Form data submitted successfully to backend.");
    } catch (e) {
      setError(e.message || "Failed to submit data.");
    }
  };

  const handleDelete = async (idToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to delete submission #${idToDelete}?`
      )
    ) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${idToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }
      await fetchSubmissions();
    } catch (e) {
      setError(e.message || "Failed to delete submission.");
      setIsLoading(false);
    }
  };

  const handleEditClick = (submission) => {
    setEditingSubmission(submission);
  };

  const handleUpdateSubmit = async (idToUpdate, updatedData) => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${idToUpdate}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        // *** USING THE NEW HELPER FUNCTION FOR ROBUST ERROR HANDLING ***
        const errorMessage = await getErrorFromResponse(response);
        throw new Error(errorMessage);
      }

      setEditingSubmission(null);
      await fetchSubmissions();
    } catch (e) {
      setError(e.message);
    } finally {
      // If fetchSubmissions runs, it sets loading to false.
      // If it errors before fetchSubmissions, we need to set it here.
      if (isLoading) {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingSubmission(null);
  };

  return (
    <main className="App">
      <header className="app-header">
        <h1>Simple Data Entry Form (with Edit Modal)</h1>
        <p>You can now add, fetch, delete, and edit entries.</p>
      </header>
      <div className="content-wrapper">
        <SubmitForm onFormSubmit={handleFormSubmit} />
        {error && <p className="error-message">Error: {error}</p>}
        <DataTable
          data={submissions}
          onFetchData={fetchSubmissions}
          onDelete={handleDelete}
          onEdit={handleEditClick}
          isLoading={isLoading}
        />
      </div>

      {editingSubmission && (
        <EditForm
          submission={editingSubmission}
          onUpdate={handleUpdateSubmit}
          onCancel={handleCancelEdit}
        />
      )}

      <footer className="app-footer">
        <p>© 2025 Simple Form App</p>
      </footer>
    </main>
  );
}

export default App;
