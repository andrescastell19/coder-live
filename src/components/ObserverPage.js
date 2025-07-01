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
    // Obtener roomId de la URL (?roomId=...)
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    if (!roomId) {
      setErrors('No se encontró roomId en la URL.');
      return;
    }

    // Validar roomId antes de conectar WebSocket
    const backendBase = window.location.protocol === 'https:'
      ? 'https://live-coder-593m.onrender.com'
      : 'http://localhost:3002';
    fetch(`${backendBase}/room-exists?roomId=${encodeURIComponent(roomId)}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          if (data.exists) {
            // Solo conectar WebSocket si la sala existe
            let wsUrl;
            if (window.location.protocol === 'https:') {
              wsUrl = `wss://live-coder-593m.onrender.com/ws?token=${token}&roomId=${roomId}`;
            } else {
              wsUrl = `ws://localhost:3002/ws?token=${token}&roomId=${roomId}`;
            }
            let heartbeat;
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
