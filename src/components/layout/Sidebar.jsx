import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  Scale,
  Clock,
  UserX,
  ScrollText,
  Settings,
  Shield,
  LogOut,
  Building2
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout, isOSD, isMinistro, isPrincipal, isAdviser, isBoard, isPresident } = useAuth();
  const { appeals, communityServices, incidents } = useIncidents();

  // Badge counts
  const pendingAppealsCount = appeals.filter(
    (a) => a.status === 'Pending' || a.status === 'Under Review'
  ).length;
  const activeServiceCount = communityServices.filter(
    (c) => c.status === 'In Progress'
  ).length;
  const recentReportCount = incidents.filter(
    (i) => i.status === 'Recent Report'
  ).length;

  // The 8 navigation items requested:
  // Dashboard, Reports, Students, Appeals, Community Service, Expelled, Audit Log, Settings
  // Note: Board of Discipline has restricted administrative scope (no settings management)
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'incidents',
      label: 'Reports',
      icon: FileSpreadsheet,
      badge: recentReportCount,
      badgeColor: 'bg-blue-600 text-white',
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users,
    },
    {
      id: 'appeals',
      label: 'Appeals',
      icon: Scale,
      badge: pendingAppealsCount,
      badgeColor: 'bg-purple-700 text-white',
    },
    {
      id: 'community-service',
      label: 'Community Service',
      icon: Clock,
      badge: activeServiceCount,
      badgeColor: 'bg-teal-700 text-white',
    },
    {
      id: 'expulsions',
      label: 'Expelled',
      icon: UserX,
    },
    {
      id: 'audit-logs',
      label: 'Audit Log',
      icon: Shield,
    },
    ...(!isBoard
      ? [
          {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <aside className="w-68 bg-[#0f2444] text-slate-100 border-r border-[#1b365d] flex flex-col h-full shrink-0 select-none shadow-md">
      {/* Brand & Organization Header */}
      <div className="p-5 border-b border-[#1b365d] flex items-center gap-3.5 bg-[#0a1a33]">
        <div className="w-11 h-11 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm font-black text-xl tracking-wider shrink-0 border border-blue-500/30">
          H
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-white">HAYAGSYNC</span>
            <span className="text-[11px] bg-blue-900 text-blue-200 border border-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">
              CONSOLE
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium truncate">
            Discipline & Guidance Office
          </p>
        </div>
      </div>

      {/* Navigation Menu (Icon + Text Label for Every Item) */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5" aria-label="Main Navigation">
        <div className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                isActive
                  ? 'bg-blue-800 text-white shadow-sm font-bold border-l-4 border-blue-300'
                  : 'text-slate-200 hover:bg-[#1b365d] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile & Sign Out (No Role Switcher) */}
      <div className="p-4 border-t border-[#1b365d] bg-[#0a1a33] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-slate-500 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-blue-300 truncate font-semibold">
                {isAdviser
                  ? 'Section Adviser'
                  : isPrincipal
                  ? 'School Principal'
                  : isOSD
                  ? 'OSD Discipline Officer'
                  : isMinistro
                  ? 'Ministrong Tagasubaybay'
                  : isBoard
                  ? 'Board of Discipline'
                  : isPresident
                  ? 'School President'
                  : currentUser?.title || 'Staff Official'}
              </p>
              {currentUser?.assigned_section && (
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/80 text-blue-200 border border-blue-700/60 truncate max-w-[140px]">
                  {currentUser.assigned_section}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-2 text-slate-300 hover:text-rose-300 hover:bg-[#1b365d] rounded-lg transition shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
