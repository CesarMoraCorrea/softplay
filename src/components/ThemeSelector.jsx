// src/components/ThemeSelector.jsx
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeSelector = () => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 bg-gradient-to-r ${theme.primary} text-white hover:shadow-xl`}
        title="Cambiar tema"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
      </button>

      {/* Theme Dropdown */}
      {isOpen && (
        <div className="absolute top-14 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-64 animate-fadeIn">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-1">Personalizar tema</h3>
            <p className="text-sm text-gray-600">Elige el estilo que más te guste</p>
          </div>
          
          <div className="max-h-80 overflow-y-auto custom-scroll">
            {Object.entries(themes).map(([key, themeOption]) => (
              <button
                key={key}
                onClick={() => {
                  changeTheme(key);
                  setIsOpen(false);
                }}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                  currentTheme === key 
                    ? `border-blue-500 bg-blue-50` 
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${themeOption.primary} flex items-center justify-center text-lg shadow-md`}>
                    {themeOption.icon}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{themeOption.name}</div>
                    <div className="text-sm text-gray-500">
                      {key === 'default' && 'Tema original'}
                      {key === 'sunset' && 'Cálido y vibrante'}
                      {key === 'ocean' && 'Fresco y relajante'}
                      {key === 'forest' && 'Natural y tranquilo'}
                      {key === 'lavender' && 'Elegante y suave'}
                      {key === 'dark' && 'Moderno y profesional'}
                    </div>
                  </div>
                  {currentTheme === key && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 -z-10" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};