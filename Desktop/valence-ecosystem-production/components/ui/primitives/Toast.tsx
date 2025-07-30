import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface ToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, removeAllToasts } = context;

  const toast = useCallback((options: Omit<ToastProps, 'id'>) => {
    const id = addToast(options);
    return () => removeToast(id);
  }, [addToast, removeToast]);

  const success = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'success' });
  }, [toast]);

  const error = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'error' });
  }, [toast]);

  const warning = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'warning' });
  }, [toast]);

  const info = useCallback((title: string, description?: string) => {
    return toast({ title, description, variant: 'info' });
  }, [toast]);

  return {
    toast,
    success,
    error,
    warning,
    info,
    dismiss: removeToast,
    dismissAll: removeAllToasts,
  };
};

// Individual Toast Component
const Toast: React.FC<ToastProps & { onRemove: () => void }> = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  action,
  onClose,
  onRemove,
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove();
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onRemove, onClose]);

  const variants = {
    default: {
      icon: null,
      className: 'bg-white border-gray-200',
      iconColor: 'text-gray-600',
    },
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      className: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      className: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      className: 'bg-yellow-50 border-yellow-200',
      iconColor: 'text-yellow-600',
    },
    info: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      className: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600',
    },
  };

  const { icon, className, iconColor } = variants[variant];

  return (
    <div
      role="alert"
      className={cn(
        'w-full max-w-sm pointer-events-auto',
        'flex items-start gap-3 p-4',
        'rounded-lg border shadow-lg',
        'animate-in slide-in-from-right fade-in duration-300',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className={cn('flex-shrink-0', iconColor)}>
          {icon}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={() => {
          onRemove();
          onClose?.();
        }}
        className={cn(
          'flex-shrink-0 ml-2 p-1 rounded-md',
          'text-gray-400 hover:text-gray-600',
          'hover:bg-gray-100 active:bg-gray-200',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-gray-500'
        )}
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Toast Container Component
const ToastContainer: React.FC = () => {
  const context = useContext(ToastContext);
  if (!context) return null;

  const { toasts, removeToast } = context;

  if (toasts.length === 0) return null;

  const container = (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  if (typeof window !== 'undefined') {
    return createPortal(container, document.body);
  }

  return null;
};

// Standalone toast function for imperative use
let toastInstance: ToastContextType | null = null;

export const setToastInstance = (instance: ToastContextType) => {
  toastInstance = instance;
};

export const toast = {
  show: (options: Omit<ToastProps, 'id'>) => {
    if (!toastInstance) {
      console.warn('Toast instance not initialized. Wrap your app with ToastProvider.');
      return;
    }
    return toastInstance.addToast(options);
  },
  success: (title: string, description?: string) => {
    return toast.show({ title, description, variant: 'success' });
  },
  error: (title: string, description?: string) => {
    return toast.show({ title, description, variant: 'error' });
  },
  warning: (title: string, description?: string) => {
    return toast.show({ title, description, variant: 'warning' });
  },
  info: (title: string, description?: string) => {
    return toast.show({ title, description, variant: 'info' });
  },
  dismiss: (id: string) => {
    toastInstance?.removeToast(id);
  },
  dismissAll: () => {
    toastInstance?.removeAllToasts();
  },
};

export default Toast;