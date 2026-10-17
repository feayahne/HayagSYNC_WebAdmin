import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
  UserCheck,
  Building2,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { login, usersList } = useAuth();

  // Active administrative office portal: 'osd' or 'ministrong_tagasubaybay'
  const [activePortal, setActivePortal] = useState('osd');
  const [email, setEmail] = useState('osd@hayag.edu.ph');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPortal = (portalKey) => {
    setActivePortal(portalKey);
    setErrorMsg('');
    if (portalKey === 'osd') {
      setEmail('osd@hayag.edu.ph');
    } else {
      setEmail('ministro@hayag.edu.ph');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const targetUser = usersList.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        (u.role === 'osd' || u.role === 'ministrong_tagasubaybay')
    );

    if (targetUser) {
      login(targetUser);
    } else {
      setErrorMsg(
        'Access Denied: Only registered OSD and Ministrong Tagasubaybay administrator accounts are authorized to sign in.'
      );
    }
  };

  const handleDirectDemoLogin = (portalKey) => {
    const user = usersList.find((u) => u.role === portalKey) || usersList[0];
    login(user);
  };

  const isOSD = activePortal === 'osd';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 select-none text-slate-900 font-sans">
      {/* Institutional Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#0f2444] text-white shadow-sm font-black text-2xl tracking-wider border border-blue-900/40">
          H
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2444] tracking-tight">
          HAYAGSYNC WEB
        </h1>
        <p className="text-sm font-semibold text-slate-600">
          Department of Education • Disciplinary Administrative Console
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-9 shadow-md rounded-xl border border-slate-300 space-y-6">
          {/* Dual Office Selector Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2 text-center">
              Select Your Administrative Office:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-300">
              {/* OSD Portal */}
              <button
                type="button"
                onClick={() => handleSelectPortal('osd')}
                className={`py-3 px-3 rounded-lg text-left transition flex flex-col justify-between ${
                  isOSD
                    ? 'bg-[#0f2444] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Scale className={`w-4 h-4 ${isOSD ? 'text-blue-300' : 'text-slate-500'}`} />
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isOSD ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    OSD Head
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">OSD Office</p>
                  <p className={`text-xs truncate ${isOSD ? 'text-slate-300' : 'text-slate-500'}`}>
                    Student Discipline
                  </p>
                </div>
              </button>

              {/* Ministrong Tagasubaybay Portal */}
              <button
                type="button"
                onClick={() => handleSelectPortal('ministrong_tagasubaybay')}
                className={`py-3 px-3 rounded-lg text-left transition flex flex-col justify-between ${
                  !isOSD
                    ? 'bg-[#0f2444] text-white shadow-xs font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ShieldCheck className={`w-4 h-4 ${!isOSD ? 'text-blue-300' : 'text-slate-500'}`} />
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      !isOSD ? 'bg-blue-900 text-blue-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    Guidance
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">Tagasubaybay</p>
                  <p className={`text-xs truncate ${!isOSD ? 'text-slate-300' : 'text-slate-500'}`}>
                    Guidance Director
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields: Single Column, Large Inputs, Visible Labels */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5">
                Official School Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. osd@hayag.edu.ph"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0f2444] font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-slate-800 block mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0f2444] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-sm text-rose-900 font-semibold flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Clear Primary Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-[#0f2444] hover:bg-[#1b365d] text-white rounded-lg text-base font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign In to Disciplinary Console</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Quick One-Click Demo Verification */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2 text-center">
              Demonstration One-Click Sign In:
            </span>
            <button
              type="button"
              onClick={() => handleDirectDemoLogin(activePortal)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-900" />
              <span>
                Enter Console as {isOSD ? 'OSD Admin (Atty. Roberto Mendoza)' : 'Ministro (Gng. Corazon Alcantara)'}
              </span>
            </button>
          </div>
        </div>

        {/* Legal & Data Privacy Act Compliance Notice */}
        <div className="mt-6 p-4 rounded-xl bg-white border border-slate-300 text-center space-y-1 shadow-xs">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Philippine Data Privacy Act (RA 10173) • Confidential minor records
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access is restricted to authorized school discipline administrators. All logins and record views are permanently logged in the audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}
