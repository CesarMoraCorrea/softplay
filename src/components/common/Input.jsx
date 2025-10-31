import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef((
  {
    type = 'text',
    label,
    placeholder,
    error,
    hint,
    icon,
    iconPosition = 'left',
    disabled = false,
    fullWidth = true,
    size = 'md',
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) => {
  // Clases base con soporte dark
  const baseClasses = 'rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none transition-all duration-200';

  // Alturas por tamaño (consistentes)
  const sizeHeights = {
    sm: 'h-10 text-sm',
    md: 'h-11',
    lg: 'h-12 text-lg',
  };

  // Estados
  const stateClasses = {
    default: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:border-blue-400 dark:focus:ring-blue-300/30',
    error: 'border-red-300 dark:border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-300/30',
    disabled: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 cursor-not-allowed'
  };

  // Ancho
  const widthClasses = fullWidth ? 'w-full' : '';

  // Padding para iconos
  const iconPaddingClasses = {
    left: icon ? 'pl-10' : '',
    right: icon ? 'pr-10' : ''
  };

  const inputClasses = [
    baseClasses,
    sizeHeights[size],
    disabled ? stateClasses.disabled : (error ? stateClasses.error : stateClasses.default),
    widthClasses,
    iconPaddingClasses[iconPosition],
    className
  ].join(' ');

  const containerClasses = [
    'flex flex-col',
    fullWidth ? 'w-full' : '',
    containerClassName
  ].join(' ');

  return (
    <div className={containerClasses}>
      {label && (
        <label className="mb-1.5 font-medium text-gray-700 dark:text-gray-300 text-sm">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {hint && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  containerClassName: PropTypes.string
};

export default Input;