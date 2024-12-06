import React, { useState, useEffect } from 'react';
import './Documentos.css';
import {
  Button,
  Col,
  Card,
  Table,
  Form,
  Dropdown,
  Modal,
  Alert
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

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8000', // Asegúrate de que este sea el puerto correcto de tu backend
});

const Documentos = () => {
  // Estado para documentos
  const [documents, setDocuments] = useState([
    { folder: 'Cerrados', doc: 'Informe Dimensiones', client: 'ACME', date: '2022-01-23', type: 'Informe' },
    // ... otros documentos
  ]);

  // Estados para búsqueda y ordenación
  const [searchTerm, setSearchTerm] = useState('');
  const [isSortedAlphabetically, setIsSortedAlphabetically] = useState(false);
  const [isSortedByDate, setIsSortedByDate] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedFile, setUploadedFile] = useState([]);
  // Aquí solo usamos uploadedFiles (un array) para todos los archivos


  // Estados para modales
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [foldersForSelectedProject, setFoldersForSelectedProject] = useState([]);
  const [carpetas, setCarpetas] = useState([]);


  // Estado para proyectos
  const [proyectos, setProyectos] = useState([]);

  // Estados para mensajes de éxito/error
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [messageVariant, setMessageVariant] = useState('success'); // 'success', 'info' o 'danger'

  // Fetch de proyectos desde la API
  useEffect(() => {
    const fetchProjectTitles = async () => {
      try {
        const response = await axiosInstance.get('/api/projects/titles/');
        console.log('Proyectos obtenidos:', response.data); // Depuración
        setProyectos(response.data);
      } catch (error) {
        console.error("Error al obtener los proyectos:", error);
        setMessage("Error al obtener los proyectos.");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    };
    fetchProjectTitles();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axiosInstance.get('/api/api_file/');
        setDocuments(response.data);
      } catch (error) {
        console.error("Error al obtener los documentos:", error);
        setMessage("Error al obtener los documentos.");
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    };
    fetchDocuments();
  }, []);

  // Fetch de carpetas cuando se selecciona un proyecto
  useEffect(() => {
    const fetchFolders = async () => {
      if (selectedProject && selectedProject.id) {
        try {
          const response = await axiosInstance.get(`/api/proyectos/${selectedProject.id}/carpetas/`);
          console.log('Carpetas obtenidas:', response.data); // Depuración
          setFoldersForSelectedProject(response.data);
          if (response.data.length === 0) {
            setMessage("No hay carpetas para este proyecto.");
            setMessageVariant('info');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
          }
        } catch (error) {
          console.error('Error al obtener carpetas:', error);
          setMessage("Error al obtener las carpetas del proyecto seleccionado.");
          setMessageVariant('danger');
          setShowMessage(true);
          setTimeout(() => setShowMessage(false), 3000);
        }
      } else {
        setFoldersForSelectedProject([]);
      }
    };
    fetchFolders();
  }, [selectedProject]); // Solo depende de selectedProject



  // Manejar cambio de proyecto
  const handleProjectChange = (event) => {
    const projectId = event.target.value;
    const selected = proyectos.find(proyecto => proyecto.id === parseInt(projectId));
    setSelectedProject(selected || null);
    setSelectedFolder(''); // Resetear carpeta seleccionada al cambiar de proyecto
    console.log('Proyecto seleccionado:', selected); // Depuración
  };

  // Manejar cambio de carpeta
  const handleFolderChange = (e) => {
    setSelectedFolder(e.target.value);
  };

   // Documentos.js

   // Actualizar esta función para usar uploadedFiles
   // Función para confirmar la subida de documentos
