import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import DarkModeToggle from './DarkModeToggle';
import { FaCheckCircle, FaBell, FaSyncAlt, FaMoon, FaChartLine, FaUsers } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 
import Dashboard from './Dashboard'; 
import Notifications from './Notifications';


function Home() {
  const features = [
    { title: "Smart Prioritization", icon: <FaCheckCircle size={40} color="#127283fa" /> },
    { title: "Deadline Alerts", icon: <FaBell size={40} color="#127283fa" /> },
    { title: "Real-time Sync", icon: <FaSyncAlt size={40} color="#127283fa" /> },
    { title: "Dark Mode", icon: <FaMoon size={40} color="#127283fa" /> },
    { title: "Progress Tracking", icon: <FaChartLine size={40} color="#127283fa" /> },
    { title: "User-friendly UI", icon: <FaUsers size={40} color="#127283fa" /> },
  ];

  return (
    <div>
      {/* Glass Header */}
      <div className="glass-header text-center py-4 mb-4">
        <h1 className="display-5 mb-1">SmartTaskOra</h1>
        <p className="lead mb-0">Organize. Prioritize. Achieve more with less stress.</p>
      </div>

      {/* Login/Register Buttons */}
      <div className="text-center mb-5">
        <Link to="/login" className="btn btn-primary mx-2">Login</Link>
        <Link to="/register" className="btn btn-primary mx-2">Register</Link>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <div className="row g-4">
          {features.map(({ title, icon }, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="feature-card text-center p-4 shadow-sm rounded">
                <div className="icon mb-3">{icon}</div>
                <h5>{title}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">What is SmartTaskOra?</h2>
        <p className="text-center lead">
          SmartTaskOra is your personal productivity assistant designed to help you stay on top of your tasks,
          manage deadlines, and achieve your goals effortlessly. Built with intelligent prioritization and real-time syncing,
          it ensures you never miss a beat—at home, at work, or on the go.
        </p>
      </div>

      {/* How It Works Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">How it Works</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <h5>1. Create Tasks</h5>
            <p>Easily add tasks with deadlines and categories.</p>
          </div>
          <div className="col-md-4 mb-4">
            <h5>2. Get Smart Suggestions</h5>
            <p>Our system prioritizes and highlights what matters most.</p>
          </div>
          <div className="col-md-4 mb-4">
            <h5>3. Track & Achieve</h5>
            <p>Monitor your progress and get notified before deadlines hit.</p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center my-5">
        <h3>Ready to take control of your productivity?</h3>
        <p className="lead">Join SmartTaskOra and turn your chaos into clarity.</p>
        <Link to="/register" className="btn btn-success btn-lg mt-2">Get Started</Link>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 bg-light mt-5">
        <small>©️ 2025 SmartTaskOra</small>
      </footer>
    </div>
  );
}


function Layout({ children }) {
  return (
    <div>
      {/* Dark Mode Toggle Button */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 9999 }}>
        <DarkModeToggle />
      </div>
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />  {/* <-- Route path */}
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
