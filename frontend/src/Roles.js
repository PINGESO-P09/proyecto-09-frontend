import React, { useState } from 'react';
import './Roles.css';
import {
  Button,
  Col,
  Table,
  Card,
  Row,
  ListGroup,
  Form,
} from 'react-bootstrap';

const Roles = () => {
  const [roles, setRoles] = useState([
    { nombre: 'Socio', activo: true },
    { nombre: 'Arquitecto', activo: false },
    { nombre: 'Administrador', activo: false },
  ]);

  const [permisos, setPermisos] = useState([
    { nombre: 'Modificar Documentos', asignado: true },
    { nombre: 'Subir Documentos', asignado: true },
    { nombre: 'Dar Permisos', asignado: true },
    { nombre: 'Crear Roles', asignado: true },
    { nombre: 'Crear Usuario', asignado: true },
    { nombre: 'Mensajería', asignado: true },
  ]);

  const handleActivoChange = (index) => {
    const updatedRoles = [...roles];
    updatedRoles[index].activo = !updatedRoles[index].activo;
    setRoles(updatedRoles);
  };

  const handlePermisoChange = (index) => {
    const updatedPermisos = [...permisos];
    updatedPermisos[index].asignado = !updatedPermisos[index].asignado;
    setPermisos(updatedPermisos);
  };

  const handleEliminar = (index) => {
    const updatedRoles = [...roles];
    updatedRoles.splice(index, 1);
    setRoles(updatedRoles);
  };

  const handleAñadirRol = () => {
    const nuevoRol = {
      nombre: prompt('Introduce el nombre del nuevo rol:'),
      activo: false,
    };
    if (nuevoRol.nombre) {
      setRoles([...roles, nuevoRol]);
    }
  };

  const handleGuardarCambios = () => {
    console.log('Cambios guardados:', { roles, permisos });
  };

  return (
    <div className="roles-app d-flex">
      <Col xs={12} className="main-content p-4">
        <h1 className="mb-4">Administración Roles</h1>
        <Button variant="dark" className="btn-add-role mb-3" onClick={handleAñadirRol}>
          + Añadir Rol
        </Button>
        
        <Row>
          <Col md={8}>
            <Card>
              <Card.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Rol</th>
                      <th>Activo</th>
                      <th>Eliminar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((rol, index) => (
                      <tr key={index}>
                        <td>{rol.nombre}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={rol.activo}
                            onChange={() => handleActivoChange(index)}
                          />
                        </td>
                        <td>
                          <Button variant="danger" onClick={() => handleEliminar(index)}>
                            ELIMINAR
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="permissions-container">
              <Card.Body>
                <h5>Permisos</h5>
                <ListGroup>
                  {permisos.map((permiso, index) => (
                    <ListGroup.Item key={index}>
                      <Form.Check
                        type="checkbox"
                        label={permiso.nombre}
                        checked={permiso.asignado}
                        onChange={() => handlePermisoChange(index)}
                      />
                    </ListGroup.Item>
                  ))}
                </ListGroup>
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
    </div>
  );
};

export default Roles;
