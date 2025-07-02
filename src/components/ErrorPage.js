import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/styles.css';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const errorMsg = location.state?.error || 'Ha ocurrido un error inesperado.';

  return (
    <div className="error-page-container">
      <h1>¡Ups! Algo salió mal.</h1>
      <p>{errorMsg}</p>
      <button onClick={() => navigate('/')}>Volver al inicio</button>
    </div>
  );
};

export default ErrorPage;
