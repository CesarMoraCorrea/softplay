import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Palette, ChevronDown } from 'lucide-react';

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Obtener icono según el tema actual
  const getThemeIcon = () => {
    return theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Seleccionar tema"
      >
        {getThemeIcon()}
        <span className="hidden sm:inline">Tema</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fadeIn">
          <div className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            Seleccionar tema
          </div>
          
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <Sun className="w-4 h-4" />
            <span>Claro</span>
            {theme === 'light' && (
              <span className="ml-auto bg-blue-500 rounded-full w-2 h-2"></span>
            )}
          </button>
          
          <button
            onClick={() => {
              toggleTheme();
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
          >
            <Moon className="w-4 h-4" />
            <span>Oscuro</span>
            {theme === 'dark' && (
              <span className="ml-auto bg-blue-500 rounded-full w-2 h-2"></span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;