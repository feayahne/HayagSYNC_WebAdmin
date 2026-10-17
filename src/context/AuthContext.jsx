import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_USERS } from '../data/initialSeedData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default logged in as OSD Admin, or read from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hayagsync_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'osd' || parsed?.role === 'ministrong_tagasubaybay') {
          return parsed;
        }
      } catch {
        // ignore parse error
      }
    }
    return INITIAL_USERS[0]; // Default: Atty. Roberto Mendoza (OSD)
  });

  const [sessionTimeoutActive, setSessionTimeoutActive] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [sessionWarningOpen, setSessionWarningOpen] = useState(false);

  // 15-minute inactivity timeout configuration (demonstrated with alert capability)
  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 mins
  const WARNING_DURATION = 13 * 60 * 1000; // Warning at 13 mins

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (sessionWarningOpen) {
      setSessionWarningOpen(false);
    }
  }, [sessionWarningOpen]);

  useEffect(() => {
    const onUserActivity = () => resetActivity();
    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('click', onUserActivity);
    };
  }, [resetActivity]);

  // Session monitor loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (!currentUser) return;
      const elapsed = Date.now() - lastActivity;

      if (elapsed > TIMEOUT_DURATION) {
        // Auto-lock session
        setSessionTimeoutActive(true);
        setSessionWarningOpen(false);
      } else if (elapsed > WARNING_DURATION && !sessionWarningOpen) {
        setSessionWarningOpen(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, lastActivity, sessionWarningOpen]);

  const login = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('hayagsync_user', JSON.stringify(userObj));
    setSessionTimeoutActive(false);
    setSessionWarningOpen(false);
    setLastActivity(Date.now());
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hayagsync_user');
    setSessionTimeoutActive(false);
  };

  const unlockSession = (password) => {
    // For demo purposes, any valid entry unlocks
    setSessionTimeoutActive(false);
    setLastActivity(Date.now());
    setSessionWarningOpen(false);
  };

  const switchRole = (roleKey) => {
    const target = INITIAL_USERS.find(u => u.role === roleKey) || INITIAL_USERS[0];
    login(target);
  };

  // Helper getters
  const isAdmin = currentUser?.role === 'osd' || currentUser?.role === 'ministrong_tagasubaybay';
  const isOSD = currentUser?.role === 'osd';
  const isMinistro = currentUser?.role === 'ministrong_tagasubaybay';
  const isReporterOnly = currentUser?.role === 'reporter' || !isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        isAdmin,
        isOSD,
        isMinistro,
        isReporterOnly,
        sessionTimeoutActive,
        sessionWarningOpen,
        unlockSession,
        resetActivity,
        usersList: INITIAL_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
