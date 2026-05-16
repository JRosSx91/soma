import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * A bottom sheet that slides up from the bottom of the screen.
 * Used to show contextual info on mobile (e.g. selected organ details)
 * without taking the user away from the main view (e.g. the 3D model).
 *
 * - Slides up on open, down on close (Framer Motion).
 * - Backdrop click closes it.
 * - Escape key closes it.
 * - Body scroll is locked while open to prevent the page from scrolling
 *   underneath when the user scrolls the sheet's content.
 * - Drag handle at the top is a visual affordance (no actual drag-to-close
 *   gesture — that requires a more complex setup we can add later if needed).
 */
export function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="
              fixed bottom-0 left-0 right-0 z-50
              bg-soma-bg-surface
              border-t border-soma-border-subtle
              rounded-t-2xl
              max-h-[80vh]
              flex flex-col
            "
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-3 cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              <div className="w-10 h-1 bg-soma-fg-muted/40 rounded-full" />
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}