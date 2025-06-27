import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/styles.css';

function LoginPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
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
        if (obj.user === 'admin') {
          navigate('/admin');
        } else if (obj.user === 'dev') {
          navigate('/dev');
        } else if (obj.user === 'observer') {
          navigate('/observer');
        } else {
          alert('Rol desconocido');
        }
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div style={{ margin: 0, fontFamily: 'sans-serif', background: '#1e1e1e', color: 'white', minHeight: '100vh' }}>
      <div id="login" style={{ display: 'flex', gap: 5, padding: 10, background: '#111' }}>
        <input type="text" id="user" placeholder="Usuario" value={user} onChange={e => setUser(e.target.value)} style={{ padding: 5 }} />
        <input type="password" id="pass" placeholder="Contraseña" value={pass} onChange={e => setPass(e.target.value)} style={{ padding: 5 }} />
        <button onClick={login} style={{ padding: 10, background: '#444', color: 'white', border: 'none', cursor: 'pointer' }}>Login</button>
      </div>
      <div id="editor"></div>
      <button id="run">Ejecutar</button>
      <div id="errors"></div>
      <pre id="output"></pre>
    </div>
  );
}

export default LoginPage;