// Función para confirmar la subida
const handleConfirmUpload = async () => {
  // Verificar si hay carpeta seleccionada y archivos añadidos
  console.log(selectedFolder);
  console.log(uploadedFiles.length);
  if (selectedFolder && uploadedFiles.length > 0) {
    try {
      const formData = new FormData();
      formData.append('folder_id', selectedFolder);
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await axiosInstance.post('/api/upload-files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 200) {
        setMessage('Documento(s) subido(s) con éxito.');
        setMessageVariant('success');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);

        // Actualizar el estado de documentos (asumiendo que response.data.uploaded_files contiene la info)
        const newUploadedFiles = response.data.uploaded_files.map(file => ({
          folder: selectedFolder,
          doc: file.name,
          client: 'Cliente X',
          date: new Date().toISOString().split('T')[0],
          type: selectedDocumentType,
        }));
        setDocuments((prevDocs) => [...prevDocs, ...newUploadedFiles]);

        // Cerrar el modal y resetear estados
        closeUploadDocumentModal();
      } else {
        setMessage('Error al subir el(los) documento(s).');
        setMessageVariant('danger');
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
      }
    } catch (error) {
      console.error("Error al subir el(los) documento(s):", error.response ? error.response.data : error.message);
      setMessage(error.response?.data?.error || "Ocurrió un error al subir el(los) documento(s).");
      setMessageVariant('danger');
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }
  } else {
    // Si llega aquí es porque no se seleccionó carpeta o no hay archivos agregados
    alert('Selecciona una carpeta y uno o más archivos para subir.');
  }
};
  

  // Ordenar alfabéticamente
  const handleSortAlphabetically = () => {
    const sortedDocuments = [...documents].sort((a, b) =>
      isSortedAlphabetically
        ? b.doc.localeCompare(a.doc)
        : a.doc.localeCompare(b.doc)
    );
    setDocuments(sortedDocuments);
    setIsSortedAlphabetically(!isSortedAlphabetically);
    setIsSortedByDate(false);
  };

  // Ordenar por fecha
  const handleSortByDate = () => {
    const sortedDocuments = [...documents].sort((a, b) =>
      isSortedByDate ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
    );
    setDocuments(sortedDocuments);
    setIsSortedByDate(!isSortedByDate);
    setIsSortedAlphabetically(false);
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUploadDocument = (docType) => {
    setSelectedDocumentType(docType);
    setShowUploadDocumentModal(true);
    setSelectedProject(null);
    setSelectedFolder('');
    setUploadedFiles([]); // Reiniciar la lista al abrir el modal
  };

// Manejar arrastrar sobre el área (para evitar comportamiento por defecto)
const handleDragOver = (e) => {
  e.preventDefault();
};

// Cuando selecciones archivos desde el input
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
};

// Cuando arrastres y sueltes archivos en el área
const handleFileDrop = (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
};

 // Cerrar modal de subir documento
