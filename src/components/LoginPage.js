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

  const handleContinue = () => {
    if (!roomId) {
      alert('Debes ingresar un roomId');
      return;
    }
    if (role === 'admin') {
      navigate(`/admin?roomId=${encodeURIComponent(roomId)}`);
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
        <div id="roomid" style={{ display: 'flex', gap: 5, padding: 10, background: '#111', alignItems: 'center' }}>
          <span style={{ color: '#fff' }}>Ingresa el Room ID:</span>
          <input type="text" id="roomid-input" placeholder="roomId" value={roomId} onChange={e => setRoomId(e.target.value)} style={{ padding: 5 }} />
          <button onClick={handleContinue} style={{ padding: 10, background: '#444', color: 'white', border: 'none', cursor: 'pointer' }}>Continuar</button>
          <span style={{ color: '#aaa', marginLeft: 10 }}>
            {role === 'admin' ? 'Como admin, defines el roomId para la sesión.' : 'Ingresa el roomId proporcionado por el admin.'}
          </span>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
