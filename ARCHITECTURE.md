# 🏗️ Arquitectura del Frontend - SoftPlay

## Estructura General

```
frontend/
├── src/
│   ├── features/                  # Features basadas en módulos
│   │   ├── Auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── RegisterPage.jsx
│   │   │   ├── views/
│   │   │   │   ├── LoginView.jsx
│   │   │   │   └── RegisterView.jsx
│   │   │   ├── services/
│   │   │   │   └── authService.js
│   │   │   ├── index.js
│   │   │   └── README.md
│   │   └── canchas/
│   │       ├── services/
│   │       │   └── canchasService.js
│   │       ├── index.js
│   │       └── README.md
│   ├── pages/                     # Páginas públicas
│   ├── components/                # Componentes reutilizables
│   ├── layouts/                   # Layouts
│   ├── redux/                     # Estado global
│   │   ├── store.js
│   │   ├── slices/
│   │   └── ...
│   ├── api/
│   │   └── axios.js              # Instancia configurada
│   ├── contexts/                  # Context API
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

## Patrón Feature-Based Architecture

### Estructura de un Feature

Cada feature tiene:
- **pages/**: Componentes contenedores (smart components)
- **views/**: Componentes presentacionales (dumb components)
- **services/**: Lógica de negocio y llamadas HTTP
- **index.js**: Exporta los componentes principales
- **README.md**: Documentación del feature

### Ejemplo: Auth Feature

```javascript
// pages/LoginPage.jsx - Smart Component
// Maneja lógica, estado, efectos, validación
import { authService } from '../services/authService';

export default function LoginPage() {
  // Lógica aquí
  return <LoginView {...props} />;
}

// views/LoginView.jsx - Dumb Component
// Solo recibe props y renderiza
export default function LoginView({ email, password, onSubmit }) {
  return <form onSubmit={onSubmit}>...</form>;
}

// services/authService.js - Servicio
export const authService = {
  login: async (credentials) => {...},
  register: async (userData) => {...},
  getMe: async () => {...}
};
```

## Features Disponibles

### 1. **Auth** ✨ Refactorizado
- Autenticación JWT
- Registro de usuarios
- Gestión de tokens
- Servicio centralizado: `authService`
- Métodos:
  - `login(credentials)` - Iniciar sesión
  - `register(userData)` - Registrarse
  - `getMe()` - Obtener usuario actual
  - `saveToken(token)` - Guardar JWT
  - `getToken()` - Obtener JWT
  - `clearAuth()` - Limpiar sesión

### 2. **Canchas** ✨ Refactorizado
- CRUD de canchas
- Búsqueda y filtros
- Geolocalización
- Carga de imágenes
- Servicio centralizado: `canchasService`
- Métodos:
  - `getAll(filters)` - Listar con filtros
  - `getById(id)` - Obtener detalle
  - `create(data)` - Crear cancha (admin)
  - `update(id, data)` - Actualizar (admin)
  - `delete(id)` - Eliminar (admin)
  - `uploadImage(formData)` - Cargar imagen
  - `searchByLocation(lat, lng, radius)` - Geobúsqueda

## Stack Tecnológico

- **Framework**: React 18.2 + Vite 5.3
- **State Management**: Redux Toolkit 2.8
- **Routing**: React Router 6.30
- **HTTP Client**: Axios con interceptores
- **Styling**: Tailwind CSS
- **Animaciones**: Framer Motion
- **API Calls**: Axios con servicio abstraction

## Ventajas de Feature-Based Architecture

✅ **Escalabilidad**: Fácil agregar nuevos features
✅ **Mantenibilidad**: Todo relacionado en un lugar
✅ **Reutilización**: Services compartibles
✅ **Testing**: Componentes aislados
✅ **Colaboración**: Equipos pueden trabajar en paralelo

## Cambios en esta Versión

- ✨ Refactorización a Feature-Based Architecture
- 📁 Separación clara de concerns (pages/views/services)
- 🚀 Mejor escalabilidad y mantenibilidad
- 📚 Documentación completa de cada feature
- 🔄 Container/Presentational pattern consolidado
