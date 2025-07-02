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
    <div style={{ margin: 0, fontFamily: 'sans-serif', background: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
      {!loginSuccess ? (
        <div id="login" style={{ display: 'flex', gap: 5, padding: 10, background: '#111' }}>
          <input type="text" id="user" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} style={{ padding: 5 }} />
          <input type="password" id="pass" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: 5 }} />
          <button onClick={login} style={{ padding: 10, background: '#444', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
        </div>
      ) : (
        role === 'admin' ? (
          <div id="roomid-admin" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 10, background: '#111', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ color: '#fff' }}>Room ID para crear la sesión:</span>
              <input type="text" id="roomid-input" placeholder="roomId" value={roomId} onChange={e => setRoomId(e.target.value)} style={{ padding: 5 }} />
              <button onClick={handleContinue} style={{ padding: 10, background: '#444', color: 'white', border: 'none', cursor: loading ? 'wait' : 'pointer' }} disabled={loading}>
                {loading ? 'Creando...' : 'Crear sala'}
              </button>
            </div>
            <span style={{ color: '#aaa', marginLeft: 2 }}>Como admin, defines el Room ID para la sesión.</span>
            {createError && <div style={{ color: '#f44', marginTop: 4 }}>{createError}</div>}
          </div>
        ) : (
          <div id="roomid" style={{ display: 'flex', gap: 5, padding: 10, background: '#111', alignItems: 'center' }}>
            <span style={{ color: '#fff' }}>Ingresa el Room ID:</span>
            <input type="text" id="roomid-input" placeholder="roomId" value={roomId} onChange={e => setRoomId(e.target.value)} style={{ padding: 5 }} />
            <button onClick={handleContinue} style={{ padding: 10, background: '#444', color: 'white', border: 'none', cursor: 'pointer' }}>Continuar</button>
            <span style={{ color: '#aaa', marginLeft: 10 }}>Ingresa el roomId proporcionado por el admin.</span>
          </div>
        )
      )}
    </div>
  );
}

export default LoginPage;
