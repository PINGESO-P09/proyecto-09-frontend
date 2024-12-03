import React, { useState } from 'react';
import './Permisos.css';
import {
  Button,
  Col,
  Card,
  Row,
  ListGroup,
  Form,
  Modal,
  Alert
} from 'react-bootstrap';

const Permisos = () => {
  // Lista de usuarios y permisos
  const [usuarios, setUsuarios] = useState([
    { id: 1, nombre: 'José Martínez', rol: 'Arquitecto', permisos: ['Lectura Documentos', 'Edición documentos'], activo: true },
    { id: 2, nombre: 'Estrella Lopez', rol: 'Socio', permisos: ['Subir Documentos'], activo: true },
    { id: 3, nombre: 'Pedro Parra', rol: 'Arquitecto', permisos: [], activo: true }
  ]);

  const [permisosDisponibles, setPermisosDisponibles] = useState([
    'Lectura Documentos',
    'Edición documentos',
    'Comentar documentos',
    'Subir Documentos',
    'Descargar documentos'
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false); // Modal para agregar usuario
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [newUserPermissions, setNewUserPermissions] = useState([]);
  const [newUserActive, setNewUserActive] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Mostrar el modal con los datos del usuario
  const handleShowModal = (usuario) => {
    setSelectedUser(usuario);
    setNewUserName(usuario.nombre);
    setNewUserRole(usuario.rol);
    setNewUserPermissions(usuario.permisos);
    setNewUserActive(usuario.activo);
    setShowModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => setShowModal(false);

  // Mostrar el modal para agregar un nuevo usuario
  const handleShowAddUserModal = () => {
    setNewUserName('');
    setNewUserRole('');
    setNewUserPermissions([]);
    setNewUserActive(true);
    setShowAddUserModal(true);
  };

  // Cerrar el modal para agregar un usuario
  const handleCloseAddUserModal = () => setShowAddUserModal(false);

  // Guardar los cambios de un usuario
  const handleSaveUser = () => {
    const updatedUsers = usuarios.map((user) => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          nombre: newUserName,
          rol: newUserRole,
          permisos: newUserPermissions,
          activo: newUserActive
        };
      }
      return user;
    });
    setUsuarios(updatedUsers);
    setShowModal(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000); // Mensaje de éxito
  };

  // Eliminar un usuario
  const handleDeleteUser = (id) => {
    const updatedUsers = usuarios.filter(user => user.id !== id);
    setUsuarios(updatedUsers);
  };

  // Manejar el cambio de permisos
  const handlePermissionChange = (permission) => {
    const updatedPermissions = newUserPermissions.includes(permission)
      ? newUserPermissions.filter((perm) => perm !== permission)
      : [...newUserPermissions, permission];
    setNewUserPermissions(updatedPermissions);
  };

  // Cambiar el estado de habilitación o deshabilitación de un usuario
  const handleToggleActiveStatus = (id) => {
    const updatedUsers = usuarios.map((user) => {
      if (user.id === id) {
        return { ...user, activo: !user.activo };
      }
      return user;
    });
    setUsuarios(updatedUsers);
  };

  // Crear un nuevo usuario
  const handleCreateUser = () => {
    const newUser = {
      id: usuarios.length + 1,
      nombre: newUserName,
      rol: newUserRole,
      permisos: newUserPermissions,
      activo: newUserActive
    };
    setUsuarios([...usuarios, newUser]);
    setShowAddUserModal(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000); // Mensaje de éxito
  };

  return (
    <div className="permisos-app d-flex">
      <Col xs={12} className="main-content p-4">
        <h1 className="mb-4">Gestión de Usuarios</h1>

        {/* Mostrar alerta de éxito */}
        {showSuccessAlert && (
          <Alert variant="success" className="alert-success">Usuario actualizado con éxito.</Alert>
        )}

        {/* Botón para agregar nuevo usuario */}
        <Button variant="dark" className="btn-add-role mb-3" onClick={handleShowAddUserModal}>
          + Añadir Usuario
        </Button>

        <Row className="w-100 justify-content-center">
          <Col md={10} lg={8}>
            <Card className="mb-3">
              <Card.Body>
                <h5>Usuarios del Sistema</h5>
                <ListGroup variant="flush">
                  {usuarios.map((usuario) => (
                    <ListGroup.Item key={usuario.id} className="d-flex justify-content-between align-items-center">
                      <span>{usuario.nombre} - {usuario.rol}</span>
                      <div>
                        <Button variant="info" size="sm" onClick={() => handleShowModal(usuario)}>Modificar</Button>
                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(usuario.id)} className="ms-2">
                          Eliminar
                        </Button>
                        <Button 
                          variant={usuario.activo ? "success" : "secondary"} 
                          size="sm" 
                          onClick={() => handleToggleActiveStatus(usuario.id)} 
                          className="ms-2"
                        >
                          {usuario.activo ? "Desactivar" : "Activar"}
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal de modificación de usuario */}
        <Modal show={showModal} onHide={handleCloseModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Modificar Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre del Usuario</Form.Label>
              <Form.Control
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Rol del Usuario</Form.Label>
              <Form.Control
                as="select"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="Arquitecto">Arquitecto</option>
                <option value="Socio">Socio</option>
                <option value="Administrador">Administrador</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Permisos</Form.Label>
              {permisosDisponibles.map((permiso, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  label={permiso}
                  checked={newUserPermissions.includes(permiso)}
                  onChange={() => handlePermissionChange(permiso)}
                />
              ))}
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Activo"
                checked={newUserActive}
                onChange={() => setNewUserActive(!newUserActive)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleSaveUser}>Guardar Cambios</Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de agregar nuevo usuario */}
        <Modal show={showAddUserModal} onHide={handleCloseAddUserModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Crear Nuevo Usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre del Usuario</Form.Label>
              <Form.Control
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Rol del Usuario</Form.Label>
              <Form.Control
                as="select"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
              >
                <option value="Arquitecto">Arquitecto</option>
                <option value="Socio">Socio</option>
                <option value="Administrador">Administrador</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Permisos</Form.Label>
              {permisosDisponibles.map((permiso, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  label={permiso}
                  checked={newUserPermissions.includes(permiso)}
                  onChange={() => handlePermissionChange(permiso)}
                />
              ))}
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label="Activo"
                checked={newUserActive}
                onChange={() => setNewUserActive(!newUserActive)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddUserModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleCreateUser}>Crear Usuario</Button>
          </Modal.Footer>
        </Modal>

        <footer className="mt-4 footer-img-container">
          <img src="/logo.png" alt="Footer" className="footer-img" />
        </footer>
      </Col>
    </div>
  );
};

export default Permisos;
