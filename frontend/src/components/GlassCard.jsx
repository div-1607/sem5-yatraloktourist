import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-navy-900/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-2xl p-6 ${
        hover ? 'hover:border-amber-500/30 hover:shadow-glass-hover' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
