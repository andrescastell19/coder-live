import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/styles.css';

function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();

  const getBackendUrl = () => {
    if (window.location.protocol === 'https:') {
      return 'https://live-coder-593m.onrender.com/login';
    } else {
      return 'http://localhost:3002/login';
    }
  };

  const login = () => {
    fetch(getBackendUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user, pass }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Login inválido');
        const obj = await res.json();
        // Guardar el token si viene en el body
        if (obj.token) {
          localStorage.setItem('jwt_token', obj.token);
        }
        if (['admin', 'dev', 'observer'].includes(obj.user)) {
          setRole(obj.user);
          setLoginSuccess(true);
        } else {
          alert('Rol desconocido');
        }
      })
      .catch((err) => alert(err.message));
  };

  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const handleContinue = () => {
    if (!roomId) {
      alert('Debes ingresar un roomId');
      return;
    }
    if (role === 'admin') {
      setLoading(true);
      setCreateError('');
      // Crear la sala antes de navegar
      const backendBase = window.location.protocol === 'https:'
        ? 'https://live-coder-593m.onrender.com'
        : 'http://localhost:3002';
      fetch(`${backendBase}/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ roomId }),
      })
        .then(async res => {
          setLoading(false);
          if (res.ok) {
            navigate(`/admin?roomId=${encodeURIComponent(roomId)}`);
          } else if (res.status === 409) {
            setCreateError('Room ya existe. Elige otro Room ID.');
          } else if (res.status === 401 || res.status === 403) {
            setCreateError('No autorizado para crear salas.');
          } else {
            const error = await res.json().catch(() => ({}));
            setCreateError('Error: ' + (error.error || 'Desconocido'));
          }
        })
        .catch(err => {
          setLoading(false);
          setCreateError('Error de red: ' + err.message);
        });
    } else if (role === 'dev') {
      navigate(`/dev?roomId=${encodeURIComponent(roomId)}`);
    } else if (role === 'observer') {
      navigate(`/observer?roomId=${encodeURIComponent(roomId)}`);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-header">
          <img src="/logo192.png" alt="Coder Live" className="login-logo" />
          <h1>Coder Live</h1>
          <p className="login-subtitle">Colaboración en tiempo real para entrevistas técnicas</p>
        </div>
        {!loginSuccess ? (
          <form className="login-form" onSubmit={e => { e.preventDefault(); login(); }}>
            <label htmlFor="user">Usuario</label>
            <input type="text" id="user" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} autoFocus autoComplete="username" />
            <label htmlFor="pass">Contraseña</label>
            <input type="password" id="pass" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} autoComplete="current-password" />
            <button type="submit" className="login-btn">Iniciar sesión</button>
          </form>
        ) : (
          role === 'admin' ? (
            <div className="login-roomid-admin">
              <h2>Crear nueva sala</h2>
              <div className="login-roomid-row">
                <input type="text" id="roomid-input" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
                <button onClick={handleContinue} className="login-btn" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear sala'}
                </button>
              </div>
              <span className="login-roomid-hint">Como admin, defines el Room ID para la sesión.</span>
              {createError && <div className="login-error">{createError}</div>}
            </div>
          ) : (
            <div className="login-roomid">
              <h2>Unirse a una sala</h2>
              <div className="login-roomid-row">
                <input type="text" id="roomid-input" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
                <button onClick={handleContinue} className="login-btn">Continuar</button>
              </div>
              <span className="login-roomid-hint">Ingresa el Room ID proporcionado por el admin.</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default LoginPage;
