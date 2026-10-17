import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export default function SessionTimeoutModal() {
  const { sessionTimeoutActive, sessionWarningOpen, resetActivity, unlockSession, currentUser } = useAuth();
  const [unlockPassword, setUnlockPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!sessionTimeoutActive && !sessionWarningOpen) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (unlockPassword.trim().length === 0) {
      setErrorMsg('Please enter your password to resume session');
      return;
    }
    unlockSession(unlockPassword);
    setUnlockPassword('');
    setErrorMsg('');
  };

  // Warning state (about to lock)
  if (sessionWarningOpen && !sessionTimeoutActive) {
    return (
      <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom duration-300">
        <div className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                Session Inactivity Warning
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Under Philippine Data Privacy rules, confidential records will automatically lock in 2 minutes of inactivity.
              </p>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={resetActivity}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                >
                  I'm Still Here (Keep Active)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Locked State
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300 mb-4">
          <Lock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confidential Session Locked</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Your session timed out due to inactivity to protect student records (RA 10173). Enter password to unlock.
        </p>

        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center gap-3 text-left">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.title}</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="mt-4 space-y-3">
          <input
            type="password"
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            placeholder="Enter password (e.g. password)"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            autoFocus
          />
          {errorMsg && <p className="text-xs text-rose-500 font-medium text-left">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            Unlock Session <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
