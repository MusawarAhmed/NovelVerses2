import React from 'react';
import { motion } from 'framer-motion';

// Basic Fade In with optional delay
export const FadeIn = ({ children, delay = 0, className = "", duration = 0.5 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

// Blur Text Effect for Headings
export const BlurIn = ({ children, className = "", delay = 0 }: any) => (
  <motion.h1
    initial={{ filter: 'blur(10px)', opacity: 0, y: -20 }}
    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.h1>
);

// Stagger Container for lists/grids
export const StaggerContainer = ({ children, className = "", delay = 0, stagger = 0.05 }: any) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger,
          delayChildren: delay
        }
      }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Child item for StaggerContainer
export const StaggerItem = ({ children, className = "" }: any) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20, scale: 0.95 },
      visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
    }}
    className={className}
  >
    {children}
  </motion.div>
);

// Card with hover lift and spring entrance
export const SpringCard = ({ children, className = "", delay = 0 }: any) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    transition={{ type: "spring", stiffness: 260, damping: 20, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Interactive Button Scale
export const ScaleButton = ({ children, onClick, className = "", type = "button", disabled = false }: any) => (
  <motion.button
    type={type}
    disabled={disabled}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={className}
  >
    {children}
  </motion.button>
);

// Background Gradient Blob Animation
export const BlobBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
  </div>
);