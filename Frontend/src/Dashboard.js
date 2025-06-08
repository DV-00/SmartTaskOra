import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaAward, FaCheckCircle, FaEdit, FaTrashAlt, FaGripVertical } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Configuration Constants for Badges ---
const POINTS_PER_COMPLETED_TASK = 10;
const BADGE_THRESHOLDS = {
  BRONZE: 50,
  SILVER: 150,
  GOLD: 300,
  PLATINUM: 500
};

// TaskCreateForm Component: Renders a form for creating new tasks.
function TaskCreateForm({ userId, token, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      console.log('1. Input Due Date (from form):', dueDate);
      console.log('2. Sent to Backend (ISO string):', new Date(dueDate).toISOString());

      const response = await axios.post(`http://localhost:8080/api/tasks/user/${userId}`, {
        title, description, dueDate: new Date(dueDate).toISOString(), status: 'PENDING'
      }, { headers: { Authorization: `Bearer ${token}` } });
      console.log('Task created successfully:', response.data);
      onSuccess();
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (err) {
      setError('❌ Failed to create task.');
      console.error('Task creation error:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="card glass-card mb-4">
      <div className="card-body">
        <h3 className="card-title mb-4">Create New Task</h3>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="mb-3">
            <label htmlFor="title" className="form-label">Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="mb-3">
            <label htmlFor="dueDate" className="form-label">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-success mt-3"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}

// TaskItem Component: Displays an individual task and enables drag-and-drop.
function TaskItem({ task, isExpanded, toggleExpand, onEdit, onDelete, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      task: task,
      currentStatus: task.status
    }
  });

  const liStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : 'auto',
    position: 'relative',
    backgroundColor:
      task.status?.toUpperCase() === 'OVERDUE' ? 'rgba(255, 99, 132, 0.1)' :
        task.status?.toUpperCase() === 'COMPLETED' ? 'rgba(40, 167, 69, 0.1)' :
          'rgba(255, 193, 7, 0.1)',
    borderColor:
      task.status?.toUpperCase() === 'OVERDUE' ? '#dc3545' :
        task.status?.toUpperCase() === 'COMPLETED' ? '#28a745' :
          '#ffc107',
    borderWidth: '1px',
    borderStyle: 'solid',
    marginBottom: '8px',
    borderRadius: '5px',
    cursor: 'pointer',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
  };

  const isCompleted = task.status?.toUpperCase() === 'COMPLETED';

  return (
    <li
      ref={setNodeRef}
      style={liStyle}
      {...attributes}
      className={`list-group-item list-group-item-action ${isExpanded ? 'active' : ''}`}
      onClick={() => toggleExpand(task.id)}
    >
      <div
        {...listeners}
        className="drag-handle me-3"
        style={{ cursor: 'grab', flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <FaGripVertical size={20} color="#666" />
      </div>

      <div className="flex-grow-1">
        <div className="d-flex w-100 justify-content-between align-items-center">
          <h5 className="mb-1">{task.title}</h5>
          <small className="text-muted">{new Date(task.dueDate).toLocaleDateString()}</small>
        </div>

        {isExpanded && (
          <div className="mt-2">
            <p className="mb-1 text-muted"><strong>Description:</strong> {task.description || 'N/A'}</p>
            <small className="text-muted">
              Due: {new Date(task.dueDate + 'Z').toLocaleString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </small><br />
            <small className="text-muted">Status: {task.status}</small>
            <div className="mt-2">
              {!isCompleted && (
                <button
                  className="btn btn-success btn-sm me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id, 'COMPLETED');
                  }}
                >
                  <FaCheckCircle /> Complete
                </button>
              )}
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
              >
                <FaEdit /> Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this task?')) {
                    onDelete(task.id);
                  }
                }}
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

// TaskBucket Component: Represents a droppable column for tasks based on their status.
function TaskBucket({ title, tasks, onEdit, onDelete, onStatusChange, expandedTaskIds, toggleExpand, emptyMessage, bucketColor, status }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className={`card glass-card h-100 ${bucketColor ? `glass-${bucketColor.replace('bg-', '')}` : ''}`}>
      <div className="card-header text-white">
        <h4 className="mb-0">{title} ({tasks.length})</h4>
      </div>
      <div
        className="card-body task-bucket-body"
        ref={setNodeRef}
        style={{
          minHeight: '100px',
          backgroundColor: isOver ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
      >
        {tasks.length === 0 ? (
          <p className="text-center text-muted mt-3">{emptyMessage}</p>
        ) : (
          <ul className="list-group list-group-flush">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isExpanded={expandedTaskIds.includes(task.id)}
                toggleExpand={toggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// Dashboard Component: Manages the overall task management dashboard state and logic.
function Dashboard() {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || '1' : '1';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : 'mock-token';

  const navigate = useNavigate();

  // Effect to check for authentication token and redirect to login if not found.
  useEffect(() => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      console.log('No authentication token found. Redirecting to login.');
      navigate('/login');
      return;
    }
  }, [navigate]);

  const [tasks, setTasks] = useState([]);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState([]);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');
  const [searchTerm, setSearchTerm] = useState('');

  const [totalTaskPoints, setTotalTaskPoints] = useState(0);
  const [currentBadge, setCurrentBadge] = useState(null);

  const [pieChartData, setPieChartData] = useState({
    labels: ['Completed', 'Pending', 'Overdue'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 1,
    }],
  });

  const getToken = useCallback(() => localStorage.getItem('token'), []);

  // Fetches all task-related data (all tasks, sorted by deadline, and conflicts).
  const fetchAllData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [allRes, sortedRes, conflictRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/tasks/user/${userId}`, { headers }),
        axios.get(`http://localhost:8080/api/tasks/user/${userId}/sorted-by-deadline`, { headers }),
        axios.get(`http://localhost:8080/api/tasks/user/${userId}/conflicts`, { headers }),
      ]);
      setTasks(allRes.data);
      setSortedTasks(sortedRes.data);
      setConflicts(conflictRes.data);
      setError('');
    } catch (e) {
      setError('❌ Failed to load tasks. Please ensure your backend is running and accessible.');
      console.error('Fetch data error:', e.response ? e.response.data : e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // Marks overdue tasks by calling the backend API.
  const markOverdueTasks = useCallback(async () => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/user/${userId}/mark-overdue`, null, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      console.log('Overdue tasks marked successfully.');
    } catch (e) {
      console.error('❌ Overdue marking error:', e.response ? e.response.data : e.message);
    }
  }, [userId, getToken]);

  // Handles updating a task's status via API call and re-fetches data.
  const handleTaskStatusChange = async (taskId, newStatus) => {
    const currentToken = getToken();
    if (!currentToken) {
      console.error("No token found for status change!");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8080/api/tasks/${taskId}/status`,
        newStatus,
        { headers: { Authorization: `Bearer ${currentToken}`, 'Content-Type': 'text/plain' } }
      );
      console.log(`Task ${taskId} status updated to ${newStatus}`);
      await fetchAllData();
    } catch (err) {
      setError(`❌ Failed to update task status to ${newStatus}.`);
      console.error("Error updating task status:", err.response ? err.response.data : err.message);
    }
  };

  // Initializes dashboard data and marks overdue tasks on component mount.
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      await markOverdueTasks();
      await fetchAllData();
    };
    initializeDashboard();
  }, [markOverdueTasks, fetchAllData]);

  // Calculates task points, determines the current badge, and updates pie chart data.
  useEffect(() => {
    if (loading) {
      return;
    }

    const completedTasksCount = tasks.filter(task => task.status === 'COMPLETED').length;
    const currentPoints = completedTasksCount * POINTS_PER_COMPLETED_TASK;
    setTotalTaskPoints(currentPoints);

    if (currentPoints >= BADGE_THRESHOLDS.PLATINUM) {
      setCurrentBadge('Platinum');
    } else if (currentPoints >= BADGE_THRESHOLDS.GOLD) {
      setCurrentBadge('Gold');
    } else if (currentPoints >= BADGE_THRESHOLDS.SILVER) {
      setCurrentBadge('Silver');
    } else if (currentPoints >= BADGE_THRESHOLDS.BRONZE) {
      setCurrentBadge('Bronze');
    } else {
      setCurrentBadge(null);
    }

    const pending = tasks.filter(task => task.status === 'PENDING').length;
    const overdue = tasks.filter(task => task.status === 'OVERDUE').length;

    setPieChartData({
      labels: ['Completed', 'Pending', 'Overdue'],
      datasets: [{
        data: [completedTasksCount, pending, overdue],
        backgroundColor: ['rgb(76,197,104)', 'rgb(213,180,91)', 'rgb(207,75,79)'],
        borderColor: ['#fff', '#fff', '#fff'],
        borderWidth: 1,
      }],
    });

  }, [tasks, loading]);

  // Handles user logout by clearing tokens and redirecting to the login page.
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    navigate('/login');
  };

  // Deletes a task by its ID after user confirmation.
  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:8080/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        console.log('Task deleted successfully:', taskId);
        fetchAllData();
      } catch (e) {
        setError('❌ Failed to delete task.');
        console.error('Delete task error:', e.response ? e.response.data : e.message);
      }
    }
  };

  // Updates an existing task's details via API call.
  const updateTask = async (task) => {
    try {
      await axios.put(`http://localhost:8080/api/tasks/${task.id}`, task, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Task updated successfully:', task.id);
      setEditTask(null);
      fetchAllData();
      setError('');
    } catch (e) {
      setError('❌ Failed to update task.');
      console.error('Update task error:', e.response ? e.response.data : e.message);
    }
  };

  // Toggles the expanded (details) state of a task.
  const toggleExpand = (taskId) => {
    setExpandedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  // Filters and sorts tasks based on current filter status, search term, and sort order.
  const filteredAndSortedTasks = tasks
    .filter(task => {
      if (filterStatus === 'ALL') return true;
      return task.status?.toUpperCase() === filterStatus;
    })
    .filter(task => {
      if (!searchTerm) return true;
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.description?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      if (sortBy === 'createdAt') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  const totalTasks = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'PENDING').length;
  const overdueTasksCount = tasks.filter(t => t.status === 'OVERDUE').length;

  // Determines and provides information about the next badge to achieve.
  const getNextBadgeInfo = (currentBadge) => {
    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIndex = currentBadge ? tiers.indexOf(currentBadge.toUpperCase()) : -1;

    if (currentIndex < tiers.length - 1) {
      const nextTierName = tiers[currentIndex + 1];
      const nextTierPoints = BADGE_THRESHOLDS[nextTierName];
      return `Next: **${nextTierName}** at **${nextTierPoints}** points`;
    }
    return "You've earned all badges!";
  };

  // Handles the end of a drag operation for tasks, updating their status if dropped into a new bucket.
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || (active.id === over.id)) {
      return;
    }

    const draggedTask = active.data.current?.task;
    const newStatus = over.id;

    if (!draggedTask || !newStatus) return;

    if (draggedTask.status !== newStatus) {
      console.log(`Dragging task ${draggedTask.id} from ${draggedTask.status} to ${newStatus}`);
      await handleTaskStatusChange(draggedTask.id, newStatus);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 glass-header rounded-lg">
        <h2 className="my-0">📋 Welcome To Dashboard</h2>
        <div className="d-flex align-items-center">
          <Link to="/notifications" className="btn btn-primary me-2">🔔 Notifications</Link>
          <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="row mb-4">
        <SummaryCard title="Total Tasks" count={totalTasks} bg="primary" />
        <SummaryCard title="Completed" count={completedTasksCount} bg="success" />
        <SummaryCard title="Pending" count={pendingTasksCount} bg="warning" />
        <SummaryCard title="Overdue" count={overdueTasksCount} bg="danger" />
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="gamification-badge-section p-4 rounded-lg text-center h-100">
            <h2><FaAward /> Your Task Mastery Badge</h2>
            {currentBadge ? (
              <div className={`badge-display badge-${currentBadge.toLowerCase()}`}>
                <h3>{currentBadge} Task Master!</h3>
                <p>Total Points: **{totalTaskPoints}**</p>
                <p>{getNextBadgeInfo(currentBadge)}</p>
              </div>
            ) : (
              <div className="no-badge-message">
                <p>Keep completing tasks to earn your first badge!</p>
                <p>Target: **{BADGE_THRESHOLDS.BRONZE}** points for Bronze</p>
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="pie-chart-container p-4 rounded-lg text-center h-100">
            <h2>📊 Task Status Overview</h2>
            <div style={{ maxWidth: '300px', margin: 'auto' }}>
              <Pie data={pieChartData} />
            </div>
          </div>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="alert alert-warning mb-4">
          ⚠️ You have {conflicts.length} conflicting tasks! Please resolve them.
        </div>
      )}

      <div className="upcoming-deadlines-container mb-4">
        <h4 className="mb-3 text-center">🗓️ Upcoming Deadlines</h4>
        {sortedTasks.filter(task => task.status !== 'COMPLETED').length === 0 ? (
          <p className="text-center">No upcoming tasks.</p>
        ) : (
          <ul className="list-unstyled">
            {sortedTasks
              .filter(task => task.status !== 'COMPLETED')
              .slice(0, 5)
              .map(task => (
                <li key={task.id} className="upcoming-deadlines-item d-flex justify-content-between align-items-center">
                  <span>{task.title}</span>
                  <span className="text-muted text-sm">
                    Due: {new Date(task.dueDate + 'Z').toLocaleString(undefined, {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <button className="btn btn-success my-3" onClick={() => setShowCreateForm(!showCreateForm)}>
        {showCreateForm ? 'Cancel New Task' : '➕ Add New Task'}
      </button>

      {showCreateForm && (
        <TaskCreateForm
          userId={userId}
          token={token}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchAllData();
          }}
        />
      )}

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading tasks...</span>
          </div>
          <p>Loading tasks...</p>
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <div className="btn-group mb-2 me-2" role="group">
            <button
              type="button"
              className={`btn ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus('ALL')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filterStatus === 'PENDING' ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setFilterStatus('PENDING')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`btn ${filterStatus === 'COMPLETED' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setFilterStatus('COMPLETED')}
            >
              Completed
            </button>
            <button
              type="button"
              className={`btn ${filterStatus === 'OVERDUE' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setFilterStatus('OVERDUE')}
            >
              Overdue
            </button>
          </div>

          <div className="flex-grow-1 mb-2 me-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="createdAt">Sort by Creation Date</option>
              <option value="title">Sort by Title (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Wrap your task buckets with DndContext to enable drag and drop */}
      {!loading && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="task-buckets-container row g-4">
            <div className="col-md-4">
              <TaskBucket
                title="Pending Tasks"
                status="PENDING"
                tasks={filteredAndSortedTasks.filter(task => task.status === 'PENDING')}
                onEdit={setEditTask}
                onDelete={deleteTask}
                onStatusChange={handleTaskStatusChange}
                expandedTaskIds={expandedTaskIds}
                toggleExpand={toggleExpand}
                emptyMessage="No pending tasks. Great job!"
                bucketColor="bg-warning"
              />
            </div>
            <div className="col-md-4">
              <TaskBucket
                title="Completed Tasks"
                status="COMPLETED"
                tasks={filteredAndSortedTasks.filter(task => task.status === 'COMPLETED')}
                onEdit={setEditTask}
                onDelete={deleteTask}
                onStatusChange={handleTaskStatusChange}
                expandedTaskIds={expandedTaskIds}
                toggleExpand={toggleExpand}
                emptyMessage="No completed tasks yet. Get to work!"
                bucketColor="bg-success"
              />
            </div>
            <div className="col-md-4">
              <TaskBucket
                title="Overdue Tasks"
                status="OVERDUE"
                tasks={filteredAndSortedTasks.filter(task => task.status === 'OVERDUE')}
                onEdit={setEditTask}
                onDelete={deleteTask}
                onStatusChange={handleTaskStatusChange}
                expandedTaskIds={expandedTaskIds}
                toggleExpand={toggleExpand}
                emptyMessage="No overdue tasks. You're on track!"
                bucketColor="bg-danger"
              />
            </div>
          </div>
        </DndContext>
      )}

      {editTask && (
        <TaskEditForm
          task={editTask}
          token={token}
          onCancel={() => setEditTask(null)}
          onSave={updateTask}
        />
      )}
      <footer className="text-center py-4 bg-light mt-5">
        <small>©️ 2025 SmartTaskOra</small>
      </footer>
    </div>
  );
}

// SummaryCard Component: Displays a summary card with a title, count, and background color.
function SummaryCard({ title, count, bg }) {
  return (
    <div className="col-md-3 col-sm-6 mb-3">
      <div className={`card glass-card glass-${bg}`}>
        <div className="card-body text-center">
          <h5 className="card-title mb-2">{title}</h5>
          <p className="fs-2 fw-bold mb-0">{count}</p>
        </div>
      </div>
    </div>
  );
}

// TaskEditForm Component: A modal form for editing an existing task's details.
function TaskEditForm({ task, onCancel, onSave }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 16) : '');
  const [status, setStatus] = useState(task.status);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedTask = {
      ...task,
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      status,
    };

    try {
      await onSave(updatedTask);
    } catch {
      setError('❌ Update failed');
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal d-block fade show" tabIndex="-1" role="dialog" aria-labelledby="editTaskModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title" id="editTaskModalLabel">✏️ Edit Task</h5>
              <button type="button" className="btn-close" onClick={onCancel} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label htmlFor="editTitle" className="form-label">Title</label>
                <input
                  type="text"
                  id="editTitle"
                  className="form-control"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="editDescription" className="form-label">Description</label>
                <textarea
                  id="editDescription"
                  className="form-control"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="editDueDate" className="form-label">Due Date</label>
                <input
                  type="datetime-local"
                  id="editDueDate"
                  className="form-control"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="editStatus" className="form-label">Status</label>
                <select
                  id="editStatus"
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  required
                >
                  <option value="PENDING">PENDING</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="OVERDUE">OVERDUE</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Dashboard;