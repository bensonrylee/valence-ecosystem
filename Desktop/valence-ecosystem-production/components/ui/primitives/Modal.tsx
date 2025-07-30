import React, { useEffect, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top' | 'bottom';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      children,
      title,
      description,
      size = 'md',
      position = 'center',
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      preventScroll = true,
      className,
      overlayClassName,
    },
    ref
  ) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // Handle escape key
    useEffect(() => {
      if (!open || !closeOnEscape) return;

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [open, onClose, closeOnEscape]);

    // Prevent body scroll
    useEffect(() => {
      if (!preventScroll) return;

      if (open) {
        const originalStyle = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = originalStyle;
        };
      }
    }, [open, preventScroll]);

    // Focus trap
    useEffect(() => {
      if (!open || !contentRef.current) return;

      const focusableElements = contentRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // Focus first element
      firstElement?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }, [open]);

    if (!open) return null;

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4',
    };

    const positions = {
      center: 'items-center justify-center',
      top: 'items-start justify-center pt-16',
      bottom: 'items-end justify-center pb-16',
    };

    const modalContent = (
      <div
        className={cn(
          'fixed inset-0 z-50 flex',
          positions[position],
          'px-4'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Overlay */}
        <div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'animate-in fade-in duration-300',
            overlayClassName
          )}
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Content */}
        <div
          ref={(el) => {
            if (typeof ref === 'function') ref(el);
            else if (ref && 'current' in ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
            if (el) (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
          }}
          className={cn(
            'relative w-full',
            sizes[size],
            'bg-white rounded-2xl shadow-2xl',
            'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
            'max-h-[90vh] overflow-hidden flex flex-col',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-start justify-between p-6 pb-4">
              <div className="flex-1">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="mt-1 text-sm text-gray-500"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className={cn(
                    'ml-4 p-2 rounded-lg',
                    'text-gray-400 hover:text-gray-600',
                    'hover:bg-gray-100 active:bg-gray-200',
                    'transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    );

    // Portal render
    if (typeof window !== 'undefined') {
      return createPortal(modalContent, document.body);
    }

    return null;
  }
);

Modal.displayName = 'Modal';

// Modal Actions Component
export interface ModalActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right';
}

export const ModalActions = forwardRef<HTMLDivElement, ModalActionsProps>(
  ({ className, align = 'right', children, ...props }, ref) => {
    const alignments = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 p-6 pt-4 border-t border-gray-200',
          alignments[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalActions.displayName = 'ModalActions';

export default Modal;