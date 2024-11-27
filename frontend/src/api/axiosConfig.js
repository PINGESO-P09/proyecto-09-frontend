import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Cambia esta URL si tu backend está en otro host
    withCredentials: true, // Habilitar cookies, si es necesario
});



api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        // Token expirado o inválido
        // Aquí puedes agregar lógica para refrescar el token o hacer logout
        console.error('Token de acceso inválido');
        // Ejemplo de redirección (necesitarás importar navigate si estás usando react-router)
        // window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );// Funciones de servicio de API
  export const authService = {
    login: (username, password) => {
      return api.post('auth/', { username, password });
    }
  };
  
  export const projectService = {
    getProyectos: () => {
      return api.get('projects/');
    },
    createProyecto: (proyectoData) => {
      return api.post('projects/', proyectoData);
    }
  };

  export default api;