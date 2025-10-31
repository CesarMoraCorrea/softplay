// Componente: DashboardLayout
import { useState } from "react";
import { useSelector } from "react-redux";
import { FiMenu } from "react-icons/fi";
import Sidebar from "../components/layout/Sidebar";
import { useTheme } from "../contexts/ThemeContext";
import { useLocation, Link } from "react-router-dom";
// ... existing code ...
import { Home, MapPin } from "lucide-react";
import ThemeSelector from "../theme/ThemeSelector";
// ... existing code ...

const DashboardLayout = ({ children }) => {
  // ... existing code ...
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  // ... existing code ...
  const navigation = [
    { name: "Inicio", href: "/home", icon: <Home className="w-5 h-5" /> },
    { name: "Canchas", href: "/canchas", icon: <MapPin className="w-5 h-5" /> },
  ];
  const isActive = (path) => location.pathname === path;
  // ... existing code ...

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header movido aquí: consistente como en Home */}
        <header className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="w-full px-6">
            <div className="max-w-7xl mx-auto flex justify-between h-16">
              {/* Marca */}
              <div className="flex items-center">
                <Link
                  to="/home"
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  SoftPlay
                </Link>
              </div>
              {/* Navegación */}
              <nav className="hidden sm:flex items-center gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {item.icon}
                      {item.name}
                    </span>
                  </Link>
                ))}
              </nav>
              {/* Acciones */}
              <div className="hidden sm:flex items-center space-x-3">
                <ThemeSelector />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
// ... existing code ...
export default DashboardLayout;
