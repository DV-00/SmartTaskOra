import React, { useState } from 'react';
import axios from 'axios';

function TaskCreateForm({ userId, token, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      setError('Title and Due Date are required.');
      return;
    }

    const taskDto = {
      title: title.trim(),
      description: description.trim(),
      dueDate: new Date(dueDate).toISOString(),
      status: 'PENDING',  // force PENDING here
      userId,
    };

    try {
      await axios.post(`http://localhost:8080/api/tasks/user/${userId}`, taskDto, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setError('');
      onSuccess();
    } catch {
      setError('Failed to create task.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 border p-3 rounded bg-light">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Title *</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Due Date *</label>
        <input
          type="datetime-local"
          className="form-control"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">Create Task</button>
    </form>
  );
}

export default TaskCreateForm;
