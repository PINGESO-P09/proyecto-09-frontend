// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Login from './Login';
import Roles from './Roles';
import Permisos from './Permisos';
import Mensajes from './Mensajes';
import Documentos from './Documentos';
import Proyectos from './Proyectos';
import FloatingChat from './FloatingChat';
import NotificationBell from './NotificationBell';
import { FaAngleRight, FaAngleLeft } from 'react-icons/fa';
import './App.css';

function AppContent() {
  const [menuVisible, setMenuVisible] = useState(true);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const showSidebarAndChat = location.pathname !== '/';

  return (
    <div className="App">
      {showSidebarAndChat && (
        <div
          className={`toggle-tab ${!menuVisible ? 'hidden' : ''}`}
          onClick={toggleMenu}
        >
          {menuVisible ? <FaAngleLeft /> : <FaAngleRight />}
        </div>
      )}

      {showSidebarAndChat && (
        <nav className={`sidebar ${menuVisible ? '' : 'hidden'}`}>
          <div className="navbar-brand">RosenmannLopez</div>
          <ul>
            <li>
              <NavLink to="/roles" activeClassName="active">
                Roles
              </NavLink>
            </li>
            <li>
              <NavLink to="/permisos" activeClassName="active">
                Gestión Usuarios
              </NavLink>
            </li>
            <li>
              <NavLink to="/mensajes" activeClassName="active">
                Mensajes
              </NavLink>
            </li>
            <li>
              <NavLink to="/documentos" activeClassName="active">
                Documentos
              </NavLink>
            </li>
            <li>
              <NavLink to="/proyectos" activeClassName="active">
                Proyectos
              </NavLink>
            </li>
          </ul>
        </nav>
      )}

      {/* Ajusta el contenido y el desplazamiento de la campana según el menú */}
      <div className={`content ${menuVisible && showSidebarAndChat ? '' : 'without-sidebar'}`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permisos" element={<Permisos />} />
          <Route path="/mensajes" element={<Mensajes />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/proyectos" element={<Proyectos />} />
        </Routes>
      </div>

      {/* Chat flotante y campana de notificaciones solo si no está en login */}
      {showSidebarAndChat && (
        <>
          <FloatingChat />
          <NotificationBell menuVisible={menuVisible} />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
