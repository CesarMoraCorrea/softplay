# Arquitectura del Frontend - SoftPlay

Documento que describe la arquitectura y estructura del frontend de SoftPlay después de la refactorización basada en características (Feature-Based Architecture).

## 📁 Estructura General

```
src/
├── api/                      # Configuración global
│   └── axios.js              # Cliente HTTP con interceptores
├── components/               # Componentes globales reutilizables
│   ├── common/               # Componentes base (Button, Input, Card, etc.)
│   ├── layout/               # Componentes de estructura (Header, Footer, etc.)
│   ├── ui/                   # Componentes específicos de UI
│   ├── ProtectedRoute.jsx    # Rutas protegidas
│   └── ThemeSelector.jsx     # Selector de tema
├── contexts/                 # Contextos globales
│   └── ThemeContext.jsx      # Contexto de tema
├── features/                 # 🌟 CARACTERÍSTICAS (Feature-Based)
│   ├── Auth/                 # Autenticación (Login, Register)
│   │   ├── pages/
│   │   ├── views/
│   │   ├── services/
│   │   ├── contexts/
│   │   ├── index.js
│   │   └── README.md
│   ├── Canchas/              # Gestión de canchas
│   │   ├── pages/
│   │   ├── views/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── index.js
│   │   └── README.md
│   ├── Home/                 # Página de inicio
│   ├── Reservas/             # Gestión de reservas (future)
│   └── Admin/                # Panel administrativo (future)
├── hooks/                    # Custom hooks globales
├── layouts/                  # Layouts globales
│   └── DashboardLayout.jsx   # Layout principal con sidebar
├── lib/                      # Librerías y utilidades
├── pages/                    # Páginas aún no refactorizadas ⚠️
├── redux/                    # Gestión de estado global
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── canchasSlice.js
│       └── reservasSlice.js
├── styles/                   # Estilos globales
├── theme/                    # Configuración de temas
├── utils/                    # Utilidades globales
├── App.jsx                   # Componente raíz con rutas
├── main.jsx                  # Entry point
└── index.css                 # Estilos CSS principales
```

## 🎯 Feature-Based Architecture

Cada feature sigue la misma estructura:

```
features/[Feature]/
├── pages/                    # Páginas contenedoras (Smart Components)
│   └── [Feature]Page.jsx
├── views/                    # Componentes presentacionales (Dumb Components)
│   └── [Feature]View.jsx
├── components/               # Componentes específicos (Reusables dentro de feature)
├── services/                 # Llamadas HTTP específicas
│   └── [feature]Service.js
├── hooks/                    # Custom hooks específicos (future)
├── contexts/                 # Contextos locales (future)
├── utils/                    # Helpers y utilidades
├── index.js                  # Exportaciones públicas
└── README.md                 # Documentación de la feature
```

## ✅ Features Implementadas

### 1. **Auth** ✨ (Completado)
- **Ubicación**: `src/features/Auth/`
- **Páginas**: 
  - `pages/LoginPage.jsx` - Lógica de login
  - `pages/RegisterPage.jsx` - Lógica de registro
- **Vistas**:
  - `views/LoginView.jsx` - Presentación de login
  - `views/RegisterView.jsx` - Presentación de registro
- **Servicios**: `services/authService.js`
- **Funcionalidades**:
  - ✅ Login con CAPTCHA
  - ✅ Registro con validación
  - ✅ JWT Token management
  - ✅ Persistencia en localStorage
  - ✅ Protección de rutas
- **Rutas**:
  - POST `/api/auth/login`
  - POST `/api/auth/register`
  - GET `/api/auth/me`

### 2. **Canchas** 🏟️ (En Progreso)
- **Ubicación**: `src/features/Canchas/`
- **Servicios**: `services/canchasService.js` ✅ Creado
- **Funcionalidades**:
  - Listado de canchas
  - Búsqueda y filtrado
  - Geolocalización
  - CRUD (admin)
- **Rutas**:
  - GET `/api/canchas`
  - GET `/api/canchas/:id`
  - POST `/api/canchas`
  - PUT `/api/canchas/:id`
  - DELETE `/api/canchas/:id`

