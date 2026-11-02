import React from 'react';
import { useApp } from '../../context/AppContext';

export const PrintableTimetable: React.FC = () => {
  const { profile, schedule, tasks, exams, todayStudyHours } = useApp();

  const parseMin = (t: string) => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const todaySchedule = [...schedule]
    .filter((a) => a.dayOfWeek === 'Today' || a.recurring === 'daily')
    .sort((a, b) => parseMin(a.startTime) - parseMin(b.startTime));

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto">
      {/* Print Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FOCUSMATE MASTER TIMETABLE</h1>
          <p className="text-xs uppercase tracking-wider text-gray-700">
            {profile.name} • {profile.educationLevel}
          </p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">{currentDate}</p>
          <p className="text-gray-600">Daily Study Target: {profile.targetDailyStudyHours}h</p>
        </div>
      </div>

      {/* Core Rules Box */}
      <div className="border border-gray-400 p-3 mb-6 text-xs bg-gray-50 flex justify-between">
        <div>
          <span className="font-bold">Protected Meals:</span> Lunch at {profile.lunchTime} • Dinner at {profile.dinnerTime}
        </div>
        <div>
          <span className="font-bold">Protected Sleep:</span> {profile.sleepTime} - {profile.wakeTime} (7.5 Hours Rest)
        </div>
      </div>

      {/* Daily Schedule Table */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">
          Today's Time Block Sequence
        </h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-black text-left">
              <th className="py-2 w-32">Time Slot</th>
              <th className="py-2">Activity Description</th>
              <th className="py-2 w-28">Category</th>
              <th className="py-2 w-20">Priority</th>
              <th className="py-2 w-16 text-center">Done [✓]</th>
            </tr>
          </thead>
          <tbody>
            {todaySchedule.map((act) => (
              <tr key={act.id} className="border-b border-gray-200">
                <td className="py-2 font-mono font-medium">
                  {act.startTime} - {act.endTime}
                </td>
                <td className="py-2">
                  <div className="font-semibold">{act.title}</div>
                  {act.notes && <div className="text-[11px] text-gray-600">{act.notes}</div>}
                </td>
                <td className="py-2 text-gray-700">{act.category}</td>
                <td className="py-2 font-mono text-[11px]">{act.priority}</td>
                <td className="py-2 text-center">
                  <div className="w-4 h-4 border border-black inline-block rounded-xs" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Focus Deliverables */}
      <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-300 page-break">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Priority Tasks</h3>
          <ul className="text-xs space-y-1.5">
            {tasks.slice(0, 6).map((task) => (
              <li key={task.id} className="flex items-start gap-2">
                <span className="w-3.5 h-3.5 border border-black inline-block shrink-0 mt-0.5 rounded-xs" />
                <span>
                  <strong>{task.title}</strong> (Due: {task.dueDate})
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2">Upcoming Exam Deadlines</h3>
          <ul className="text-xs space-y-2">
            {exams.map((exam) => (
              <li key={exam.id} className="border-l-2 border-black pl-2">
                <div className="font-semibold">{exam.name}</div>
                <div className="text-[11px] text-gray-600">
                  Target: {exam.targetDate} • Goal: {exam.targetScoreOrRank || 'N/A'}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-400 text-center text-[10px] text-gray-500">
        FOCUSMATE — Your goals. Your time. Your balance. • Built with Google AI Studio
      </div>
    </div>
  );
};
