import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from './MonacoEditor';
import DevMenu from './DevMenu';
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
  const [language, setLanguage] = useState('javascript');
  const [roomId, setRoomId] = useState('');
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
    // Obtener roomId de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('roomId');
    setRoomId(urlRoomId || '');
    if (!urlRoomId) {
      setErrors('No se encontró roomId en la URL.');
      return;
    }

    // Validar roomId antes de conectar WebSocket
    const backendBase = window.location.protocol === 'https:'
      ? 'https://live-coder-593m.onrender.com'
      : 'http://localhost:3002';
    fetch(`${backendBase}/room-exists?roomId=${encodeURIComponent(urlRoomId)}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            // Solo conectar WebSocket si la sala existe
            let wsUrl;
            let heartbeat;
            if (window.location.protocol === 'https:') {
              wsUrl = `wss://live-coder-593m.onrender.com/ws?token=${token}&roomId=${urlRoomId}`;
            } else {
              wsUrl = `ws://localhost:3002/ws?token=${token}&roomId=${urlRoomId}`;
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
              if (data.type === 'init') {
                setCode(data.code);
                if (data.language) setLanguage(data.language);
              }
              else if (data.type === 'code') setCode(data.code);
              else if (data.type === 'output') setOutput(data.output);
              else if (data.type === 'admin_editing') {
                adminEditing.current = data.editing;
                setReadOnly(data.editing);
              } else if (data.type === 'dev_editing') {
                devEditing.current = data.editing;
              } else if (data.type === 'language') {
                setLanguage(data.language);
              }
            };
            // Limpiar heartbeat al desmontar
            return () => {
              if (heartbeat) clearInterval(heartbeat);
            };
          } else {
            setErrors('La sala no existe.');
          }
        } else if (res.status === 404) {
          setErrors('La sala no existe.');
        } else {
          const error = await res.json().catch(() => ({}));
          setErrors('Error: ' + (error.error || 'Desconocido'));
        }
      })
      .catch(err => {
        setErrors('Error de red: ' + err.message);
      });
    return () => wsRef.current && wsRef.current.close();
  }, []);

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
    wsRef.current.send(JSON.stringify({ type: 'run', code, language }));
  };

  // Mensaje de estado
  let infoMsg = '';
  if (readOnly) {
    infoMsg = 'El administrador ha bloqueado la edición. Espera a que habilite la edición para ti.';
  } else if (devEditing.current) {
    infoMsg = 'Estás editando el código. Se bloqueará si el admin toma el control.';
  } else {
    infoMsg = 'Puedes editar el código mientras el admin lo permita.';
  }

  return (
    <div style={{ background: '#1e1e1e', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <DevMenu language={language} roomId={roomId} />
      <div style={{ margin: '0 32px 8px 32px', color: readOnly ? '#fbb' : '#bbf', fontWeight: 500, minHeight: 24 }}>{infoMsg}</div>
      <MonacoEditor value={code} onChange={handleChange} readOnly={readOnly} language={language} />
      <button id="run" onClick={handleRun} style={{ margin: 16, padding: 10, background: '#0a0', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>Ejecutar</button>
      <div id="errors" style={{ color: errors ? '#f44' : undefined }}>{errors}</div>
      <pre id="output">{output}</pre>
    </div>
  );
}

export default DevPage;
