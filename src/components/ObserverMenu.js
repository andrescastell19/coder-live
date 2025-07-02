import React from 'react';
import '../css/styles.css';

const ObserverMenu = ({
  language,
  roomId
}) => {
  return (
    <div className="observer-menu">
      <div className="observer-menu-section">
        <span className="observer-menu-label">Sala:</span>
        <span className="observer-menu-value">{roomId}</span>
      </div>
      <div className="observer-menu-section">
        <span className="observer-menu-label">Lenguaje:</span>
        <span className="observer-menu-value">{language}</span>
      </div>
    </div>
  );
};

export default ObserverMenu;
