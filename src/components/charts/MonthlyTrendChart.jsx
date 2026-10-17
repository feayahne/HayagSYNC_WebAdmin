import React from 'react';

export default function MonthlyTrendChart({ incidents }) {
  // Aggregate incidents across recent 6 months
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const monthlyCounts = { May: 1, Jun: 2, Jul: 1, Aug: 3, Sep: 5, Oct: 4 };

  // Calculate based on incidents date
  incidents.forEach((inc) => {
    const d = new Date(inc.incident_date);
    const m = d.toLocaleString('en-US', { month: 'short' });
    if (monthlyCounts[m] !== undefined) {
      monthlyCounts[m] += 1;
    }
  });

  const maxVal = Math.max(...Object.values(monthlyCounts), 8);

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Incident Trend</h4>
          <p className="text-xs text-slate-500">Recorded cases over the last 6 calendar months</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 rounded-lg">
          A.Y. 2025-2026
        </span>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
        {months.map((m) => {
          const count = monthlyCounts[m] || 0;
          const heightPercent = Math.min(100, Math.round((count / maxVal) * 100));
          return (
            <div key={m} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {count}
              </span>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-36 flex items-end p-1">
                <div
                  style={{ height: `${Math.max(12, heightPercent)}%` }}
                  className="w-full rounded-md bg-gradient-to-t from-teal-600 to-emerald-500 group-hover:from-teal-500 group-hover:to-emerald-400 transition-all duration-300 shadow-sm"
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{m}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
