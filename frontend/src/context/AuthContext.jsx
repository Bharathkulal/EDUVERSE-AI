import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestTimeLeft, setGuestTimeLeft] = useState(180);
  const [guestAiRequests, setGuestAiRequests] = useState(10);
  const [guestExpired, setGuestExpired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.isGuest) {
        setGuestTimeLeft(parseInt(localStorage.getItem('guest_time_left') || '180', 10));
        setGuestAiRequests(parseInt(localStorage.getItem('guest_ai_requests') || '10', 10));
        setGuestExpired(localStorage.getItem('guest_expired') === 'true');
      }
      api.get('/auth/me').then((res) => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }).catch(() => {
        if (!parsedUser.isGuest) {
          logout();
        }
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Timer effect for Guest Session
  useEffect(() => {
    if (!user?.isGuest || guestExpired) return;

    const interval = setInterval(() => {
      setGuestTimeLeft((prev) => {
        const next = prev - 1;
        localStorage.setItem('guest_time_left', next.toString());
        if (next <= 0) {
          clearInterval(interval);
          setGuestExpired(true);
          localStorage.setItem('guest_expired', 'true');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [user, guestExpired]);

  const startGuestSession = () => {
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      role: 'student',
      name: 'Guest Learner',
      isGuest: true,
      profile_completed: true
    };
    setUser(guestUser);
    setGuestTimeLeft(180);
    setGuestAiRequests(10);
    setGuestExpired(false);
    localStorage.setItem('user', JSON.stringify(guestUser));
    localStorage.setItem('token', 'guest_token_session');
    localStorage.setItem('guest_time_left', '180');
    localStorage.setItem('guest_ai_requests', '10');
    localStorage.setItem('guest_expired', 'false');
  };

  const decrementGuestAiRequests = () => {
    setGuestAiRequests((prev) => {
      const next = Math.max(0, prev - 1);
      localStorage.setItem('guest_ai_requests', next.toString());
      return next;
    });
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Clear any guest state
    localStorage.removeItem('guest_time_left');
    localStorage.removeItem('guest_ai_requests');
    localStorage.removeItem('guest_expired');
    setGuestExpired(false);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Clear any guest state
    localStorage.removeItem('guest_time_left');
    localStorage.removeItem('guest_ai_requests');
    localStorage.removeItem('guest_expired');
    setGuestExpired(false);
    return data;
  };

  const loginWithGoogle = async (accessToken) => {
    const { data } = await api.post('/auth/google', { accessToken });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    // Clear any guest state
    localStorage.removeItem('guest_time_left');
    localStorage.removeItem('guest_ai_requests');
    localStorage.removeItem('guest_expired');
    setGuestExpired(false);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('guest_time_left');
    localStorage.removeItem('guest_ai_requests');
    localStorage.removeItem('guest_expired');
    setUser(null);
    setGuestExpired(false);
  };

  const setProfileCompleted = () => {
    const updated = { ...user, profile_completed: true };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      setProfileCompleted,
      isAdmin: user?.role === 'admin',
      profileCompleted: true,
      guestTimeLeft,
      guestAiRequests,
      guestExpired,
      startGuestSession,
      decrementGuestAiRequests
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
