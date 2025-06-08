import React, { useEffect, useState } from 'react';

function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <button
      className="btn btn-sm"
      style={{
        background: darkMode ? '#333' : '#eee',
        color: darkMode ? '#fff' : '#000',
        padding: '6px 12px',
        borderRadius: '8px',
        border: '1px solid #ccc',
      }}
      onClick={() => setDarkMode(prev => !prev)}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
}

export default DarkModeToggle;
