import React from 'react';

export default function OffenseDistributionChart({ incidents }) {
  const counts = {};
  incidents.forEach((i) => {
    counts[i.category] = (counts[i.category] || 0) + 1;
  });

  const total = incidents.length || 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const colorPalettes = [
    'bg-blue-500',
    'bg-amber-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-indigo-500',
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Incidents by Offense Category</h4>
        <p className="text-xs text-slate-500">Distribution of reported bullying & disciplinary acts</p>
      </div>

      <div className="space-y-3">
        {sorted.map(([cat, count], idx) => {
          const percent = Math.round((count / total) * 100);
          const colorClass = colorPalettes[idx % colorPalettes.length];
          return (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{cat}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {count} ({percent}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
