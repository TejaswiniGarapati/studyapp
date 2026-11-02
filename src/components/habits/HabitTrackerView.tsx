import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CATEGORY_CONFIG } from '../../data/initialData';
import { Habit, ActivityCategory } from '../../types';
import {
  Repeat,
  Plus,
  Flame,
  CheckCircle2,
  Trash2,
  X,
  Sparkles,
  Heart,
  TrendingUp,
} from 'lucide-react';

export const HabitTrackerView: React.FC = () => {
  const { habits, toggleHabitDate, addHabit, deleteHabit, triggerConfetti } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<ActivityCategory>('DSA');
  const [formTargetDays, setFormTargetDays] = useState(6);

  // Generate last 7 days dates
  const days = Array.from({ length: 7 })
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        dayNum: d.getDate(),
        isToday: i === 6,
      };
    });

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormCategory('Coding');
    setFormTargetDays(6);
    setIsModalOpen(true);
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    addHabit({
      title: formTitle.trim(),
      category: formCategory,
      iconName: 'Binary',
      targetDaysPerWeek: formTargetDays,
      history: {},
    });

    setIsModalOpen(false);
    triggerConfetti();
  };

  // Compassionate non-judgmental guidance message
  const positiveNotes = [
    'Building identity through small daily repetitions. Even on low-energy days, doing 5 minutes preserves your rhythm.',
    'A missed day is simply an opportunity to resume gently. Consistency is measured in months, not single afternoons.',
    'Restorative sleep is as vital to your brain as solving algorithms. Celebrate the balance you keep.',
  ];
  const activeNote = positiveNotes[new Date().getDate() % positiveNotes.length];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 font-heading">
            Habit Consistency Tracker
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Build sustainable daily rhythms for DSA, GATE concepts, chores, and restorative sleep.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#FF9466] hover:bg-[#FF8550] rounded-full shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Gentle Motivation Card */}
      <div className="p-4 bg-[#f4f7f5] dark:bg-[#1b2520] border border-[#d2e3d7] dark:border-[#274030] rounded-xl flex items-start gap-3 text-xs text-[#2b4433] dark:text-[#a8d5b5]">
        <Heart className="w-4 h-4 text-[#5b8266] shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Gentle Productivity Principle:</p>
          <p className="mt-0.5 text-stone-600 dark:text-stone-300 leading-relaxed">{activeNote}</p>
        </div>
      </div>

      {/* Weekly Matrix Card */}
      <div className="bg-white dark:bg-[#161a1c] border border-stone-200/90 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/30 text-xs">
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            Weekly Habit Momentum (Past 7 Days)
          </span>
          <span className="text-stone-500 text-[11px]">Click any circle to toggle completion</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200/60 dark:border-stone-800 text-stone-500 bg-stone-50/30 dark:bg-stone-900/10">
                <th className="py-3 px-4 font-medium">Habit Focus</th>
                <th className="py-3 px-2 text-center font-medium">Streak</th>
                {days.map((day) => (
                  <th key={day.dateStr} className="py-3 px-2 text-center font-medium">
                    <div className="font-mono text-[10px]">{day.dayName}</div>
                    <div
                      className={`text-xs font-mono font-semibold ${
                        day.isToday ? 'text-[#5b8266] dark:text-[#88b695]' : ''
                      }`}
                    >
                      {day.dayNum}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800">
              {habits.map((habit) => {
                const cat = CATEGORY_CONFIG[habit.category] || CATEGORY_CONFIG.Personal;

                return (
                  <tr
                    key={habit.id}
                    className="hover:bg-stone-50/60 dark:hover:bg-stone-850/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {habit.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${cat.bgLight} ${cat.textLight} ${cat.bgDark} ${cat.textDark}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-center font-mono tabular-nums">
                      <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold text-xs">
                        <Flame className="w-3.5 h-3.5" />
                        <span>{habit.streak}d</span>
                      </span>
                    </td>

                    {days.map((day) => {
                      const isCompleted = !!habit.history[day.dateStr];
                      return (
                        <td key={day.dateStr} className="py-3 px-2 text-center">
                          <button
                            onClick={() => {
                              toggleHabitDate(habit.id, day.dateStr);
                              if (!isCompleted) triggerConfetti();
                            }}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-[#5b8266] text-white shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-300 dark:text-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700'
                            }`}
                            title={`${habit.title} on ${day.dateStr}`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        title="Delete habit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Habit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#161a1c] border border-stone-200 dark:border-stone-800 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 font-heading">
                Create New Daily Habit
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 45 mins Abdul Bari Dynamic Programming"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#5b8266]"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as ActivityCategory)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100"
                >
                  {Object.keys(CATEGORY_CONFIG).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Target Days per Week: {formTargetDays} days
                </label>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={formTargetDays}
                  onChange={(e) => setFormTargetDays(parseInt(e.target.value, 10))}
                  className="w-full accent-[#5b8266]"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>1 day</span>
                  <span>4 days</span>
                  <span>7 days (Everyday)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF9466] hover:bg-[#FF8550] text-white font-bold rounded-full shadow-xs transition-colors"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
