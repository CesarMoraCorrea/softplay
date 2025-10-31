import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

const AnimatedContainer = ({ 
  children, 
  className,
  delay = 0,
  duration = 500, // en milisegundos
  direction = 'up', // 'up', 'down', 'left', 'right', 'fade'
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    const baseClasses = 'transition-all ease-out';
    const durationClass = `duration-${Math.min(1000, duration)}`;
    
    if (!isVisible) {
      switch (direction) {
        case 'up':
          return `${baseClasses} ${durationClass} translate-y-5 opacity-0`;
        case 'down':
          return `${baseClasses} ${durationClass} -translate-y-5 opacity-0`;
        case 'left':
          return `${baseClasses} ${durationClass} -translate-x-5 opacity-0`;
        case 'right':
          return `${baseClasses} ${durationClass} translate-x-5 opacity-0`;
        case 'fade':
          return `${baseClasses} ${durationClass} opacity-0`;
        default:
          return `${baseClasses} ${durationClass} translate-y-5 opacity-0`;
      }
    }
    
    return `${baseClasses} ${durationClass} translate-x-0 translate-y-0 opacity-100`;
  };

  return (
    <div
      className={cn(getAnimationClass(), className)}
      style={{
        transitionDuration: `${duration}ms`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente para animaciones de lista
export const AnimatedList = ({ children, className, staggerDelay = 100 }) => {
  const [visibleItems, setVisibleItems] = useState(new Set());

  useEffect(() => {
    const childrenArray = Array.isArray(children) ? children : [children];
    
    childrenArray.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]));
      }, index * staggerDelay);
    });
  }, [children, staggerDelay]);

  return (
    <div className={cn('space-y-2', className)}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <AnimatedListItem key={index} isVisible={visibleItems.has(index)}>
              {child}
            </AnimatedListItem>
          ))
        : <AnimatedListItem isVisible={visibleItems.has(0)}>{children}</AnimatedListItem>
      }
    </div>
  );
};

// Componente para elementos de lista animados
export const AnimatedListItem = ({ children, className, isVisible = true, ...props }) => {
  return (
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        isVisible 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-5 opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Componente para hover animations
export const HoverCard = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'cursor-pointer transition-all duration-200 ease-out hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;