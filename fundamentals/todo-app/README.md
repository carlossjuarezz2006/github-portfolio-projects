# 📝 Todo App

Una aplicación completa de gestión de tareas desarrollada con React y Node.js/Express, que incluye autenticación, CRUD completo, y una interfaz moderna y responsiva.

![Todo App](https://via.placeholder.com/800x400/667eea/ffffff?text=Todo+App+Screenshot)

## 🚀 Características

- ✅ **Autenticación completa** - Registro, login y logout
- 📝 **CRUD de tareas** - Crear, leer, actualizar y eliminar
- 🔍 **Búsqueda y filtros** - Buscar por texto y filtrar por estado
- 📊 **Estadísticas** - Contador de tareas totales, completadas y pendientes
- 🎨 **UI moderna** - Interfaz responsive con Material-UI
- 🔐 **Seguridad** - JWT tokens, validación y rate limiting
- 🧪 **Testing** - Tests unitarios incluidos
- 📱 **Responsive** - Optimizada para móviles y desktop

## 🛠️ Tecnologías

### Backend
- Node.js
- Express.js
- JWT para autenticación
- bcrypt para encriptación
- Jest para testing
- Helmet para seguridad

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios para HTTP
- React Toastify para notificaciones

## 📦 Instalación y Uso

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn

### Backend
```bash
cd backend
npm install
npm start  # Para producción
npm run dev  # Para desarrollo (con nodemon)
npm test  # Para ejecutar tests
```

### Frontend
```bash
cd frontend
npm install
npm start  # Inicia en http://localhost:3000
npm test  # Para ejecutar tests
npm run build  # Para construir para producción
```

## 🌐 Variables de Entorno

Crea un archivo `.env` en la carpeta backend:

```env
PORT=5000
JWT_SECRET=tu-jwt-secret-muy-seguro
NODE_ENV=development
```

Para el frontend, crea un archivo `.env` en la carpeta frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Tareas (requieren autenticación)
- `GET /api/todos` - Obtener todas las tareas del usuario
- `POST /api/todos` - Crear nueva tarea
- `PUT /api/todos/:id` - Actualizar tarea
- `DELETE /api/todos/:id` - Eliminar tarea

### Utilidad
- `GET /api/health` - Estado del servidor

## 🎯 Funcionalidades Principales

### Para el Usuario
1. **Registro e Inicio de Sesión**
   - Formularios validados con feedback inmediato
   - Manejo seguro de contraseñas
   - Persistencia de sesión

2. **Gestión de Tareas**
   - Crear tareas con título y descripción
   - Marcar como completadas/pendientes
   - Editar tareas existentes
   - Eliminar tareas con confirmación

3. **Organización**
   - Buscar tareas por texto
   - Filtrar por estado (todas, pendientes, completadas)
   - Ver estadísticas en tiempo real

### Para el Desarrollador
1. **Arquitectura Limpia**
   - Separación clara entre frontend y backend
   - Componentes reutilizables
   - Manejo centralizado del estado

2. **Seguridad**
   - Validación tanto en frontend como backend
   - Tokens JWT con expiración
   - Rate limiting para prevenir abuse
   - Encriptación de contraseñas

3. **Testing y Calidad**
   - Tests unitarios en backend
   - Configuración lista para CI/CD
   - Linting y formateo de código

## 🚀 Despliegue

### Backend (Heroku/Railway/DigitalOcean)
```bash
# Configurar variables de entorno
# Ejecutar: npm start
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Subir carpeta build/
```

## 📖 Estructura del Proyecto

```
todo-app/
├── backend/
│   ├── server.js          # Servidor principal
│   ├── package.json       # Dependencias backend
│   ├── jest.config.js     # Configuración tests
│   └── tests/
│       └── server.test.js # Tests de API
└── frontend/
    ├── public/
    │   └── index.html     # HTML base
    ├── src/
    │   ├── components/    # Componentes reutilizables
    │   ├── pages/         # Páginas principales
    │   ├── contexts/      # Context API de React
    │   ├── services/      # Servicios y API calls
    │   ├── utils/         # Utilidades
    │   ├── App.js         # Componente principal
    │   └── index.js       # Punto de entrada
    └── package.json       # Dependencias frontend
```

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🔮 Próximas Características

- [ ] Categorías para las tareas
- [ ] Fechas de vencimiento
- [ ] Compartir tareas entre usuarios
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Exportar tareas a PDF
- [ ] API móvil con React Native

## 📞 Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@ejemplo.com

Link del Proyecto: [https://github.com/tu-usuario/todo-app](https://github.com/tu-usuario/todo-app)

---

⭐️ Si este proyecto te fue útil, ¡no olvides darle una estrella!

