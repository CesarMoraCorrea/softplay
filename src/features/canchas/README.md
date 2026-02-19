# Canchas Feature

Módulo de gestión y visualización de canchas deportivas con arquitectura basada en características.

## Estructura

```
features/Canchas/
├── pages/                     # Páginas contenedoras
│   ├── CanchasPage.jsx        # Listado de canchas
│   ├── CanchaDetallePage.jsx  # Detalle de cancha
│   └── AdminCanchasPage.jsx   # Admin de canchas
├── views/                     # Componentes presentacionales
│   ├── CanchasListView.jsx
│   ├── CanchaDetalleView.jsx
│   └── AdminCanchasView.jsx
├── components/
│   ├── CanchaCard.jsx         # Tarjeta de cancha
│   ├── FiltrosCanchas.jsx     # Filtros
│   └── ...
├── services/
│   └── canchasService.js      # Llamadas HTTP
├── utils/                     # Funciones auxiliares
│   └── filterHelpers.js       # Lógica de filtrado
├── hooks/                     # Custom hooks
│   └── useCanchas.js
├── index.js                   # Exportaciones públicas
└── README.md                  # Este archivo
```

## Servicios Disponibles

```javascript
import { canchasService } from '../../features/Canchas';

// Obtener todas las canchas
await canchasService.getAll({ tipoCancha: 'Fútbol 5' });

// Obtener cancha por ID
await canchasService.getById(id);

// Crear cancha (admin)
await canchasService.create(canchaData);

// Actualizar cancha (admin)
await canchasService.update(id, canchaData);

// Eliminar cancha (admin)
await canchasService.delete(id);

// Subir imagen
await canchasService.uploadImage(formData);

// Búsqueda por ubicación
await canchasService.searchByLocation(lat, lng, radius);
```

## Uso

```jsx
// Importación de servicios
import { canchasService } from '../../features/Canchas';

// En componentes
const [canchas, setCanchas] = useState([]);

useEffect(() => {
  canchasService.getAll()
    .then(data => setCanchas(data))
    .catch(err => console.error(err));
}, []);
```

## Flujo de Datos

1. **Page** - Maneja estado y comunica con Redux/Services
2. **View** - Presenta la UI de forma declarativa
3. **Components** - Componentes reutilizables (tarjetas, filtros, etc.)
4. **Service** - Llama al backend

## Servicios Principales

### Búsqueda y Filtrado
- Filtros por tipo de cancha
- Filtros por horario
- Filtros por servicios
- Búsqueda por ubicación (geolocalización)
- Rango de precios

### Visualización
- Listado de canchas
- Detalle de cancha
- Galería de imágenes
- Mapa interactivo
- Información de contacto

### Administración (Admin)
- CRUD de canchas
- Carga de imágenes
- Gestión de disponibilidad
- Estadísticas de reservas

## Redux Integration

```javascript
// Slice de Redux
state.canchas = {
  items: [],
  selected: null,
  loading: false,
  error: null,
  filters: {}
}
```

## TODOs Futuros

- [ ] Filtros avanzados
- [ ] Búsqueda full-text
- [ ] Ratings y reseñas
- [ ] Galería de múltiples imágenes
- [ ] Disponibilidad en tiempo real
- [ ] Notificaciones de nuevas canchas
