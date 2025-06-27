import React, { useEffect, useRef, useState } from 'react';
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

function DevPage() {
  const [code, setCode] = useState('');
  const [readOnly, setReadOnly] = useState(false);
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const wsRef = useRef();
  const devEditing = useRef(false);
  const adminEditing = useRef(false);
  const syncTimeout = useRef();
  const devEditTimeout = useRef();

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
    if (adminEditing.current) return;
    if (!devEditing.current) {
      devEditing.current = true;
      wsRef.current.send(JSON.stringify({ type: 'dev_editing', editing: true }));
    }
    clearTimeout(devEditTimeout.current);
    devEditTimeout.current = setTimeout(() => {
      devEditing.current = false;
      wsRef.current.send(JSON.stringify({ type: 'dev_editing', editing: false }));
      setReadOnly(adminEditing.current);
    }, 1200);
    clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(() => {
      wsRef.current.send(JSON.stringify({ type: 'code', code: val }));
    }, 400);
  };

  const handleRun = () => {
    wsRef.current.send(JSON.stringify({ type: 'run', code }));
  };

  return (
    <div style={{ background: '#1e1e1e', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <MonacoEditor value={code} onChange={handleChange} readOnly={readOnly} />
      <button id="run" onClick={handleRun}>Ejecutar</button>
      <div id="errors" style={{ color: errors ? '#f44' : undefined }}>{errors}</div>
      <pre id="output">{output}</pre>
    </div>
  );
}

export default DevPage;
