import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({
  src,
  alt = '',
  size = 'md',
  status,
  statusPosition = 'bottom-right',
  className = '',
  ...props
}) => {
  // Definir clases base
  const baseClasses = 'relative inline-block rounded-full overflow-hidden bg-gray-200';
  
  // Tamaños
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };
  
  // Estado (online, offline, etc.)
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-amber-500'
  };
  
  // Posición del indicador de estado
  const statusPositionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0'
  };
  
  // Tamaño del indicador de estado basado en el tamaño del avatar
  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4'
  };
  
  // Construir clases finales
  const avatarClasses = [
    baseClasses,
    sizeClasses[size] || sizeClasses.md,
    className
  ].join(' ');
  
  // Obtener iniciales del nombre si no hay imagen
  const getInitials = () => {
    if (!alt) return '';
    
    return alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className={avatarClasses} {...props}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div 
        className={`w-full h-full flex items-center justify-center text-gray-700 font-medium ${src ? 'hidden' : 'flex'}`}
        style={{
          fontSize: size === 'xs' || size === 'sm' ? '0.7rem' : 
                   size === 'md' ? '0.8rem' : 
                   size === 'lg' ? '0.9rem' : 
                   size === 'xl' ? '1rem' : '1.2rem'
        }}
      >
        {getInitials()}
      </div>
      
      {status && (
        <span 
          className={`absolute block rounded-full ring-2 ring-white ${statusClasses[status] || ''} ${statusPositionClasses[statusPosition] || ''} ${statusSizeClasses[size] || ''}`}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  statusPosition: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
  className: PropTypes.string
};

export default Avatar;