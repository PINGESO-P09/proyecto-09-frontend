import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Image } from 'react-bootstrap';
import api from './api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Importar el archivo de estilos

function Login() {
    const [username, setUsername] = useState(''); // Estado para el nombre de usuario
    const [email, setEmail] = useState('');       // Estado para el correo electrónico
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const [message, setMessage] = useState('');   // Estado para mensajes de éxito
    const [error, setError] = useState('');       // Estado para mensajes de error
    const navigate = useNavigate();

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/', { username, email, password });
            console.log("Respuesta del servidor al loguear:", response.data); // Log para verificar la respuesta
            localStorage.setItem("accessToken", response.data.access);
            localStorage.setItem("refreshToken", response.data.refresh);
            setMessage("Inicio de sesión exitoso");
            navigate('/proyectos'); // Redirige al área de Proyectos
        } catch (error) {
            console.error("Error al iniciar sesión:", error.response || error.message);
            setError(error.response?.data?.error || "Error al iniciar sesión");
        }
    };

    return (
        <Container className="login-container">
            <Row className="w-100 justify-content-center">
                <Col md={6} lg={4}>
                    <Card className="login-card">
                        <Card.Body>
                            <Image src="/logo.png" alt="Logo" className="logo-img" />
                            <h2 className="text-center mb-4">Iniciar Sesión</h2>
                            {message && <p className="text-success text-center">{message}</p>}
                            {error && <p className="text-danger text-center">{error}</p>}
                            <Form onSubmit={handleSubmit}>
                                {/* Campo de Nombre de Usuario */}
                                <Form.Group controlId="username">
                                    <Form.Label>Nombre de Usuario</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                {/* Campo de Correo Electrónico */}
                                <Form.Group controlId="email" className="mt-3">
                                    <Form.Label>Correo Electrónico</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                {/* Campo de Contraseña */}
                                <Form.Group controlId="password" className="mt-3">
                                    <Form.Label>Contraseña</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Button type="submit" className="w-100 mt-4" variant="primary">
                                    Iniciar Sesión
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Login;
