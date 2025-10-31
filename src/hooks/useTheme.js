// src/hooks/useTheme.js
import { useState, useEffect, createContext, useContext } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Azul Clásico',
    background: 'bg-gradient-to-br from-blue-50 via-white to-indigo-50',
    primary: 'from-blue-600 to-indigo-600',
    primaryHover: 'from-blue-700 to-indigo-700',
    secondary: 'from-green-600 to-blue-600',
    accent: 'bg-blue-50',
    icon: '🔵'
  },
  sunset: {
    name: 'Atardecer',
    background: 'bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50',
    primary: 'from-orange-500 to-pink-500',
    primaryHover: 'from-orange-600 to-pink-600',
    secondary: 'from-purple-600 to-orange-600',
    accent: 'bg-orange-50',
    icon: '🌅'
  },
  ocean: {
    name: 'Océano',
    background: 'bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50',
    primary: 'from-cyan-500 to-blue-500',
    primaryHover: 'from-cyan-600 to-blue-600',
    secondary: 'from-teal-600 to-cyan-600',
    accent: 'bg-cyan-50',
    icon: '🌊'
  },
  forest: {
    name: 'Bosque',
    background: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50',
    primary: 'from-green-600 to-emerald-600',
    primaryHover: 'from-green-700 to-emerald-700',
    secondary: 'from-teal-600 to-green-600',
    accent: 'bg-green-50',
    icon: '🌲'
  },
  lavender: {
    name: 'Lavanda',
    background: 'bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50',
    primary: 'from-purple-500 to-violet-500',
    primaryHover: 'from-purple-600 to-violet-600',
    secondary: 'from-indigo-600 to-purple-600',
    accent: 'bg-purple-50',
    icon: '💜'
  },
  dark: {
    name: 'Oscuro',
    background: 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800',
    primary: 'from-indigo-500 to-purple-500',
    primaryHover: 'from-indigo-600 to-purple-600',
    secondary: 'from-blue-600 to-indigo-600',
    accent: 'bg-gray-800',
    icon: '🌙'
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      localStorage.setItem('app-theme', themeName);
    }
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};