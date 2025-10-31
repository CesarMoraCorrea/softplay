import React from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({ children, text, position = 'top' }) => {
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative group inline-flex">
      {children}
      <div className={`pointer-events-none absolute ${positions[position]} hidden group-hover:block`}
           role="tooltip">
        <div className="px-2.5 py-1 rounded-lg bg-gray-900 text-white text-xs shadow-md whitespace-nowrap">
          {text}
        </div>
      </div>
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

export default Tooltip;