// Documentos.js

import React, { useState, useEffect, useCallback } from 'react';
import './Documentos.css';
import {
  Button,
  Col,
  Card,
  Table,
  Form,
  Dropdown,
  Modal,
  Alert,
  Spinner
} from 'react-bootstrap';
import { 
  FaUpload, 
  FaFolderPlus, 
  FaEllipsisH, 
  FaTrash, 
  FaDownload, 
  FaExternalLinkAlt, 
  FaPencilAlt 
} from 'react-icons/fa';
import axios from 'axios';
import { useDropzone } from 'react-dropzone'; // Importar useDropzone

// Configuración de la instancia de Axios con la URL base
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Asegúrate de que este sea el puerto correcto de tu backend
});

const Documentos = () => {
  // Estado para documentos, inicializado como arreglo vacío
  const [documents, setDocuments] = useState([]);

  // Estados para búsqueda y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortedAlphabetically, setIsSortedAlphabetically] = useState(false);
  const [isSortedByDate, setIsSortedByDate] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]); // Manejar múltiples archivos

  // Estado para controlar si se está subiendo
  const [isUploading, setIsUploading] = useState(false);

  // Estado para controlar si se está creando una carpeta
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Estados para modales
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para gestionar carpetas y proyectos
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [foldersForSelectedProject, setFoldersForSelectedProject] = useState([]);
  const [projects, setProjects] = useState([]);

  // Estado para manejar el archivo a eliminar
  const [fileToDelete, setFileToDelete] = useState(null);

  // Estados para mensajes de éxito/error
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [messageVariant, setMessageVariant] = useState('success'); // 'success', 'info' o 'danger'

  /**
   * Función para formatear fechas de manera segura
   * @param {string} dateString - La cadena de fecha a formatear.
   * @returns {string} - Fecha formateada o mensaje de error.
   */
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Fecha Inválida";
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  };

  /**
   * useEffect para obtener la lista de proyectos desde el backend cuando el componente se monta.
   */
  useEffect(() => {
    const fetchProjectTitles = async () => {
      try {
        const response = await axiosInstance.get('/api/projects/titles/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`, // Asume que el token está almacenado en localStorage
          }
        });
        console.log('Proyectos obtenidos:', response.data); // Depuración
        setProjects(response.data);
      } catch (error) {
        console.error("Error al obtener los proyectos:", error.response || error.message);
        setMessage("Error al obtener los proyectos.");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      }
    };
    fetchProjectTitles();
  }, []);

  /**
   * useEffect para obtener la lista de documentos desde el backend cuando el componente se monta.
   */
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/api/api_file/', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          }
        });
        console.log("Respuesta de /api/api_file/:", response.data); // Depuración
        // Verificar si response.data.results es un arreglo
        if (Array.isArray(response.data.results)) {
          setDocuments(response.data.results);
        } else {
          console.error("Formato de respuesta inesperado:", response.data);
          setMessage("Formato de datos de documentos no válido.");
          setMessageVariant('danger');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }
      } catch (error) {
        console.error("Error al obtener los documentos:", error.response || error.message);
        setMessage("Error al obtener los documentos.");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      }
    };
    fetchDocuments();
  }, []);

  /**
   * useEffect para obtener las carpetas asociadas al proyecto seleccionado.
   */
  useEffect(() => {
    const fetchFolders = async () => {
      if (selectedProject && selectedProject.id) {
        try {
          const response = await axiosInstance.get(`/api/proyectos/${selectedProject.id}/carpetas/`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
            }
          });
          console.log('Carpetas obtenidas:', response.data); // Depuración
          setFoldersForSelectedProject(response.data);
          if (response.data.length === 0) {
            setMessage("No hay carpetas para este proyecto.");
            setMessageVariant('info');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
          }
        } catch (error) {
          console.error('Error al obtener carpetas:', error.response || error.message);
          setMessage("Error al obtener las carpetas del proyecto seleccionado.");
          setMessageVariant('danger');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }
      } else {
        setFoldersForSelectedProject([]);
      }
    };
    fetchFolders();
  }, [selectedProject]);

  /**
   * Función para manejar la selección de proyecto
   */
  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    const selected = projects.find(proyecto => proyecto.id === parseInt(projectId));
    setSelectedProject(selected || null);
    setSelectedFolder(''); // Resetear carpeta seleccionada al cambiar de proyecto
    console.log('Proyecto seleccionado:', selected); // Depuración
  };

  /**
   * Función para manejar la selección de carpeta
   */
  const handleFolderChange = (e) => {
    const folderId = e.target.value;
    setSelectedFolder(folderId);
  };

  /**
   * Función para manejar búsqueda
   */
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Función para filtrar documentos según la búsqueda
   */
  const filteredDocuments = Array.isArray(documents) ? documents.filter((doc) =>
    doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  /**
   * Función para manejar la descarga de un documento
   */
  const handleDownload = (doc) => {
    if (doc.web_view_link) {
      window.open(doc.web_view_link, '_blank');
    } else {
      setMessage("No se encontró el enlace para descargar el archivo.");
      setMessageVariant('danger');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  };

  /**
   * Función para abrir el modal de eliminación
   */
  const handleDeleteClick = (doc) => {
    setFileToDelete(doc);
    setShowDeleteModal(true);
  };

  /**
   * Función para confirmar la eliminación de un documento
   */
  const confirmDelete = async () => {
    if (!fileToDelete) return;

    try {
      // Realizar solicitud DELETE a la URL correcta
      await axiosInstance.delete(`/api/delete-file/${fileToDelete.id}/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
        }
      });
      // Actualizar el estado de documentos eliminando el documento borrado
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== fileToDelete.id));
      setMessage("Archivo eliminado con éxito.");
      setMessageVariant('success');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } catch (error) {
      console.error("Error al eliminar el archivo:", error.response || error.message);
      setMessage(`Error al eliminar el archivo: ${error.response?.data?.message || error.message}`);
      setMessageVariant('danger');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } finally {
      setShowDeleteModal(false);
      setFileToDelete(null);
    }
  };

  /**
   * Función para manejar la subida de archivos con react-dropzone
   */
  const onDrop = useCallback((acceptedFiles) => {
    setUploadedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: '*/*', // Acepta cualquier tipo de archivo
    multiple: true
  });

  /**
   * Función para confirmar la subida de documentos
   */
  const handleConfirmUpload = async () => {
    // Verificar si hay carpeta seleccionada y archivos añadidos
    console.log('Carpeta Seleccionada:', selectedFolder);
    console.log('Número de Archivos:', uploadedFiles.length);
    
    if (selectedFolder && uploadedFiles.length > 0) {
      setIsUploading(true); // Iniciar el proceso de subida
      try {
        const formData = new FormData();
        
        // Añadir los archivos al FormData
        uploadedFiles.forEach(file => {
          formData.append('files', file);
        });

        // Añadir folder_id en el cuerpo de la solicitud
        formData.append('folder_id', selectedFolder);

        // Construir la URL correctamente
        const uploadUrl = `/api/upload-drive-files/`; // Asegúrate de que este endpoint existe en tu backend

        const response = await axiosInstance.post(uploadUrl, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });

        if (response.status === 200 || response.status === 201) {
          setMessage('Archivo(s) subido(s) con éxito.');
          setMessageVariant('success');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);

          // Actualizar el estado de documentos
          const newUploadedFiles = Array.isArray(response.data.uploaded_files) ? response.data.uploaded_files.map(file => ({
            folder: {
              folder_name: foldersForSelectedProject.find(folder => folder.folder_id === selectedFolder)?.folder_name || 'Sin carpeta'
            },
            name: file.name,
            client: 'Cliente X', // Ajusta según tus datos
            created_at: file.created_at, // Asegúrate de que este campo existe en la respuesta
            id: file.id, // Asegúrate de que cada archivo tenga un id único
            web_view_link: file.web_view_link || '', // Asegúrate de que este campo existe si es necesario
          })) : [];

          setDocuments((prevDocs) => [...prevDocs, ...newUploadedFiles]);

          // Cerrar el modal y resetear estados
          closeUploadDocumentModal();
        } else {
          setMessage('Error al subir el(los) archivo(s).');
          setMessageVariant('danger');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }
      } catch (error) {
        console.error("Error al subir el(los) archivo(s):", error.response ? error.response.data : error.message);
        setMessage(error.response?.data?.error || "Ocurrió un error al subir el(los) archivo(s).");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      } finally {
        setIsUploading(false); // Finalizar el proceso de subida
      }
    } else {
      // Si llega aquí es porque no se seleccionó carpeta o no hay archivos agregados
      alert('Selecciona una carpeta y uno o más archivos para subir.');
    }
  };

  /**
   * Función para abrir el modal de subida de archivos
   */
  const handleUploadDocument = () => {
    setShowUploadDocumentModal(true);
    setUploadedFiles([]);
    setSelectedProject(null);
    setSelectedFolder('');
  };

  /**
   * Función para cerrar el modal de subida de archivos
   */
  const closeUploadDocumentModal = () => {
    setShowUploadDocumentModal(false);
    setUploadedFiles([]);
    setSelectedProject(null);
    setSelectedFolder('');
  };

  /**
   * Función para crear una nueva carpeta
   */
  const handleCreateFolder = async () => {
    if (newFolderName && selectedProject) {
      setIsCreatingFolder(true); // Iniciar el proceso de creación de carpeta
      const projectName = projects.find((p) => p.id === parseInt(selectedProject.id))?.name || '';
      const newFolder = `${projectName}/${newFolderName}`;

      try {
        // Realiza la solicitud al backend para crear la carpeta
        const response = await axiosInstance.post('/api/create-folder/', {
          folder_name: newFolder,
          project_id: selectedProject.id, // Enviar el project_id correctamente
        });

        if (response.status === 201) {
          setMessage(`Carpeta '${newFolder}' creada con éxito.`);
          setMessageVariant('success');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);

          // Asumiendo que response.data es la nueva carpeta creada
          setFoldersForSelectedProject([...foldersForSelectedProject, response.data]);

          // Cerrar el modal y resetear estados
          setShowCreateFolderModal(false);
          setNewFolderName('');
          setSelectedProject(null);
        } else {
          console.error("Error al crear la carpeta: ", response);
          setMessage("Error al crear la carpeta.");
          setMessageVariant('danger');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 5000);
        }
      } catch (error) {
        console.error("Error al crear la carpeta:", error.response || error.message);
        setMessage("Ocurrió un error al crear la carpeta. Verifica los detalles.");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);
      } finally {
        setIsCreatingFolder(false); // Finalizar el proceso de creación de carpeta
      }
    } else {
      setMessage('Selecciona un proyecto y escribe un nombre para la carpeta.');
      setMessageVariant('danger');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    }
  };

  /**
   * Función para ordenar alfabéticamente
   */
  const handleSortAlphabetically = () => {
    const sortedDocuments = [...documents].sort((a, b) =>
      isSortedAlphabetically
        ? b.name.localeCompare(a.name)
        : a.name.localeCompare(b.name)
    );
    setDocuments(sortedDocuments);
    setIsSortedAlphabetically(!isSortedAlphabetically);
    setIsSortedByDate(false);
  };

  /**
   * Función para ordenar por fecha
   */
  const handleSortByDate = () => {
    const sortedDocuments = [...documents].sort((a, b) =>
      isSortedByDate ? new Date(a.created_at) - new Date(b.created_at) : new Date(b.created_at) - new Date(a.created_at)
    );
    setDocuments(sortedDocuments);
    setIsSortedByDate(!isSortedByDate);
    setIsSortedAlphabetically(false);
  };

  return (
    <div className="documentos-app d-flex flex-column" style={{ height: '100vh', overflowY: 'auto' }}>
      <Col xs={12} className="main-content p-4" style={{ flex: '1 0 auto' }}>
        {/* Mensajes de alerta */}
        {showMessage && (
          <Alert variant={messageVariant} onClose={() => setShowMessage(false)} dismissible>
            {message}
          </Alert>
        )}

        {/* Título */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Administración de Documentos</h1>
        </div>

        {/* Botones de Ordenación y Creación de Carpeta */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
          <div className="d-flex flex-wrap">
            <Button 
              variant="outline-secondary" 
              className="me-2 mb-2" 
              onClick={handleSortAlphabetically}
            >
              Ordenar {isSortedAlphabetically ? 'Z-A' : 'A-Z'}
            </Button>
            <Button 
              variant="outline-secondary" 
              className="me-2 mb-2" 
              onClick={handleSortByDate}
            >
              Ordenar por Fecha {isSortedByDate ? 'Ascendente' : 'Descendente'}
            </Button>
            <Dropdown className="mb-2">
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                <FaUpload /> Subir archivo
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleUploadDocument}>Subir cualquier archivo</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowCreateFolderModal(true)}
            disabled={isCreatingFolder} // Deshabilitar durante la creación de carpeta
            className="mb-2"
          >
            <FaFolderPlus /> {isCreatingFolder ? 'Creando...' : 'Crear Carpeta'}
          </Button>
        </div>

        {/* Campo de Búsqueda */}
        <div className="search-container mb-4">
          <Form.Control
            type="text"
            placeholder="Buscar Documento"
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Tabla de Documentos */}
        <Card>
          <Card.Body>
            <Table responsive bordered hover>
              <thead>
                <tr>
                  <th>Nombre Carpeta</th>
                  <th>Nombre Documento</th>
                  <th>Cliente</th>
                  <th>Fecha Subido</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.folder ? doc.folder.folder_name : 'Sin carpeta'}</td>
                      <td>{doc.name}</td>
                      <td>{doc.client}</td>
                      <td>{formatDate(doc.created_at)}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <FaEllipsisH />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleDownload(doc)}>
                              <FaDownload /> Descargar
                            </Dropdown.Item>
                            <Dropdown.Item href={doc.web_view_link} target="_blank" rel="noopener noreferrer">
                              <FaExternalLinkAlt /> Abrir
                            </Dropdown.Item>
                            {/* Puedes implementar la funcionalidad de renombrar según tus necesidades */}
                            <Dropdown.Item onClick={() => {/* Implementa la función de renombrar */}}>
                              <FaPencilAlt /> Cambiar nombre
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDeleteClick(doc)} className="text-danger">
                              <FaTrash /> Borrar
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No hay archivos disponibles.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Modal para Crear Carpeta */}
        <Modal show={showCreateFolderModal} onHide={() => setShowCreateFolderModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Crear Carpeta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Nombre de la Carpeta</Form.Label>
              <Form.Control
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ingresa el nombre de la carpeta"
              />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Label>Seleccionar Proyecto</Form.Label>
              <Form.Control
                as="select"
                value={selectedProject ? selectedProject.id : ''}
                onChange={handleProjectChange}
                disabled={isCreatingFolder} // Deshabilitar mientras se crea la carpeta
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowCreateFolderModal(false)}
              disabled={isCreatingFolder} // Deshabilitar durante la creación de carpeta
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCreateFolder}
              disabled={isCreatingFolder} // Deshabilitar durante la creación de carpeta
            >
              {isCreatingFolder ? 'Creando...' : 'Crear Carpeta'} {/* Cambiar el texto según el estado */}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para Subir Archivos */}
        <Modal show={showUploadDocumentModal} onHide={closeUploadDocumentModal}>
          <Modal.Header closeButton>
            <Modal.Title>Subir Archivo(s)</Modal.Title> {/* Título actualizado */}
          </Modal.Header>
          <Modal.Body>
            {/* Seleccionar Proyecto */}
            <Form.Group>
              <Form.Label>Seleccionar Proyecto</Form.Label>
              <Form.Control 
                as="select" 
                value={selectedProject ? selectedProject.id : ''} 
                onChange={handleProjectChange}
                disabled={isUploading} // Deshabilitar mientras se sube
              >
                <option value="">Seleccionar Proyecto</option>
                {projects.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Seleccionar Carpeta */}
            {selectedProject && (
              <Form.Group className="mt-3">
                <Form.Label>Seleccionar Carpeta</Form.Label>
                <Form.Control 
                  as="select" 
                  value={selectedFolder} 
                  onChange={handleFolderChange}
                  disabled={isUploading} // Deshabilitar mientras se sube
                >
                  <option value="">Seleccionar Carpeta</option>
                  {foldersForSelectedProject.map((folder) => (
                    <option key={folder.folder_id} value={folder.folder_id}>
                      {folder.folder_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}

            {/* Área de Subida de Archivos con react-dropzone */}
            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''}`}
              style={{
                border: '2px dashed #cccccc',
                borderRadius: '5px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#e6f7ff' : '#ffffff',
                marginTop: '20px'
              }}
            >
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <p>Suelta los archivos aquí...</p> :
                  <p>Arrastra uno o más archivos aquí o haz clic para seleccionar</p>
              }
              <Button variant="secondary" className="mt-2" disabled={isUploading}>Seleccionar Archivo(s)</Button>
            </div>

            {/* Mostrar la lista de archivos seleccionados */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3">
                <h5>Archivos seleccionados:</h5>
                <ul>
                  {uploadedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={closeUploadDocumentModal}
              disabled={isUploading} // Deshabilitar mientras se sube
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleConfirmUpload}
              disabled={isUploading} // Deshabilitar durante la subida
            >
              {isUploading ? <Spinner animation="border" size="sm" /> : 'Subir Archivo(s)'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal para Confirmar Eliminación */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {fileToDelete && (
              <p>¿Estás seguro de que deseas eliminar el archivo <strong>{fileToDelete.name}</strong>?</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Eliminar
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Footer */}
        <footer className="mt-4 footer-img-container">
          <img src="/logo.png" alt="Footer Logo" className="footer-img" />
        </footer>
      </Col>
    </div>
  );
};

export default Documentos;
