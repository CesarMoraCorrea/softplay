import { cn } from '../../utils/cn';

const LoadingSpinner = ({ 
  size = 'default', 
  className,
  text = 'Cargando...',
  showText = true 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Spinner principal */}
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700",
            sizes[size],
            className
          )}
          style={{
            borderTopColor: 'rgb(59 130 246)', // blue-500
            animationDuration: '1s'
          }}
        />
        
        {/* Efecto de pulso interno */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full bg-blue-500/20 animate-pulse",
            sizes[size]
          )}
          style={{
            animationDuration: '2s'
          }}
        />
      </div>
      
      {showText && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Componente de pantalla completa de carga
export const FullScreenLoader = ({ text = 'Cargando aplicación...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" text={text} />
        <div className="mt-6 space-y-2">
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Preparando tu experiencia...</p>
        </div>
      </div>
    </div>
  );
};

// Componente de carga para secciones
export const SectionLoader = ({ text = 'Cargando contenido...' }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

export default LoadingSpinner;