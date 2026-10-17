import React from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';
import { useAuth } from '../../context/AuthContext';
import { useIncidents } from '../../context/IncidentContext';
import {
  Calendar,
  MapPin,
  User,
  Shield,
  FileText,
  AlertTriangle,
  History,
  CheckCircle2,
  ExternalLink,
  Printer,
  Scale
} from 'lucide-react';

export default function IncidentDetailModal({
  isOpen,
  onClose,
  incident,
  onChangeStatus,
  onViewStudent,
  onGenerateSummons,
}) {
  const { isOSD, isAdmin, usersList } = useAuth();
  const { assignHandler } = useIncidents();

  if (!incident) return null;

  const handleHandlerChange = (e) => {
    const selectedUserId = e.target.value;
    const user = usersList.find((u) => u.id === selectedUserId);
    if (user) {
      assignHandler(incident.id, user.id, user.name);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Official Case Record: ${incident.case_number}`} maxWidth="max-w-4xl">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-[#0f2444] dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                {incident.case_number}
              </span>
              <StatusBadge status={incident.status} />
              <SeverityBadge severity={incident.severity} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">{incident.title}</h2>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => onChangeStatus(incident)}
                className="px-4 py-2.5 bg-[#0f2444] hover:bg-[#1a365d] text-white rounded-lg text-sm md:text-base font-bold shadow-sm transition"
              >
                Update Case Status / Sanction
              </button>
            )}
            <button
              onClick={() => onGenerateSummons(incident)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 rounded-lg text-sm md:text-base font-bold transition flex items-center gap-2 border border-slate-300 dark:border-slate-600"
              title="Print Guardian Summons Notice"
            >
              <Printer className="w-4 h-4" /> Print Summons Letter
            </button>
          </div>
        </div>

        {/* Student & Involved Parties */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0f2444] dark:text-blue-400" /> Student Subject (Biktima / Involved)
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">{incident.student_name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{incident.section} • LRN: {incident.student_lrn}</p>
              </div>
              <button
                onClick={() => onViewStudent(incident.student_id)}
                className="text-sm text-[#0f2444] dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                View Profile History <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Alleged Bully / Offender
            </h4>
            <p className="text-base font-bold text-slate-900 dark:text-white">{incident.alleged_offender || 'Not specified'}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Witnesses: {incident.witnesses || 'None logged'}</p>
          </div>
        </div>

        {/* Incident Particulars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-bold text-xs uppercase">Offense Category:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base mt-1 block">{incident.category}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-bold text-xs uppercase">Date & Time:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
              {new Date(incident.incident_date).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-bold text-xs uppercase">Location:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-1 block">{incident.incident_location}</span>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400 block font-bold text-xs uppercase">Reported By:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 mt-1 block">
              {incident.reporter_name} <span className="text-xs text-slate-500">({incident.reporter_role})</span>
            </span>
          </div>
        </div>

        {/* Incident Description */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">Detailed Observation / Incident Summary</h4>
          <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{incident.description}</p>
        </div>

        {/* Assigned Handler Selection (Ministrong Tagasubaybay vs OSD) */}
        {isAdmin && (
          <div className="p-5 rounded-xl bg-blue-50/70 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#0f2444] dark:text-blue-400" />
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white">Assigned Disciplinary Handler</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Designated school official presiding over hearing & counseling</p>
              </div>
            </div>
            <select
              value={incident.handler_id || ''}
              onChange={handleHandlerChange}
              className="px-4 py-2 text-base bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0f2444]"
            >
              <option value="">-- Assign Case Handler --</option>
              {usersList
                .filter((u) => u.role === 'osd' || u.role === 'ministrong_tagasubaybay')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'osd' ? 'OSD Head' : 'Ministro ng Tagasubaybay'})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Evidence Attachments */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2.5 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0f2444] dark:text-blue-400" /> Attached Incident Evidence ({incident.evidence?.length || 0})
          </h4>
          {incident.evidence && incident.evidence.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {incident.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500 uppercase font-mono mt-0.5">{ev.type} • {ev.file_size}</p>
                  </div>
                  {ev.type === 'photo' && ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-lg text-[#0f2444] dark:text-blue-400 border border-slate-300 dark:border-slate-700 shrink-0"
                    >
                      View Photo
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">No external photographic or document evidence attached to this case.</p>
          )}
        </div>

        {/* Status History & Remarks Timeline */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-5">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-[#0f2444] dark:text-blue-400" /> Case Status Workflow History & Audit Trail
          </h4>
          <div className="space-y-3">
            {incident.status_history && incident.status_history.length > 0 ? (
              incident.status_history.map((hist, idx) => (
                <div key={idx} className="flex items-start gap-3.5 text-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0f2444] dark:bg-blue-400 mt-2 shrink-0" />
                  <div className="flex-1 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-base">
                        {hist.from_status} → <span className="text-[#0f2444] dark:text-blue-400 underline">{hist.to_status}</span>
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {new Date(hist.timestamp).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 mt-1.5 leading-relaxed font-medium">{hist.remark}</p>
                    <p className="text-xs text-slate-500 mt-1">Logged by: <strong>{hist.changed_by}</strong> ({hist.role})</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">Initial filing status recorded.</div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
