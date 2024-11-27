// Proyectos.js

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importa Axios para realizar solicitudes HTTP
import './Proyectos.css'; // Asegúrate de que este archivo CSS existe y está correctamente configurado
import { Button, Card, Table, Form, Modal, Spinner, Alert } from 'react-bootstrap'; // Importa componentes de React Bootstrap
import { FaEdit, FaTrash } from 'react-icons/fa'; // Importa íconos para botones de acción

const Proyectos = () => {
  // Estado para almacenar el proyecto seleccionado para ver sus documentos
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Estado para almacenar el proyecto que se está editando
  const [editingProject, setEditingProject] = useState(null);
  
  // Estados para controlar la visibilidad de los modales
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  
  // Estado para manejar los datos del nuevo proyecto que se está creando
  const [newProject, setNewProject] = useState({
    codigo: '',
    cliente: '',
    correo: '',
    fecha_inicio: '',
    fecha_termino: '',
    estado: '',
    inversion: '',
    folder_name: '',
  });

  // Estado para almacenar la lista de proyectos obtenidos desde el backend
  const [proyectos, setProyectos] = useState([]);
  
  // Estado para almacenar la lista de documentos (puedes modificar esto para obtenerlos desde el backend si es necesario)
  const [documents, setDocuments] = useState([
    { id: 1, projectCode: 'IN/1001/24', nombre: 'Informe Dimensiones', cliente: 'ACME', fecha: '2022-01-23', tipo: 'Informe' },
    { id: 2, projectCode: 'IN/1002/24', nombre: 'Plano 3D', cliente: 'Museo Nacional', fecha: '2022-01-09', tipo: 'Plano' },
    { id: 3, projectCode: 'IN/1003/24', nombre: 'Análisis Financiero', cliente: 'Coliseo Metropolitano', fecha: '2023-08-15', tipo: 'Informe' },
    { id: 4, projectCode: 'IN/1004/24', nombre: 'Especificaciones Técnicas', cliente: 'Mausoleo Colón', fecha: '2023-11-02', tipo: 'Manual' },
  ]);

  // Estado para indicar si se está procesando una solicitud (creación o edición de proyecto)
  const [loading, setLoading] = useState(false);

  // Estado para manejar errores generales
  const [error, setError] = useState(null);

  /**
   * Función para generar un nuevo código de proyecto automáticamente.
   * Asegura que el código sea único incrementando el número hasta encontrar uno disponible.
   */
  const generateProjectCode = () => {
    console.log("Generando nuevo código de proyecto...");
    const year = new Date().getFullYear().toString().slice(-2); // Obtiene los dos últimos dígitos del año actual
    let lastNumber = 1000; // Número inicial si no hay proyectos existentes

    if (proyectos.length > 0) {
      // Extrae los números de los códigos existentes
      const numbers = proyectos
        .map(proj => {
          const parts = proj.codigo.split('/');
          const number = parts.length === 3 ? parseInt(parts[1], 10) : null;
          console.log(`Proyecto existente: ${proj.codigo} - Número extraído: ${number}`);
          return number;
        })
        .filter(n => !isNaN(n));

      if (numbers.length > 0) {
        lastNumber = Math.max(...numbers);
        console.log(`Último número de proyecto encontrado: ${lastNumber}`);
      }
    }

    let newNumber = lastNumber + 1;
    let newCodigo = `IN/${newNumber}/${year}`;
    console.log(`Código de proyecto generado inicialmente: ${newCodigo}`);
    
    // Verifica si el código ya existe y, de ser así, incrementa hasta encontrar uno único
    while (proyectos.some(proj => proj.codigo === newCodigo)) {
      console.log(`El código ${newCodigo} ya existe. Incrementando número...`);
      newNumber += 1;
      newCodigo = `IN/${newNumber}/${year}`;
      console.log(`Nuevo código de proyecto generado: ${newCodigo}`);
    }

    console.log(`Código de proyecto final generado: ${newCodigo}`);
    return newCodigo;
  };

  /**
   * Función para abrir el modal de creación de un nuevo proyecto.
   * Genera un nuevo código de proyecto y reinicia los campos del formulario.
   */
  const handleOpenNewProjectModal = () => {
    console.log("Abriendo modal para nuevo proyecto...");
    setNewProject({
      codigo: generateProjectCode(),
      cliente: '',
      correo: '',
      fecha_inicio: '',
      fecha_termino: '',
      estado: '',
      inversion: '',
      folder_name: '',
    });
    setShowNewProjectModal(true); // Muestra el modal
    console.log("Modal para nuevo proyecto abierto.");
  };

  /**
   * useEffect para obtener la lista de proyectos desde el backend cuando el componente se monta.
   */
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Obtener el token de acceso

        if (!accessToken) {
          console.error("No token found");
          setError("No token found. Please log in again.");
          return;
        }

        console.log("Token de acceso obtenido:", accessToken);

        // Realiza la solicitud GET al backend con el token en la cabecera Authorization
        const response = await axios.get('http://localhost:8000/api/projects/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,  // Token enviado aquí
          }
        });

        console.log("Respuesta de la API:", response.data); // Log para depuración

        if (response.data.results) {
          setProyectos(response.data.results);
        } else {
          setProyectos(response.data);
        }
      } catch (error) {
        console.error("Error al obtener los proyectos:", error.response || error.message);
        console.log("Detalles del error:", error); // Log adicional para depuración
        setError("No se pudieron obtener los proyectos. Revisa la consola para más detalles.");
      }
    };

    fetchProyectos();
  }, []);

  /**
   * Función para manejar la creación de un nuevo proyecto.
   * Envía una solicitud POST al backend para crear el proyecto y la carpeta en Google Drive.
   */
  const handleSaveNewProject = async () => {
    console.log("Intentando guardar un nuevo proyecto...");
    // Validación básica de campos obligatorios
    if (
      newProject.codigo &&
      newProject.cliente &&
      newProject.fecha_inicio &&
      newProject.fecha_termino &&
      newProject.estado &&
      newProject.folder_name
    ) {
      console.log("Todos los campos obligatorios están completos.");
      setLoading(true); // Indica que se está procesando la solicitud
      try {
        console.log("Enviando solicitud POST a 'http://localhost:8000/api/create-project/' con los datos del proyecto...");
        console.log("Datos del nuevo proyecto:", newProject);

        // Realiza una solicitud POST al backend para crear el proyecto
        const response = await axios.post('http://localhost:8000/api/create-project/', {
          codigo: newProject.codigo,
          cliente: newProject.cliente,
          correo: newProject.correo,
          fecha_inicio: newProject.fecha_inicio,
          fecha_termino: newProject.fecha_termino,
          estado: newProject.estado,
          inversion: newProject.inversion ? parseFloat(newProject.inversion) : null,
          folder_name: newProject.folder_name,
      }, {
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          },
      });

        console.log("Respuesta del backend después de crear el proyecto:", response.data);

        if (response.data.project) {
          console.log("Proyecto creado exitosamente. Actualizando estado de proyectos...");
          // Añade el nuevo proyecto al estado de proyectos
          setProyectos([...proyectos, response.data.project]);
          setShowNewProjectModal(false); // Cierra el modal
          alert(`Proyecto creado con éxito y carpeta en Google Drive: ${response.data.folder_id}`);
          console.log("Estado de proyectos actualizado y modal cerrado.");
        } else {
          console.warn("La respuesta del backend no contiene 'project'. Verifica los datos enviados.");
          alert("No se pudo guardar el proyecto. Verifica los datos.");
        }
      } catch (error) {
        console.error("Error al guardar el proyecto:", error.response || error.message);
        console.log("Detalles del error:", error);

        // Verifica si el error es por código duplicado y genera un nuevo código automáticamente
        if (error.response && error.response.status === 400 && error.response.data.error) {
          if (error.response.data.error.includes('codigo') && error.response.data.error.includes('already exists')) {
            console.warn("El código del proyecto ya existe. Generando un nuevo código...");
            alert("El código del proyecto ya existe. Generando un nuevo código...");
            // Genera un nuevo código y vuelve a intentar guardar el proyecto
            setNewProject(prev => ({ ...prev, codigo: generateProjectCode() }));
            handleSaveNewProject();
            return;
          }
        }
        alert(`Error al guardar el proyecto: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false); // Finaliza el estado de carga
        console.log("Finalizado el proceso de creación del proyecto. Estado de carga:", loading);
      }
    } else {
      console.warn("Faltan campos obligatorios. No se puede guardar el proyecto.");
      alert("Por favor, completa todos los campos obligatorios.");
    }
  };

  /**
   * Función para abrir el modal de edición de un proyecto existente.
   * @param {Object} project - El proyecto que se va a editar.
   */
  const handleEditProject = (project) => {
    console.log("Abriendo modal para editar el proyecto:", project);
    setEditingProject(project);
    setShowEditModal(true); // Muestra el modal de edición
    console.log("Modal de edición abierto.");
  };

  /**
   * Función para manejar la eliminación de un proyecto.
   * @param {number} projectId - El ID del proyecto que se va a eliminar.
   */
  const handleDeleteProject = async (projectId) => {
    console.log(`Intentando eliminar el proyecto con ID: ${projectId}`);
    if (window.confirm("¿Desea eliminar el proyecto y todos sus documentos?")) {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Obtiene el token de acceso
        console.log(`Token de acceso para eliminación: ${accessToken}`);

        // Realiza una solicitud DELETE al backend para eliminar el proyecto de la base de datos
        const response = await axios.delete(`http://localhost:8000/api/projects/${projectId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Incluye el token en los headers
          }
        });

        console.log(`Respuesta del backend después de eliminar el proyecto:`, response.status);

        if (response.status === 204) {
          console.log("Proyecto eliminado exitosamente. Actualizando estado de proyectos...");
          setProyectos(proyectos.filter(proj => proj.id !== projectId));
          alert("Proyecto eliminado exitosamente.");
          console.log("Estado de proyectos actualizado.");
        } else {
          console.warn("El backend respondió pero no con el status esperado (204).");
          alert("No se pudo eliminar el proyecto. Verifica los datos.");
        }
      } catch (error) {
        console.error("Error al eliminar el proyecto:", error.response || error.message);
        console.log("Detalles del error:", error);
        alert("Error al eliminar el proyecto. Revisa la consola para más detalles.");
      }
    } else {
      console.log("Eliminación del proyecto cancelada por el usuario.");
    }
  };

  /**
   * Función para guardar los cambios realizados en un proyecto editado.
   */
  const handleSaveProject = async () => {
    console.log("Intentando guardar los cambios en el proyecto:", editingProject);
    // Validación básica de campos obligatorios
    if (
      editingProject.codigo &&
      editingProject.cliente &&
      editingProject.fecha_inicio &&
      editingProject.fecha_termino &&
      editingProject.estado &&
      editingProject.folder_name
    ) {
      console.log("Todos los campos obligatorios están completos para la edición.");
      setLoading(true); // Indica que se está procesando la solicitud
      try {
        console.log(`Realizando solicitud PUT a 'http://localhost:8000/api/projects/${editingProject.id}/' con los datos actualizados...`);
        console.log("Datos actualizados del proyecto:", editingProject);

        const accessToken = localStorage.getItem("accessToken"); // Obtiene el token de acceso
        console.log(`Token de acceso para actualización: ${accessToken}`);

        // Realiza una solicitud PUT al backend para actualizar el proyecto
        const response = await axios.put(`http://localhost:8000/api/projects/${editingProject.id}/`, {
          codigo: editingProject.codigo,
          cliente: editingProject.cliente,
          correo: editingProject.correo,
          fecha_inicio: editingProject.fecha_inicio,
          fecha_termino: editingProject.fecha_termino,
          estado: editingProject.estado,
          inversion: editingProject.inversion ? parseFloat(editingProject.inversion) : null,
          folder_name: editingProject.folder_name,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Incluye el token en los headers
          }
        });

        console.log("Respuesta del backend después de actualizar el proyecto:", response.data);

        if (response.data) {
          console.log("Proyecto actualizado exitosamente. Actualizando estado de proyectos...");
          // Actualiza el proyecto en el estado de proyectos
          setProyectos(proyectos.map(proj =>
            proj.id === editingProject.id ? response.data : proj
          ));
          setShowEditModal(false); // Cierra el modal de edición
          alert("Proyecto actualizado exitosamente.");
          console.log("Estado de proyectos actualizado y modal cerrado.");
        } else {
          console.warn("La respuesta del backend no contiene datos actualizados.");
          alert("No se pudo actualizar el proyecto. Verifica los datos.");
        }
      } catch (error) {
        console.error("Error al actualizar el proyecto:", error.response || error.message);
        console.log("Detalles del error:", error);
        alert(`Error al actualizar el proyecto: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false); // Finaliza el estado de carga
        console.log("Finalizado el proceso de actualización del proyecto. Estado de carga:", loading);
      }
    } else {
      console.warn("Faltan campos obligatorios en la edición. No se puede guardar el proyecto.");
      alert("Por favor, completa todos los campos obligatorios.");
    }
  };

  /**
   * Filtra los documentos para mostrar solo los asociados al proyecto seleccionado.
   */
  const filteredDocuments = selectedProject ? documents.filter(doc => doc.projectCode === selectedProject) : documents;

  return (
    <div className="proyectos-app">
      {/* Encabezado con título y botón para crear un nuevo proyecto */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Administración de Proyectos</h1>
        <Button variant="dark" onClick={handleOpenNewProjectModal}>
          Nuevo Proyecto
        </Button>
      </div>

      {/* Mostrar mensaje de error si existe */}
      {error && (
        <Alert variant="danger">
          {error}
        </Alert>
      )}

      {/* Selector para filtrar proyectos */}
      <Form.Group className="mb-3">
        <Form.Label>Seleccionar Proyecto:</Form.Label>
        <Form.Control 
          as="select" 
          onChange={(e) => {
            console.log(`Proyecto seleccionado: ${e.target.value}`);
            setSelectedProject(e.target.value);
          }}
          value={selectedProject || ""}>
          <option value="">Todos los Proyectos</option>
          {proyectos.map(proyecto => (
            <option key={proyecto.id} value={proyecto.codigo}>
              {proyecto.codigo} - {proyecto.cliente}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      {/* Tabla de lista de proyectos */}
      <Card className="mb-4">
        <Card.Body>
          <h5>Lista de Proyectos</h5>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Término</th>
                <th>Estado</th>
                <th>Inversión</th>
                <th>ID Proyecto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.length > 0 ? (
                proyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>{proyecto.codigo}</td>
                    <td>{proyecto.cliente}</td>
                    <td>{proyecto.correo}</td>
                    <td>{proyecto.fecha_inicio}</td>
                    <td>{proyecto.fecha_termino}</td>
                    <td>{proyecto.estado}</td>
                    <td>${parseFloat(proyecto.inversion).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{proyecto.folder_id || 'N/A'}</td>
                    <td>
                      <Button 
                        variant="warning" 
                        size="sm" 
                        onClick={() => handleEditProject(proyecto)}
                        className="me-2"
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteProject(proyecto.id)}
                      >
                        <FaTrash /> Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No hay proyectos disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Tabla de documentos asociados al proyecto seleccionado */}
      <Card>
        <Card.Body>
          <h5>Documentos Asociados al Proyecto {selectedProject || "Todos"}</h5>
          <Table responsive bordered>
            <thead>
              <tr>
                <th>Nombre Documento</th>
                <th>Cliente</th>
                <th>Fecha Subido</th>
                <th>Tipo</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.nombre}</td>
                    <td>{doc.cliente}</td>
                    <td>{doc.fecha}</td>
                    <td>{doc.tipo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">No hay documentos para este proyecto.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para crear un nuevo proyecto */}
      <Modal show={showNewProjectModal} onHide={() => setShowNewProjectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Nuevo Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Creando...</span>
              </Spinner>
              <p>Creando proyecto y carpeta en Google Drive...</p>
            </div>
          ) : (
            <>
              {/* Campo de código (solo lectura) */}
              <Form.Group className="mb-3">
                <Form.Label>Código</Form.Label>
                <Form.Control type="text" value={newProject.codigo} readOnly />
              </Form.Group>
              
              {/* Campo de cliente */}
              <Form.Group className="mb-3">
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  value={newProject.cliente}
                  onChange={(e) => {
                    console.log(`Actualizando cliente: ${e.target.value}`);
                    setNewProject({ ...newProject, cliente: e.target.value });
                  }}
                  placeholder="Ingresa el nombre del cliente"
                  required
                />
              </Form.Group>
              
              {/* Campo de correo */}
              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={newProject.correo}
                  onChange={(e) => {
                    console.log(`Actualizando correo: ${e.target.value}`);
                    setNewProject({ ...newProject, correo: e.target.value });
                  }}
                  placeholder="Ingresa el correo electrónico"
                  required
                />
              </Form.Group>
              
              {/* Campo de fecha de inicio */}
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={newProject.fecha_inicio}
                  onChange={(e) => {
                    console.log(`Actualizando fecha de inicio: ${e.target.value}`);
                    setNewProject({ ...newProject, fecha_inicio: e.target.value });
                  }}
                  required
                />
              </Form.Group>
              
              {/* Campo de fecha de término */}
              <Form.Group className="mb-3">
                <Form.Label>Fecha Término</Form.Label>
                <Form.Control
                  type="date"
                  value={newProject.fecha_termino}
                  onChange={(e) => {
                    console.log(`Actualizando fecha de término: ${e.target.value}`);
                    setNewProject({ ...newProject, fecha_termino: e.target.value });
                  }}
                  required
                />
              </Form.Group>
              
              {/* Campo de estado */}
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  value={newProject.estado}
                  onChange={(e) => {
                    console.log(`Actualizando estado: ${e.target.value}`);
                    setNewProject({ ...newProject, estado: e.target.value });
                  }}
                  required
                >
                  <option value="">Selecciona el estado</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completado">Completado</option>
                  {/* Añade más opciones según tus necesidades */}
                </Form.Control>
              </Form.Group>
              
              {/* Campo de inversión */}
              <Form.Group className="mb-3">
                <Form.Label>Inversión</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={newProject.inversion}
                  onChange={(e) => {
                    console.log(`Actualizando inversión: ${e.target.value}`);
                    setNewProject({ ...newProject, inversion: e.target.value });
                  }}
                  placeholder="Ingresa la cantidad de inversión"
                  required
                />
              </Form.Group>
              
              {/* Campo de nombre de carpeta */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre de Carpeta</Form.Label>
                <Form.Control
                  type="text"
                  value={newProject.folder_name}
                  onChange={(e) => {
                    console.log(`Actualizando nombre de carpeta: ${e.target.value}`);
                    setNewProject({ ...newProject, folder_name: e.target.value });
                  }}
                  placeholder="Ingresa el nombre de la carpeta en Drive"
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* Botón para cancelar la creación del proyecto */}
          <Button variant="secondary" onClick={() => {
            console.log("Cancelando creación de nuevo proyecto.");
            setShowNewProjectModal(false);
          }}>
            Cancelar
          </Button>
          
          {/* Botón para guardar el nuevo proyecto (solo si no está cargando) */}
          {!loading && (
            <Button variant="primary" onClick={handleSaveNewProject}>
              Guardar Proyecto
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal para editar un proyecto existente */}
      <Modal show={showEditModal} onHide={() => {
        console.log("Cancelando edición del proyecto.");
        setShowEditModal(false);
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Proyecto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProject ? (
            <>
              {/* Campo de código (solo lectura) */}
              <Form.Group className="mb-3">
                <Form.Label>Código</Form.Label>
                <Form.Control type="text" value={editingProject.codigo} readOnly />
              </Form.Group>
              
              {/* Campo de cliente */}
              <Form.Group className="mb-3">
                <Form.Label>Cliente</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProject.cliente}
                  onChange={(e) => {
                    console.log(`Actualizando cliente en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, cliente: e.target.value });
                  }}
                  placeholder="Ingresa el nombre del cliente"
                  required
                />
              </Form.Group>
              
              {/* Campo de correo */}
              <Form.Group className="mb-3">
                <Form.Label>Correo</Form.Label>
                <Form.Control
                  type="email"
                  value={editingProject.correo}
                  onChange={(e) => {
                    console.log(`Actualizando correo en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, correo: e.target.value });
                  }}
                  placeholder="Ingresa el correo electrónico"
                  required
                />
              </Form.Group>
              
              {/* Campo de fecha de inicio */}
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control
                  type="date"
                  value={editingProject.fecha_inicio}
                  onChange={(e) => {
                    console.log(`Actualizando fecha de inicio en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, fecha_inicio: e.target.value });
                  }}
                  required
                />
              </Form.Group>
              
              {/* Campo de fecha de término */}
              <Form.Group className="mb-3">
                <Form.Label>Fecha Término</Form.Label>
                <Form.Control
                  type="date"
                  value={editingProject.fecha_termino}
                  onChange={(e) => {
                    console.log(`Actualizando fecha de término en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, fecha_termino: e.target.value });
                  }}
                  required
                />
              </Form.Group>
              
              {/* Campo de estado */}
              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  as="select"
                  value={editingProject.estado}
                  onChange={(e) => {
                    console.log(`Actualizando estado en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, estado: e.target.value });
                  }}
                  required
                >
                  <option value="">Selecciona el estado</option>
                  <option value="Nuevo">Nuevo</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completado">Completado</option>
                  {/* Añade más opciones según tus necesidades */}
                </Form.Control>
              </Form.Group>
              
              {/* Campo de inversión */}
              <Form.Group className="mb-3">
                <Form.Label>Inversión</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={editingProject.inversion}
                  onChange={(e) => {
                    console.log(`Actualizando inversión en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, inversion: e.target.value });
                  }}
                  placeholder="Ingresa la cantidad de inversión"
                  required
                />
              </Form.Group>
              
              {/* Campo de nombre de carpeta */}
              <Form.Group className="mb-3">
                <Form.Label>Nombre de Carpeta</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProject.folder_name}
                  onChange={(e) => {
                    console.log(`Actualizando nombre de carpeta en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, folder_name: e.target.value });
                  }}
                  placeholder="Ingresa el nombre de la carpeta en Drive"
                  required
                />
              </Form.Group>
            </>
          ) : (
            <p>Cargando datos del proyecto...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* Botón para cancelar la edición del proyecto */}
          <Button variant="secondary" onClick={() => {
            console.log("Cancelando edición del proyecto.");
            setShowEditModal(false);
          }}>
            Cancelar
          </Button>
          
          {/* Botón para guardar los cambios en el proyecto */}
          <Button variant="primary" onClick={handleSaveProject}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pie de página con logo */}
      <footer className="mt-4 footer-img-container">
        <img src="/logo.png" alt="Footer Logo" className="footer-img" />
      </footer>
    </div>
  );
};

export default Proyectos;
