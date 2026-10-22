import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  isBottomSheetOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  isBottomSheetOnMobile = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
          />

          {/* Modal / Bottom Sheet Content */}
          <motion.div
            initial={isBottomSheetOnMobile ? { y: '100%', opacity: 0.8 } : { scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={isBottomSheetOnMobile ? { y: '100%', opacity: 0 } : { scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={cn(
              'relative z-10 w-full bg-white shadow-2xl overflow-hidden',
              isBottomSheetOnMobile
                ? 'rounded-t-3xl md:rounded-3xl mt-auto md:mt-0 max-h-[90vh] md:max-h-[85vh]'
                : 'rounded-3xl max-h-[85vh]',
              'max-w-lg md:max-w-xl flex flex-col',
              className
            )}
          >
            {/* Mobile Sheet Drag Indicator */}
            {isBottomSheetOnMobile && (
              <div className="md:hidden flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
              </div>
            )}

            {/* Header */}
            {(title || description) && (
              <div className="px-6 py-4 border-b border-canvas-200 flex items-start justify-between">
                <div>
                  {title && <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>}
                  {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
