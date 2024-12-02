// Proyectos.js

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
    titulo: '',
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
    { id: 1, projectTitle: 'IN/1001/24', nombre: 'Informe Dimensiones', cliente: 'ACME', fecha: '2022-01-23', tipo: 'Informe' },
    { id: 2, projectTitle: 'IN/1002/24', nombre: 'Plano 3D', cliente: 'Museo Nacional', fecha: '2022-01-09', tipo: 'Plano' },
    { id: 3, projectTitle: 'IN/1003/24', nombre: 'Análisis Financiero', cliente: 'Coliseo Metropolitano', fecha: '2023-08-15', tipo: 'Informe' },
    { id: 4, projectTitle: 'IN/1004/24', nombre: 'Especificaciones Técnicas', cliente: 'Mausoleo Colón', fecha: '2023-11-02', tipo: 'Manual' },
  ]);

  // Estado para indicar si se está procesando una solicitud (creación o edición de proyecto)
  const [loading, setLoading] = useState(false);

  // Estado para manejar errores generales
  const [error, setError] = useState(null);

  /**
   * Función para generar un nuevo título de proyecto automáticamente.
   * Asegura que el título sea único incrementando el número hasta encontrar uno disponible.
   */
  const generateProjectTitle = () => {
    console.log("Generando nuevo título de proyecto...");
    const year = new Date().getFullYear().toString().slice(-2); // Obtiene los dos últimos dígitos del año actual
    let lastNumber = 1000; // Número inicial si no hay proyectos existentes

    if (proyectos.length > 0) {
      // Extrae los números de los títulos existentes
      const numbers = proyectos
        .map(proj => {
          const parts = proj.titulo.split('/');
          const number = parts.length === 3 ? parseInt(parts[1], 10) : null;
          console.log(`Proyecto existente: ${proj.titulo} - Número extraído: ${number}`);
          return number;
        })
        .filter(n => !isNaN(n));

      if (numbers.length > 0) {
        lastNumber = Math.max(...numbers);
        console.log(`Último número de proyecto encontrado: ${lastNumber}`);
      }
    }

    let newNumber = lastNumber + 1;
    let newTitulo = `IN/${newNumber}/${year}`;
    console.log(`Título de proyecto generado inicialmente: ${newTitulo}`);
    
    // Verifica si el título ya existe y, de ser así, incrementa hasta encontrar uno único
    while (proyectos.some(proj => proj.titulo === newTitulo)) {
      console.log(`El título ${newTitulo} ya existe. Incrementando número...`);
      newNumber += 1;
      newTitulo = `IN/${newNumber}/${year}`;
      console.log(`Nuevo título de proyecto generado: ${newTitulo}`);
    }

    console.log(`Título de proyecto final generado: ${newTitulo}`);
    return newTitulo;
  };

  const handleOpenNewProjectModal = () => {
    console.log("Abriendo modal para nuevo proyecto...");
    setNewProject({
      titulo: '', // Titulo vacío para que el usuario lo ingrese
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
 * Envía una solicitud POST al backend para crear el proyecto.
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

      // Realiza una solicitud POST al backend para crear el proyecto
      const response = await axios.post('http://localhost:8000/api/create-project/', {
        titulo: newProject.titulo,
        cliente: newProject.cliente,
        correo: newProject.correo,
        fecha_inicio: newProject.fecha_inicio,
        fecha_termino: newProject.fecha_termino,
        estado: newProject.estado,
        inversion: newProject.inversion ? parseFloat(newProject.inversion) : null,
        // Elimina 'folder_name' de la solicitud
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
        alert(`Proyecto creado con éxito.`);
        console.log("Estado de proyectos actualizado y modal cerrado.");
      } else {
        console.warn("La respuesta del backend no contiene 'project'. Verifica los datos enviados.");
        alert("No se pudo guardar el proyecto. Verifica los datos.");
      }
    } catch (error) {
      console.error("Error al guardar el proyecto:", error.response || error.message);
      console.log("Detalles del error:", error);

      // Imprime los detalles del error para obtener más información
      if (error.response && error.response.data) {
        console.log("Detalles del error del backend:", error.response.data);
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

const handleEditProject = (project) => {
  console.log("Abriendo modal para editar el proyecto:", project);
  setEditingProject(project); // Asegúrate de que el proyecto se está asignando correctamente
  setShowEditModal(true); // Muestra el modal de edición
  console.log("Modal de edición abierto.");
};


  /**
   * Función para manejar la eliminación de un proyecto.
   * @param {number} projectId - El ID del proyecto que se va a eliminar.
   */
  const handleDeleteProject = async (projectId) => {
    if (window.confirm("¿Seguro que quieres eliminar este proyecto?")) {
      setLoading(true); // Muestra el indicador de carga
  
      try {
        const accessToken = localStorage.getItem("accessToken"); // Obtiene el token de acceso
        if (!accessToken) {
          console.error("No se encontró el token de acceso.");
          alert("No se encontró el token de acceso.");
          return;
        }
  
        // Realiza la solicitud DELETE al backend para eliminar el proyecto
        const response = await axios.delete(`http://localhost:8000/api/projects/${projectId}/delete/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`, // Incluye el token de acceso en los headers
          }
        });
  
        if (response.status === 204) {
          // El proyecto se eliminó con éxito
          setProyectos(prevProyectos => prevProyectos.filter(proj => proj.id !== projectId)); // Actualiza el estado eliminando el proyecto
          alert("Proyecto eliminado con éxito.");
        } else {
          alert("No se pudo eliminar el proyecto.");
        }
      } catch (error) {
        console.error("Error al eliminar el proyecto:", error.response || error.message);
        alert("Error al eliminar el proyecto.");
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    }
  };
  
  

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
        const accessToken = localStorage.getItem("accessToken"); // Obtiene el token de acceso
        if (!accessToken) {
          console.error("No se ha encontrado el token de acceso.");
          alert("No se ha encontrado el token de acceso.");
          return;
        }
  
        console.log(`Token de acceso para actualización: ${accessToken}`);
  
        const response = await axios.put(`http://localhost:8000/api/projects/${editingProject.id}/`, {
          titulo: editingProject.titulo,
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
          setProyectos(prevProyectos => {
            const updatedProyectos = prevProyectos.map(proj => 
              proj.id === editingProject.id ? { ...proj, ...response.data } : proj
            );
            return updatedProyectos;
          });
          setShowEditModal(false); // Cierra el modal
          alert("Proyecto actualizado exitosamente.");
        } else {
          alert("No se pudo actualizar el proyecto. Verifica los datos.");
        }
      } catch (error) {
        console.error("Error al actualizar el proyecto:", error.response || error.message);
        alert(`Error al actualizar el proyecto: ${error.response?.data?.error || error.message}`);
      } finally {
        setLoading(false); // Finaliza el estado de carga
      }
    } else {
      alert("Por favor, completa todos los campos obligatorios.");
    }
  };
  
  

  /**
   * Filtra los documentos para mostrar solo los asociados al proyecto seleccionado.
   */
  const filteredDocuments = selectedProject ? documents.filter(doc => doc.projectTitle === selectedProject) : documents;


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
                <th>Titulo</th>
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
                    <td>{proyecto.fecha_inicio}</td>
                    <td>{proyecto.fecha_termino}</td>
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
              {/* Campo de título (editable) */}
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

              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  value={newProject.titulo}
                  onChange={(e) => {
                    console.log(`Actualizando título: ${e.target.value}`);
                    setNewProject({ ...newProject, titulo: e.target.value });
                  }}
                  placeholder="Ingresa el nombre del proyecto"
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
