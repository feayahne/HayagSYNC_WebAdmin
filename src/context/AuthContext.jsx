import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_USERS } from '../data/initialSeedData';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Read authenticated user from localStorage, or null (requires login)
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hayagsync_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (['osd', 'ministrong_tagasubaybay', 'board_of_discipline', 'principal', 'adviser', 'school_president'].includes(parsed?.role)) {
          return parsed;
        }
      } catch {
        // ignore parse error
      }
    }
    return null;
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

  const authenticate = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { success: false, error: 'Please enter both your email and password.' };
    }

    let authenticatedUser = null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', cleanEmail)
        .maybeSingle();

      if (data && !error) {
        // Match password (standard default is 'password' or direct match)
        if (password === 'password' || data.password === password) {
          authenticatedUser = {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            assigned_section: data.assigned_section || data.student_section || '',
            title: data.title || (
              data.role === 'principal'
                ? (data.email.includes('jhs') ? 'Junior High School Principal (Grades 7–10)' : 'Senior High School Principal (Grades 11–12)')
                : data.role === 'adviser'
                ? `Section Adviser - ${data.assigned_section || ''}`
                : data.role === 'ministrong_tagasubaybay'
                ? `Ministrong Tagasubaybay - ${data.assigned_section || ''}`
                : data.role === 'osd'
                ? `OSD Discipline Officer - ${data.assigned_section || ''}`
                : 'Staff Official'
            ),
            department: data.department || (
              data.role === 'principal'
                ? 'Office of the Principal'
                : data.role === 'adviser'
                ? 'Faculty / Grade Level Department'
                : 'Guidance & Student Well-Being Office'
            ),
            avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          };
        }
      }
    } catch (e) {
      console.warn('Database auth query notice:', e);
    }

    // Fallback match against INITIAL_USERS
    if (!authenticatedUser) {
      const localMatch = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      if (localMatch && (password === 'password' || password === 'admin123')) {
        authenticatedUser = localMatch;
      }
    }

    if (authenticatedUser) {
      login(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } else {
      return { success: false, error: 'Authentication failed. Please verify your email and password.' };
    }
  };

  // Helper getters
  const isOSD = currentUser?.role === 'osd';
  const isMinistro = currentUser?.role === 'ministrong_tagasubaybay';
  const isPrincipal = currentUser?.role === 'principal';
  const isAdviser = currentUser?.role === 'adviser';
  const isBoard = currentUser?.role === 'board_of_discipline';
  const isPresident = currentUser?.role === 'school_president';
  const isStaff = ['osd', 'ministrong_tagasubaybay', 'principal', 'adviser', 'board_of_discipline', 'school_president'].includes(currentUser?.role);
  const isAdmin = isStaff;
  const isReporterOnly = currentUser?.role === 'reporter' || !isAdmin;

  const isJhsPrincipal = isPrincipal && (
    (currentUser?.email || '').toLowerCase().includes('jhs') ||
    (currentUser?.assigned_section || '').includes('7-10') ||
    (currentUser?.title || '').toLowerCase().includes('junior')
  );

  const isShsPrincipal = isPrincipal && (
    (currentUser?.email || '').toLowerCase().includes('shs') ||
    (currentUser?.assigned_section || '').includes('11-12') ||
    (currentUser?.title || '').toLowerCase().includes('senior')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        authenticate,
        isAdmin,
        isStaff,
        isOSD,
        isMinistro,
        isPrincipal,
        isJhsPrincipal,
        isShsPrincipal,
        isAdviser,
        isBoard,
        isPresident,
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
