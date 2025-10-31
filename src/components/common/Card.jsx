import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  ...props
}) => {
  // Definir clases base
  const baseClasses = 'rounded-2xl overflow-hidden';
  
  // Variantes
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-100 shadow-md',
    glass: 'bg-white/90 backdrop-blur-sm border border-white/20',
    outline: 'bg-white border-2 border-gray-200',
    filled: 'bg-gray-100 border border-gray-200',
    primary: 'bg-blue-50 border border-blue-200',
    secondary: 'bg-purple-50 border border-purple-200'
  };
  
  // Hover
  const hoverClasses = hover ? 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1' : '';
  
  // Construir clases finales
  const classes = [
    baseClasses,
    variantClasses[variant] || variantClasses.default,
    hoverClasses,
    className
  ].join(' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

// Componentes adicionales para estructura de Card
const CardHeader = ({ children, className = '', ...props }) => {
  const classes = ['p-4 border-b border-gray-100', className].join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardBody = ({ children, className = '', ...props }) => {
  const classes = ['p-4', className].join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  const classes = ['p-4 border-t border-gray-100', className].join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardImage = ({ src, alt = '', className = '', ...props }) => {
  const classes = ['w-full object-cover', className].join(' ');
  return <img src={src} alt={alt} className={classes} {...props} />;
};

const CardTitle = ({ children, className = '', ...props }) => {
  const classes = ['text-xl font-semibold', className].join(' ');
  return (
    <h3 className={classes} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  const classes = ['text-gray-600 mt-1', className].join(' ');
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'elevated', 'glass', 'outline', 'filled', 'primary', 'secondary']),
  hover: PropTypes.bool,
  className: PropTypes.string
};

CardHeader.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardFooter.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string
};

CardTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

CardDescription.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Image = CardImage;
Card.Title = CardTitle;
Card.Description = CardDescription;

export default Card;