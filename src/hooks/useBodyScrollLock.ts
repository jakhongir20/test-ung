import { useEffect } from 'react';

// Global counter to track how many modals/drawers are open
let scrollLockCount = 0;

/**
 * Hook to prevent body scrolling when a modal or drawer is open
 * Handles multiple modals/drawers being open simultaneously
 * @param isOpen - Whether the modal/drawer is open
 */
export const useBodyScrollLock = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow value only on first lock
      if (scrollLockCount === 0) {
        const originalOverflow = document.body.style.overflow;
        // Store original value in a way we can access it later
        (document.body as any).__originalOverflow = originalOverflow;
      }
      
      // Increment lock count
      scrollLockCount++;
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
      
      // Cleanup: decrement lock count and restore overflow if no more locks
      return () => {
        scrollLockCount--;
        if (scrollLockCount === 0) {
          // Restore original overflow value
          const originalOverflow = (document.body as any).__originalOverflow || '';
          document.body.style.overflow = originalOverflow;
          delete (document.body as any).__originalOverflow;
        }
      };
    }
  }, [isOpen]);
};


