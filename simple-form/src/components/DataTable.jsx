// src/components/DataTable.jsx

import React from "react";

// 'onEdit' is now the handleEditClick function from App.jsx
function DataTable({ data, onFetchData, onDelete, onEdit, isLoading }) {
  return (
    <div className="table-container">
      <div className="table-header-controls">
        <h2>Stored Data</h2>
        <button
          onClick={onFetchData}
          className="fetch-data-btn"
          disabled={isLoading}
        >
          {isLoading ? "Fetching..." : "Refresh Data from DB"}
        </button>
      </div>

      {isLoading && data.length === 0 && (
        <p className="loading-message">Loading data...</p>
      )}

      {!isLoading && data.length === 0 && (
        <p className="no-data-message">
          No data available. Add an entry or click "Refresh Data".
        </p>
      )}

      {!isLoading && data.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((submission) => (
              <tr key={submission.id}>
                <td data-label="ID">{submission.id}</td>
                <td data-label="Username">{submission.username}</td>
                <td data-label="Email">{submission.email}</td>
                <td data-label="Phone">{submission.phone}</td>
                <td data-label="Actions">
                  {/* *** UPDATED: onEdit now passes the whole submission object *** */}
                  <button
                    onClick={() => onEdit(submission)}
                    className="action-btn edit-btn"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(submission.id)}
                    className="action-btn delete-btn"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DataTable;
