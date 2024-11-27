import React, { useState } from 'react';
import './Roles.css';
import {
  Button,
  Col,
  Card,
  Row,
  ListGroup,
  Form,
} from 'react-bootstrap';

const Permisos = () => {
  const [permisos, setPermisos] = useState([
    { nombre: 'Lectura Documentos', asignado: true },
    { nombre: 'Edición documentos', asignado: false },
    { nombre: 'Comentar documentos', asignado: false },
    { nombre: 'Subir Documentos', asignado: false },
    { nombre: 'Descargar documentos', asignado: false },
  ]);

  const [usuarios, setUsuarios] = useState([
    { nombre: 'José Martínez', rol: 'Arquitecto', asignado: true },
    { nombre: 'Estrella Lopez', rol: 'Socio', asignado: false },
    { nombre: 'Pedro Parra', rol: 'Arquitecto', asignado: false },
  ]);

  const handlePermisoChange = (index) => {
    const updatedPermisos = [...permisos];
    updatedPermisos[index].asignado = !updatedPermisos[index].asignado;
    setPermisos(updatedPermisos);
  };

  const handleUsuarioChange = (index) => {
    const updatedUsuarios = [...usuarios];
    updatedUsuarios[index].asignado = !updatedUsuarios[index].asignado;
    setUsuarios(updatedUsuarios);
  };

  const handleGuardarCambios = () => {
    console.log('Cambios guardados:', { permisos, usuarios });
  };

  return (
    <div className="roles-app d-flex">
      <Col xs={12} className="main-content p-4">
        <h1 className="mb-4">Asignación Permisos</h1>

        <Row>
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
          <Col md={8}>
            <Card>
              <Card.Body>
                <h5>Usuarios</h5>
                <ListGroup variant="flush">
                  {usuarios.map((usuario, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <span>{usuario.nombre} - {usuario.rol}</span>
                      <Form.Check
                        type="checkbox"
                        checked={usuario.asignado}
                        onChange={() => handleUsuarioChange(index)}
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

export default Permisos;
