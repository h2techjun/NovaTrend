'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, CheckCircle, AlertCircle, X, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'info' | 'success' | 'error' | 'notification';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'notification': return <Bell className="h-5 w-5 text-brand-500" />;
      default: return <Info className="h-5 w-5 text-brand-500" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "flex min-w-[300px] max-w-md items-center gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))/0.8] p-4 shadow-2xl backdrop-blur-xl",
                "before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-l-2xl",
                toast.type === 'success' && "before:bg-green-500",
                toast.type === 'error' && "before:bg-red-500",
                (toast.type === 'info' || toast.type === 'notification') && "before:bg-brand-500"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] shadow-inner">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 pr-4">
                <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
