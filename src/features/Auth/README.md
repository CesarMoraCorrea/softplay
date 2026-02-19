# Feature: Autenticación

## Descripción
Feature completa de autenticación con login y registro de usuarios.

## Estructura
```
Auth/
├── pages/
│   ├── LoginPage.jsx
│   └── RegisterPage.jsx
├── views/
│   ├── LoginView.jsx
│   └── RegisterView.jsx
├── services/
│   └── authService.js
├── index.js
└── README.md
```

## Dependencias
- Redux para estado global
- Axios para peticiones HTTP
- React Router para navegación

## Uso
```javascript
import { LoginPage, RegisterPage } from 'src/features/Auth';
```
