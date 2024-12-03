import React, { useState } from 'react';
import './Roles.css';
import {
  Button,
  Col,
  Table,
  Card,
  Row,
  Form,
  Modal,
  Alert,
} from 'react-bootstrap';

const Roles = () => {
  // Estado para los roles y permisos
  const [roles, setRoles] = useState([
    { id: 1, nombre: 'Socio', activo: true, permisos: ['Modificar Documentos', 'Crear Roles'] },
    { id: 2, nombre: 'Arquitecto', activo: false, permisos: ['Subir Documentos'] },
    { id: 3, nombre: 'Administrador', activo: true, permisos: ['Dar Permisos', 'Crear Usuario'] },
  ]);

  const [permisosDisponibles] = useState([
    'Modificar Documentos', 
    'Subir Documentos', 
    'Dar Permisos', 
    'Crear Roles', 
    'Crear Usuario', 
    'Mensajería'
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Mostrar el modal para modificar un rol
  const handleShowModal = (role) => {
    setSelectedRole(role);
    setNewRoleName(role.nombre);
    setNewRolePermissions(role.permisos);
    setShowModal(true);
  };

  // Cerrar el modal
  const handleCloseModal = () => setShowModal(false);

  // Cambiar el estado de activación del rol
  const handleActivoChange = (index) => {
    const updatedRoles = [...roles];
    updatedRoles[index].activo = !updatedRoles[index].activo;
    setRoles(updatedRoles);
  };

  // Cambiar los permisos del rol
  const handlePermisoChange = (permiso) => {
    const updatedPermissions = newRolePermissions.includes(permiso)
      ? newRolePermissions.filter((perm) => perm !== permiso)
      : [...newRolePermissions, permiso];
    setNewRolePermissions(updatedPermissions);
  };

  // Eliminar un rol
  const handleEliminar = (id) => {
    const updatedRoles = roles.filter((role) => role.id !== id);
    setRoles(updatedRoles);
  };

  // Añadir un nuevo rol
  const handleAñadirRol = () => {
    const nuevoRol = {
      id: roles.length + 1,
      nombre: prompt('Introduce el nombre del nuevo rol:'),
      activo: false,
      permisos: []
    };
    if (nuevoRol.nombre) {
      setRoles([...roles, nuevoRol]);
    }
  };

  // Guardar cambios después de modificar un rol
  const handleGuardarCambios = () => {
    const updatedRoles = roles.map((role) => {
      if (role.id === selectedRole.id) {
        return {
          ...role,
          nombre: newRoleName,
          permisos: newRolePermissions
        };
      }
      return role;
    });
    setRoles(updatedRoles);
    setShowModal(false);
    setShowSuccessAlert(true);
    setTimeout(() => setShowSuccessAlert(false), 3000); // Mensaje de éxito
  };

  return (
    <div className="roles-app d-flex flex-column align-items-center">
      <Col xs={12} className="main-content p-4">
        <h1 className="mb-4">Administración de Roles</h1>

        {/* Alerta de éxito al guardar los cambios */}
        {showSuccessAlert && (
          <Alert variant="success">Rol actualizado con éxito.</Alert>
        )}

        <Button variant="dark" className="btn-add-role mb-3" onClick={handleAñadirRol}>
          + Añadir Rol
        </Button>

        <Row className="w-100 justify-content-center">
          <Col md={8}>
            <Card>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Activo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((rol, index) => (
                      <tr key={rol.id}>
                        <td>{rol.nombre}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={rol.activo}
                            onChange={() => handleActivoChange(index)}
                          />
                        </td>
                        <td>
                          <Button variant="info" size="sm" onClick={() => handleShowModal(rol)}>
                            Modificar
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleEliminar(rol.id)} className="ms-2">
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button variant="success" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        </div>

        <footer className="mt-4 footer-img-container">
          <img
            src="/logo.png"
            alt="Footer"
            className="footer-img"
          />
        </footer>
      </Col>

      {/* Modal para modificar rol */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modificar Rol</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nombre del Rol</Form.Label>
            <Form.Control
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Label>Permisos</Form.Label>
            {permisosDisponibles.map((permiso, index) => (
              <Form.Check
                key={index}
                type="checkbox"
                label={permiso}
                checked={newRolePermissions.includes(permiso)}
                onChange={() => handlePermisoChange(permiso)}
              />
            ))}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleGuardarCambios}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Roles;
