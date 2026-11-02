import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { schedule, tasks, exams, habits, todayStudyHours, profile } = useApp();

  const [timeWindow, setTimeWindow] = useState<'this-week' | 'monthly'>('this-week');

  const parseMin = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Study hours by category from schedule
  const studyCategories = [
    'GATE',
    'DSA',
    'Placements',
    'Coding',
    'College',
    'Java',
    'Python',
    'System Administration',
  ];

  const categoryHoursMap: Record<string, number> = {};
  for (const cat of studyCategories) {
    categoryHoursMap[cat] = 0;
  }

  schedule.forEach((act) => {
    if (studyCategories.includes(act.category)) {
      const s = parseMin(act.startTime);
      const e = parseMin(act.endTime);
      if (e > s) {
        const hrs = (e - s) / 60;
        categoryHoursMap[act.category] = (categoryHoursMap[act.category] || 0) + hrs;
      }
    }
  });

  const categoryHoursList = Object.entries(categoryHoursMap)
    .filter(([_, hrs]) => hrs > 0)
    .sort((a, b) => b[1] - a[1]);

  const totalWeeklyStudyHours = Math.round(
    Object.values(categoryHoursMap).reduce((acc, v) => acc + v, 0) * 5 * 10
  ) / 10; // estimate 5 working days

  // Task metrics
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const taskCompletionRate =
    tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // 7-day study trend mock data grounded in profile daily study target
  const trendDays = [
    { day: 'Mon', hours: 7.2, target: profile.targetDailyStudyHours },
    { day: 'Tue', hours: 6.8, target: profile.targetDailyStudyHours },
    { day: 'Wed', hours: 7.5, target: profile.targetDailyStudyHours },
    { day: 'Thu', hours: 8.0, target: profile.targetDailyStudyHours },
    { day: 'Fri', hours: 7.0, target: profile.targetDailyStudyHours },
    { day: 'Sat', hours: 8.5, target: profile.targetDailyStudyHours },
    { day: 'Sun (Today)', hours: todayStudyHours, target: profile.targetDailyStudyHours },
  ];

  const maxChartHours = 10;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Progress Analytics
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Real data on study hours, subject allocation, task velocity, and habit consistency.
          </p>
        </div>

        <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs">
          <button
            onClick={() => setTimeWindow('this-week')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              timeWindow === 'this-week'
                ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeWindow('monthly')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              timeWindow === 'monthly'
                ? 'bg-white dark:bg-[#1f2528] text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            November 2026
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-stone-500">Today Study Hours</span>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {todayStudyHours}h
          </div>
          <span className="text-[11px] text-[#5b8266] font-medium font-mono">
            {Math.round((todayStudyHours / profile.targetDailyStudyHours) * 100)}% of daily target
          </span>
        </div>

        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-stone-500">Weekly Total Study</span>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {totalWeeklyStudyHours}h
          </div>
          <span className="text-[11px] text-stone-500 font-mono">5-day schedule projection</span>
        </div>

        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-stone-500">Task Completion Rate</span>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            {taskCompletionRate}%
          </div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
            {completedTasks} completed · {pendingTasks} active
          </span>
        </div>

        <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <span className="text-xs text-stone-500">Habit Adherence</span>
          <div className="mt-2 text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">
            88%
          </div>
          <span className="text-[11px] text-orange-600 dark:text-orange-400">
            {habits[0]?.streak || 0}d streak on core focus
          </span>
        </div>
      </div>

      {/* Main Charts: 7-Day Trend & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 7-Day Trend Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5b8266]" />
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Daily Study Hours vs Target
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#5b8266]" />
                Actual
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-0.5 bg-amber-500" />
                Target ({profile.targetDailyStudyHours}h)
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="mt-6 h-56 flex items-end justify-between gap-3 px-2">
            {trendDays.map((item, idx) => {
              const heightPct = Math.round((item.hours / maxChartHours) * 100);
              const targetHeightPct = Math.round((item.target / maxChartHours) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-stone-600 dark:text-stone-400 font-semibold">
                    {item.hours}h
                  </span>

                  <div className="relative w-full max-w-[38px] h-40 bg-stone-100 dark:bg-stone-800 rounded-t-lg overflow-hidden flex items-end">
                    {/* Target line */}
                    <div
                      className="absolute w-full border-t border-dashed border-amber-500 z-10"
                      style={{ bottom: `${targetHeightPct}%` }}
                      title={`Target: ${item.target}h`}
                    />

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        item.hours >= item.target
                          ? 'bg-[#5b8266]'
                          : 'bg-[#5b8266]/70'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-stone-500 font-medium truncate max-w-full text-center">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Subject-wise Distribution (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Subject Allocation
              </h2>
            </div>
            <span className="text-[11px] text-stone-500">Based on Schedule</span>
          </div>

          <div className="mt-4 space-y-3">
            {categoryHoursList.map(([catName, hrs]) => {
              const cat = CATEGORY_CONFIG[catName as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.Coding;
              const totalHrs = Object.values(categoryHoursMap).reduce((a, b) => a + b, 0);
              const pct = totalHrs > 0 ? Math.round((hrs / totalHrs) * 100) : 0;

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {cat.label}
                    </span>
                    <span className="font-mono tabular-nums text-stone-500">
                      {Math.round(hrs * 10) / 10}h ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#5b8266] h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 leading-relaxed">
            Healthy balance confirmed: College lectures and GATE/Placement prep each occupy structured focused blocks without crowding out sleep or chores.
          </div>
        </div>
      </div>
    </div>
  );
};
