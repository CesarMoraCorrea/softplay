import React from 'react';
import PropTypes from 'prop-types';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Alert = ({
  children,
  variant = 'info',
  title,
  icon,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}) => {
  // Definir clases base
  const baseClasses = 'rounded-xl p-4 flex gap-3';
  
  // Variantes
  const variantClasses = {
    info: 'bg-blue-50 text-blue-800 border border-blue-100',
    success: 'bg-green-50 text-green-800 border border-green-100',
    warning: 'bg-amber-50 text-amber-800 border border-amber-100',
    error: 'bg-red-50 text-red-800 border border-red-100'
  };
  
  // Iconos por defecto según variante
  const defaultIcons = {
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
    success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
  };
  
  // Construir clases finales
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.info,
    className
  ].join(' ');
  
  // Determinar el icono a mostrar
  const displayIcon = icon || defaultIcons[variant];
  
  return (
    <div className={classes} role="alert" {...props}>
      {displayIcon && (
        <div className="flex-shrink-0">
          {displayIcon}
        </div>
      )}
      
      <div className="flex-1">
        {title && (
          <h5 className="font-semibold mb-1">{title}</h5>
        )}
        <div className="text-sm">{children}</div>
      </div>
      
      {dismissible && onDismiss && (
        <button 
          type="button" 
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  icon: PropTypes.node,
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  className: PropTypes.string
};

export default Alert;