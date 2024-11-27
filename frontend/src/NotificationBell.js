// NotificationBell.js
import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import './NotificationBell.css';

const NotificationBell = ({ menuVisible }) => {
    const [isOpen, setIsOpen] = useState(false);

    const notifications = [
        { id: 1, text: "Juan subió un nuevo documento", timestamp: "Hace 1 hora" },
        { id: 2, text: "Pedro comentó en un documento", timestamp: "Hace 2 horas" },
        { id: 3, text: "Se eliminó un archivo de la carpeta 'Finalizados'", timestamp: "Hace 4 horas" },
        { id: 4, text: "Ana actualizó el presupuesto", timestamp: "Hace 1 día" },
    ];

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className="notification-bell-container"
            style={{ left: menuVisible ? '270px' : '20px' }}
        >
            <FaBell className="notification-icon" onClick={toggleNotifications} />
            {isOpen && (
                <div className="notification-dropdown">
                    <h4>Notificaciones</h4>
                    {notifications.map(notification => (
                        <div key={notification.id} className="notification-item">
                            <p>{notification.text}</p>
                            <span className="timestamp">{notification.timestamp}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
