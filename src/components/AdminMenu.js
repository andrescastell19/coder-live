import React from 'react';
import '../css/styles.css';

const AdminMenu = ({
  isReadOnly,
  onToggleEdit,
  language,
  onLanguageChange,
  onLogout,
  roomId
}) => {
  return (
    <div className="admin-menu">
      <div className="admin-menu-section">
        <span className="admin-menu-label">Sala:</span>
        <span className="admin-menu-value">{roomId}</span>
      </div>
      <div className="admin-menu-section">
        <span className="admin-menu-label">Lenguaje:</span>
        <select value={language} onChange={e => onLanguageChange(e.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="c">C</option>
          <option value="cpp">C++</option>
        </select>
      </div>
      <div className="admin-menu-section">
        <button onClick={onToggleEdit}>
          {isReadOnly ? 'Habilitar edición' : 'Deshabilitar edición'}
        </button>
      </div>
      <div className="admin-menu-section">
        <button className="logout-btn" onClick={onLogout}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default AdminMenu;
