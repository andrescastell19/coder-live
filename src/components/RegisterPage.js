import React, { useState } from 'react';
import '../css/styles.css';

function RegisterPage() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [role, setRole] = useState('admin');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('#fff');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const getBackendUrl = () => {
        if (window.location.protocol === 'https:') {
          return 'https://live-coder-593m.onrender.com/register';
        } else {
          return 'http://localhost:3002/register';
        }
      };
      const res = await fetch(getBackendUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user, pass, role })
      });
      const data = await res.json();
      if (res.ok) {
        setMsgColor('#0f0');
        setMsg(`Usuario ${data.user} creado como ${data.role}`);
      } else {
        setMsgColor('#f44');
        setMsg(data.error || 'Error al registrar');
        if (res.status === 401 || res.status === 403) {
          setTimeout(() => window.location.href = 'index.html', 1500);
        }
      }
    } catch (err) {
      setMsgColor('#f44');
      setMsg('Error de red');
    }
  };

  return (
    <div style={{ background: '#181818', color: '#fff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
      <form id="registerForm" onSubmit={handleSubmit} style={{ margin: '40px auto', width: 320, background: '#222', padding: 24, borderRadius: 8, boxShadow: '0 2px 16px #0008' }}>
        <h2>Registrar nuevo usuario</h2>
        <input type="text" id="user" placeholder="Usuario" required value={user} onChange={e => setUser(e.target.value)} />
        <input type="password" id="pass" placeholder="Contraseña" required value={pass} onChange={e => setPass(e.target.value)} />
        <select id="role" required value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="dev">Dev</option>
          <option value="observer">Observer</option>
        </select>
        <button type="submit">Registrar</button>
        <div className="msg" id="msg" style={{ color: msgColor, marginTop: 10 }}>{msg}</div>
      </form>
    </div>
  );
}

export default RegisterPage;