### 3. **Home** 🏠 (No iniciado)
- **Ubicación**: `src/features/Home/` (próximamente)
- **Actualmente**: `src/pages/home/`
- **Acciones Pendientes**:
  - [x] Crear carpeta features/Home
  - [ ] Mover componentes
  - [ ] Crear páginas contenedoras
  - [ ] Actualizar rutas

## 🔄 Flujo de Datos

**Page → View → Redux → Service → API**

```
1. PAGE (pages/*.jsx)
   ├─ Estado local (useState)
   ├─ Conecta Redux (useSelector/useDispatch)
   ├─ Efectos y validaciones (useEffect)
   └─ Pasa props a View

2. VIEW (views/*View.jsx)
   ├─ Props con datos y handlers
   ├─ Renderiza UI pura
   ├─ Llama callbacks para eventos
   └─ SIN lógica de negocio

3. SERVICE (services/*Service.js)
   ├─ Métodos reutilizables
   ├─ Llamadas axios
   ├─ Manejo de errores
   └─ Transformación de datos

4. REDUX (redux/slices/)
   ├─ Estado global
   ├─ Thunks async
   ├─ Actions
   └─ Reducers
```

## 🔌 Redux Slices

### authSlice
```javascript
{
  token: string | null,
  user: { id, name, email, role },
  loading: boolean,
  error: string | null
}
```

### canchasSlice
```javascript
{
  items: [],
  selected: null,
  loading: boolean,
  error: null,
  filters: {}
}
```

### reservasSlice
```javascript
{
  items: [],
  selected: null,
  loading: boolean,
  error: null
}
```

## 🛡️ Rutas de la Aplicación

### Públicas
```
GET  /                    → Redirige a /login
GET  /login               → LoginPage
GET  /register            → RegisterPage
GET  /canchas             → CanchasListPage
GET  /canchas/:id         → CanchaDetailPage
```

### Protegidas (Autenticadas)
```
GET  /home                → HomePage (user)
GET  /dashboard           → Dashboard (user)
GET  /mis-reservas        → MisReservasPage (user)
GET  /reservar/:id        → NuevaReservaPage (user)
GET  /reservas/:id        → ReservaDetailPage (user)
```

### Protegidas (Admin)
```
GET  /admin/canchas       → AdminCanchasPage (admin_cancha, admin_sistema)
GET  /admin/sistema       → AdminSistemaPage (admin_sistema)
```

## 📦 Importaciones Estándar

### Desde Features
```javascript
import { LoginPage, authService } from '../../features/Auth';
import { canchasService } from '../../features/Canchas';
```

### Desde Componentes Globales
```javascript
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { useTheme } from '../../contexts/ThemeContext';
```

### Desde Redux
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { loginThunk, logout } from '../../redux/slices/authSlice';
```

## 🎨 Estilos y Temas

- **Framework**: Tailwind CSS
- **Modo Oscuro**: context + localStorage
- **Animaciones**: Framer Motion
- **Iconos**: 
  - React Icons
  - Lucide React

## 📋 Checklist de Refactorización

- [x] Auth feature refactorizada
- [x] Canchas services creado
- [x] Actualizar App.jsx
- [ ] Home feature completada
- [ ] Reservas feature
- [ ] Admin feature
- [ ] Remover carpeta pages/
- [ ] Tests unitarios

## 🚀 Próximas Acciones

1. **Completar Auth Feature**
   - [x] LoginPage ✅
   - [x] RegisterPage ✅
   - [ ] ForgotPasswordPage
   - [ ] PasswordResetPage

2. **Refactorizar Canchas**
   - [ ] CanchasListPage
   - [ ] CanchaDetailPage
   - [ ] AdminCanchasPage

3. **Nuevas Features**
   - [ ] Home
   - [ ] Reservas
   - [ ] Admin
   - [ ] Profile

4. **Mejoras Generales**
   - [ ] Custom hooks por feature
   - [ ] Contexts locales
   - [ ] Error boundaries
   - [ ] Suspense boundaries
   - [ ] Tests E2E

## 📚 Referencias

- [Feature-First Architecture](https://angular.io/guide/styleguide)
- [Ducks Pattern](https://github.com/erikras/ducks-modular-redux)
- [Smart and Dumb Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

---

**Actualizado**: 18 de febrero de 2026  
**Versión**: 2.0.0 (Feature-Based Refactor)
