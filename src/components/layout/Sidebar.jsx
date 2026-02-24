import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  FiCalendar,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import { MdSportsSoccer, MdAdminPanelSettings } from "react-icons/md";
import { logout } from "../../redux/slices/authSlice";
import ThemeSelector from "../../theme/ThemeSelector";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [expandedMenus, setExpandedMenus] = useState({});

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isParentActive = (paths) => paths.some((path) => location.pathname.startsWith(path));

  const menuItems = [
    {
      key: "canchas",
      label: "Canchas",
      icon: MdSportsSoccer,
      path: "/canchas",
    },
    {
      key: "reservas",
      label: "Mis Reservas",
      icon: FiCalendar,
      path: "/reservas",
      roles: ["usuario", "admin_cancha", "admin_sistema"],
    },
    {
      key: "admin-panel",
      label: "Panel de Administrador",
      icon: MdAdminPanelSettings,
      path: "/admin",
      roles: ["admin_sistema"],
      submenu: [
        {
          key: "admin-canchas",
          label: "Gestión de Canchas",
          icon: MdSportsSoccer,
          path: "/admin/canchas",
        },
        {
          key: "admin-sistema",
          label: "Administración Sistema",
          icon: FiSettings,
          path: "/admin/sistema",
        },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const MenuItem = ({ item }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isExpanded = expandedMenus[item.key];
    const isItemActive = hasSubmenu
      ? isParentActive(item.submenu.map((sub) => sub.path))
      : isActive(item.path);

    if (hasSubmenu) {
      return (
        <div className="mb-1">
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
              isItemActive
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon
                className={`w-5 h-5 ${
                  isItemActive ? "text-white" : "text-gray-500 dark:text-gray-400"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? (
              <FiChevronDown className="w-4 h-4" />
            ) : (
              <FiChevronRight className="w-4 h-4" />
            )}
          </button>

          {isExpanded && (
            <div className="ml-4 mt-2 space-y-1">
              {item.submenu.map((subItem) => (
                <Link
                  key={subItem.key}
                  to={subItem.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(subItem.path)
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500 dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <subItem.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{subItem.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        to={item.path}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 group ${
          isItemActive
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <item.icon
          className={`w-5 h-5 ${
            isItemActive
              ? "text-white"
              : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500"
          }`}
        />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar: full height, responsiva y pegada al borde inferior */}
      <div
        className={`fixed left-0 top-0 h-full flex flex-col bg-white dark:bg-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shadow-none w-80 border-r border-gray-200 dark:border-gray-700`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <MdSportsSoccer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">SoftPlay</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de Reservas</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white truncate">
                Hola, {user?.nombre || "Invitado"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                  user?.role === "admin_sistema"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    : user?.role === "admin_cancha"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {user?.role === "admin_sistema"
                  ? "Administrador"
                  : user?.role === "admin_cancha"
                  ? "Admin Cancha"
                  : "Usuario"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation (se expande para rellenar altura) */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <MenuItem key={item.key} item={item} />
          ))}

          {/* Theme Selector */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FiSettings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema</span>
            </div>
            <ThemeSelector />
          </div>
        </nav>

        {/* Footer (siempre pegado al fondo) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
