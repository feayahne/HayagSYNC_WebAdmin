import React, { useState } from 'react';
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
  Scale,
  Archive,
  Download,
  Clock,
  Award
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
  const [showArchivePacket, setShowArchivePacket] = useState(false);

  if (!incident) return null;

  const handleHandlerChange = (e) => {
    const selectedUserId = e.target.value;
    const user = usersList.find((u) => u.id === selectedUserId);
    if (user) {
      assignHandler(incident.id, user.id, user.name);
    }
  };

  const isResolvedOrClosed =
    incident.status?.toLowerCase() === 'resolved' ||
    incident.status?.toLowerCase() === 'closed';

  return (
    <>
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
              {isResolvedOrClosed && (
                <button
                  onClick={() => setShowArchivePacket(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm md:text-base font-bold transition flex items-center gap-2 shadow-sm"
                  title="View Sealed Case Archive Packet"
                >
                  <Archive className="w-4 h-4" /> Case Archive Packet
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

          {/* Disciplinary Approval & Administrative Hierarchy Trail */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0f2444] dark:text-blue-400 mb-3 flex items-center gap-2">
              <Scale className="w-4 h-4" /> Disciplinary Approval & Administrative Hierarchy Trail (Layer 1)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stage 1: Intake
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">Adviser Acknowledged</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Report logged & intake initiated</p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stage 2: Guidance
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">Ministrong Tagasubaybay</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Parent conference & mediation</p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-1">
                  <Clock className="w-3.5 h-3.5" /> Stage 3: Sanction
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">Principal / OSD Review</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Corrective measure disposition</p>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className={`flex items-center gap-2 font-bold text-xs uppercase mb-1 ${isResolvedOrClosed ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <Award className="w-3.5 h-3.5" /> Stage 4: Resolution
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">Institutional Archive</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{isResolvedOrClosed ? 'Sealed & Abstracted' : 'Pending final closure'}</p>
              </div>
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
              <FileText className="w-4 h-4 text-[#0f2444] dark:text-blue-400" /> Attached Incident Evidence & Provenance Screening ({incident.evidence?.length || 0})
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
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        ✓ Screening: Metadata Provenance Preserved
                      </p>
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

      {/* Case Archive Packet Modal (Layer 2 & 3) */}
      {showArchivePacket && (
        <Modal
          isOpen={showArchivePacket}
          onClose={() => setShowArchivePacket(false)}
          title={`Institutional Case Archive Packet: ${incident.case_number}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm space-y-2">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-900 dark:text-white">Case Number:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{incident.case_number}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Subject Student:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{incident.student_name} ({incident.section})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Incident Category:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{incident.category} Bullying</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Disciplinary Sanction:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{incident.sanction || 'Restorative Mediation / Warning'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700">
              <h5 className="font-bold text-xs uppercase tracking-wider text-[#0f2444] dark:text-blue-400 mb-2">
                Post-Resolution Case Abstract (Layer 3)
              </h5>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                {`=== ARCHIVE CASE ABSTRACT ===
Case ID: ${incident.case_number} | Status: ${incident.status?.toUpperCase()}
Subject Student: ${incident.student_name} (${incident.section})
Category: ${incident.category} Bullying
Location: ${incident.incident_location}
Occurrence: ${new Date(incident.incident_date).toLocaleString()}

Summary of Incident:
"${incident.description}"

Disciplinary Disposition:
• Action: ${incident.sanction || 'Counseling & Restorative Agreement'}
• Procedural Trail: 100% verified across Homeroom, Guidance, and OSD records.

Archival Compliance: Sealed in compliance with DepEd Child Protection Policy (DO 40, s. 2012).`}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowArchivePacket(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert('Case Archive Packet exported for permanent institutional records.');
                  setShowArchivePacket(false);
                }}
                className="px-4 py-2 text-sm font-bold rounded-lg bg-[#0f2444] hover:bg-[#1a365d] text-white flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Export Archive Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
