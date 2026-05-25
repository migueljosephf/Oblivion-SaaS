import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.15)' } : {}}
      onClick={onClick}
      className={`bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-700 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
