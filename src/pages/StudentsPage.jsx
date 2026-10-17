import React, { useState, useMemo } from 'react';
import { useIncidents } from '../context/IncidentContext';
import { searchStudents } from '../utils/searchUtils';
import { Users, Search, AlertTriangle, Phone, Eye, ArrowRight, UserCheck } from 'lucide-react';

export default function StudentsPage({ onSelectStudent }) {
  const { students, getStudentIncidents, isRepeatOffender } = useIncidents();
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const filteredStudents = useMemo(() => {
    let result = students;

    if (searchQuery.trim()) {
      result = searchStudents(students, searchQuery, 50);
    }

    if (gradeFilter !== 'ALL') {
      result = result.filter((s) => s.grade === gradeFilter);
    }

    return result;
  }, [students, searchQuery, gradeFilter]);

  const grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <Users className="w-7 h-7 text-blue-900 dark:text-blue-400" />
          <span>Student Directory & History</span>
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mt-1">
          Confidential student disciplinary archive. Select any student profile to inspect their chronological timeline.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[280px] max-w-lg">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Search Student
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name or 12-digit LRN..."
              className="w-full pl-10 pr-4 py-2.5 text-base rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-white font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Filter by Grade Level
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-medium focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-white text-base"
            >
              <option value="ALL">All Grade Levels</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((st) => {
            const studentIncidents = getStudentIncidents(st.id);
            const isRepeat = isRepeatOffender(st.id);
            return (
              <div
                key={st.id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-900 dark:hover:border-blue-400 transition shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="w-14 h-14 rounded-xl object-cover border-2 border-slate-300 dark:border-slate-700 shrink-0"
                    />
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 block">
                        LRN: {st.lrn}
                      </span>
                      {isRepeat && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-300 mt-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Repeat Offender
                        </span>
                      )}
                      {st.status === 'Expelled' && (
                        <span className="text-xs font-bold bg-rose-700 text-white px-2 py-0.5 rounded-md mt-1 inline-block">
                          Expelled
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    {st.name}
                  </h3>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mt-0.5">
                    {st.grade} • {st.section}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 space-y-1.5">
                    <p className="truncate">
                      Guardian: <strong className="text-slate-800 dark:text-slate-200">{st.guardian_name}</strong>
                    </p>
                    <p className="truncate flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{st.guardian_phone}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <strong className="text-blue-900 dark:text-blue-300 text-base">{studentIncidents.length}</strong> Incident(s)
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectStudent(st)}
                    className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-sm font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Timeline</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              No student records found
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Try searching by student first name, last name, or 12-digit Learner Reference Number (LRN).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
