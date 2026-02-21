# Feature: Canchas

## Descripción
Feature para gestión de canchas de deporte, con CRUD, búsqueda por geolocalización.

## Métodos Disponibles
- `getAll(filters)` - Listar canchas con filtros
- `getById(id)` - Obtener detalle de una cancha
- `create(data)` - Crear cancha (admin)
- `update(id, data)` - Actualizar cancha (admin)
- `delete(id)` - Eliminar cancha (admin)
- `uploadImage(formData)` - Cargar imágenes
- `searchByLocation(lat, lng, radius)` - Buscar por ubicación
