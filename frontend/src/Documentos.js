import React, { useState } from 'react';
import './Documentos.css';
import {
  Button,
  Col,
  Card,
  Table,
  Form,
  Dropdown,
  Modal
} from 'react-bootstrap';
import { FaUpload, FaFolderPlus, FaEdit, FaEllipsisH, FaTrash, FaDownload, FaExternalLinkAlt, FaPencilAlt } from 'react-icons/fa';

const Documentos = () => {
  const [documents, setDocuments] = useState([
    { folder: 'Cerrados', doc: 'Informe Dimensiones', client: 'ACME', date: '2022-01-23', type: 'Informe' },
    { folder: 'En Etapa 3', doc: 'Plano 3D', client: 'Coliseo Metropolitano', date: '2024-01-09', type: 'Plano' },
    { folder: 'Activos', doc: 'Análisis Financiero', client: 'Global Corp', date: '2023-08-15', type: 'Informe' },
    { folder: 'Finalizados', doc: 'Especificaciones Técnicas', client: 'Industrias Químicas', date: '2023-11-02', type: 'Manual' },
    { folder: 'Recientes', doc: 'Memoria de Cálculo', client: 'Inmobiliaria Sur', date: '2023-09-18', type: 'Informe' },
    { folder: 'En Proceso', doc: 'Maqueta VR', client: 'Museo Nacional', date: '2024-03-10', type: 'Plano' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isSortedAlphabetically, setIsSortedAlphabetically] = useState(false);
  const [isSortedByDate, setIsSortedByDate] = useState(false);

  // Estados para modales
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const [proyectos, setProyectos] = useState([
    { id: 1, name: 'Proyecto A' },
    { id: 2, name: 'Proyecto B' },
    { id: 3, name: 'Proyecto C' },
  ]);

  const [carpetas, setCarpetas] = useState(['Cerrados', 'En Etapa 3', 'Activos', 'Finalizados', 'Recientes', 'En Proceso']);

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

  const handleSortByDate = () => {
    const sortedDocuments = [...documents].sort((a, b) =>
      isSortedByDate ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)
    );
    setDocuments(sortedDocuments);
    setIsSortedByDate(!isSortedByDate);
    setIsSortedAlphabetically(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUploadDocument = (docType) => {
    setSelectedDocumentType(docType);
    setShowUploadDocumentModal(true);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setUploadedFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setUploadedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const closeUploadDocumentModal = () => {
    setUploadedFile(null);
    setSelectedFolder('');
    setShowUploadDocumentModal(false);
  };

  const handleConfirmUpload = () => {
    if (selectedFolder && uploadedFile) {
      const newDocument = {
        folder: selectedFolder,
        doc: uploadedFile.name,
        client: 'Cliente X',
        date: new Date().toISOString().split('T')[0],
        type: selectedDocumentType,
      };
      setDocuments([...documents, newDocument]);
      closeUploadDocumentModal();
    } else {
      alert('Selecciona una carpeta y un archivo para subir.');
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName && selectedProject) {
      const projectName = proyectos.find((p) => p.id === parseInt(selectedProject))?.name || '';
      const newFolder = `${projectName}/${newFolderName}`;
      setCarpetas([...carpetas, newFolder]);
      setShowCreateFolderModal(false);
      setNewFolderName('');
      setSelectedProject('');
    } else {
      alert('Selecciona un proyecto y escribe un nombre para la carpeta.');
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.doc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="documentos-app d-flex">
      <Col xs={12} className="main-content p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">Administración Documentos</h1>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Button variant="outline-secondary" className="me-2" onClick={handleSortAlphabetically}>
              Ordenar {isSortedAlphabetically ? 'Z-A' : 'A-Z'}
            </Button>
            <Button variant="outline-secondary" className="me-2" onClick={handleSortByDate}>
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
          <Button variant="dark" onClick={() => setShowCreateFolderModal(true)}>
            <FaFolderPlus /> Crear carpeta
          </Button>
        </div>

        <div className="search-container mb-4">
          <Form.Control
            type="text"
            placeholder="Buscar Doc"
            className="search-input"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

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
            <Form.Group>
              <Form.Label>Seleccionar Carpeta</Form.Label>
              <Form.Control
                as="select"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">Selecciona una carpeta</option>
                {carpetas.map((folder, index) => (
                  <option key={index} value={folder}>
                    {folder}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
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
              <Form.Control type="file" onChange={handleFileSelect} style={{ display: 'none' }} />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeUploadDocumentModal}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleConfirmUpload}>
              Subir Documento
            </Button>
          </Modal.Footer>
        </Modal>

        <footer className="mt-4 footer-img-container">
          <img src="/logo.png" alt="Footer Logo" className="footer-img" />
        </footer>
      </Col>
    </div>
  );
};

export default Documentos;
