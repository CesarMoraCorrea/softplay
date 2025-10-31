# Arquitectura del Frontend

## Estructura de Directorios

```
src/
├── assets/               # Recursos estáticos (imágenes, fuentes, etc.)
├── components/           # Componentes reutilizables
│   ├── common/           # Componentes básicos (Button, Input, Card, etc.)
│   ├── forms/            # Componentes de formularios
│   ├── layout/           # Componentes de estructura (Header, Footer, Sidebar)
│   ├── modals/           # Componentes de modales y diálogos
│   └── ui/               # Componentes de interfaz específicos
├── config/               # Configuraciones globales
├── contexts/             # Contextos de React
├── features/             # Módulos de características específicas
│   ├── auth/             # Autenticación (login, registro, recuperación)
│   ├── canchas/          # Gestión de canchas
│   ├── profile/          # Perfil de usuario
│   └── reservas/         # Gestión de reservas
├── hooks/                # Hooks personalizados
├── layouts/              # Layouts de la aplicación
├── lib/                  # Utilidades y funciones auxiliares
├── pages/                # Páginas de la aplicación
├── services/             # Servicios de API
├── styles/               # Estilos globales
├── theme/                # Configuración de temas
└── utils/                # Utilidades generales
```

## Módulos Principales

### Autenticación (auth)
- Login
- Registro
- Recuperación de contraseña
- Gestión de sesiones

### Canchas
- Listado de canchas
- Detalle de cancha
- Búsqueda y filtrado

### Reservas
- Creación de reservas
- Gestión de reservas
- Historial de reservas

### Perfil de Usuario
- Visualización de datos
- Edición de perfil
- Preferencias

### Administración
- Gestión de canchas
- Gestión de usuarios
- Configuración del sistema

## Tecnologías y Patrones

### Frontend
- React con Vite
- Redux Toolkit para gestión de estado
- React Router para navegación
- Tailwind CSS para estilos
- Framer Motion para animaciones

### Patrones de Diseño
- Arquitectura basada en características (Feature-based)
- Componentes atómicos
- Container/Presentational pattern
- Custom hooks para lógica reutilizable

### Temas
- Sistema de temas claro/oscuro
- Personalización de colores
- Accesibilidad

## Flujo de Datos

1. **Servicios API**: Comunicación con el backend
2. **Redux Store**: Gestión de estado global
3. **Contextos**: Estado compartido entre componentes relacionados
4. **Props**: Paso de datos entre componentes

## Estrategia de Implementación

1. Configurar estructura base y dependencias
2. Implementar sistema de temas y componentes base
3. Desarrollar módulo de autenticación
4. Implementar layouts principales
5. Desarrollar módulos de características específicas
6. Integrar animaciones y feedback visual
7. Optimizar rendimiento y accesibilidad
8. Pruebas y ajustes finales