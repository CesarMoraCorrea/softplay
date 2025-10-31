import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

// Definir temas disponibles
const themes = {
  light: {
    name: 'light',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      background: '#ffffff',
      card: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      input: '#f9fafb',
      inputBorder: '#d1d5db',
      hover: '#f3f4f6'
    }
  },
  dark: {
    name: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      background: '#111827',
      card: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      input: '#1f2937',
      inputBorder: '#4b5563',
      hover: '#374151'
    }
  },
  sports: {
    name: 'sports',
    colors: {
      primary: '#16a34a',
      secondary: '#0284c7',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      background: '#f0fdf4',
      card: '#ffffff',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#dcfce7',
      input: '#f9fafb',
      inputBorder: '#d1d5db',
      hover: '#f0fdf4'
    }
  }
};

// Crear contexto para el tema
const ThemeContext = createContext();

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Proveedor de tema
const ThemeProvider = ({ children }) => {
  // Estado para el tema actual
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Intentar obtener el tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    // Verificar preferencia del sistema si no hay tema guardado
    if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return themes.dark;
    }
    // Usar el tema guardado o el tema claro por defecto
    return themes[savedTheme] || themes.light;
  });

  // Cambiar tema
  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themes[themeName]);
      localStorage.setItem('theme', themeName);
    }
  };

  // Alternar entre temas claro y oscuro
  const toggleTheme = () => {
    const newTheme = currentTheme.name === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };

  // Aplicar clases CSS al documento cuando cambia el tema
  useEffect(() => {
    const root = document.documentElement;
    
    // Aplicar clase para tema oscuro
    if (currentTheme.name === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Aplicar variables CSS para colores del tema
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [currentTheme]);

  // Valor del contexto
  const value = {
    theme: currentTheme,
    themes,
    changeTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ThemeProvider;