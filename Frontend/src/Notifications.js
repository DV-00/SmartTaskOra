import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function Notifications() {
  const token = localStorage.getItem('token');

  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  // Use a ref to always have latest notifications for cleanup
  const notificationsRef = useRef([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/notifications/unread', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
        notificationsRef.current = res.data; // update ref
        setError('');
      } catch {
        setError('❌ Failed to load notifications');
      }
    };

    fetchNotifications();

    // Cleanup: mark all currently fetched notifications as read on unmount
    return () => {
      const unread = notificationsRef.current;
      if (unread.length > 0) {
        // mark all as read in parallel, but no need to await here
        unread.forEach((n) => {
          axios.put(
            `http://localhost:8080/api/notifications/${n.id}/read`,
            null,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ).catch(() => {
            // ignore errors silently
          });
        });
      }
    };
  }, [token]); // token only dependency

  return (
    <div className="container py-4">
      <h2>🔔 Notifications</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li key={n.id} style={{ fontWeight: 'bold' }}>
              {n.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
