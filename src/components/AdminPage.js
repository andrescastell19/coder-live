import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonacoEditor from './MonacoEditor';
import '../css/styles.css';

function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
}

function AdminPage() {
  const [code, setCode] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const wsRef = useRef();
  const adminEditing = useRef(false);
  const devEditing = useRef(false);
  const syncTimeout = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setErrors('No hay token de sesión. Inicia sesión primero.');
      return;
    }
    let wsUrl;
    if (window.location.protocol === 'https:') {
      wsUrl = `wss://live-coder-593m.onrender.com/?token=${token}`;
    } else {
      wsUrl = `ws://localhost:3002/?token=${token}`;
    }
    wsRef.current = new window.WebSocket(wsUrl);
    wsRef.current.onopen = () => setErrors('');
    wsRef.current.onerror = (e) => setErrors('No se pudo conectar al servidor WebSocket en ' + wsUrl);
    wsRef.current.onclose = (e) => setErrors('Conexión WebSocket cerrada. ¿El backend está corriendo en el puerto 3002?');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') setCode(data.code);
      else if (data.type === 'code') setCode(data.code);
      else if (data.type === 'output') setOutput(data.output);
      else if (data.type === 'admin_editing') {
        adminEditing.current = data.editing;
        setReadOnly(data.editing);
      } else if (data.type === 'dev_editing') {
        devEditing.current = data.editing;
      }
    };
    return () => wsRef.current && wsRef.current.close();
  }, [getToken()]);

  const handleChange = (val) => {
    setCode(val);
    if (devEditing.current && !adminEditing.current) return;
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      wsRef.current.send(JSON.stringify({ type: 'code', code: val }));
    }, 400);
  };

  const handleRun = () => {
    wsRef.current.send(JSON.stringify({ type: 'run', code }));
  };

  const handleLock = () => {
    adminEditing.current = !adminEditing.current;
    wsRef.current.send(JSON.stringify({ type: 'admin_editing', editing: adminEditing.current }));
    setReadOnly(adminEditing.current);
    if (!adminEditing.current) {
      wsRef.current.send(JSON.stringify({ type: 'code', code }));
    }
  };

  return (
    <div style={{ background: '#1e1e1e', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <button id="go-register" style={{ marginLeft: 10 }} onClick={() => navigate('/register')}>Registrar usuario</button>
      <button id="lock-btn" style={{ padding: 10, background: adminEditing.current ? '#888' : '#c00', color: '#fff', border: 'none', cursor: 'pointer', margin: 10 }} onClick={handleLock}>
        {adminEditing.current ? 'Desbloquear edición DEV' : 'Bloquear edición DEV'}
      </button>
      <MonacoEditor value={code} onChange={handleChange} readOnly={readOnly} />
      <button id="run" onClick={handleRun}>Ejecutar</button>
      <div id="errors" style={{ color: errors ? '#f44' : undefined }}>{errors}</div>
      <pre id="output">{output}</pre>
    </div>
  );
}

export default AdminPage;
