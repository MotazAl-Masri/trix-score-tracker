import { useEffect, useRef } from 'react';

/**
 * Acquires and holds a Screen Wake Lock while the component is mounted.
 * Automatically re-acquires the lock if the page becomes visible again
 * (e.g. user switches tabs and comes back).
 *
 * Falls back gracefully when the API is not supported (older browsers).
 */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;
    if (!('wakeLock' in navigator)) return;

    let released = false;

    const acquire = async () => {
      if (released) return;
      try {
        lockRef.current = await navigator.wakeLock.request('screen');
      } catch {
        // Device denied (battery-saver mode, etc.) — silently ignore
      }
    };

    const release = async () => {
      released = true;
      if (lockRef.current) {
        try { await lockRef.current.release(); } catch { /* ignore */ }
        lockRef.current = null;
      }
    };

    acquire();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      release();
    };
  }, [active]);
}
