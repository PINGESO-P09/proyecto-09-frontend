// Proyectos.js

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Para solicitudes HTTP
import './Proyectos.css'; // Asegúrate de que este archivo CSS exista y esté correctamente configurado
import { Button, Card, Table, Form, Modal, Spinner, Alert } from 'react-bootstrap'; // Componentes de React Bootstrap
import { FaEdit, FaTrash } from 'react-icons/fa'; // Íconos para botones de acción

const Proyectos = () => {
  
  // Estados para manejar proyectos y carpetas
  const [proyectos, setProyectos] = useState([]);
  const [folders, setFolders] = useState([]);
  
  // Estados para manejar modales
  const [editingProject, setEditingProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  
  // Estado para manejar el nuevo proyecto
  const [newProject, setNewProject] = useState({
    titulo: '',
    cliente: '',
    correo: '',
    fecha_inicio: '',
    fecha_termino: '',
    estado: '',
    inversion: '',
  });

  // Estado para manejar loading y errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado para manejar el proyecto seleccionado
  const [selectedProject, setSelectedProject] = useState('');  // ID del proyecto
  const [selectedProjectName, setSelectedProjectName] = useState('');  // Nombre del proyecto

  /**
   * Función para formatear fechas de manera segura
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} - Fecha formateada o mensaje de error.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Fecha Inválida" : date.toLocaleDateString('es-ES');
  };

  /**
   * useEffect para obtener la lista de proyectos desde el backend cuando el componente se monta.
   */
  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Obtener el token de acceso

        if (!accessToken) {
          console.error("No se encontró el token de acceso.");
          setError("No se encontró el token de acceso. Por favor, inicia sesión nuevamente.");
          return;
        }

        // Solicitud GET para obtener proyectos
        const response = await axios.get('http://localhost:8000/api/projects/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        console.log("Proyectos obtenidos:", response.data); // Log para depuración

        // Ajusta según la estructura de tu API
        if (response.data.results) {
          setProyectos(response.data.results);
        } else {
          setProyectos(response.data);
        }
      } catch (error) {
        console.error("Error al obtener los proyectos:", error.response || error.message);
        setError("No se pudieron obtener los proyectos. Revisa la consola para más detalles.");
      }
    };

    fetchProyectos();
  }, []);

  /**
   * useEffect para obtener las carpetas asociadas al proyecto seleccionado.
   * Si no se selecciona ningún proyecto, obtiene todas las carpetas.
   */
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // Obtener el token de acceso

        if (!accessToken) {
          console.error("No se encontró el token de acceso.");
          setError("No se encontró el token de acceso. Por favor, inicia sesión nuevamente.");
          return;
        }

        let url = '';

        if (selectedProject) {
          console.log(`Obteniendo carpetas para el proyecto ID: ${selectedProject}`);
          url = `http://localhost:8000/api/proyectos/${selectedProject}/carpetas/`;
        } else {
          console.log("Obteniendo todas las carpetas de todos los proyectos.");
          url = `http://localhost:8000/api/carpeta/`; // Asegúrate de que este endpoint exista y devuelva todas las carpetas
        }

        // Solicitud GET para obtener carpetas
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        console.log("Carpetas obtenidas:", response.data); // Log para depuración

        // Añadir log para cada carpeta
        response.data.forEach(folder => {
          console.log(`Carpeta: ${folder.folder_name}, created_at: ${folder.created_at}`);
        });

        setFolders(response.data); // Ajusta según la estructura de tu API
      } catch (error) {
        console.error("Error al obtener las carpetas:", error.response || error.message);
        //setError("No se pudieron obtener las carpetas. Revisa la consola para más detalles.");
      }
    };

    fetchFolders();
  }, [selectedProject]);

  /**
   * Función para manejar la selección de un proyecto
   */
  const handleSelectProject = (event) => {
    const selected = proyectos.find((p) => p.id === parseInt(event.target.value));
    if (selected) {
      setSelectedProject(selected.id);  // Guarda el ID del proyecto
      setSelectedProjectName(selected.titulo);  // Guarda el nombre del proyecto
    } else {
      setSelectedProject('');
      setSelectedProjectName('');
    }
  };

  /**
   * Función para abrir el modal de nuevo proyecto
   */
  const handleOpenNewProjectModal = () => {
    console.log("Abriendo modal para nuevo proyecto...");
    setNewProject({
      titulo: '',
      cliente: '',
      correo: '',
      fecha_inicio: '',
      fecha_termino: '',
      estado: '',
      inversion: '',
    });
    setShowNewProjectModal(true);
    console.log("Modal para nuevo proyecto abierto.");
  };

  /**
   * Función para guardar un nuevo proyecto
   */
  const handleSaveNewProject = async () => {
    console.log("Intentando guardar un nuevo proyecto...");

    // Validación básica de campos obligatorios
    if (
      newProject.titulo &&
      newProject.cliente &&
      newProject.fecha_inicio &&
      newProject.fecha_termino &&
      newProject.estado
    ) {
      console.log("Todos los campos obligatorios están completos.");
      setLoading(true); // Indica que se está procesando la solicitud

      // Validación extra: Asegúrate de que las fechas sean válidas y la inversión esté en formato numérico
      const isValidFechaInicio = !isNaN(new Date(newProject.fecha_inicio).getTime());
      const isValidFechaTermino = !isNaN(new Date(newProject.fecha_termino).getTime());
      const isValidInversion = !isNaN(parseFloat(newProject.inversion));

      if (!isValidFechaInicio || !isValidFechaTermino) {
        alert("Las fechas de inicio y término deben tener un formato válido.");
        setLoading(false);
        return;
      }

      if (!isValidInversion) {
        alert("La inversión debe ser un número válido.");
        setLoading(false);
        return;
      }

      try {
        console.log("Enviando solicitud POST a 'http://localhost:8000/api/create-project/' con los datos del proyecto...");
        console.log("Datos del nuevo proyecto:", newProject);

        // Solicitud POST para crear proyecto
        const response = await axios.post('http://localhost:8000/api/create-project/', {
          titulo: newProject.titulo,
          cliente: newProject.cliente,
          correo: newProject.correo,
          fecha_inicio: newProject.fecha_inicio,
          fecha_termino: newProject.fecha_termino,
          estado: newProject.estado,
          inversion: newProject.inversion ? parseFloat(newProject.inversion) : null,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        console.log("Respuesta del backend después de crear el proyecto:", response.data);

        if (response.data.project) {
          console.log("Proyecto creado exitosamente. Actualizando estado de proyectos...");
          setProyectos([...proyectos, response.data.project]);
          setShowNewProjectModal(false);
          alert("Proyecto creado con éxito.");
          console.log("Estado de proyectos actualizado y modal cerrado.");
        } else {
          console.warn("La respuesta del backend no contiene 'project'. Verifica los datos enviados.");
          alert("No se pudo guardar el proyecto. Verifica los datos.");
        }
      } catch (error) {
        console.error("Error al guardar el proyecto:", error.response || error.message);
        console.log("Detalles del error:", error);

        if (error.response && error.response.data) {
          console.log("Detalles del error del backend:", error.response.data);
        }

        alert(`Error al guardar el proyecto: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false);
        console.log("Finalizado el proceso de creación del proyecto. Estado de carga:", loading);
      }
    } else {
      console.warn("Faltan campos obligatorios. No se puede guardar el proyecto.");
      alert("Por favor, completa todos los campos obligatorios.");
    }
  };

  /**
   * Función para manejar la edición de un proyecto
   */
  const handleEditProject = (project) => {
    console.log("Abriendo modal para editar el proyecto:", project);
    setEditingProject({
      id: project.id,
      titulo: project.titulo,
      cliente: project.cliente,
      correo: project.correo,
      fecha_inicio: project.fecha_inicio,
      fecha_termino: project.fecha_termino,
      estado: project.estado,
      inversion: project.inversion,
    });
    setShowEditModal(true);
    console.log("Modal de edición abierto.");
  };

  /**
   * Función para guardar los cambios en un proyecto editado
   */
  const handleSaveProject = async () => {
    console.log("Intentando guardar los cambios en el proyecto:", editingProject);

    if (!editingProject || !editingProject.id) {
      console.error("No se ha seleccionado un proyecto para editar.");
      alert("No se ha seleccionado un proyecto válido para editar.");
      return;
    }

    // Validación básica de campos obligatorios
    if (
      editingProject.titulo &&
      editingProject.cliente &&
      editingProject.fecha_inicio &&
      editingProject.fecha_termino &&
      editingProject.estado
    ) {
      console.log("Todos los campos obligatorios están completos para la edición.");
      setLoading(true); // Indica que se está procesando la solicitud
      try {
        console.log(`Realizando solicitud PUT a 'http://localhost:8000/api/projects/${editingProject.id}/' con los datos actualizados...`);
        console.log("Datos actualizados del proyecto:", editingProject);

        const accessToken = localStorage.getItem("accessToken");
        console.log(`Token de acceso para actualización: ${accessToken}`);

        // Solicitud PUT para actualizar proyecto
        const response = await axios.put(`http://localhost:8000/api/projects/${editingProject.id}/`, {
          titulo: editingProject.titulo,
          cliente: editingProject.cliente,
          correo: editingProject.correo,
          fecha_inicio: editingProject.fecha_inicio,
          fecha_termino: editingProject.fecha_termino,
          estado: editingProject.estado,
          inversion: editingProject.inversion ? parseFloat(editingProject.inversion) : null,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        console.log("Respuesta del backend después de actualizar el proyecto:", response.data);

        if (response.data) {
          console.log("Proyecto actualizado exitosamente. Actualizando estado de proyectos...");
          setProyectos(prevProyectos => {
            const updatedProyectos = prevProyectos.map(proj => 
              proj.id === editingProject.id ? { ...proj, ...response.data } : proj
            );
            return updatedProyectos;
          });
          setShowEditModal(false);
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
        setLoading(false);
        console.log("Finalizado el proceso de actualización del proyecto. Estado de carga:", loading);
      }
    } else {
      console.warn("Faltan campos obligatorios en la edición. No se puede guardar el proyecto.");
      alert("Por favor, completa todos los campos obligatorios.");
    }
  };

  /**
   * Función para manejar la eliminación de un proyecto
   */
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("¿Seguro que quieres eliminar este proyecto?")) {
      setLoading(true); // Muestra el indicador de carga

      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("No se encontró el token de acceso.");
          alert("No se encontró el token de acceso.");
          return;
        }

        // Solicitud DELETE para eliminar proyecto
        const response = await axios.delete(`http://localhost:8000/api/projects/${projectId}/delete/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (response.status === 204) {
          // Elimina el proyecto del estado
          setProyectos(prevProyectos => prevProyectos.filter(proj => proj.id !== projectId));
          alert("Proyecto eliminado con éxito.");
        } else {
          alert("No se pudo eliminar el proyecto.");
        }
      } catch (error) {
        console.error("Error al eliminar el proyecto:", error.response || error.message);
        alert("Error al eliminar el proyecto.");
      } finally {
        setLoading(false);
      }
    }
  };

  /**
   * Funciones para manejar carpetas
   */

  /**
   * Función para editar una carpeta (Implementa según tus necesidades)
   */
  const handleEditFolder = (folder) => {
    // Implementa la lógica para editar la carpeta
    console.log("Editar carpeta:", folder);
    // Por ejemplo, abrir un modal para editar el nombre de la carpeta
  };

  /**
   * Función para eliminar una carpeta
   */
  const handleDeleteFolder = async (folderId) => {
    if (window.confirm("¿Seguro que quieres eliminar esta carpeta?")) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          console.error("No se encontró el token de acceso.");
          setError("No se encontró el token de acceso. Por favor, inicia sesión nuevamente.");
          return;
        }

        // Solicitud DELETE para eliminar carpeta
        const response = await axios.delete(`http://localhost:8000/api/carpeta/${folderId}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          }
        });

        if (response.status === 204) {
          // Elimina la carpeta del estado
          setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
          alert("Carpeta eliminada con éxito.");
        } else {
          alert("No se pudo eliminar la carpeta.");
        }
      } catch (error) {
        console.error("Error al eliminar la carpeta:", error.response || error.message);
        alert("Error al eliminar la carpeta.");
      }
    }
  };

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

      {/* Dropdown para seleccionar proyecto */}
      <Form.Group className="mt-3">
        <Form.Label>Seleccionar Proyecto</Form.Label>
        <Form.Control
          as="select"
          value={selectedProject}
          onChange={handleSelectProject}
        >
          <option value="">Todos los Proyectos</option>
          {proyectos.map(proyecto => (
            <option key={proyecto.id} value={proyecto.id}>
              {proyecto.titulo} 
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
                <th>Título</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Fecha Inicio</th>
                <th>Fecha Término</th>
                <th>Estado</th>
                <th>Inversión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.length > 0 ? (
                proyectos.map((proyecto) => (
                  <tr key={proyecto.id}>
                    <td>{proyecto.titulo}</td>
                    <td>{proyecto.cliente}</td>
                    <td>{proyecto.correo}</td>
                    <td>{formatDate(proyecto.fecha_inicio)}</td>
                    <td>{formatDate(proyecto.fecha_termino)}</td>
                    <td>{proyecto.estado}</td>
                    <td>${parseFloat(proyecto.inversion).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        
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
                  <td colSpan="8" className="text-center">No hay proyectos disponibles.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Tabla de carpetas asociadas al proyecto seleccionado */}
      <Card className="mb-4">
        <Card.Body>
          <h5>Carpetas Asociadas al Proyecto {selectedProjectName || "Todos"}</h5>
          <div className="table-responsive">
            <Table responsive bordered>
              <thead>
                <tr>
                  <th>Nombre Carpeta</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {folders.length > 0 ? (
                  folders.map((folder) => (
                    <tr key={folder.id}>
                      <td>{folder.folder_name}</td>
                      <td>{formatDate(folder.created_at)}</td> {/* Asegúrate de que 'created_at' esté presente */}
                      <td>
                        {/* Acciones sobre la carpeta */}
                        <Button 
                          variant="warning" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditFolder(folder)}
                        >
                          <FaEdit /> Editar
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleDeleteFolder(folder.id)}
                        >
                          <FaTrash /> Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No hay carpetas para este proyecto.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
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
              <p>Creando proyecto...</p>
            </div>
          ) : (
            <>
              {/* Campo de título */}
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newProject.titulo} 
                  onChange={(e) => {
                    console.log(`Actualizando título: ${e.target.value}`);
                    setNewProject({ ...newProject, titulo: e.target.value });
                  }} 
                  placeholder="Ingresa el título del proyecto"
                  required
                />
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

          {/* Botón para guardar el nuevo proyecto */}
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
              {/* Campo de título */}
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={editingProject.titulo}
                  onChange={(e) => {
                    console.log(`Actualizando título en edición: ${e.target.value}`);
                    setEditingProject({ ...editingProject, titulo: e.target.value });
                  }}
                  required
                />
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
