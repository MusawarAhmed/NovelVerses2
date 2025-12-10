import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, message, type };
        
        setToasts((prev) => [...prev, toast]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, [removeToast]);

    const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
    const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
    const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);
    const warning = useCallback((msg: string) => showToast(msg, 'warning'), [showToast]);

    return (
        <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
    const variants = {
        success: 'bg-green-500 border-green-600',
        error: 'bg-red-500 border-red-600',
        info: 'bg-blue-500 border-blue-600',
        warning: 'bg-orange-500 border-orange-600'
    };

    const icons = {
        success: <Check size={20} className="text-white" />,
        error: <AlertCircle size={20} className="text-white" />,
        info: <Info size={20} className="text-white" />,
        warning: <AlertTriangle size={20} className="text-white" />
    };

    const titles = {
        success: 'Success',
        error: 'Error',
        info: 'Info',
        warning: 'Warning'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            layout
            className={`pointer-events-auto min-w-[300px] max-w-sm rounded-lg shadow-lg border-l-4 p-4 flex items-start gap-3 backdrop-blur-sm ${variants[toast.type]} text-white`}
        >
            <div className="mt-0.5 shrink-0">
                {icons[toast.type]}
            </div>
            <div className="flex-1">
                <h4 className="text-sm font-bold opacity-90">{titles[toast.type]}</h4>
                <p className="text-sm opacity-90 leading-tight mt-1">{toast.message}</p>
            </div>
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
                <X size={16} />
            </button>
        </motion.div>
    );
};
