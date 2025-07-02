import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import logo from './logo.svg';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AdminPage from './components/AdminPage';
import DevPage from './components/DevPage';
import ObserverPage from './components/ObserverPage';
import ErrorPage from './components/ErrorPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dev" element={<DevPage />} />
          <Route path="/observer" element={<ObserverPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<Navigate to="/error" state={{ error: 'Página no encontrada.' }} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
