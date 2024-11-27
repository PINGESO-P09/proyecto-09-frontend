import React, { useState } from 'react';
import './FloatingChat.css';
import { Button, ListGroup, Form } from 'react-bootstrap';
import { FaComments, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');

  // Lista de contactos
  const contactos = [
    { id: 1, nombre: 'José Martínez' },
    { id: 2, nombre: 'Estrella Lopez' },
    { id: 3, nombre: 'Pedro Parra' },
  ];

  // Alternar abrir/cerrar el chat flotante
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Alternar expandir/contraer el chat
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Seleccionar contacto para el chat
  const handleSelectContact = (contact) => {
    setActiveChat(contact);
    if (!chatMessages[contact.id]) {
      setChatMessages((prev) => ({ ...prev, [contact.id]: [] }));
    }
  };

  // Enviar mensaje
  const handleSendMessage = () => {
    if (messageInput.trim() !== '' && activeChat) {
      const newMessage = { text: messageInput, sender: 'me' };
      setChatMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...prev[activeChat.id], newMessage],
      }));
      setMessageInput('');
    }
  };

  return (
    <div className={`floating-chat ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <Button variant="primary" className="chat-toggle-btn" onClick={toggleChat}>
        {isOpen ? <FaTimes /> : <FaComments />}
      </Button>

      {isOpen && (
        <div className="chat-window">
          <div className="contact-list">
            <h5>Contactos</h5>
            <ListGroup>
              {contactos.map((contacto) => (
                <ListGroup.Item
                  key={contacto.id}
                  action
                  onClick={() => handleSelectContact(contacto)}
                  active={activeChat && activeChat.id === contacto.id}
                >
                  {contacto.nombre}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <Button variant="secondary" className="expand-btn" onClick={toggleExpand}>
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </Button>
          </div>

          {activeChat && (
            <div className="chat-box">
              <h6>Chat con {activeChat.nombre}</h6>
              <div className="chat-messages">
                {chatMessages[activeChat.id] && chatMessages[activeChat.id].map((message, index) => (
                  <div key={index} className={`chat-message ${message.sender === 'me' ? 'sent' : 'received'}`}>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>
              <div className="chat-input-container">
                <Form.Control
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button variant="primary" onClick={handleSendMessage} className="send-button">
                  Enviar
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
