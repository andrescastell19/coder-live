import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from './MonacoEditor';
import '../css/styles.css';

function getToken() {
  const match = document.cookie.match(/(^| )token=([^;]+)/);
  return match ? match[2] : '';
}

function ObserverPage() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState('');
  const wsRef = useRef();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setErrors('No hay token de sesión. Inicia sesión primero.');
      return;
    }
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    let host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      host = 'localhost';
    }
    const wsUrl = `${wsProtocol}://${host}:3002/?token=${token}`;
    wsRef.current = new window.WebSocket(wsUrl);
    wsRef.current.onopen = () => setErrors('');
    wsRef.current.onerror = (e) => setErrors('No se pudo conectar al servidor WebSocket en ' + wsUrl);
    wsRef.current.onclose = (e) => setErrors('Conexión WebSocket cerrada. ¿El backend está corriendo en el puerto 3002?');
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') setCode(data.code);
      else if (data.type === 'code') setCode(data.code);
      else if (data.type === 'output') setOutput(data.output);
    };
    return () => wsRef.current && wsRef.current.close();
  }, [getToken()]);

  return (
    <div style={{ background: '#1e1e1e', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <MonacoEditor value={code} readOnly={true} />
      <div id="errors" style={{ color: errors ? '#f44' : undefined }}>{errors}</div>
      <pre id="output">{output}</pre>
    </div>
  );
}

export default ObserverPage;