const closeUploadDocumentModal = () => {
  setUploadedFiles([]); // Vaciar la lista de archivos al cerrar el modal
  setSelectedFolder('');
  setSelectedProject(null);
  setSelectedDocumentType('');
  setShowUploadDocumentModal(false);
};


  const handleCreateFolder = async () => {
    if (newFolderName && selectedProject) {
      const projectName = proyectos.find((p) => p.id === parseInt(selectedProject))?.name || '';
      const newFolder = `${projectName}/${newFolderName}`;
  
      try {
        // Realiza la solicitud al backend para crear la carpeta
        const response = await axios.post('http://localhost:8000/api/create-folder/', {
          folder_name: newFolder,
          project_id: selectedProject, // Asegúrate de enviar el project_id también
        });
  
        if (response.status === 201) {
          alert(`Carpeta '${newFolder}' creada con éxito.`);
  
          // Actualiza las carpetas y cierra el modal
          setCarpetas([...carpetas, newFolder]);
          setShowCreateFolderModal(false);
          setNewFolderName('');
          setSelectedProject('');
  
          // Mostrar el mensaje de éxito
          setMessage('Carpeta creada con éxito.');
          setShowMessage(true);
  
          // Ocultar el mensaje después de 3 segundos
          setTimeout(() => setShowMessage(false), 3000);
        } else {
          console.error("Error al crear la carpeta: ", response);
        }
      } catch (error) {
        console.error("Error al crear la carpeta:", error.response ? error.response.data : error.message);
        alert("Ocurrió un error al crear la carpeta. Verifica los detalles.");
      }
    } else {
      alert('Selecciona un proyecto y escribe un nombre para la carpeta.');
    }
  };

  // Filtrar documentos según búsqueda
  const filteredDocuments = documents.filter((doc) =>
    doc.doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="documentos-app d-flex">
      <Col xs={12} className="main-content p-4">
        {/* Mensajes de alerta */}
        {showMessage && (
          <Alert variant={messageVariant} onClose={() => setShowMessage(false)} dismissible>
            {message}
          </Alert>
        )}

        {/* Título */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Administración Documentos</h1>
        </div>

        {/* Botones de Ordenación y Subida de Documentos */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={handleSortAlphabetically}
            >
              Ordenar {isSortedAlphabetically ? 'Z-A' : 'A-Z'}
            </Button>
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={handleSortByDate}
            >
              Ordenar por Fecha {isSortedByDate ? 'Ascendente' : 'Descendente'}
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                <FaUpload /> Subir documento
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleUploadDocument('Informe')}>Informe</Dropdown.Item>
                <Dropdown.Item onClick={() => handleUploadDocument('Plano')}>Plano</Dropdown.Item>
                <Dropdown.Item onClick={() => handleUploadDocument('Excel')}>Excel</Dropdown.Item>
                <Dropdown.Item onClick={() => handleUploadDocument('Presentación')}>Presentación</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowCreateFolderModal(true)}
          >
            <FaFolderPlus /> Crear Carpeta
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
            <div className="table-scroll">
              <Table responsive bordered>
                <thead>
                  <tr>
                    <th>Nombre Carpeta</th>
                    <th>Nombre Documento</th>
                    <th>Cliente</th>
                    <th>Fecha Subido</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc, index) => (
                    <tr key={index}>
                      <td>{doc.folder}</td>
                      <td>{doc.doc}</td>
                      <td>{doc.client}</td>
                      <td>{doc.date}</td>
                      <td>{doc.type}</td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <FaEllipsisH />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item href="#/download">
                              <FaDownload /> Descargar
                            </Dropdown.Item>
                            <Dropdown.Item href="#/open">
                              <FaExternalLinkAlt /> Abrir
                            </Dropdown.Item>
                            <Dropdown.Item href="#/rename">
                              <FaPencilAlt /> Cambiar nombre
                            </Dropdown.Item>
                            <Dropdown.Item href="#/delete" className="text-danger">
                              <FaTrash /> Borrar
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

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
                />
              </Form.Group>
              <Form.Group className="mt-3">
                <Form.Label>Seleccionar Proyecto</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                >
                  <option value="">Selecciona un proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowCreateFolderModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreateFolder}>
                Crear Carpeta
              </Button>
            </Modal.Footer>
        </Modal>

        <Modal show={showUploadDocumentModal} onHide={closeUploadDocumentModal}>
          <Modal.Header closeButton>
            <Modal.Title>Subir {selectedDocumentType}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Seleccionar Proyecto */}
            <Form.Group>
              <Form.Label>Seleccionar Proyecto</Form.Label>
              <Form.Control 
                as="select" 
                value={selectedProject?.id || ''} 
                onChange={handleProjectChange}
              >
                <option value="">Seleccionar Proyecto</option>
                {proyectos.map((proyecto) => (
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
                >
                  <option value="">Seleccionar Carpeta</option>
                  {foldersForSelectedProject.map((folder) => (
                  <option key={folder.id} value={folder.folder_id}>
                    {folder.folder_name}
                  </option>
                ))}
                </Form.Control>
              </Form.Group>
            )}

            {/* Área de Subida de Archivo */}
            <div
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              style={{
                border: '2px dashed #ccc',
                borderRadius: '5px',
                padding: '20px',
                textAlign: 'center',
                marginTop: '20px',
                cursor: 'pointer',
              }}
            >
              {uploadedFile ? (
                <p>{uploadedFile.name}</p>
              ) : (
                <p>Arrastra un archivo aquí o haz clic para seleccionar</p>
              )}
              <Form.Control 
                type="file" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
                id="file-upload"
              />
              <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block', marginTop: '10px' }}>
                <Button variant="secondary">Seleccionar Archivo</Button>
              </label>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeUploadDocumentModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmUpload}>
              Subir Documento(s)
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
