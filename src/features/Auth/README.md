# Auth Feature

Módulo de autenticación de SoftPlay con arquitectura basada en características (feature-based).

## Estructura

```
features/Auth/
├── pages/
│   ├── LoginPage.jsx          # Página de login (lógica y estado)
│   └── RegisterPage.jsx       # Página de registro (lógica y estado)
├── views/
│   ├── LoginView.jsx          # Vista presentacional de login
│   └── RegisterView.jsx       # Vista presentacional de registro
├── services/
│   └── authService.js         # Servicio con llamadas HTTP
├── contexts/                  # Contextos locales del módulo (future)
├── index.js                   # Exportaciones públicas
└── README.md                  # Este archivo
```

## Flujo de Datos

1. **Page** (`*Page.jsx`)
   - Maneja estado local
   - Comunica con Redux
   - Valida datos
   - Pasa datos y handlers a View

2. **View** (`*View.jsx`)
   - Componente presentacional puro
   - Recibe datos via props
   - Renderiza UI
   - No tiene lógica de negocio

3. **Service** (`authService.js`)
   - Lógica de peticiones HTTP
   - Manejo de localStorage
   - Métodos reutilizables

## Uso

```jsx
// Importación desde el índice
import { LoginPage, authService } from '../../features/Auth';

// O importación directa
import LoginPage from '../../features/Auth/pages/LoginPage.jsx';
```

## Patrones

### Validación en Tiempo Real
- Estado `touched` para rastrear campos visitados
- Efectos `useEffect` que validan al cambiar datos
- Errores condicionales basados en `touched`

### Autenticación
- Tokens JWT almacenados en localStorage
- Interceptores axios que agregan token automáticamente
- Thunks de Redux para operaciones async

### CAPTCHA
- Previene ataques de fuerza bruta
- Requerido en login y registro
- Validación en el componente Captcha

## Componentes Dependientes

- `Captcha.jsx` - Componente de CAPTCHA reutilizable
- Redux `authSlice.js` - Gestión de estado global
- Axios `api.js` - Cliente HTTP configurado

## Notas de Desarrollo

- Mantener Page y View separados para mejor testabilidad
- Services deben ser stateless y reutilizables
- Props en Page/View deben ser bien documentadas
- Validaciones complejas van en Effects, no en render

## TODOs Futuros

- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Login con redes sociales
- [ ] Autenticación de dos factores
- [ ] Actualización de perfil
