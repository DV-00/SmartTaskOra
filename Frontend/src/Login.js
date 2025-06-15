import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate(); 

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { username, password } = formData;

      const response = await axios.post('https://smarttaskora-backend.onrender.com/api/auth/login', {
        username,
        password
      });

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId); // <--- ADD THIS LINE!

      

      navigate('/dashboard');  // 3. Redirect here

    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <form
        onSubmit={handleSubmit}
        className="card-custom w-100"
        style={{ maxWidth: '400px' }}
      >
        <h2 className="text-center mb-4">Login</h2>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}

export default Login;
