import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import {
  RefreshCw,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Clock,
  Database,
  ArrowRight,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function EtlManagementPage() {
  const { currentUser } = useAuth();
  const [etlRuns, setEtlRuns] = useState([]);
  const [rejectedRecords, setRejectedRecords] = useState([]);
  const [guardianships, setGuardianships] = useState([]);
  const [activeTab, setActiveTab] = useState('runs'); // 'runs', 'rejected', 'relationships'
  const [isRunningSync, setIsRunningSync] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // Fetch ETL history
  const fetchEtlData = async () => {
    try {
      // 1. Fetch ETL runs
      const { data: runs } = await supabase
        .from('etl_runs')
        .select('*')
        .order('id', { ascending: false })
        .limit(20);
      if (runs) setEtlRuns(runs);

      // 2. Fetch Rejected records
      const { data: rejected } = await supabase
        .from('etl_rejected_records')
        .select('*, etl_runs(batch_id, started_at)')
        .order('id', { ascending: false })
        .limit(30);
      if (rejected) setRejectedRecords(rejected);

      // 3. Fetch Guardianships sample
      const { data: guards } = await supabase
        .from('parent_student_guardianships')
        .select(`
          id, relationship_type, is_primary_contact, created_at,
          parent_profiles (user_id, phone_number, users:user_id(name, email)),
          students (id, lrn, name, grade, section)
        `)
        .order('id', { ascending: false })
        .limit(15);
      if (guards) setGuardianships(guards);
    } catch (_) {}
  };

  useEffect(() => {
    fetchEtlData();
  }, []);

  // Trigger Manual Institutional Sync via Supabase RPC
  const handleTriggerSync = async () => {
    setIsRunningSync(true);
    setSyncFeedback(null);

    // Demonstration batch payload containing both valid and deliberate boundary records to test validation
    const samplePayload = {
      staff: [
        {
          name: 'Ms. Clara Mahogany',
          email: 'adviser.grade-7-mahogany@hayag.edu.ph',
          role: 'adviser',
          assigned_section: 'Grade 7 - Mahogany'
        },
        {
          name: 'Mr. Dennis Narra',
          email: 'adviser.grade-7-narra@hayag.edu.ph',
          role: 'adviser',
          assigned_section: 'Grade 7 - Narra'
        },
        {
          name: 'Invalid Staff Test',
          email: 'not-an-email-address', // deliberate error for testing rejected records
          role: 'adviser',
          assigned_section: 'Grade 8 - Uranus'
        }
      ],
      students: [
        {
          lrn: '10928374001',
          name: 'Sophia Mahogany',
          grade: 'Grade 7',
          section: 'Grade 7 - Mahogany',
          guardian_name: 'Mrs. Dolores Mahogany',
          guardian_email: 'sophiamama@gmail.com',
          guardian_phone: '+63 917 234 5678'
        },
        {
          lrn: '10928374002',
          name: 'Ethan Santos',
          grade: 'Grade 7',
          section: 'Grade 7 - Mahogany',
          guardian_name: 'Mr. Eduardo Santos',
          guardian_email: 'ethanparent@gmail.com',
          guardian_phone: '+63 918 345 6789'
        },
        {
          lrn: 'BAD_LRN_123', // deliberate invalid LRN for rejected records test
          name: 'Faulty LRN Student',
          grade: 'Grade 10',
          section: 'Grade 10 - Rizal'
        }
      ]
    };

    try {
      const { data, error } = await supabase.rpc('run_institutional_sync_etl', {
        p_batch_payload: samplePayload,
        p_triggered_by: currentUser?.name || 'Administrator',
        p_trigger_type: 'MANUAL'
      });

      if (error) {
        setSyncFeedback({ success: false, message: error.message });
      } else {
        setSyncFeedback({
          success: true,
          message: `Sync Completed Successfully! Processed: ${data.total_processed}, Inserted: ${data.inserted}, Updated: ${data.updated}, Deactivated: ${data.deactivated}, Rejected/Failed: ${data.failed}`
        });
        await fetchEtlData();
      }
    } catch (e) {
      setSyncFeedback({ success: false, message: e.message });
    } finally {
      setIsRunningSync(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="w-7 h-7 text-blue-900 dark:text-blue-400" />
            <span>Synchronized Institutional ETL Pipeline (Gap 1)</span>
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
            Idempotent roster synchronization, validation checks, rejected records report, and execution audit logging
          </p>
        </div>

        <button
          onClick={handleTriggerSync}
          disabled={isRunningSync}
          className="px-5 py-2.5 bg-[#0f2444] hover:bg-[#1a365d] text-white rounded-xl font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningSync ? 'animate-spin' : ''}`} />
          <span>{isRunningSync ? 'Executing ETL Pipeline...' : 'Run Institutional Sync Now'}</span>
        </button>
      </div>

      {/* Sync Status Banner */}
      {syncFeedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            syncFeedback.success
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
          }`}
        >
          {syncFeedback.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-sm font-semibold">{syncFeedback.message}</span>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Pipeline Runs</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{etlRuns.length}</p>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Logged in public.etl_runs</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Last Run Status</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {etlRuns[0]?.status || 'IDLE'}
          </p>
          <span className="text-xs text-slate-500">
            {etlRuns[0]?.started_at ? new Date(etlRuns[0].started_at).toLocaleTimeString() : 'Never'}
          </span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Rejected Records</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{rejectedRecords.length}</p>
          <span className="text-xs text-amber-600 font-semibold">Validation exceptions caught</span>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Pipeline Mode</span>
          <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">Idempotent Upsert</p>
          <span className="text-xs text-slate-500">Supports Incremental Updates</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('runs')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'runs'
              ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          ETL Run Logs ({etlRuns.length})
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'rejected'
              ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Rejected Records Report ({rejectedRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('relationships')}
          className={`pb-3 px-4 font-bold text-sm border-b-2 transition ${
            activeTab === 'relationships'
              ? 'border-blue-900 text-blue-900 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Normalized Guardianships Preview ({guardianships.length})
        </button>
      </div>

      {/* Tab 1: ETL Runs Table */}
      {activeTab === 'runs' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Run ID / Batch</th>
                  <th className="py-3 px-4">Trigger</th>
                  <th className="py-3 px-4">Started At</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Processed</th>
                  <th className="py-3 px-4">Inserted</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4">Failed</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {etlRuns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500 italic">
                      No ETL runs logged yet. Click "Run Institutional Sync Now" above to trigger.
                    </td>
                  </tr>
                ) : (
                  etlRuns.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 dark:text-blue-400">
                        #{r.id} <span className="text-xs text-slate-500 font-normal">({r.batch_id?.substring(0, 8)})</span>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800">
                          {r.trigger_type} ({r.triggered_by})
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(r.started_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {r.ended_at ? `${Math.max(1, Math.round((new Date(r.ended_at) - new Date(r.started_at)) / 1000))}s` : 'In progress'}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{r.total_records}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-600">+{r.inserted_count}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">~{r.updated_count}</td>
                      <td className="py-3 px-4 font-semibold text-rose-600">{r.failed_count}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                            r.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : r.status === 'PARTIAL_SUCCESS'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Rejected Records Inspector */}
      {activeTab === 'rejected' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Validation Failure Reason</th>
                  <th className="py-3 px-4">Raw Payload Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rejectedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                      Zero rejected records! All incoming roster records satisfied strict validation rules.
                    </td>
                  </tr>
                ) : (
                  rejectedRecords.map((rej) => (
                    <tr key={rej.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850">
                      <td className="py-3 px-4 font-mono text-xs">#{rej.id}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {rej.entity_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                        {rej.source_record_identifier || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-slate-900 dark:text-slate-100 font-medium">
                        {rej.rejection_reason}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500 max-w-xs truncate">
                        {JSON.stringify(rej.raw_data)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Normalized Guardianships Preview */}
      {activeTab === 'relationships' && (
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Relationship ID</th>
                  <th className="py-3 px-4">Parent Name & Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Student Subject</th>
                  <th className="py-3 px-4">Section & Grade</th>
                  <th className="py-3 px-4">Primary Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {guardianships.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                      Run the database migration to view normalized parent-student guardianships.
                    </td>
                  </tr>
                ) : (
                  guardianships.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850">
                      <td className="py-3 px-4 font-mono text-xs">#{g.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {g.parent_profiles?.users?.name || 'Parent User'}
                        </p>
                        <p className="text-xs text-slate-500">{g.parent_profiles?.users?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-900 dark:text-blue-300">
                        {g.relationship_type}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">{g.students?.name}</p>
                        <p className="text-xs text-slate-500 font-mono">LRN: {g.students?.lrn || '10928374001'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                        {g.students?.section} ({g.students?.grade})
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {g.is_primary_contact ? 'Primary Guardian' : 'Secondary'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
