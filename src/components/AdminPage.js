
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MonacoEditor from './MonacoEditor';
import AdminMenu from './AdminMenu';
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
  const [language, setLanguage] = useState('javascript');
  const wsRef = useRef();
  const adminEditing = useRef(false);
  const devEditing = useRef(false);
  const syncTimeout = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  // Obtener roomId de la URL (solo una vez, no editable aquí)
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId') || '';

  // Validar roomId antes de conectar WebSocket (igual que DevPage)
  useEffect(() => {
    if (!roomId) return;
    const token = getToken();
    if (!token) {
      navigate('/error', { state: { error: 'No hay token de sesión. Inicia sesión primero.' } });
      return;
    }
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
            wsRef.current.onerror = (e) => {
              navigate('/error', { state: { error: 'No se pudo conectar al servidor WebSocket en ' + wsUrl } });
            };
            wsRef.current.onclose = (e) => {
              setErrors('Conexión WebSocket cerrada.');
              if (heartbeat) clearInterval(heartbeat);
            };
            wsRef.current.onmessage = (event) => {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'init') {
                  setCode(data.code);
                  if (data.language) setLanguage(data.language);
                } else if (data.type === 'code') setCode(data.code);
                else if (data.type === 'output') setOutput(data.output);
                else if (data.type === 'admin_editing') {
                  adminEditing.current = data.editing;
                  setReadOnly(!data.editing); // Habilita edición si admin_editing es true
                } else if (data.type === 'dev_editing') {
                  devEditing.current = data.editing;
                } else if (data.type === 'language') {
                  setLanguage(data.language);
                }
              } catch (err) {
                navigate('/error', { state: { error: 'Error inesperado en la comunicación WebSocket.' } });
              }
            };
            // Limpiar heartbeat al desmontar
            return () => {
              wsRef.current && wsRef.current.close();
              if (heartbeat) clearInterval(heartbeat);
            };
          } else {
            navigate('/error', { state: { error: 'La sala no existe o fue cerrada.' } });
          }
        } else if (res.status === 404) {
          navigate('/error', { state: { error: 'La sala no existe.' } });
        } else {
          const error = await res.json().catch(() => ({}));
          navigate('/error', { state: { error: 'Error: ' + (error.error || 'Desconocido') } });
        }
      })
      .catch(err => {
        navigate('/error', { state: { error: 'Error de red: ' + err.message } });
      });
  }, [roomId, navigate]);

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
    wsRef.current.send(JSON.stringify({ type: 'run', code, language }));
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

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    wsRef.current.send(JSON.stringify({ type: 'language', language: lang }));
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/');
  };

  return (
    <div style={{ background: '#1e1e1e', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <AdminMenu
        isReadOnly={readOnly}
        onToggleEdit={handleLock}
        language={language}
        onLanguageChange={handleLanguageChange}
        onLogout={handleLogout}
        roomId={roomId}
      />
      <MonacoEditor value={code} onChange={handleChange} readOnly={readOnly} language={language} />
      <button id="run" onClick={handleRun} style={{ margin: 16, padding: 10, background: '#0a0', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 'bold' }}>Ejecutar</button>
      <div id="errors" style={{ color: errors ? '#f44' : undefined }}>{errors}</div>
      <pre id="output">{output}</pre>
    </div>
  );
}

export default AdminPage;
