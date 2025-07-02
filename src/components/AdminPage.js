import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MonacoEditor from './MonacoEditor';
import '../css/styles.css';

function getToken() {
  // Primero intenta obtener el token de localStorage (body de login)
  const token = localStorage.getItem('jwt_token');
  if (token) return token;
  // Fallback: intenta obtenerlo de la cookie (legacy)
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
}

function AdminPage() {
  const [code, setCode] = useState('');
  const [readOnly, setReadOnly] = useState(true); // admin inicia deshabilitado
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const wsRef = useRef();
  const adminEditing = useRef(false);
  const devEditing = useRef(false);
  const syncTimeout = useRef();
  const navigate = useNavigate();
  // Obtener roomId de la URL (solo una vez, no editable aquí)
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId') || '';

  // Conectar WebSocket solo si hay roomId en la URL
  useEffect(() => {
    if (!roomId) return;
    const token = getToken();
    if (!token) {
      setErrors('No hay token de sesión. Inicia sesión primero.');
      return;
    }
    let wsUrl;
    let heartbeat;
    if (window.location.protocol === 'https:') {
      wsUrl = `wss://live-coder-593m.onrender.com/ws?token=${token}&roomId=${roomId}`;
    } else {
      wsUrl = `ws://localhost:3002/ws?token=${token}&roomId=${roomId}`;
    }
    wsRef.current = new window.WebSocket(wsUrl);
    wsRef.current.onopen = () => {
      setErrors('');
      heartbeat = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === 1) {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };
    wsRef.current.onerror = (e) => setErrors('No se pudo conectar al servidor WebSocket en ' + wsUrl);
    wsRef.current.onclose = (e) => {
      setErrors('Conexión WebSocket cerrada.');
      if (heartbeat) clearInterval(heartbeat);
    };
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') setCode(data.code);
      else if (data.type === 'code') setCode(data.code);
      else if (data.type === 'output') setOutput(data.output);
      else if (data.type === 'admin_editing') {
        adminEditing.current = data.editing;
        setReadOnly(!data.editing); // Habilita edición si admin_editing es true
      } else if (data.type === 'dev_editing') {
        devEditing.current = data.editing;
      }
    };
    return () => {
      wsRef.current && wsRef.current.close();
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [roomId]);

  // El admin ya no crea la sala aquí, solo muestra la interfaz colaborativa

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
    const newEditing = !adminEditing.current;
    adminEditing.current = newEditing;
    setReadOnly(!newEditing); // Habilita edición si admin_editing es true
    wsRef.current.send(JSON.stringify({ type: 'admin_editing', editing: newEditing }));
    if (!newEditing) {
      // Cuando admin sale de modo edición, sincroniza el código
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
