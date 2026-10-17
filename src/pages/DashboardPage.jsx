import React from 'react';
import { useIncidents } from '../context/IncidentContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/common/StatusBadge';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import OffenseDistributionChart from '../components/charts/OffenseDistributionChart';
import {
  Clock,
  AlertTriangle,
  Scale,
  UserX,
  Hammer,
  ArrowRight,
  Shield,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage({
  onSelectIncident,
  onViewStudent,
  onNavigateTab,
}) {
  const { incidents, students, appeals, communityServices, isRepeatOffender } = useIncidents();
  const { currentUser, isOSD } = useAuth();

  // Status counts for the five key categories
  const recentCount = incidents.filter((i) => i.status === 'Recent Report').length;
  const ongoingCount = incidents.filter((i) => i.status === 'Ongoing Report').length;
  const appealedCount = incidents.filter((i) => i.status === 'Appealed').length;
  const expelledCount = incidents.filter((i) => i.status === 'Expelled').length;
  const communityCount = incidents.filter((i) => i.status === 'Community Service').length;

  // The 5 Large Status Cards as specified:
  // Recent = blue, Ongoing = orange, Appealed = purple, Expelled = red, Community Service = teal
  const statusCards = [
    {
      id: 'Recent Report',
      label: 'Recent Reports',
      count: recentCount,
      description: 'Newly filed cases awaiting administrative review',
      borderClass: 'border-blue-600',
      bgClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100',
      badgeClass: 'bg-blue-600 text-white',
      icon: Clock,
      statusKey: 'Recent Report',
    },
    {
      id: 'Ongoing Report',
      label: 'Ongoing Reports',
      count: ongoingCount,
      description: 'Cases actively under investigation or formal hearing',
      borderClass: 'border-amber-600',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100',
      badgeClass: 'bg-amber-600 text-white',
      icon: AlertTriangle,
      statusKey: 'Ongoing Report',
    },
    {
      id: 'Appealed',
      label: 'Appealed Cases',
      count: appealedCount,
      description: 'Formal guardian petitions contested for review',
      borderClass: 'border-purple-600',
      bgClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100',
      badgeClass: 'bg-purple-600 text-white',
      icon: Scale,
      statusKey: 'Appealed',
    },
    {
      id: 'Expelled',
      label: 'Expelled Records',
      count: expelledCount,
      description: 'Final sanctions issued under Board resolution',
      borderClass: 'border-rose-600',
      bgClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100',
      badgeClass: 'bg-rose-600 text-white',
      icon: UserX,
      statusKey: 'Expelled',
    },
    {
      id: 'Community Service',
      label: 'Community Service',
      count: communityCount,
      description: 'Restitution hours currently assigned and in progress',
      borderClass: 'border-teal-600',
      bgClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100',
      badgeClass: 'bg-teal-600 text-white',
      icon: Hammer,
      statusKey: 'Community Service',
    },
  ];

  // Needs Attention items:
  // 1. Pending appeals
  // 2. Repeat offenders
  // 3. High severity recent cases
  const needsAttentionList = [
    ...appeals
      .filter((a) => a.status === 'Pending' || a.status === 'Under Review')
      .map((a) => ({
        id: a.id,
        type: 'Appeal Review',
        title: `Appeal filed for Case #${a.case_number}`,
        subtitle: `Reason: "${a.reason_for_appeal}"`,
        urgency: 'High Priority',
        urgencyClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
        actionLabel: 'Review Appeal',
        tabTarget: 'appeals',
      })),
    ...students
      .filter((s) => isRepeatOffender(s.id))
      .slice(0, 3)
      .map((s) => ({
        id: s.id,
        type: 'Repeat Offender',
        title: `Student Flag: ${s.name} (${s.section})`,
        subtitle: `Multiple recorded disciplinary incidents. Escalated counseling required.`,
        urgency: 'Action Needed',
        urgencyClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
        actionLabel: 'View Record',
        studentId: s.id,
      })),
    ...incidents
      .filter((i) => i.status === 'Recent Report' && (i.severity === 'High' || i.severity === 'Critical'))
      .slice(0, 3)
      .map((i) => ({
        id: i.id,
        type: 'Severe Incident',
        title: `High Severity: ${i.title}`,
        subtitle: `Student: ${i.student_name} (${i.section}) • Filed on ${new Date(i.incident_date).toLocaleDateString()}`,
        urgency: 'Urgent Intake',
        urgencyClass: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
        actionLabel: 'Open Case',
        incidentObj: i,
      })),
  ];

  return (
    <div className="space-y-7">
      {/* Institutional Welcome Card */}
      <div className="p-6 sm:p-7 rounded-xl bg-[#0f2444] text-white border border-[#1b365d] shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-blue-900 text-blue-200 border border-blue-700">
            Official Disciplinary Console • School Year 2025–2026
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2.5 text-white">
            Overview Dashboard
          </h1>
          <p className="text-base text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
            Welcome, <strong>{currentUser?.name}</strong>. Access is restricted under the Philippine Data Privacy Act (RA 10173). Select any status card below to view corresponding case records.
          </p>
        </div>
      </div>

      {/* Five Large Status Cards (Recent, Ongoing, Appealed, Expelled, Community Service) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Incident Records by Current Status
          </h2>
          <span className="text-sm font-semibold text-slate-500">
            Click any card to view records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statusCards.map((card) => {
            const CardIcon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigateTab('incidents', card.statusKey)}
                className={`p-5 rounded-xl border-t-4 ${card.borderClass} ${card.bgClass} border-x border-b border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer focus:outline-none`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      {card.label}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-slate-900/80 flex items-center justify-center shrink-0 shadow-2xs">
                      <CardIcon className="w-4 h-4" aria-hidden="true" />
                    </div>
                  </div>

                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    {card.count}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-300 group-hover:underline">
                  <span>View Filtered List</span>
                  <ArrowRight className="w-3.5 h-3.5 transition group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Simple Bar Chart & Needs Attention List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Simple Analytics Chart (7 Columns) */}
        <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Incident Frequency by Month
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Disciplinary trend across the current academic term
            </p>
          </div>

          <MonthlyTrendChart incidents={incidents} />
        </div>

        {/* Needs Attention List (5 Columns) */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-700" />
                <span>Needs Attention</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Critical items requiring administrative action
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-800 rounded-md">
              {needsAttentionList.length} Items
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[360px] pr-1">
            {needsAttentionList.length > 0 ? (
              needsAttentionList.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded border uppercase ${item.urgencyClass}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (item.tabTarget) onNavigateTab(item.tabTarget);
                      else if (item.studentId) onViewStudent(item.studentId);
                      else if (item.incidentObj) onSelectIncident(item.incidentObj);
                    }}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    {item.actionLabel}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  All items are up to date
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  No overdue appeals or unreviewed severe incidents at this time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
