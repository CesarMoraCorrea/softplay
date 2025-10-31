import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  Activity,
  Settings,
  Plus,
  ArrowLeft,
  Search,
  Edit,
  UserPlus,
  X,
} from "lucide-react";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import api from "../../api/axios";

export default function AdminSistema() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "usuario",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "usuario",
  });

  // Cargar usuarios desde la API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/users", newUser);
      setUsers([...users, response.data]);
      setNewUser({ name: "", email: "", password: "", role: "usuario" });
      setShowUserForm(false);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Error al crear usuario");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/users/${editingUser._id}`, editUser);
      setUsers(users.map((user) => (user._id === editingUser._id ? response.data : user)));
      setShowEditModal(false);
      setEditingUser(null);
      setEditUser({ name: "", email: "", role: "usuario" });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Error al actualizar usuario");
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      setUsers(users.map((user) => (user._id === userId ? response.data : user)));
    } catch (error) {
      console.error("Error al cambiar estado del usuario:", error);
      alert("Error al cambiar estado del usuario");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Panel de Administración
        </h1>
        <Link to="/canchas">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver a Canchas
          </Button>
        </Link>
      </div>

      {/* Tabs de navegación */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab("usuarios")}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === "usuarios"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Users className="w-4 h-4" />
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab("reportes")}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === "reportes"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <FileText className="w-4 h-4" />
          Reportes
        </button>
        <button
          onClick={() => setActiveTab("auditoria")}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === "auditoria"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Activity className="w-4 h-4" />
          Auditoría
        </button>
        <button
          onClick={() => setActiveTab("configuracion")}
          className={`px-4 py-2 flex items-center gap-2 ${
            activeTab === "configuracion"
              ? "border-b-2 border-primary text-primary"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Settings className="w-4 h-4" />
          Configuración
        </button>
      </div>

      {/* Contenido según la pestaña activa */}
      {activeTab === "usuarios" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Gestión de Usuarios
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra los usuarios del sistema
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <Button
                onClick={() => setShowUserForm(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Nuevo Usuario
              </Button>
            </div>
          </div>

          {showUserForm && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={newUser.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Contraseña
                    </label>
                    <Input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rol
                    </label>
                    <select
                      name="role"
                      value={newUser.role}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="propietario">Propietario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar Usuario</Button>
                </div>
              </form>
            </div>
          )}

          {/* Modal de edición de usuario */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Editar Usuario
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={editUser.name}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={editUser.email}
                      onChange={handleEditInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Rol
                    </label>
                    <select
                      name="role"
                      value={editUser.role}
                      onChange={handleEditInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="usuario">Usuario</option>
                      <option value="propietario">Propietario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Actualizar Usuario</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Nombre
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Rol
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "propietario"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(user._id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                              user.activo
                                ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            }`}
                          >
                            {user.activo ? "🔒 Desactivar" : "✅ Activar"}
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                            onClick={() => handleEditUser(user)}
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "reportes" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Reportes</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Genera informes y estadísticas sobre el uso de la plataforma.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Reservas por Mes</h3>
              <div className="h-40 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Gráfico de Reservas</span>
              </div>
              <Button className="mt-3 w-full" size="sm">
                Ver Detalles
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Ingresos</h3>
              <div className="h-40 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Gráfico de Ingresos</span>
              </div>
              <Button className="mt-3 w-full" size="sm">
                Ver Detalles
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Canchas Populares</h3>
              <div className="h-40 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400">Gráfico de Popularidad</span>
              </div>
              <Button className="mt-3 w-full" size="sm">
                Ver Detalles
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "auditoria" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Auditoría</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Registro de actividades y cambios en el sistema.
          </p>

          <div className="overflow-hidden shadow-md rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Usuario
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Acción
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    2023-09-15 14:30
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Juan Losada
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Creación de usuario
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Se creó el usuario 'ana@example.com'
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    2023-09-14 10:15
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Juan Losada
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Modificación de cancha
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Se actualizó la cancha 'Camp Nou Sur'
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    2023-09-13 16:45
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Sistema
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Backup automático
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    Backup completo de la base de datos
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "configuracion" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Configuración del Sistema</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ajusta los parámetros y preferencias del sistema.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Configuración General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre del Sitio
                  </label>
                  <Input type="text" defaultValue="SoftPlay" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email de Contacto
                  </label>
                  <Input type="email" defaultValue="contacto@softplay.com" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Configuración de Reservas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo Mínimo de Antelación (horas)
                  </label>
                  <Input type="number" defaultValue="2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiempo Máximo de Antelación (días)
                  </label>
                  <Input type="number" defaultValue="30" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Configuración de Pagos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Moneda
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white">
                    <option>COP - Peso Colombiano</option>
                    <option>USD - Dólar Estadounidense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Comisión por Reserva (%)
                  </label>
                  <Input type="number" defaultValue="5" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline">Cancelar</Button>
              <Button>Guardar Cambios</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
