import React from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Definir clases base
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  
  // Variantes
  const variantClasses = {
    default: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300',
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-900/90 hover:bg-gray-900 text-white focus:ring-gray-700',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400',
    info: 'bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400',
    soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300',
    outline: 'bg-transparent border-2 border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-300 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700',
    'outline-primary': 'bg-transparent border-2 border-blue-500 hover:bg-blue-50 text-blue-600 focus:ring-blue-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-700',
    link: 'bg-transparent underline underline-offset-4 hover:underline text-blue-600 hover:text-blue-800 p-0 focus:ring-0 focus:ring-offset-0'
  };
  
  // Tamaños
  const sizeClasses = {
    xs: 'h-8 px-3 text-xs',
    sm: 'h-9 px-3.5 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
    xl: 'h-12 px-6 text-lg'
  };
  
  // Estados
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const fullWidthClasses = 'w-full';
  
  // Construir clases finales
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    sizeClasses[size] || sizeClasses.md,
    disabled || loading ? disabledClasses : '',
    fullWidth ? fullWidthClasses : '',
    className
  ].join(' ');
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    'default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info',
    'outline', 'outline-primary', 'ghost', 'link'
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string
};

export default Button;