import React from 'react';
import '../css/styles.css';

const DevMenu = ({
  language,
  roomId
}) => {
  return (
    <div className="dev-menu">
      <div className="dev-menu-section">
        <span className="dev-menu-label">Sala:</span>
        <span className="dev-menu-value">{roomId}</span>
      </div>
      <div className="dev-menu-section">
        <span className="dev-menu-label">Lenguaje:</span>
        <span className="dev-menu-value">{language}</span>
      </div>
    </div>
  );
};

export default DevMenu;
