// Componente: DashboardLayout
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiMenu, FiLogOut } from "react-icons/fi";
import Sidebar from "../components/layout/Sidebar";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Home, MapPin } from "lucide-react";
import ThemeSelector from "../theme/ThemeSelector";
import { logout } from "../redux/slices/authSlice";

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: "Inicio", href: "/home", icon: <Home className="w-5 h-5" /> },
    { name: "Canchas", href: "/canchas", icon: <MapPin className="w-5 h-5" /> },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar — solo visible en mobile como overlay */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ───── Top Header ───── */}
        <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="w-full px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16">

              {/* Izquierda: Hamburger (mobile) + Logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Abrir menú"
                  className="lg:hidden p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100
                             dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700
                             focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <FiMenu className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Logo — única instancia en desktop */}
                <Link
                  to="/home"
                  className="text-2xl font-bold text-gray-800 dark:text-white hover:opacity-80 transition-opacity duration-200"
                >
                  Soft<span className="text-blue-600 dark:text-blue-400">play</span>
                </Link>
              </div>

              {/* Derecha: Nav links (desktop) + Auth / User */}
              <div className="flex items-center gap-3">

                {/* Nav links */}
                <nav className="hidden lg:flex items-center gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Selector de tema */}
                <ThemeSelector />

                {/* Auth: botones si no hay sesión, avatar si la hay */}
                {user ? (
                  <div className="hidden lg:flex items-center gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[100px] truncate">
                        {user.name}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      aria-label="Cerrar sesión"
                      className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="hidden lg:flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-sm hover:shadow-blue-600/30"
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 ${location.pathname === '/home' ? '' : 'p-4 sm:p-6'}`}>
          <div className={location.pathname === '/home' ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
