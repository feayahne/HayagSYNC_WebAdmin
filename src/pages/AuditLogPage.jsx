import React, { useState } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { Shield, Search, Filter, Lock } from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs } = useIncidents();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchUser = log.user_name.toLowerCase().includes(q);
      const matchEntity = log.target_entity.toLowerCase().includes(q);
      const matchId = (log.target_id || '').toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      if (!matchUser && !matchEntity && !matchId && !matchDetails) return false;
    }
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    return true;
  });

  const getActionBadge = (act) => {
    switch (act) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'STATUS_CHANGE':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'EXPEL':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'APPEAL_DECISION':
      case 'APPEAL_REVIEW':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'EXPORT':
      case 'PRINT':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Shield className="w-7 h-7 text-blue-900 dark:text-blue-400" />
            <span>Security Audit Log (Talaan ng Pagsusuri)</span>
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
            Immutable tracking of all record accesses, status updates, decisions, and data exports
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0f2444] text-white rounded-lg text-sm font-semibold shadow-xs">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Immutable Audit Protocol Active</span>
        </span>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Search Audit Records
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search official name, target ID, details..."
              className="w-full pl-10 pr-4 py-2.5 text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Filter by Action Type
          </label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-white text-base"
          >
            <option value="ALL">All Actions</option>
            <option value="VIEW">VIEW (Record Inspection)</option>
            <option value="CREATE">CREATE (Filing Report)</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE (Workflow)</option>
            <option value="ASSIGN">ASSIGN (Handler Assign)</option>
            <option value="APPEAL_REVIEW">APPEAL_REVIEW</option>
            <option value="EXPEL">EXPEL (Expulsion Resolution)</option>
            <option value="EXPORT">EXPORT (Data Export)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table: Sticky Header, Zebra Rows, Text >= 15px */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[15px] border-collapse">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700 select-none">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Reference ID</th>
                <th className="py-3.5 px-4">Audit Details & Changes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="odd:bg-white even:bg-slate-50/80 hover:bg-blue-50/60 dark:odd:bg-slate-900 dark:even:bg-slate-850">
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm">
                    {new Date(log.timestamp).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white text-base">
                      {log.user_name}
                    </p>
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                      {log.user_role === 'osd' ? 'OSD Head' : 'Ministro ng Tagasubaybay'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {log.target_entity}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900 dark:text-blue-300 whitespace-nowrap">
                    {log.target_id || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
