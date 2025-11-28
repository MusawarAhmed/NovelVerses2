import React from 'react';
import { motion } from 'framer-motion';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-slate-950 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
        <img 
          src="/assets/novelverse_splash_logo.png" 
          alt="Loading..." 
          className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
        />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 flex flex-col items-center"
      >
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-400 animate-pulse">Entering the Verse...</p>
      </motion.div>
    </div>
  );
};
