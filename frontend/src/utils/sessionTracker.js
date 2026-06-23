import { useEffect } from 'react';
import api from '../api/axios';

export function useSessionTracker(user) {
  useEffect(() => {
    if (!user || user.role === 'admin') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const logStoredSession = async () => {
      const storedStart = localStorage.getItem('pending_session_start');
      if (storedStart) {
        const sessionEndTime = new Date().toISOString();
        localStorage.removeItem('pending_session_start');
        try {
          await api.post('/progress/session/log', {
            sessionStartTime: storedStart,
            sessionEndTime,
          });
        } catch (err) {
          console.error('Failed to log previous study session:', err);
          // Restore if failed and not too old
          const startMs = new Date(storedStart).getTime();
          if (Date.now() - startMs < 24 * 60 * 60 * 1000) {
            localStorage.setItem('pending_session_start', storedStart);
          }
        }
      }
    };

    // 1. Process any previously interrupted session
    logStoredSession();

    // 2. Set current session start
    const currentStart = new Date().toISOString();
    localStorage.setItem('pending_session_start', currentStart);

    // 3. Keep-alive check: Update current session in localStorage on page leave
    const handleUnload = () => {
      const storedStart = localStorage.getItem('pending_session_start');
      if (storedStart) {
        const sessionEndTime = new Date().toISOString();
        // Since we are unloading, use sendBeacon or a synchronous fetch if supported.
        // Or we can rely on the next load, but let's try to send a quick fetch request.
        const body = JSON.stringify({
          sessionStartTime: storedStart,
          sessionEndTime
        });
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/progress/session/log`;
        
        if (navigator.sendBeacon) {
          // sendBeacon cannot set Authorization header easily.
          // Let's pass the token in body or query if sendBeacon is used, or let next startup log it.
          // For now, next startup logging is extremely reliable. Let's still try fetch.
          fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body,
            keepalive: true
          }).then(() => {
            localStorage.removeItem('pending_session_start');
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [user]);
}
