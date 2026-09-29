import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`glass-card p-6 ${
        hover ? 'hover:border-blue-electric/50 hover:shadow-glass-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
