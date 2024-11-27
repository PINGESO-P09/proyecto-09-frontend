import React, { useState } from 'react';
import './Mensajes.css';
import {
  Button,
  Col,
  Card,
  Row,
  ListGroup,
  Form,
  Modal,
} from 'react-bootstrap';

const Mensajes = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [messageInput, setMessageInput] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [reviews, setReviews] = useState([]); // Solicitudes de revisión

  const contactos = [
    { id: 1, nombre: 'José Martínez' },
    { id: 2, nombre: 'Estrella Lopez' },
    { id: 3, nombre: 'Pedro Parra' },
  ];

  const documentos = [
    'Informe Dimensiones',
    'Plano 3D',
    'Análisis Financiero',
    'Memoria de Cálculo',
  ];

  const handleSelectContact = (contact) => {
    setActiveChat(contact);
    if (!chatMessages[contact.id]) {
      setChatMessages((prev) => ({ ...prev, [contact.id]: [] }));
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() !== '') {
      const newMessage = { text: messageInput, sender: 'me' };
      setChatMessages((prev) => ({
        ...prev,
        [activeChat.id]: [...prev[activeChat.id], newMessage],
      }));
      setMessageInput('');
    }
  };

  // Agregar tarea
  const handleAddTask = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTask = {
      title: formData.get('title'),
      description: formData.get('description'),
      assignedTo: formData.get('assignedTo'),
      dueDate: formData.get('dueDate'),
    };
    setTasks([...tasks, newTask]);
    setShowTaskModal(false);
  };

  // Agregar solicitud de revisión
  const handleAddReview = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newReview = {
      document: formData.get('document'),
      reviewer: formData.get('reviewer'),
      notes: formData.get('notes'),
      deadline: formData.get('deadline'),
    };
    setReviews([...reviews, newReview]);
    setShowReviewModal(false);
  };

  return (
    <div className="roles-app d-flex">
      <Col xs={12} className="main-content p-4">
        <h1 className="mb-4">Mensajería y Solicitudes</h1>

        <Row>
          <Col md={4}>
            <Card className="contactos-container">
              <Card.Body>
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
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="mb-2"
                    onClick={() => setShowTaskModal(true)}
                  >
                    Asignar Tarea
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Solicitar Revisión
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={8}>
            <Card className="main-chat-container">
              <Card.Body>
                <h5>{activeChat ? `Chat con ${activeChat.nombre}` : 'Selecciona un contacto'}</h5>
                <div className="chat-messages">
                  {activeChat && chatMessages[activeChat.id] && chatMessages[activeChat.id].map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender === 'me' ? 'sent' : 'received'}`}>
                      <p>{message.text}</p>
                    </div>
                  ))}
                </div>
                {activeChat && (
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
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Lista de Tareas */}
        <div className="mt-4">
          <h5>Tareas Asignadas</h5>
          <ListGroup>
            {tasks.map((task, index) => (
              <ListGroup.Item key={index}>
                <strong>{task.title}</strong>: {task.description} 
                (Asignado a: {task.assignedTo}, Fecha límite: {task.dueDate})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        {/* Solicitudes de Revisión */}
        <div className="mt-4">
          <h5>Solicitudes de Revisión</h5>
          <ListGroup>
            {reviews.map((review, index) => (
              <ListGroup.Item key={index}>
                <strong>{review.document}</strong>: {review.notes} 
                (Revisor: {review.reviewer}, Fecha límite: {review.deadline})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>

        <footer className="footer-img-container mt-4">
          <img src="/logo.png" alt="RosenmannLopez" className="footer-img" />
        </footer>
      </Col>

      {/* Modal para asignar tarea */}
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Asignar Tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddTask}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control name="title" type="text" placeholder="Título de la tarea" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control name="description" as="textarea" rows={3} placeholder="Detalles de la tarea" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Asignar a</Form.Label>
              <Form.Control name="assignedTo" as="select" required>
                <option value="">Seleccionar...</option>
                {contactos.map((contact) => (
                  <option key={contact.id} value={contact.nombre}>
                    {contact.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha límite</Form.Label>
              <Form.Control name="dueDate" type="date" required />
            </Form.Group>
            <Button variant="primary" type="submit">
              Asignar Tarea
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para solicitar revisión */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Solicitar Revisión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddReview}>
            <Form.Group className="mb-3">
              <Form.Label>Documento</Form.Label>
              <Form.Control name="document" as="select" required>
                <option value="">Seleccionar documento...</option>
                {documentos.map((doc, index) => (
                  <option key={index} value={doc}>
                    {doc}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Revisor</Form.Label>
              <Form.Control name="reviewer" as="select" required>
                <option value="">Seleccionar...</option>
                {contactos.map((contact) => (
                  <option key={contact.id} value={contact.nombre}>
                    {contact.nombre}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notas</Form.Label>
              <Form.Control name="notes" as="textarea" rows={3} placeholder="Detalles adicionales" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha límite</Form.Label>
              <Form.Control name="deadline" type="date" required />
            </Form.Group>
            <Button variant="primary" type="submit">
              Solicitar Revisión
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Mensajes;
